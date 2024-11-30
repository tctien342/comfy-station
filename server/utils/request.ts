import { IncomingMessage } from 'http'

export const convertIMessToRequest = async (req: IncomingMessage) => {
  var headers = new Headers()
  for (var key in req.headers) {
    if (req.headers[key]) headers.append(key, req.headers[key] as string)
  }

  const contentType = req.headers['content-type'] || ''
  const isMultipart = contentType.includes('multipart/form-data')

  const body = await new Promise<string | Buffer>((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk) => {
      chunks.push(chunk)
    })
    req.on('end', () => {
      if (isMultipart) {
        resolve(Buffer.concat(chunks))
      } else {
        resolve(Buffer.concat(chunks).toString())
      }
    })
    req.on('error', (err) => {
      reject(err)
    })
  })

  const absoluteUrl = new URL(req.url ?? '', `http://${req.headers.host}`)
  const request = new Request(absoluteUrl.toString(), {
    method: req.method,
    headers: headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? null : body
  })
  return request
}
