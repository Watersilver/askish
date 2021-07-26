import React, {Component} from "react";

// Enum for screen state
import screenEnum from "../screenEnum.js";

import re from "../../../universal/regularExpressions.js";

import Phones from "./Phones.js";

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const arraysAreEqual = (arr1, arr2) => {
  if (!arr1) return false;
  if (!arr2) return false;
  if (arr1.length !== arr2.length) return false;

  const sorted1 = arr1.sort();
  const sorted2 = arr2.sort();

  for (let i = 0; i < sorted1.length; i++) {
    if (sorted1[i] !== sorted2[i]) return false;
  }

  return true;
}

class EditForm extends Component {
  constructor(props) {
    super(props);

    // Store if we are editing or inserting new contact
    // Will be used throughout the component
    // to separate insert logic from edit logic
    const edit = props.screen === screenEnum.view;

    // Ensure consistent phones viewing order
    if (edit && Array.isArray(this.props.viewing.phones))
      this.props.viewing.phones.sort();

    this.state = {
      name: edit ? null : "",
      email: edit ? null : "",
      address: edit ? null : "",
      phones: edit ? null : [],

      // Phone that is currently being inputer. Will be the one validated
      currentPhone: null,

      // Validation prompts
      nameValidation: null,
      emailValidation: null,
      phoneValidation: null,

      hover: null
    };

    // bind methods
    this.handleNameChange = this.handleNameChange.bind(this);
    this.validateName = this.validateName.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.validateEmail = this.validateEmail.bind(this);
    this.handleAddressChange = this.handleAddressChange.bind(this);
    this.handlePhonesClick = this.handlePhonesClick.bind(this);
    this.handlePhonesChange = this.handlePhonesChange.bind(this);
    this.handlePhonesBlur = this.handlePhonesBlur.bind(this);
    this.validatePhone = this.validatePhone.bind(this);
    this.deleteUnnecessaryEdits = this.deleteUnnecessaryEdits.bind(this);
    this.isEdited = this.isEdited.bind(this);
    this.cancel = this.cancel.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  // Return false if name is invalid
  validateName(value, callback) {

    const edit = this.props.screen === screenEnum.view;
    
    if (!edit && !value) {
      this.setState({nameValidation: "Name is required."});
      return false;
    }
    else if (edit && (!value || value === this.props.viewing._id)) {
      return true;
    } else if (this.props.list.map(obj => obj._id).includes(value)) {
      // Disallow dupes
      this.setState({nameValidation: "Name already exists."}, callback);
      return false;
    } else {
      this.setState({nameValidation: ""}, callback);
      return true;
    }
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
  }

  // Return false if email is invalid
  validateEmail(value, callback) {

    const edit = this.props.screen === screenEnum.view;
    
    if (!edit && !value) {
      this.setState({emailValidation: "Email is required."});
      return false;
    }
    else if (edit && (!value || value === this.props.viewing.email)) {
      return true;
    }
    else if (!re.testEmail(value)) {
      this.setState({emailValidation: "Invalid email address."}, callback);
      return false;
    }
    else {
      this.setState({emailValidation: ""}, callback);
      return true;
    }
  }

  handleAddressChange(event) {
    this.setState({address: event.target.value});
  }

  // Will fire when clicking the button under the phones list,
  // or any number of that list.
  // If clicked the button just add new input, if clicked the number
  // remove number from list of phones and edit it.
  handlePhonesClick(number) {

    const edit = this.props.screen === screenEnum.view;

    this.setState(prevstate => {
      let phones = new Set(edit ? prevstate.phones || this.props.viewing.phones : prevstate.phones);
      phones.delete(number);
      phones = [...phones];

      return {phones, currentPhone: number};
    });
  }

  // Controlled input for phone number
  handlePhonesChange(event) {
    const val = event.target.value;
    if (!val.length) {
      this.setState({currentPhone: ""});
    } else if (re.testPhoneLenient(val)) {
      this.setState({currentPhone: val});
    }
  }

  // Check if phone must be added
  // to phones list when losing
  // focus from input
  handlePhonesBlur() {

    const edit = this.props.screen === screenEnum.view;

    return new Promise((resolve, reject) => {
      if (re.testPhone(this.state.currentPhone)) {
        this.setState(prevstate => {
          let phones = new Set(edit ? prevstate.phones || this.props.viewing.phones : prevstate.phones);
          phones.add(prevstate.currentPhone);
          phones = [...phones];
  
          phones.sort();
    
          return {phones, currentPhone: null};
        }, () => resolve(true));
      } else if (!this.state.currentPhone) {
        this.setState({currentPhone: null}, () => resolve(true));
      } else {
        resolve(false);
      }
    })
  }

  // return false if provided phone number is invalid
  validatePhone(value, callback) {
    if (re.testPhone(value)) {
      this.setState({phoneValidation: ""}, callback);
      return true;
    } else if (!value) {
      this.setState({phoneValidation: ""}, callback);
      return true;
    } else {
      this.setState({phoneValidation: "Invalid phone."}, callback);
      return false;
    }
  }

  // Remove edits that are the same
  // as the original values
  deleteUnnecessaryEdits(callback) {

    let promise1 = Promise.resolve();
    let promise2 = Promise.resolve();
    let promise3 = Promise.resolve();
    let promise4 = Promise.resolve();

    // Also delete if empty string since name is required
    if (this.state.name === "" || this.props.viewing._id === this.state.name)
      promise1 = new Promise(resolve => this.setState({name: null}, resolve));

    // Also delete if empty string since email is required
    if (this.state.email === "" || this.props.viewing.email === this.state.email)
      promise2 = new Promise(resolve => this.setState({email: null}, resolve));

    if (this.props.viewing.address === this.state.address || (!this.props.viewing.address && !this.state.address))
      promise3 = new Promise(resolve => this.setState({address: null}, resolve));

    // Test if edited phones are the same as original
    if (arraysAreEqual(this.state.phones, this.props.viewing.phones))
      promise4 = new Promise(resolve => this.setState({phones: null}, resolve));
    
    // Babel doesnt allow async so just wait for all promises to resolve
    // and return promise that resolves then to know when all operations are done.
    return Promise.all([promise1, promise2, promise3, promise4]).then(() => callback);
  }

  // Return true if a value has been edited.
  // Not the fastest way to do it, but the most readable.
  isEdited() {
    const uState = this.props.viewing; // unedited state
    const lState = this.state; // local state

    const nameEdited = lState.name !== null && lState.name !== uState._id;
    const emailEdited = lState.email !== null && lState.email !== uState.email;
    const addressEdited = lState.address !== null && lState.address !== uState.address;

    const lPhones = lState.phones ? [...lState.phones] : [];
    if (lState.currentPhone) lPhones.push(lState.currentPhone);

    const phonesEdited = lPhones.length && !arraysAreEqual(lPhones, uState.phones);

    return nameEdited || emailEdited || addressEdited || phonesEdited;
  }

  componentWillUnmount() {
    this.isUnmounted = true;
  }

  // Return to starting unedited state
  cancel() {
    if (this.isUnmounted) return;

    this.setState({
      name: null,
      email: null,
      address: null,
      phones: null,
      currentPhone: null,
      nameValidation: null,
      emailValidation: null,
      phoneValidation: null,

      hover: null
    })
  }

  submitForm(e) {
    // Don't redirect or refresh
    e.preventDefault();

    const edit = this.props.screen === screenEnum.view;

    // First make sure there really are edits
    const due = edit ? this.deleteUnnecessaryEdits() : Promise.resolve();

    due.then(() => {

      // Validate everything to give feedback to user if many are wrong
      const nameValid = this.validateName(this.state.name);
      const emailValid = this.validateEmail(this.state.email);
      const phoneValid = this.validatePhone(this.state.currentPhone);

      // Prevent submission if not validated
      if (!(nameValid && emailValid && phoneValid))
        return;

      // Wait till currentPhone has been pushed into
      // phones list before deciding what to do next
      this.handlePhonesBlur().then(response => {
        if (response) {
          
          if (edit) {
            if (this.state.name) {
              // If name has been changed, post new name and delete old one
              const newName = this.state.name;
              const oldName = this.props.viewing._id;

              // uncomment the "then" clause for truth
              // comment for smooth ux
              this.props.post(this.state.name, this.state.email || this.props.viewing.email, this.state.address || this.props.viewing.address, this.state.phones || this.props.viewing.phones, true, true)
              // .then(() => {
                this.props.delete(oldName, true);
                this.props.get(newName);
                this.props.get();
                this.cancel();
              // })
            } else {
              // If name hasn't been changed, put changes
              this.props.put(this.props.viewing._id, this.state.email, this.state.address, this.state.phones, true);
              this.props.get(this.state.name);
              this.props.get();
              this.cancel();
            }
          } else {
            // If inserting just post
            this.props.post(this.state.name, this.state.email, this.state.address, this.state.phones, true);
            this.props.setScreen(screenEnum.browse);
          }
        }
      })
    });
  }

  render() {

    const edit = this.props.screen === screenEnum.view;

    return <form className="form-component"
    onSubmit={this.submitForm}
    >
      {
      // name and email input are very similar so handle both here
      ["name", "email"].map(field =>
      <React.Fragment key={field}>
        <label htmlFor={field}>{capitalize(field)}</label>
        {this.state[field] !== null ? <div className={"validatable " + (this.state[field+"Validation"] === "" ? "valid" : (this.state[field+"Validation"] ? "invalid" : ""))}>
          {/* Pass appropriate props to each name and email according
          to which field we're currently iterating */}
          <input autoFocus={edit? true : false} name={field} placeholder={capitalize(field)} value={this.state[field]}
          onChange={this["handle"+capitalize(field)+"Change"]}
          onBlur={e => {

            // If inserting just validate
            if (!edit) return this["validate"+capitalize(field)](e.target.value);

            this.deleteUnnecessaryEdits()
            .then(() => this["validate"+capitalize(field)](e.target.value));
            this.setState(prevstate => {
              // Use async safe version because otherwise we
              // might end up not displaying the edit symbol
              return prevstate.hover === field ? {hover: null} : prevstate;
            });
          }}></input>
          {this.state[field+"Validation"] ? <span>{this.state[field+"Validation"]}</span> : null}
        </div> :
        // Just show a div with the field if unedited
        <div
        className="editable"
        onClick={() => this.setState(() => {
          // If we click this div we start editing the field
          const nextState = {};
          nextState[field] = field === "email" ? this.props.viewing[field] : this.props.viewing._id;
          return nextState;
        })}
        
        onMouseEnter={() => {this.setState({hover: field})}}
        onMouseLeave={() => {this.setState(prevstate => {
          // Use async safe version because otherwise we
          // might end up not displaying the edit symbol
          return prevstate.hover === field ? {hover: null} : prevstate;
        })}}>
          {field === "email" ? this.props.viewing[field] : this.props.viewing._id}
          {/* Show a pen to indicate editable */}
          {this.state.hover === field ? <span><i className="fa fa-pencil fa-2x" aria-hidden="true"></i></span> : null}
        </div>}
      </React.Fragment>)}
      <label htmlFor="address">Address</label>
      {this.state.address !== null ? <div>
        <input autoFocus={edit ? true : false} name="address" placeholder="Address" value={this.state.address}
        onChange={this.handleAddressChange}
        onBlur={() => {
          
          // If inserting nothing to do here
          if (!edit) return;
          
          this.deleteUnnecessaryEdits();
          this.setState(prevstate => {
            // Use async safe version because otherwise we
            // might end up not displaying the edit symbol
            return prevstate.hover === "address" ? {hover: null} : prevstate;
          })
        }}></input>
      </div> :
      // Just show a div with the field if unedited
      <div
        className="editable"
        onClick={() => this.setState({address: this.props.viewing.address})}
        onMouseEnter={() => {this.setState({hover: "address"})}}
        onMouseLeave={() => {this.setState(prevstate => {
          // Use async safe version because otherwise we
          // might end up not displaying the edit symbol
          return prevstate.hover === "address" ? {hover: null} : prevstate;
        })}}
      >
        {this.props.viewing.address}
        {/* Show a pen to indicate editable */}
        {this.state.hover === "address" ? <span><i className="fa fa-pencil fa-2x" aria-hidden="true"></i></span> : null}
      </div>}
      <label id="phones-label" htmlFor="phones">Phone Number(s)</label>
      <Phones
        handlePhonesClick={this.handlePhonesClick}
        handlePhonesChange={this.handlePhonesChange}
        handlePhonesBlur={() => {
          if (edit)
            this.deleteUnnecessaryEdits().then(() => this.handlePhonesBlur());
          else
            this.handlePhonesBlur();
        }}
        validatePhone={this.validatePhone}
        phones={edit ? (this.state.phones || this.props.viewing.phones || []) : this.state.phones}
        currentPhone={this.state.currentPhone}
        phoneValidation={this.state.phoneValidation}
      />

      {/* Edit buttons */}
      {edit && this.isEdited() ? <section className="save-load-btns">
        <button type="submit"><i className="fa fa-floppy-o fa-2x" aria-hidden="true"></i></button>
        <button type="button" onClick={this.cancel}><i className="fa fa-undo fa-2x" aria-hidden="true"></i></button>
      </section> : null}
      {edit ? <button type="button" className="delete-btn" onClick={() => this.props.setConfirmDelete(this.props.viewing._id)}>
        <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
      </button> : null}

      {/* Insert buttons */}
      {!edit ? <button className="submit-btn"><i className="fa fa-floppy-o fa-2x" aria-hidden="true"></i></button> : null}
    </form>;
  }
};

export default EditForm;
