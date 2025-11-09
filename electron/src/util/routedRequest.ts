import dns from 'node:dns';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

async function customLookup(hostname: string, options: any, callback: any) {
  // Create a new DNS resolver instance with Google DNS servers
  const resolver = new dns.Resolver();
  resolver.setServers(['1.1.1.1', '1.1.0.0']);

  // Resolve both IPv4 and IPv6 addresses
  if (options.family === 6) {
    return resolver.resolve6(hostname, (err, addresses) => {
      if (err) return callback(err);
      return callback(null, addresses[0], 6);
    });
  }
  return resolver.resolve4(hostname, (err, addresses) => {
    if (err) return callback(err);
    return callback(null, addresses[0], 4);
  });
}

export default async function axiosGet(
  url: string,
  config?: AxiosRequestConfig,
) {
  let response: AxiosResponse;

  console.log('axiosGet', url);
  try {
    response = await axios.get(url, {
      lookup: customLookup,
      ...config,
    });
    console.log('axiosGet res.status', response.status);
  } catch (error) {
    console.error('axiosGet error', url, error);
    return null;
  }
  return response;
}
