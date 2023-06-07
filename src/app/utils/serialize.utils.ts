export enum SerializeDataObjects {
  MAP = 'Map',
  SET = 'Set',
  FUNCTION = 'Function'
}

const SerializableDataObjectArray = Object.values(SerializeDataObjects);

/*
  WEAK_MAP = 'WeakMap',
  WEAK_SET = 'WeakSet'
*/

export type SerializableObjectValue = Array<any> | Object | number | string

export interface SerializeObject {
  dataType: SerializeDataObjects,
  value: SerializableObjectValue
}

export interface MapSerializableObject<T> extends SerializeObject {
  dataType: SerializeDataObjects.MAP,
  value: Array<T>
}

export interface SetSerializableObject<T> extends SerializeObject {
  dataType: SerializeDataObjects.SET,
  value: Array<T>
}

export interface FunctionSerializableObject extends SerializeObject {
  dataType: SerializeDataObjects.FUNCTION,
  value: string
}

const ReviveFns: Record<SerializeDataObjects, (value: any) => any> = {
  [SerializeDataObjects.MAP]: (value: MapSerializableObject<[unknown, unknown]>) => new Map<unknown, unknown>(value.value),
  [SerializeDataObjects.SET]: (value: SetSerializableObject<[unknown, unknown]>) => new Set<unknown>(value.value),
  [SerializeDataObjects.FUNCTION]: (value: FunctionSerializableObject) => new Function(`return ${value.value}`)(this)
}

export class Serializer {

  static isSerializabledObject(val: any): val is SerializeObject {
    if (typeof val !== 'object') return false;
    const keys = Object.keys(val);
    if (keys.length !== 2) return false;
    if (!keys.every(k => ['dataType', 'value'].includes(k))) return false
    return SerializableDataObjectArray.includes(val['dataType']);
  }

  private static replacer(key: string, value: any): SerializeObject {
    if (value instanceof Map)
      return {
        dataType: SerializeDataObjects.MAP,
        value: Array.from(value.entries())
      }


    if (value instanceof Set)
      return {
        dataType: SerializeDataObjects.SET,
        value: Array.from(value.values())
      }
    
    if (typeof value === 'function')
      return {
        dataType: SerializeDataObjects.FUNCTION,
        value: value.toString()
      }


    return value;
  }

  static serialize(value: any): string {
    return JSON.stringify(value, Serializer.replacer)
  }


  private static revive(key: string, value: unknown) {
    if (typeof value === 'object' && Serializer.isSerializabledObject(value)) {
      return ReviveFns[value.dataType](value);
    }
    return value;
  }

  static parse(value: string) {
    return JSON.parse(value, Serializer.revive)
  }

}
