import React, {Component, useState} from "react";

import screenEnum from "../screenEnum";

const ContactList = props => {
  const [hover, setHover] = useState("");

  // Contact can be deleted when hovering over it.
  // Handle delete button existence with mouse enter and leave events
  return <ul id="contact-list">
    {props.list.map(contact => <li key={contact._id}
    onMouseEnter={() => {setHover(contact._id)}}
    onMouseLeave={() => {
      // Use async safe version because otherwise we
      // might end up deleting wrong delete button
      setHover(prevstate => {
      return prevstate === contact._id ? "" : prevstate;
    })}}
    onClick={() => {
      // Change screen to viewing a single contact
      // when clicking on a contact
      props.get(contact._id)
      .then(() => {
        // Contact data is ready
        props.setScreen(screenEnum.view);
      });
    }}
    >
      {contact._id}

      {/* Can delete contact I'm hovering over */}
      {hover === contact._id ? <button type="button" onClick={e => {
        e.stopPropagation();
        props.setConfirmDelete(contact._id);
      }}>
        <i className="fa fa-trash fa-2x" aria-hidden="true"></i>
      </button> : null}
    </li>)}
  </ul>
};

export default ContactList;