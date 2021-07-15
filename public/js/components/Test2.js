import React, {Component} from "react";

// import re from "../../../universal/regularExpressions.js";

import image from '../../images/note.png';

const fetchQuery = (method, params) => {
  const url = new URL(window.location.origin + "/api");
  if (params) url.search = new URLSearchParams(params).toString();
  return fetch(url, {
    method,
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    referrer: 'no-referrer', // no-referrer, *client
  })
  .then(response => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error('Something went wrong on api server!');
    }
  });
};

const fetchBody = (method, params) => {
  return fetch(window.location.origin + "/api", {
    method: method,
    mode: 'cors', // no-cors, cors, *same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
        'Content-Type': 'application/json',
    },
    referrer: 'no-referrer', // no-referrer, *client
    body: JSON.stringify(params), // body data type must match "Content-Type" header
  })
  .then(response => {
    if (response.status === 200) {
      return response.json();
    } else {
      throw new Error('Something went wrong on api server!');
    }
  });
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      getResult: [],
      postResult: {},
      putResult: {},
      deleteResult: {}
    };
  }

  render() {
    return (
      <section id="debug">
        <form action="/api" method="GET" onSubmit={e => {
          console.log(e);
          e.preventDefault();
          const params = {name: (new FormData(e.target)).get("name")};
          fetchQuery("GET", params).then(json => {
            this.setState({getResult: json});
          })
          .catch(error => console.error(error));
        }}>
          <input name="name" placeholder="Name"></input>
          <button>Get</button>
          <div>{JSON.stringify(this.state.getResult)}</div>
        </form>
        <form action="/api" method="POST" onSubmit={e => {
          console.log(e);
          e.preventDefault();
          const data = new FormData(e.target);
          const params = {};
          if (data.get("name")) params.name = data.get("name");
          if (data.get("email")) params.email = data.get("email");
          if (data.get("address")) params.address = data.get("address");
          if (data.get("phones")) params.phones = data.get("phones").split(",");
          fetchBody("POST", params).then(json => {
            this.setState({postResult: json});
          })
          .catch(error => console.error(error));
        }}>
          <input name="name" placeholder="Name"></input>
          <input name="email" placeholder="Email"></input>
          <input name="address" placeholder="Address"></input>
          <input name="phones" placeholder="Phones"></input>
          <button>Post</button>
          <div>{JSON.stringify(this.state.postResult)}</div>
        </form>
        <form action="/api" onSubmit={e => {
          console.log(e);
          e.preventDefault();
          const data = new FormData(e.target);
          const params = {};
          if (data.get("name")) params.name = data.get("name");
          if (data.get("email")) params.email = data.get("email");
          if (data.get("address")) params.address = data.get("address");
          if (data.get("phones")) params.phones = data.get("phones").split(",");
          fetchBody("PUT", params).then(json => {
            this.setState({putResult: json});
          })
          .catch(error => console.error(error));
        }}>
          <input name="name" placeholder="Name"></input>
          <input name="email" placeholder="Email"></input>
          <input name="address" placeholder="Address"></input>
          <input name="phones" placeholder="Phones"></input>
          <button>Put</button>
          <div>{JSON.stringify(this.state.putResult)}</div>
        </form>
        <form action="/api" onSubmit={e => {
          console.log(e);
          e.preventDefault();
          const params = {name: (new FormData(e.target)).get("name")};
          fetchQuery("DELETE", params).then(json => {
            this.setState({deleteResult: json});
          })
          .catch(error => console.error(error));
        }}>
          <input name="name" placeholder="Name"></input>
          <button>Delete</button>
          <div>{JSON.stringify(this.state.deleteResult)}</div>
        </form>
      </section>
    )
  }
}

export default App;