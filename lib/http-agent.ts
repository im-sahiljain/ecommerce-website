import http from 'http';
import https from 'https';

export const httpKeepAliveAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  maxSockets: 256,
  maxFreeSockets: 64,
  timeout: 5000,
});

export const httpsKeepAliveAgent = new https.Agent({
  keepAlive: true,
  keepAliveMsecs: 10000,
  maxSockets: 256,
  maxFreeSockets: 64,
  timeout: 5000,
});

export function getKeepAliveAgent(url: string) {
  return url.startsWith('https') ? httpsKeepAliveAgent : httpKeepAliveAgent;
}
