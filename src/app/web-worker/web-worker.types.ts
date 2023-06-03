export type WebWorkerDataMsgkeyINIT = '[WEB_WORKER]';
export type WebWorkerDataMsgkey = `${WebWorkerDataMsgkeyINIT} ${string}`;
export type WebWorkerMsgGenerator<T> = (id: string, params: T) => WebWorkerMsg<T>;
export type WebWorkerFnAction<T, R = any> = (data: WebWorkerMsg<T>) => WebWorkerResponses<R> | Promise<WebWorkerResponses<R>> | void;
export type GenerateWebWorkerActionFn<T> = {
  key: WebWorkerDataMsgkey, message: WebWorkerMsgGenerator<T>, action: WebWorkerFnAction<T>
};
export type WebWorkerResponses<T = any> = { key: WebWorkerDataMsgkey, data: T, id: string }

export interface WebWorkerMsg<T = any> {
  key: WebWorkerDataMsgkey;
  id: string;
  params: T
}

export type WebWorkerAction<T> = (params: WebWorkerMsg<T>) => void;


