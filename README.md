# node-assessment-server
Node assessment server

## Installing First time
- clone from github using following cmd.
- `git clone https://github.com/amitojsingh84/node-assessment-server.git`
- Install the npm packages
- `npm install`

## Starting the server
- npm run start

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

## Additional Info
- PORT:3000 we are using to run the server

