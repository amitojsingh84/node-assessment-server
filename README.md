# Node.js Assessment Server

## Server setup (one time only)
- clone from GitHub using following cmd.
```
git clone https://github.com/amitojsingh84/node-assessment-server
```
- Install the npm packages.
```
npm install
```

## Start the server
- Server will run at port 3000.
- Server files will be auto compiled after server setup.
```
npm run server <number-of-threads>        //to start the server
npm start <number-of-threads>             //to recompile files & start the server
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
  response : 'Success' | 'Failure'
}
```
- To hit the API make a `POST` request to `http://localhost:3000/process/ticket` with the param as json data.
