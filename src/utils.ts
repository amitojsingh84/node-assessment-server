import * as stream from 'stream'

/**
 * 
 * @param stream Readable stream
 * @returns Readable stream converted into string
 */
export async function streamToString(stream : stream.Readable) : Promise<string> {
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

export function getReqData(req : any) {

  return new Promise((resolve, reject) => {
    try {
      let body : string = ''
      req.on('data', (chunk : string) => {
        body += chunk.toString()
      })
      req.on('end', () => {
        resolve(body)
      })
    } catch (error : Error | unknown) {
      reject(error)
    }
  })
}
