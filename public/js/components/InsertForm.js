import React, {Component} from "react";

import screenEnum from "../screenEnum";

import re from "../../../universal/regularExpressions.js";

import Phones from "./Phones.js";

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

class InsertForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "",
      email: "",
      address: "",
      phones: [],
      currentPhone: null, // Phone that is currently being inputer. Will be the one validated

      // Validation prompts
      nameValidation: null,
      emailValidation: null,
      phoneValidation: null
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
  }

  handleNameChange(event) {
    this.setState({name: event.target.value});
  }

  // Return false if name is invalid
  validateName(value) {
    if (!value) {
      this.setState({nameValidation: "Name is required."});
      return false;
    } else if (this.props.list.map(obj => obj._id).includes(value)) {
      // Disallow dupes
      this.setState({nameValidation: "Name already exists."});
      return false;
    } else {
      this.setState({nameValidation: ""});
      return true;
    }
  }

  handleEmailChange(event) {
    this.setState({email: event.target.value});
  }

  // Return false if email is invalid
  validateEmail(value) {
    if (!value) {
      this.setState({emailValidation: "Email is required."});
      return false;
    }
    else if (!re.testEmail(value)) {
      this.setState({emailValidation: "Invalid email address."});
      return false;
    }
    else {
      this.setState({emailValidation: ""});
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
    this.setState(prevstate => {
      let phones = new Set(prevstate.phones);
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
    return new Promise((resolve, reject) => {
      if (re.testPhone(this.state.currentPhone)) {
        this.setState(prevstate => {
          let phones = new Set(prevstate.phones);
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

  render() {
    return <form className="form-component"
      onSubmit={e => {
        // Don't redirect or refresh
        e.preventDefault();

        // Validate everythin to give feedback to user if many are wrong
        const nameValid = this.validateName(this.state.name);
        const emailValid = this.validateEmail(this.state.email);
        const phoneValid = this.validatePhone(this.state.currentPhone);

        // Prevent submission if not validated
        if (!(nameValid && emailValid && phoneValid))
          return;

        // Wait till currentPhone has been pushed into phones list before posting
        this.handlePhonesBlur().then(response => {
          if (response) {
            this.props.post(this.state.name, this.state.email, this.state.address, this.state.phones);
            this.props.setScreen(screenEnum.browse);
          }
        })
      }}
    >
      {
      // name and email input are very similar so handle both here
      ["name", "email"].map(field =>
      <React.Fragment key={field}>
        <label htmlFor={field}>{capitalize(field)}</label>
        <div className={"validatable " + (this.state[field+"Validation"] === "" ? "valid" : (this.state[field+"Validation"] ? "invalid" : ""))}>
          {/* Pass appropriate props to each name and email according
          to which field we're currently iterating */}
          <input name={field} placeholder={capitalize(field)} value={this.state[field]}
          onChange={this["handle"+capitalize(field)+"Change"]}
          onBlur={e => this["validate"+capitalize(field)](e.target.value)}></input>
          {this.state[field+"Validation"] ? <span>{this.state[field+"Validation"]}</span> : null}
        </div>
      </React.Fragment>)}
      <label htmlFor="address">Address</label>
      <div>
        <input name="address" placeholder="Address" value={this.state.address}
        onChange={this.handleAddressChange}></input>
      </div>
      <label htmlFor="phones">Phone Number(s)</label>
      <Phones
        handlePhonesClick={this.handlePhonesClick}
        handlePhonesChange={this.handlePhonesChange}
        validatePhone={this.validatePhone}
        handlePhonesBlur={this.handlePhonesBlur}
        phones={this.state.phones}
        currentPhone={this.state.currentPhone}
        phoneValidation={this.state.phoneValidation}
      />
      <button className="submit-btn"><i className="fa fa-floppy-o fa-2x" aria-hidden="true"></i></button>
    </form>;
  }
};

export default InsertForm;
