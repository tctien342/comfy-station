import { IncomingMessage } from 'http'

export const convertIMessToRequest = async (req: IncomingMessage) => {
  var headers = new Headers()
  for (var key in req.headers) {
    if (req.headers[key]) headers.append(key, req.headers[key] as string)
  }
  const body = await new Promise<string>((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      resolve(data)
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
