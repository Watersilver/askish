import React, {Component, useState} from "react";

// Editable list of phones
const Phones = props => {
  const [hover, setHover] = useState("");

  // Show a little edit symbol on mouse enter and leave to
  // inform user the field is editable
  return <ul className="phones">
    { // Create all list items here (existing phone numbers)
    props.phones.map(phone => <li key={phone}
    className="editable"
    onMouseEnter={() => {setHover(phone)}}
    onMouseLeave={() => {setHover(prevstate => {
      // Use async safe version because otherwise we
      // might end up not displaying the edit symbol
      return prevstate === phone ? "" : prevstate;
    })}}
    onClick={() => props.handlePhonesClick(phone)}
    >
      {phone}
      {hover === phone ? <span><i className="fa fa-pencil fa-2x" aria-hidden="true"></i></span> : null}
    </li>)}

    {/* Last list item is a button to add new
    contact, or an input for editing the new
    contact to be added. */}
    <li>
      {/* If currentPhone is string, I am in the process
      of inputing new phone, so show the input element */}
      {typeof props.currentPhone === "string" ?
      <div className={"validatable " + (props.phoneValidation === "" ? "valid" : (props.phoneValidation ? "invalid" : ""))}>
        <input value={props.currentPhone} onChange={props.handlePhonesChange} 
        onBlur={e => {
          props.validatePhone(e.target.value, 
          () => props.handlePhonesBlur());
          setHover("");
        }} autoFocus></input>
        {props.phoneValidation ? <span>{props.phoneValidation}</span> : null}
      </div> :

      // If not inputing new phone, have a button instead of an input
      // that if clicked will begin inputing new phone number
      <button type="button" onClick={() => props.handlePhonesClick("")}><i className="fa fa-plus-circle fa-lg" aria-hidden="true"></i></button>}
    </li>
  </ul>
};

export default Phones;