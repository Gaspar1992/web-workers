import {generateWebWorkerAction, WEB_WORKER_DOMAIN} from "./web-worker.utils";
import {Serializer} from "../utils/serialize.utils";

type FetchData = {
  input: RequestInfo | URL,
  init?: RequestInit
}

type FunctionData = {
  callable: Function,
  params?: any[]
}

type FunctionParseData = {
  callable: string,
  params?: any[]
}

export const {
  key: FetchKey,
  message: FetchMessage,
  action: FetchAction
} = generateWebWorkerAction<FetchData>('FETCH ACTION',
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


const {
  key: FunctionKey,
  message: FunctionMessageN,
  action: FunctionAction
} = generateWebWorkerAction<FunctionParseData>(
  'FUNCTION ACTION', ({params}) => {
    const FN: Function = Serializer.parse(params.callable);
    return FN.call(this, ...(params.params ?? []));
  })

export {
  FunctionKey,
  FunctionAction
}

export const FunctionMessage = (id: string, {callable, params}: FunctionData) => FunctionMessageN(id, {
  params,
  callable: Serializer.serialize(callable)
})
