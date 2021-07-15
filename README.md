# contacts
An app that stores contact information

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