import {Injectable, OnDestroy} from '@angular/core';
import {WebWorkerMsg, WebWorkerResponses} from "./web-worker.types";
import {Subject} from "rxjs";
import {ConsoleLogMessage} from "./web-worker.actions";


@Injectable({
  providedIn: 'root'
})
export class WebWorkerService implements OnDestroy {

  private readonly worker?: Worker
  public readonly workerResponse?: Subject<WebWorkerResponses>

  constructor() {
    if (typeof Worker === 'undefined') {
      console.info('Web Workers are not supported in this environment');
      return;
    }

    this.worker ??= new Worker(new URL('./app.worker', import.meta.url));
    this.workerResponse ??= new Subject<WebWorkerResponses>()
    this.worker.onmessage = ({data}) => this.workerResponse?.next(data);
    this.worker.postMessage(ConsoleLogMessage('INIT', ['Web Worker Initialized']))
  }

  sendMessage = <T = any>(message: WebWorkerMsg<T>) => this.worker?.postMessage(message);

  ngOnDestroy(): void {
    this.worker?.terminate();
    this.workerResponse?.complete();
  }
}
