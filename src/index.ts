import * as http          from 'http'
import * as url           from 'url'
import { streamToString } from './utils'
import { ApiController }  from './api-controller'

const PORT                   = 3000,
      HTTP_PROTOCOL          = 'http://',
      HTTP_HEADER_VALUE_JSON = 'application/json',
      VALIDATION_ERROR       = 'VALIDATION ERROR',
      OPERATION_SUCCESS      = 'OPERATION SUCCESS',
      STATUS_CODE            = {
                                  OK        : 200,
                                  NOT_FOUND : 404
                               },
      HTTP_METHOD            = {
                                 POST : 'POST'
                               },
      HTTP_HEADER_KEY        = {
                                 contentType : 'content-type',
                                 requestId   : 'request-id'
                               }
      

type API = {
  fn : (params : any) => Promise<any>
}

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

  private async handleRequest(req : http.IncomingMessage, res : http.ServerResponse) {
    const { headers, method, url: reqUrl }  = req

    try {

      if(!method || !reqUrl) {
        console.error('Invalid request %s %s', method, reqUrl)
        res.writeHead(STATUS_CODE.NOT_FOUND, { [HTTP_HEADER_KEY.contentType] : HTTP_HEADER_VALUE_JSON})
        res.end(JSON.stringify({ message: 'Route not found' }))
        return
      }
      
      const baseUrl = [HTTP_PROTOCOL, headers.host].join(''),
            urlObj  = new url.URL(reqUrl, baseUrl),
            query   = urlObj.search ? urlObj.search.slice(1) : urlObj.search,
            path    = urlObj.pathname

      console.debug('query and path %s %s', query, path)

      if(!path) {
        console.error('Invalid request %s %s', method, reqUrl)
        return
      }

      console.debug('Method Url and path %s %s %s', method, reqUrl, path)
      let api : API

      console.log('path', path)
      console.log('method', method)

      if (path === '/process/ticket' && method === HTTP_METHOD.POST) {
        api = {
          fn : this.controller.getTicket
        }          
      } else {
        res.writeHead(STATUS_CODE.NOT_FOUND, { [HTTP_HEADER_KEY.contentType] : HTTP_HEADER_VALUE_JSON})
        res.end(JSON.stringify({ message: 'Route not found' }))
        return
      }

      let params = {}

      switch(method) {
        case HTTP_METHOD.POST :
          params = await this.parseBody(req)
          break

        default :
          console.error('Rejecting request with invalid method %s %s %s', method, reqUrl, path)
      }
      
      console.log(params)
      await this.invokeApi(api, params, res)

    } catch(err) {
      console.error('Some error occurred')
    }
  }

  private async parseBody(req : http.IncomingMessage) {
    console.debug('parseQuery')

    const body : string = await streamToString(req)

    console.debug('parseQuery body %s', body)

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

  private onListening(port : number) {
    console.info('Server listening on %s', port)
  }

  private onError(err : any) {
    console.error('Error on server. %s', err)
    process.exit(1)
  }

  public async invokeApi(api : API, params : any, res : http.ServerResponse) {
    console.log('invokeApi %s %s', JSON.stringify(api), JSON.stringify(params))

    try {      
      const resp = await api.fn(params)
      console.log('Sending success response %s', JSON.stringify(resp))

      return res.end(this.sendSuccessResponse(res, resp, STATUS_CODE.OK, HTTP_HEADER_VALUE_JSON))
    } catch(err) {
      console.log('Sending error response %s', err)
      return res.end(this.sendErrorResponse(res, STATUS_CODE.OK, HTTP_HEADER_VALUE_JSON))             
    }
  }

  private sendSuccessResponse(res         : http.ServerResponse, 
                              response    : any, 
                              statusCode  : number, 
                              contentType : string) {

    res.writeHead(statusCode, { [HTTP_HEADER_KEY.contentType] : contentType })
    const data = {
      success : OPERATION_SUCCESS,
      response
    }

    const resp = { data }
    return JSON.stringify(resp)
  }

  private sendErrorResponse(res         : http.ServerResponse,
                            statusCode  : number,
                            contentType : string) {

    res.writeHead(statusCode, { [HTTP_HEADER_KEY.contentType] : contentType })

    const data = {
      error : VALIDATION_ERROR
    }

    const resp = { data }
    return JSON.stringify(resp)
  }
}

/**
 * To make the request you have to do a POST hit on http://localhost:3000/process/ticket
 */

const args       = process.argv,
      controller = new ApiController(+args[2]),
      assServer  = new AssessmentServer(PORT, controller)

// console.log(args[2])

assServer.start()