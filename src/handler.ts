import { isObject } from './utils'
import { reactive } from './reactive'
import { track, trigger } from './effect'

export const handlers = {
  get(target: object, key: string | symbol, receiver: object) {
    const res = Reflect.get(target, key, receiver)
    // effect 收集
    track(target, key)
    return isObject(res) ? reactive(res) : res
  },
  set(target: object, key: string | symbol, value: unknown, receiver: object) {
    const result = Reflect.set(target, key, value, receiver)
    trigger(target, key)
    return result
  }
}
