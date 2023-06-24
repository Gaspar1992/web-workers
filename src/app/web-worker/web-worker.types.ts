import {initialWorkerState, WEB_WORKER_DOMAIN} from "./web-worker.utils";
import {BehaviorSubject, Subject} from "rxjs";
import {ConsoleLogMessage} from "./web-worker.actions";

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

export class NgWebWorker {

  get webWorkerState() {
    return this._webWorkerState$.value;
  }

  get webWorkerState$() {
    return this._webWorkerState$.asObservable();
  }

  get workerResponse$() {
    return this._workerResponse$?.asObservable();
  }

  private readonly lastMessage?: WebWorkerMsg<unknown>;
  private readonly worker: Worker;
  private readonly _webWorkerState$ = new BehaviorSubject<WebWorkerState<any>>(initialWorkerState())
  private readonly _workerResponse$: Subject<WebWorkerResponses> = new Subject<WebWorkerResponses>();

  constructor(worker: Worker, debug = false) {
    this.worker = worker;
    this.setMessageSubscribes();
    debug && this.worker.postMessage(ConsoleLogMessage('init', ['Initial Worker Call']))
  }

  terminate() {
    this.worker.terminate();
    this._workerResponse$.complete();
    this._webWorkerState$.complete();
  }

  sendMessage = <T = any>(message: WebWorkerMsg<T>) => {
    if (this.webWorkerState.state !== WebWorkerStates.Waiting) {
      console.error('WebWorker WORKING, work refused', message)
      return;
    }

    this._webWorkerState$.next({
      state: WebWorkerStates.Working,
      job: message
    });

    this.worker.postMessage(message);
  };

  private setMessageSubscribes() {
    this.worker.onmessage = ({data}) => {
      this._webWorkerState$.next({
        ...this.webWorkerState,
        state: WebWorkerStates.Done,
      })
      this._webWorkerState$.next({
        state: WebWorkerStates.Waiting,
      });
      this._workerResponse$?.next(data);
    };

    this.worker.onerror = (error) => {
      this._webWorkerState$.next({
        state: WebWorkerStates.Error,
        error
      });
    }

    this.worker.onmessageerror = ({data: error}: MessageEvent<WebWorkerError>) => {
      const {key, id, params: data} = this.lastMessage as WebWorkerMsg<unknown>
      this._workerResponse$?.next({
        key,
        data,
        id,
        error
      })
      this._webWorkerState$.next({
        state: WebWorkerStates.Error,
        job: undefined,
        error
      });

    }
  }
}
