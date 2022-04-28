const http      = require('http'),
      fs        = require('fs'),
      urlModule = require('url')

const SERVER      = {
                      PROTOCOL  : 'http:',
                      HOST      : 'localhost',
                      PORT      : 5000,
                      PATH      : '/process/ticket',
                    },
      HTTP_METHOD = {
                      GET    : 'GET',
                      POST   : 'POST',
                    },
      LINE_SPLIT  = '\n'

type UrlObj = {
  protocol : string
  hostname : string,
  port     : number,
  pathname : string
}

type Options = UrlObj & {
  method ?: string
}

let count : number = 0,
    ticketReq : number[],
    totalReq : number


class LoadBalancer {

  async run(noOfRequest : number, filePath : string) {
    console.debug('the given params are. %s %s', noOfRequest, filePath)

    const ticketArr = fs.readFileSync(filePath, 'utf-8').split(LINE_SPLIT).filter(Boolean),
          tickets   = ticketArr.map((val : string) => parseInt(val))
          
    ticketReq = [ ...tickets ]
    totalReq  = noOfRequest

    while(count < totalReq && ticketReq.length > 0) {
      const ticket = ticketReq.shift()
      if(ticket) this.executeProcessTicketRequest(ticket)
      count++
    }
  }               

  executeProcessTicketRequest(noOfTickets : number) {

    const urlObj : UrlObj   = {
                                protocol : SERVER.PROTOCOL,
                                hostname : SERVER.HOST,
                                port     : SERVER.PORT,
                                pathname : SERVER.PATH
                              },
          options : Options = urlObj,
          data    : Object  = {
                                noOfTickets
                              }

    options.method = HTTP_METHOD.POST

    // console.debug('request. %s %s %s', JSON.stringify(data),
    //             JSON.stringify(urlObj), JSON.stringify(options))
    try {
      this.executeRequest(urlObj, options, JSON.stringify(data))
    } catch(e) {
      console.warn('Error in executing http request. %s', e)
    }
  }

  async executeRequest(urlObj : UrlObj, options : Options, data : string) {
    // console.debug('executeRequest %s %s %s', urlObj, options, data)

    let statusCode

    const pr = new Promise((resolve, reject) => {

      const httpModule = http,
            url        = urlModule.format(urlObj),
            req        = httpModule.request(url, options)

      // console.log(url)
  
      req.on('error', (err : Error) => {
        return reject(err)
      })
      
      req.on('timeout', () => {
        req.destroy()
      })
  
      req.on('response', (res : any) => {
        statusCode = res.statusCode
        let body = ''
  
        res.on('data', (d : string) => {
          body = body + d
        })
        
        res.on('end', () => {
          console.log(JSON.parse(data).noOfTickets, body)
          count--
          return resolve(body)
        })
      })
        
      req.end(data)
    })
  
    const resp = await pr
    // console.debug('executeHttpsRequest response %s %s %s %s %s', JSON.stringify(urlObj), JSON.stringify(options), data, 
    //              resp, statusCode)

    while(count < totalReq && ticketReq.length > 0) {
      const ticket = ticketReq.shift()
      if(ticket) this.executeProcessTicketRequest(ticket)
      count++
    }  
  }
}


const args = process.argv

args.shift()
args.shift()

const noOfRequest = args[0],
      filePath    = args[1]

new LoadBalancer().run(+noOfRequest, filePath)
