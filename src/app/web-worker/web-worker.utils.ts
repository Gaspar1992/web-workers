import {
  GenerateWebWorkerActionFn,
  WebWorkerDataMsgkey,
  WebWorkerDataMsgkeyINIT,
  WebWorkerFnAction,
  WebWorkerMsg,
  WebWorkerMsgGenerator,
  WebWorkerResponses
} from "./web-worker.types";

const isPromise = (value: any): value is Promise<any> => value?.then
export const WEB_WORKER_DOMAIN: WebWorkerDataMsgkeyINIT = '[WEB_WORKER]'
export const isWebWorkerDataMsgKey = (value: any): value is WebWorkerDataMsgkey => typeof value === 'string' && value.startsWith('data-', 0);

export function generateWebWorkerDataMsgKey(key: string): WebWorkerDataMsgkey {
  return `${WEB_WORKER_DOMAIN} ${key}`;
}

export const generateWebWorkerActionFn = <T, R>(key: WebWorkerDataMsgkey, action: WebWorkerFnAction<T>, webServiceResponse = false): WebWorkerFnAction<T> => {
  return (params: WebWorkerMsg<T>) => {
    const exec = action(params);

    if (!webServiceResponse) return;

    isPromise(exec) ?
      exec.then((data) => postMessage({id: params.id, key, data} as WebWorkerResponses<R>)) :
      postMessage({key, data: exec} as WebWorkerResponses<R>)
  }
}

export function setMessageGenerator<T>(key: WebWorkerDataMsgkey): WebWorkerMsgGenerator<T> {
  return (id: string, params: T): WebWorkerMsg<T> => ({
    key,
    id,
    params
  })
}

export function generateWebWorkerAction<T, R = any>(key: string, action: WebWorkerFnAction<T>, webServiceResponse = true): GenerateWebWorkerActionFn<T> {
  const wWKey: WebWorkerDataMsgkey = generateWebWorkerDataMsgKey(key);
  const wWMessage = setMessageGenerator<T>(wWKey)
  const wWAction = generateWebWorkerActionFn<T, R>(wWKey, action, webServiceResponse)


  return {
    key: wWKey, message: wWMessage, action: wWAction
  }
}


