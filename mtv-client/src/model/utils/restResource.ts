import { AxiosRequestConfig, AxiosInstance, AxiosPromise } from 'axios';
import g from './g';

export default class Resource<T, R> {
  /**
   *
   * @param server AxiosInstance
   * @param url Recourse end point
   */
  constructor(private server: AxiosInstance, private url: string) {}

  /**
   * Get all items
   * @param data body data - in most cases, this should be {}
   * @param params URL parameters
   */
  public all(data = {}, params = {}): Promise<R> {
    if (g.auth) {
      params['uid'] = g.auth.uid;
    }
    const promise = this.server.get<R>(this.url, { data, params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Get one item
   * @param id the item ID (name) to be retrieved
   * @param data body data – in most cases, this should be {}
   * @param params URL parameters
   */
  public find(id, data = {}, params = {}): Promise<T> {
    if (g.auth) {
      params['uid'] = g.auth.uid;
    }
    const newUrl = `${this.url}${id}`;
    const promise = this.server.get<T>(newUrl, { data, params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Create an item.
   * @param data the item data to create
   * @param params URL parameters
   */
  public create(data = {}, params = {}): Promise<T> {
    if (g.auth) {
      params['uid'] = g.auth.uid;
    }
    const promise = this.server.post<T>(this.url, data, { params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Delete an item.
   * @param id the item ID (name) to delete
   * @returns Promise of the response's status
   */
  public delete(id): Promise<number> {
    let params = {};
    if (g.auth) {
      params['uid'] = g.auth.uid;
    }
    const newUrl = `${this.url}${id}/`;
    const promise = this.server.delete<number>(newUrl, { params });
    return promise
      .then(res => res.status)
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Update an item.
   * @param id the item ID (name) to update
   * @param data the updated data of this item
   * @param params URL parameters
   */
  public update(id, data = {}, params = {}): Promise<T> {
    if (g.auth) {
      params['uid'] = g.auth.uid;
    }
    const newUrl = `${this.url}${id}/`;
    const promise = this.server.put<T>(newUrl, data, { params });
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }

  /**
   * Allow customize your request.
   * @param config request config
   */
  public request<Z>(config: AxiosRequestConfig = {}): Promise<Z> {
    const promise: AxiosPromise<Z> = this.server(config);
    return promise
      .then(res => {
        if (res.status !== 204) {
          return res.data;
        }
        return null;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }
}
