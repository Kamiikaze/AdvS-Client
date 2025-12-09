import dns from 'node:dns';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import axios from 'axios';

/* eslint-disable no-console */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function axiosGet(url: string, config?: AxiosRequestConfig) {
  let response: AxiosResponse;

  // ToDo: Set actual Chrome User Agent
  console.log('axiosGet', url);
  try {
    response = await axios.get(url, {
      lookup: (hostname, options, cb) => customLookup(hostname, options, cb),
      ...config,
    });

    console.log('axiosGet', 'response.status', response.status);
  } catch (error) {
    console.error('axiosGet', 'error', error);
    return null;
  }
  return response;
}

export async function axiosPost(
  url: string,
  payload?: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  config?: AxiosRequestConfig
) {
  let response: AxiosResponse;

  // ToDo: Set actual Chrome User Agent
  console.log('axiosPost', url, payload);
  try {
    response = await axios.post(url, payload, {
      lookup: (hostname, options, cb) => customLookup(hostname, options, cb),
      ...config,
    });

    console.log('axiosPost', 'response.status', response.status);
  } catch (error) {
    console.error('axiosPost', 'error', error);
    return null;
  }
  return response;
}
