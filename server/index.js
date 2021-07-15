require('dotenv').config();

const path = require('path');

const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true });

// init project
const express = require('express');
const app = express();

const {testEmail, testPhone} = require("../universal/regularExpressions.js");

// failob is an object that stores if validation failed
// or if fields are missing. Used for POST and PUT requests.
// It's purpose is to avoid duplicate code and to give
// a full list of invalid and missing fields instead of
// responding at the first one encountered.
class FailOb {
  constructor() {
    this.failed = false;
    this.error = {
      missing: [],
      invalid: []
    };
  }

  validate(email, phones) {
    if (email && !testEmail(email)) {
      console.log("Invalid email");
      this.failed = true;
      this.error.invalid.push("email");
    }
  
    if (phones) {

      // phones must be array
      if (!Array.isArray(phones)) {
        console.log("Invalid phones");
        this.failed = true;
        this.error.invalid.push("phone");

        return;
      }

      for (const phone of phones) {
        if (!testPhone(phone)) {
          console.log("Invalid phone: ", phone);
          this.failed = true;
          this.error.invalid.push("phone");
          break;
        }
      }
    }
  }

  toJson() {
    const json = {error: {}};
    if (this.error.missing.length) json.error.missing = [...this.error.missing];
    if (this.error.invalid.length) json.error.invalid = [...this.error.invalid];
    json.failed = this.failed;

    return json;
  }
}

const main = async () => {
  
  await client.connect();
  console.log('Connected successfully to server');
  const db = client.db();
  const contacts = db.collection('contacts');

  // Parse body for PUT and POST requests
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(express.static(path.resolve(__dirname, '../build')));
  
  app.get("/", (_, res) => {
    res.sendFile(path.resolve(__dirname, '../build/index.html'));
  });

  app.route("/api")
  .get((req, res) => {
    const name = req.query.name;

    if (name) {
      // Look for single contact if given a name
      contacts.findOne({_id: name})
      .then(doc => res.json([doc] || []))
      .catch(err => {
        console.error("error:", err);
        res.json({failed: true, error: err});
      });
    } else {
      const id_only = req.query.id_only;

      let cursor = contacts.find();

      // Return only requested fields
      if (id_only) cursor = cursor.project({_id: 1});

      // Ensure consistency of order
      cursor = cursor.sort({_id: 1});

      const limit = req.query.limit;

      // Determine if a subset of all contacts was requested
      if (limit) {
        const skip = req.query.skip || 0;
        cursor = cursor.skip(skip).limit(limit);
      }

      cursor.toArray()
      .then(results => res.json(results || []))
      .catch(err => {
        console.error("error:", err);
        res.json({failed: true, error: err});
      });
    }
  })
  .post((req, res) => {
    const _id = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const phones = req.body.phones;

    const failob = new FailOb();

    // Ensure required fields are present
    if (!_id) {
      console.log("Tried to insert document with empty _id");
      failob.failed = true;
      failob.error.missing.push("name");
    }
    if (!email) {
      console.log("Tried to insert document with empty email");
      failob.failed = true;
      failob.error.missing.push("email");
    }

    failob.validate(email, phones);

    if (failob.failed) {
      res.json(failob.toJson());
      return;
    }

    const insertDoc = {
      _id, email
    };

    // Only insert these values if they exist
    if (address) insertDoc.address = address;
    if (phones) insertDoc.phones = phones;

    contacts.insertOne(insertDoc)
    .then(result => {
      console.log("result:", result);
      res.json(result);
    })
    .catch(err => {
      console.error("error:", err);
      res.json({failed: true, error: err});
    });
  })
  .put((req, res) => {
    const _id = req.body.name;
    const email = req.body.email;
    const address = req.body.address;
    const phones = req.body.phones;

    if (email === undefined && address === undefined && phones === undefined) {
      console.error("error:", "Trying to PUT nothing");
      res.json({failed: true, error: {
        emptyUpdateDocument: true
      }});

      return;
    }

    const failob = new FailOb();

    // Disallow deleting of email field
    // if it's undefined it will simply not change
    if (!email && email !== undefined) {
      console.log("Tried to delete email field");
      failob.failed = true;
      failob.error.missing.push("email");
    }

    failob.validate(email, phones);

    if (failob.failed) {
      res.json(failob.toJson());
      return;
    }

    const modifyDoc = {};

    if (email) modifyDoc.email = email;
    if (address !== undefined) modifyDoc.address = address;
    if (phones !== undefined) modifyDoc.phones = phones;

    contacts.findOneAndUpdate(
      {_id}, {$set: modifyDoc}
    )
    .then(result => {
      console.log("result:", result);

      if (result.value) {
        res.json(result);
      } else {
        // _id not found
        res.json({failed: true, result});
      }
    })
    .catch(err => {
      console.error("error:", err);
      res.json({failed: true, error: err});
    });
  })
  .delete((req, res) => {
    const _id = req.query.name;

    contacts.findOneAndDelete({_id})
    .then(result => {

      if (result.value) {
        res.json(result);
      } else {
        // _id not found
        res.json({failed: true, result});
      }
    })
    .catch(err => {
      console.error("error:", err);
      res.json({failed: true, error: err});
    });
  });

  // listen for requests :)
  const listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening at port ' + process.env.PORT || listener.address().port);
  });

  return 'done.'
};

main()
.then(console.log)
.catch(console.error);
