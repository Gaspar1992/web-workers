import {WebWorkerAction, WebWorkerDataMsgkey} from "./web-worker.types";
import {
  ConsoleLogAction,
  ConsoleLogKey,
  FetchAction,
  FetchKey,
  FunctionAction,
  FunctionKey
} from "./web-worker.actions";

export function actionsBaseRegistered() {
  const actions = new Map<WebWorkerDataMsgkey, WebWorkerAction<any>>();
  actions.set(FetchKey, FetchAction);
  actions.set(ConsoleLogKey, ConsoleLogAction);
  actions.set(FunctionKey, FunctionAction);
  return actions;
}

