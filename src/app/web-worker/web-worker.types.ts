import {WEB_WORKER_DOMAIN} from "./web-worker.utils";

export interface WebWorkerServiceConfig {
  numberWorkers: number,
  debug: boolean
}

export type WebWorkerDataMsgkeyINIT = '[WEB_WORKER]';
export type WebWorkerDataMsgkey = `${WebWorkerDataMsgkeyINIT} ${string}`;
export type WebWorkerMsgGenerator<T> = (id: string, params: T) => WebWorkerMsg<T>;

export interface WebWorkerMsg<T = any> {
  key: WebWorkerDataMsgkey;
  id: string;
  params: T
}

export type WebWorkerAction<T> = (params: WebWorkerMsg<T>) => void;
export type WebWorkerFnAction<T, R = any> = (data: WebWorkerMsg<T>) => WebWorkerResponses<R> | Promise<WebWorkerResponses<R>> | void;
export type GenerateWebWorkerActionFn<T> = {
  key: WebWorkerDataMsgkey, message: WebWorkerMsgGenerator<T>, action: WebWorkerFnAction<T>
};
export type WebWorkerResponses<T = any> = { key: WebWorkerDataMsgkey, data: T, id: string, error?: WebWorkerError }


export enum WebWorkerStates {
  Error = 'Error',
  Waiting = 'Waiting',
  Working = 'Working',
  Done = 'Done'
}

export interface WebWorkerState<T> {
  state: WebWorkerStates;
  job?: WebWorkerMsg<T>,
  error?: ErrorEvent | WebWorkerError
}

export class WebWorkerError extends Error {

  override name = `${WEB_WORKER_DOMAIN} [ERROR]`

  constructor(error: Error | string) {
    super(error instanceof Error ? error.message : error);
  }

}
