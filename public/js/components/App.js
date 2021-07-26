import React, {Component} from "react";

import ContactList from "./ContactList.js";
import MergedForm from "./MergedForm";

import {fetchQuery, fetchBody} from "../helpers.js";

// Enum for screen state
import screenEnum from "../screenEnum.js";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      screen: screenEnum.browse, // Main screen we are looking at
      list: [], // List of contacts
      viewing: null, // Data of contact we are currently viewing
      confirmDelete: "" // If truthy show confirm delete dialogue
    };

    // Bind methods
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.put = this.put.bind(this);
    this.delete = this.delete.bind(this);
    this.setScreen = this.setScreen.bind(this);
    this.setConfirmDelete = this.setConfirmDelete.bind(this);

    // initialize
    this.get();
  }

  // get returns a promise that resolves when ajax
  // call has returned and successfully changes state
  // and rejects otherwise
  get(name) {
    return new Promise((resolve, reject) => {
      if (!name) {
        // Get all
        fetchQuery("GET", {id_only: true}).then(json => {
          if (json.failed) {
            console.error("Get all contacts request failed.");
            console.error(json);
            reject(json);
          } else {
            this.setState({list: json}, () => resolve());
          }
        })
        .catch(err => {
          console.error("Get all contacts request failed.");
          console.error(err);
          reject(err);
        });
      } else {
        fetchQuery("GET", {name}).then(json => {
          if (json.failed) {
            console.error("Get contact " + String(name) + " request failed.");
            console.error(json);
            reject(json);
          } else if (!json[0]) {
            console.log("No contact " + String(name) + " exists.");
          } else {
            this.setState({viewing: json[0]}, () => resolve());
          }
        })
        .catch(err => {
          console.error("Get contact " + String(name) + " request failed.");
          console.error(err);
          reject(err);
        });
      }
    })
  }

  // post returns a promise that resolves when ajax
  // call has returned and successfully changes state
  // and rejects otherwise
  post(name, email, address, phones, smoothUX, smoothUX2) {
    // Set state to expected result for smoother UX
    if (smoothUX) {
      this.setState(prevState => ({
        list: [...prevState.list, {_id: name}]
      }));
    }

    // Do the following for smooth ux when viewing
    // a posted contact that hasn't been added to db yet
    if (smoothUX2) {
      this.setState(prevState => ({
        viewing: prevState.viewing ?
        { _id: name, email, address, phones } :
        null
      }));
    }

    return new Promise((resolve, reject) => {
      const params = {name, email};

      if (address) params.address = address;

      // Accept array and comma separated string for phones
      if (phones) params.phones = Array.isArray(phones) ? phones :
      (typeof phones === "string" ? phones.replace(/\s/g, "").split(",") : []);

      fetchBody("POST", params).then(json => {
        if (json.failed) {
          console.error("Post contact " + String(name) + " request failed.");
          console.error(json);
          reject(json);
        } else {
          this.get().then(() => resolve());
        }
      })
      .catch(err => {
        console.error("Post contact " + String(name) + " request failed.");
        console.error(err);
        reject(err);
      });
    });
  }

  // put returns a promise that resolves when ajax
  // call has returned and successfully changes state
  // and rejects otherwise
  put(name, email, address, phones, smoothUX) {
    // Set state to expected result for smoother UX
    if (smoothUX) {
      this.setState(prevState => ({
        viewing: (prevState.viewing && (prevState.viewing._id === name)) ?
        { _id: name, email, address, phones } :
        null
      }));
    }

    return new Promise((resolve, reject) => {
      const params = {name};

      if (email) params.email = email;
      if (address || address === "") params.address = address;

      // Accept array and comma separated string for phones
      if (phones) params.phones = Array.isArray(phones) ? phones :
      (typeof phones === "string" ? phones.replace(/\s/g, "").split(",") : []);

      fetchBody("PUT", params).then(json => {
        if (json.failed) {
          console.error("Put contact " + String(name) + " request failed.");
          console.error(json);
          reject(json);
        } else {
          this.get(name).then(() => resolve());
        }
      })
      .catch(err => {
        console.error("Put contact " + String(name) + " request failed.");
        console.error(err);
        reject(err);
      });
    });
  }

  // delete returns a promise that resolves when ajax
  // call has returned and successfully changes state
  // and rejects otherwise
  delete(name, smoothUX) {
    // If this is not empty string it means delete
    // operation was invoked by the user and
    // confirmDelete must be set to empty string
    // after operation is done
    const confirmDelete = this.state.confirmDelete;

    // Set state to expected result for smoother UX
    if (smoothUX) {
      this.setState(prevState => ({
        list: prevState.list.filter(contact => contact._id !== name),
        confirmDelete: confirmDelete ? "" : prevState.confirmDelete
      }));
    }

    return new Promise((resolve, reject) => {
      fetchQuery("DELETE", {name}).then(json => {
        if (json.failed) {
          console.error("Delete contact " + String(name) + " request failed.");
          console.error(json);
          reject(json);
        } else if (smoothUX) {
          resolve();
        } else {
          this.setState({confirmDelete: confirmDelete ? "" : prevState.confirmDelete}, () => resolve());
        }
      })
      .catch(err => {
        console.error("Delete contact " + String(name) + " request failed.");
        console.error(err);
        reject(err);
      });
    });
  }

  setScreen(screenEnumValue) {
    this.setState({screen: screenEnumValue});
  }

  setConfirmDelete(bool) {
    this.setState({confirmDelete: bool});
  }

  render() {
    return (
      <section className={
        (this.state.confirmDelete ? "confirming-delete" : "") +
        " wrapper"
        }>
        {/* Sticky Header. Has an insert button to
        the right when not at insert screen. Has a browse
        button to the left when not browsing contacts. */}
        <header id="top">
          <section>
          {
            this.state.screen !== screenEnum.browse ?
            <button type="button" className="back-btn"
            onClick={() => {
              this.get();
              this.setScreen(screenEnum.browse);
              }}>
              <i className="fa fa-chevron-left fa-2x" aria-hidden="true"></i>
            </button> :
            null
          }
          {
            this.state.screen !== screenEnum.insert ?
            <button type="button" className="new-btn"
            onClick={() => this.setScreen(screenEnum.insert)}>
              <i className="fa fa-plus fa-2x" aria-hidden="true"></i>
            </button> :
            null
          }
          </section>
        </header>

        {/* Main. Content depends on what state.screen is. */}
        <main>
          <div id="main-div">
          {/* When browsing show list of contacts */}
          {this.state.screen === screenEnum.browse ? <ContactList
            list={this.state.list}
            get={this.get}
            setScreen={this.setScreen}
            setConfirmDelete={this.setConfirmDelete}
          /> : null}
          {/* When inserting show insert form */}
          {this.state.screen === screenEnum.insert ? <MergedForm
            list={this.state.list}
            post={this.post}
            setScreen={this.setScreen}
            screen={this.state.screen}
          /> : null}
          {/* When viewing single contact show edit form */}
          {this.state.screen === screenEnum.view ? <MergedForm
            viewing={this.state.viewing}
            list={this.state.list}
            get={this.get}
            post={this.post}
            delete={this.delete}
            put={this.put}
            setConfirmDelete={this.setConfirmDelete}
            setScreen={this.setScreen}
            screen={this.state.screen}
          /> : null}
          </div>
        </main>

        {/* Delete contact dialogue */}
        {this.state.confirmDelete ? <section id="delete-dlg">
          <section>
            <span>Are you sure you want to delete {this.state.confirmDelete} permanently?</span>
            <button type="button" onClick={() => {
              this.delete(this.state.confirmDelete, true);
              this.get();

              this.setScreen(screenEnum.browse);
            }}>Yes</button>
            <button type="button" onClick={() => this.setConfirmDelete("")}>No</button>
          </section>
        </section> : null}
      </section>
    )
  }
}

export default App;