let reqNo : number = 0
// const maxReq = 10

type Body = {
  noOfTickets : number 
}

export class ApiController {

  constructor(private maxRequests : number) {}

  async getTicket(body : Body) : Promise<number> {
    console.log('In getTicket %s', JSON.stringify(body))

    return new Promise((resolve) => {
      console.log(reqNo)
      const noOfTickets = body.noOfTickets
      console.log(noOfTickets)
      console.log(this.maxRequests)
      reqNo++
      if(reqNo <= this.maxRequests) {
        // console.log(reqNo)
        setTimeout(() => {
          reqNo--
          resolve(1)
        }, noOfTickets * 1000)
      } else {
        resolve(0)
      }
    })
  }
}
