const MS_MULTIPLIER = 1000

type Body = {
  noOfTickets : number 
}

export class ApiController {

  private noOfOngoingRequests : number = 0

  constructor(private maxRequests : number = 0) {}

  public async processTickets(body : Body) {
    if(!body.noOfTickets) throw new Error('noOfTickets not defined')

    if(this.noOfOngoingRequests >= this.maxRequests) throw new Error('Server busy')

    this.noOfOngoingRequests ++
    const requestTime = body.noOfTickets * MS_MULTIPLIER
    await this.sleep(requestTime)
    this.noOfOngoingRequests --
  }

  private async sleep(ms : number) {
    return new Promise((resolve, reject) => {
      setTimeout(resolve, ms)
    })
  }
}
