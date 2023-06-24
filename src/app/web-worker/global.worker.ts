/// <reference lib="webworker" />

import {WebWorkerError, WebWorkerMsg} from "./web-worker.types";
import {actionsBaseRegistered} from "./web-worker.config";

export var WEB_WORKER_ACTIONS = actionsBaseRegistered();

addEventListener('message', ({data: {key, params, id}}: MessageEvent<WebWorkerMsg>) => {
  try {
    WEB_WORKER_ACTIONS.get(key)?.({id, key, params});
  } catch (err) {
    postMessage(new WebWorkerError(err as Error));
  }

});

addEventListener('error', console.error);

