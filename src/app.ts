const http          = require('http'),
      Ticket        = require('./controller'),
     { getReqData } = require('./utils')

const PORT        = process.env.PORT || 5000,
      STATUS_CODE = {
                      OK        : 200,
                      NOT_FOUND : 404
                    },
      HTTP_METHOD = {
                      GET    : 'GET',
                      POST   : 'POST'
                    }

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