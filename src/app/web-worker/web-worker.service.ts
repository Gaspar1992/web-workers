import {inject, Injectable, InjectionToken, OnDestroy} from '@angular/core';
import {
  WebWorkerError,
  WebWorkerMsg,
  WebWorkerResponses,
  WebWorkerServiceConfig,
  WebWorkerState,
  WebWorkerStates
} from "./web-worker.types";
import {BehaviorSubject, Subject} from "rxjs";
import {ConsoleLogMessage} from "./web-worker.actions";
import {initialWorkerState, WEB_WORKER_DOMAIN} from "./web-worker.utils";

export const WebWorkerConfig = new InjectionToken<WebWorkerServiceConfig>('[WebWorkerService', {
  providedIn: 'root',
  factory: () => ({numberWorkers: 5, debug: true})
})


@Injectable({
  providedIn: 'root'
})
export class WebWorkerService implements OnDestroy {

  private readonly worker?: Worker;
  private readonly webWorkerConfig = inject(WebWorkerConfig);
  private readonly _webWorkerState$ = new BehaviorSubject<WebWorkerState<any>>(initialWorkerState())
  private readonly _workerResponse$?: Subject<WebWorkerResponses>
  private readonly lastMessage?: WebWorkerMsg<unknown>;

  get webWorkerState() {
    return this._webWorkerState$.value;
  }

  webWorkerState$(
    observerOrNext?: Partial<BehaviorSubject<WebWorkerState<any>>> | ((value: WebWorkerState<any>) => void)
  ) {
    return this._webWorkerState$.subscribe(observerOrNext);
  }

  workerResponse$(
    observerOrNext?: Partial<Subject<WebWorkerResponses>> | ((value: WebWorkerResponses) => void)
  ) {
    return this._workerResponse$?.subscribe(observerOrNext);
  }

  constructor() {
    if (typeof Worker === 'undefined') {
      console.info('Web Workers are not supported in this environment');
      return;
    }

    this._workerResponse$ ??= new Subject<WebWorkerResponses>();
    this.worker ??= new Worker(new URL('./global.worker', import.meta.url));
    this.setMessageSubscribes(this.worker);

    if (this.webWorkerConfig.debug) {
      this.worker.postMessage(ConsoleLogMessage('INIT', ['Web Worker Initialized']))
    }

  }

  sendMessage = <T = any>(message: WebWorkerMsg<T>) => {
    if (this.webWorkerState.state !== WebWorkerStates.Waiting) {
      console.warn(WEB_WORKER_DOMAIN, 'working', this.webWorkerState.job)
      return;
    }

    this._webWorkerState$.next({
      state: WebWorkerStates.Working,
      job: message
    });

    this.worker?.postMessage(message);
  };

  ngOnDestroy(): void {
    this.worker?.terminate();
    this._workerResponse$?.complete();
  }

  private setMessageSubscribes(worker: Worker) {
    worker.onmessage = ({data}) => {
      this._webWorkerState$.next({
        ...this.webWorkerState,
        state: WebWorkerStates.Done,
      });
      this._workerResponse$?.next(data);
      this._webWorkerState$.next({
        state: WebWorkerStates.Waiting,
      });
    };

    worker.onerror = (error) => {
      this._webWorkerState$.next({
        state: WebWorkerStates.Error,
        error
      });
    }

    worker.onmessageerror = ({data: error}: MessageEvent<WebWorkerError>) => {
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
