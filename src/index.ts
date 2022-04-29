const  Ticket       = require('./controller'),
     { getReqData } = require('./utils')

import * as http from 'http'

const PORT        = 3000,
      STATUS_CODE = {
                      OK        : 200,
                      NOT_FOUND : 404
                    },
      HTTP_METHOD = {
                      POST : 'POST'
                    }

// TODO : should not be async
const server = http.createServer(async (req : any, res : any) => {

  if (req.url === '/process/ticket' && req.method === HTTP_METHOD.POST) {
    const reqData = await getReqData(req),
          resp    = await new Ticket().getTicket(JSON.parse(reqData))

    res.writeHead(STATUS_CODE.OK, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(resp))
  } else {
    res.writeHead(STATUS_CODE.NOT_FOUND, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Route not found' }))
  }

})

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}`)
})


export class AssessmentServer {
  private server : http.Server

  constructor(private port : number, private controller : ApiController) {
    this.server = http.createServer(this.handleRequest.bind(this))
  }

  public start() {

  }

  private async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {

  }
}

/**
 * To make the request you have to do a POST hit on http://localhost:3000/process/ticket
 */

const args = process.argv,
      controller = new ApiController(args[2]),
      assServer = new AssessmentServer(PORT, controller)
    
assServer.start()