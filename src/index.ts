import { ApiController }  from './api-controller'
import * as http          from 'http'
import * as url           from 'url'
import * as stream        from 'stream'
import lo                 from 'lodash'

const PORT                   = 3000,
      HTTP_PROTOCOL          = 'http:',
      HTTP_HEADER_VALUE_JSON = 'application/json',
      STATUS_CODE            = {
                                  OK        : 200,
                                  NOT_FOUND : 404
                               },
      HTTP_METHOD            = { POST : 'POST' },
      HTTP_HEADER_KEY        = { contentType : 'content-type' },
      DEFAULT_REQUEST_ID     = '---'

export class AssessmentServer {
  private server : http.Server

  constructor(private port : number, private controller : ApiController) {
    this.server = http.createServer(this.handleRequest.bind(this))
  }

  public start() {
    this.server.listen(this.port)
    this.server.on('error', this.onError)
    this.server.on('listening', this.onListening.bind(this, this.port))
  }

  public stop() {
    this.server.close()
    console.debug('Server stopped')
    process.exit()
  }

  private async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {
    const { headers, method, url: reqUrl } = req

    try {
      if(!method || !reqUrl) return this.sendResponse(res, DEFAULT_REQUEST_ID, {},
                                                      { message: 'Invalid path' }, STATUS_CODE.NOT_FOUND)
      
      const baseUrl = [HTTP_PROTOCOL, '//', headers.host].join(''),
            urlObj  = new url.URL(reqUrl, baseUrl),
            path    = urlObj.pathname

      if(!path || path !== '/process/ticket' || method !== HTTP_METHOD.POST)
        return this.sendResponse(res, DEFAULT_REQUEST_ID, {}, { message: 'Invalid path' }, STATUS_CODE.NOT_FOUND)

      const params = await this.parseBody(req)
      await this.invokeApi(params, res)
    } catch(err) {
      console.error('Some error occurred')
    }
  }

  private async parseBody(req : http.IncomingMessage) {
    const body : string = await this.streamToString(req)
    switch (req.headers[HTTP_HEADER_KEY.contentType]) {
      default :
        try {
          return JSON.parse(body)
        } catch (err) {
          console.error('Could not parse post data as json %s', body)
          return { body }
        }
    }
  }

  private async streamToString(stream : stream.Readable) : Promise<string> {
    return await new Promise((resolve, reject) => {
      let data = ''
      stream.on('data', (chunk) => {
        data += chunk.toString()
      }).on('end', () => {
        resolve(data)
      }).on('error', (err) => {
        reject(err)
      })
    })
  }

  private onListening(port : number) {
    console.info('Server listening on port %s', port)
  }

  private onError(err : any) {
    console.error('Error on server %s', err)
    process.exit(1)
  }

  private async invokeApi(params : any, res : http.ServerResponse) {
    const requestId = this.getRandomRequestId()

    try {
      console.log('API req', requestId, params)
      await this.controller.processTickets(params)
      return this.sendResponse(res, requestId, params, { response : 'Success' }, STATUS_CODE.OK)
    } catch(err) {
      return this.sendResponse(res, requestId, params, { response : 'Failure' }, STATUS_CODE.OK)
    }
  }

  private sendResponse(httpRes     : http.ServerResponse,
                       requestId   : string,
                       req         : {[index : string] : any},
                       resp        : {[index : string] : any},
                       statusCode  : number) {

    console.log('API res', requestId,req, resp)
    httpRes.writeHead(statusCode, { [HTTP_HEADER_KEY.contentType] : HTTP_HEADER_VALUE_JSON })
    httpRes.end(JSON.stringify(resp))
  }

  private getRandomRequestId() {
    const requestId = `${this.getRandomCharacter()}${this.getRandomCharacter()}${this.getRandomCharacter()}`
  
    return requestId
  }

  private getRandomCharacter() {
    return String.fromCharCode(65 + lo.random(0, 25, false))
  }
}

const args             = process.argv,
      controller       = new ApiController(+args[2]),
      assessmentServer = new AssessmentServer(PORT, controller)

process.on('SIGINT', () => {
  assessmentServer.stop()
})
process.on('SIGTERM', () => {
  assessmentServer.stop()
})

assessmentServer.start()
