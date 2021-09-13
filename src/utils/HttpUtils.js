import { HttpClient } from 'snk-libs';

const httpClient = new HttpClient({ timeout: 60000 })

export default class HttpUtils {
  static _seq = 0;

  static _createUrl(params) {
    const server = params.server || SERVER;
    return server + params.url;
  }
  static async post(params) {
    let uri = '';
    if (params.url !== undefined) {
      if (params.url.indexOf('http') != -1) {
        uri = `${params.url}?token=${params.tokes}`;
        // uri = `${params.url}`;
      } else {
        uri = HttpUtils._createUrl(params);
      }
    }

    const request = HttpUtils._createRequest(params.body);
    request.headers = params.headers || {};
    const response = await httpClient.post(uri, request);
    return HttpUtils._processResponse(response);
  }

  static async get(params) {
    const uri = HttpUtils._createUrl(params);
    const request = {
      headers: {
        Seq: HttpUtils._seq += 1,
      },
    };
    request.headers = params.headers || {};
    const response = await httpClient.get(uri, request);
    return HttpUtils._processResponse(response);
  }

  static async put(params) {
    const uri = HttpUtils._createUrl(params);
    const request = HttpUtils._createRequest(params.body);
    const response = await httpClient.put(uri, request);
    return HttpUtils._processResponse(response);
  }

  static async upload(params) {
    const uri = HttpUtils._createUrl(params);
    const request = HttpUtils._createRequest(params.body);
    request.headers = params.headers || {};
    const response = await httpClient.upload(uri, request, params.pcb);
    return HttpUtils._processResponse(response);
  }

  static _createRequest(body) {
    const request = {
      headers: {
        Seq: HttpUtils._seq += 1,
      },
      body,
    };
    return request;
  }

  static async _processResponse(response) {
    const json = await response.json();
    const { code, message, data } = json;
    if (code === 0) {
      return data;
    } else {
      const err = { code, message };
      throw err;
    }
  }
}
