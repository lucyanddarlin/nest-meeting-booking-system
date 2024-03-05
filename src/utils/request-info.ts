import { Request } from 'express'

interface ReqMainInfo {
  url: string
  host: string
  ip: string | string[]
  method: string
  query: any
  body: any
}

export const getReqMainInfo = (req: Request): ReqMainInfo => {
  const { query, headers, url, method, body, socket, ip: mIp } = req

  const xRealIP = headers['X-Real-IP']
  const xForwardedFor = headers['X-Forwarded-For']
  const { remoteAddress } = socket ?? {}
  const ip = xRealIP || xForwardedFor || mIp || remoteAddress

  return { url, host: headers.host, ip, method, query, body }
}
