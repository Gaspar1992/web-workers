/// <reference lib="webworker" />

import {WebWorkerAction, WebWorkerDataMsgkey, WebWorkerMsg} from "./web-worker.types";
import {ConsoleLogAction, ConsoleLogKey, FetchAction, FetchKey} from "./web-worker.actions";

const WEB_WORKER_ACTIONS = new Map<WebWorkerDataMsgkey, WebWorkerAction<any>>();
WEB_WORKER_ACTIONS.set(FetchKey, FetchAction);
WEB_WORKER_ACTIONS.set(ConsoleLogKey, ConsoleLogAction);

addEventListener('message', ({data: {key, params, id}}: MessageEvent<WebWorkerMsg>) => {
  WEB_WORKER_ACTIONS.get(key)?.({id, key, params});
});

addEventListener('error', console.error);

