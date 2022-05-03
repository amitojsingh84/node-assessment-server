# Node Assessment Server

## Setup the server (only one time)
- clone from github using following cmd.
```
git clone https://github.com/amitojsingh84/node-assessment-server.git
```
- Install the npm packages.
```
npm install
```

## Start the server
- Server will run at port 3000.
```
npm run start <number-of-threads>
```

## Stop the server
- Press `Ctrl` + `C` to stop the server.

## API
```
const API_PATH   = '/process/ticket'
const API_METHOD = 'POST'

const type request = {
  noOfTickets : number
}

const type response = {
  success : 0 | 1
}
```
- To hit the API make a `POST` request to `http://localhost:3000/process/ticket` with the param as json data.
