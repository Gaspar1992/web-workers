import {generateWebWorkerAction, WEB_WORKER_DOMAIN} from "./web-worker.utils";


export const {
  key: FetchKey,
  message: FetchMessage,
  action: FetchAction
} = generateWebWorkerAction<{
  input: RequestInfo | URL,
  init?: RequestInit
}>('FETCH ACTION',
  ({params}) =>
    fetch(params.input, params.init)
      .then((res) => res.json()))


export const {
  key: ConsoleLogKey,
  message: ConsoleLogMessage,
  action: ConsoleLogAction
} = generateWebWorkerAction<any[]>('CONSOLE LOG ACTION', ({
                                                            params
                                                          }) => console.log(WEB_WORKER_DOMAIN, ...params), false);
