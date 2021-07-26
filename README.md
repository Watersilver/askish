# contacts
## An app that stores contact information

https://contgeks.glitch.me/

Contacts can be inserted, edited and deleted.
Contacts are required to have a name and an valid email.
They can also have an address and multiple valid phone numbers.

Validation happens both at the front and the back end.

Warning: Needs an .env file with a field called DB with a valid mongodb uri as its value

## Api requests

- sent to /api path
- GET can have a query string
  - If "name" field is included api will return an array with one or zero object(s) that has that name
  - If "name" is not included api will return an array of objects
    - If "skip" is included and is a number a number of documents will be skipped accordingly before database returns results
    - If "limit" is included and is a number it will limit the numbers of results we get
    - If "id_only" is true the returned array will only have _id's (which correspond to the name)
- POST is used to insert new documents. It must have at least "name" and "email". "name" must be unique and "email" must be valid to be successful. It can also optionally have an "address" field and a "phones" field which must be an array of valid phones.
- PUT is used to update documents. "name" must exist in the db to be successful. It can have the same fields as post and it will succeed as long as they are valid.
- DELETE is used to delete a single document identified by the "name" field of its query string. 


## Api response

- Always json.
- If operation was unsuccessful the response will always have a field called failed that will be true.
- If there is an error the response will have a field called error.
  - If it's a database error it will be the error object returned by the mongodb driver.
  - If there is a missing or invalid key the error object will have a "missing" or "invalid" key whose value will be an array of the missing or invalid keys respectively.
  - If it's a result of a PUT request with no modified fields, it will be have a key "emptyUpdateDocument" set to true.
- If operation was unsuccessful but there was no error it will have a result key which will be the return object from the mongodb driver.
- If operation is successful the response will be the return object from the mongodb driver.

## Universal folder

- Has code that is imported by both the server and the client.