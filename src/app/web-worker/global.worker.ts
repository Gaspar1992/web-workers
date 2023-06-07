/// <reference lib="webworker" />

import {WebWorkerAction, WebWorkerDataMsgkey, WebWorkerError, WebWorkerMsg} from "./web-worker.types";
import {
  ConsoleLogAction,
  ConsoleLogKey,
  FetchAction,
  FetchKey,
  FunctionAction,
  FunctionKey
} from "./web-worker.actions";

const WEB_WORKER_ACTIONS = new Map<WebWorkerDataMsgkey, WebWorkerAction<any>>();
WEB_WORKER_ACTIONS.set(FetchKey, FetchAction);
WEB_WORKER_ACTIONS.set(ConsoleLogKey, ConsoleLogAction);
WEB_WORKER_ACTIONS.set(FunctionKey, FunctionAction);

addEventListener('message', ({data: {key, params, id}}: MessageEvent<WebWorkerMsg>) => {
  try {
    WEB_WORKER_ACTIONS.get(key)?.({id, key, params});
  } catch (err) {
    postMessage(new WebWorkerError(err as Error));
  }

});

addEventListener('error', console.error);

