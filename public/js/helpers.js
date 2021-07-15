// Use fetch api for ajax whose params are in a query string
// (This means GET and DELETE requests)
// Returns a promise that resolves with the response json
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

// Use fetch api for ajax whose params are in they body
// (This means POST and PUT requests)
// Returns a promise that resolves with the response json
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

export {fetchQuery, fetchBody};