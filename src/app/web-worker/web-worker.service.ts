import {inject, Injectable, InjectionToken, OnDestroy} from '@angular/core';
import {
  NgWebWorker,
  WebWorkerMsg,
  WebWorkerResponses,
  WebWorkerServiceConfig,
  WebWorkerState,
  WebWorkerStates
} from "./web-worker.types";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, combineLatest, merge, Observable, Subject, takeUntil, tap} from "rxjs";

export const WebWorkerConfig = new InjectionToken<WebWorkerServiceConfig>('[WebWorkerService', {
  providedIn: 'root',
  factory: () => ({numberWorkers: 2, debug: true})
})


@Injectable()
export class WebWorkerService implements OnDestroy {

  private readonly _loadingWorkers = new BehaviorSubject<boolean>(true);
  private readonly destroy$ = new Subject<void>();
  private readonly mainWorkerName = 'main-ng-worker';
  private readonly workers: NgWebWorker[];
  private _workersStates!: Observable<WebWorkerState<any>[]>;
  private _workersResponses!: Observable<WebWorkerResponses>;
  private readonly stack: (WebWorkerMsg<any>)[] = []
  private readonly webWorkerConfig = inject(WebWorkerConfig);

  get loadingWorkers() {
    return this._loadingWorkers.asObservable();
  }

  get workersStates() {
    return this._workersStates;
  }

  get workersResponses() {
    return this._workersResponses;
  }

  constructor() {
    if (typeof Worker === 'undefined')
      throw new Error('Web Workers are not supported in this environment');
    if (this.webWorkerConfig.numberWorkers < 1)
      throw new Error(`Quantity of WebWorkers setted is incorrect. Nº: ${this.webWorkerConfig.numberWorkers}`);


    this.workers = [
      new NgWebWorker(
        new Worker(new URL('./global.worker', import.meta.url), {
          name: 'main-ng-worker',
          credentials: 'same-origin'
        }),
        this.webWorkerConfig.debug
      )
    ];


    if (this.webWorkerConfig.numberWorkers > 1) {

      inject(HttpClient).get(`${this.mainWorkerName}.js`, {responseType: 'text'}).subscribe((workerText) => {
        const workerBlob = new Blob([workerText], {type: 'application/javascript'});

        for (let i = 1; i < this.webWorkerConfig.numberWorkers; i++) {
          const worker = new Worker(
            URL.createObjectURL(
              workerBlob
            ),
            {
              name: `secondary-ng-worker-${i}`,
              credentials: 'same-origin'
            }
          );
          this.workers.push(
            new NgWebWorker(
              worker,
              this.webWorkerConfig.debug
            )
          )
        }

        this.setWorkerSubs();
        this._loadingWorkers.next(false);
      })
    } else {
      this.setWorkerSubs();
      this._loadingWorkers.next(false);
    }
  }

  ngOnDestroy(): void {
    this.workers.forEach((worker) => worker.terminate());
    this.destroy$.next();
    this.destroy$.complete();
  }

  sendMessage = <T = any>(message: WebWorkerMsg<T>) => {
    const freeWorker = this.workers.find((worker) => worker.webWorkerState.state === WebWorkerStates.Waiting);

    if (!freeWorker) {
      this.stack.push(message);
      return;
    }

    freeWorker.sendMessage(message);
  };

  private setWorkerSubs() {
    this.destroy$.next();

    this._workersStates = combineLatest(
      this.workers.map((worker) => worker.webWorkerState$)
    ).pipe(
      takeUntil(this.destroy$)
    );


    this._workersResponses = merge(
      ...this.workers.map((worker) => worker.workerResponse$)
    ).pipe(
      takeUntil(this.destroy$),
      tap(() => {
        if (this.stack.length)
          this.sendMessage(this.stack.shift() as WebWorkerMsg)

      })
    )
  }

}
