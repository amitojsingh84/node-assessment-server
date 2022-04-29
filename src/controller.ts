let reqNo : number = 0

type Body = {
  noOfTickets : number 
}

class Controller {

  constructor(private maxReuests : number) {}

  async getTicket(body : Body) : Promise<number> {
    console.log('In getTicket %s', JSON.stringify(body))

    return new Promise((resolve) => {
      
      const noOfTickets = body.noOfTickets
      // console.log(noOfTickets)
      reqNo++
      if(reqNo <= this.maxReuests) {
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

module.exports = Controller