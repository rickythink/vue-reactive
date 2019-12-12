import { handlers } from './handler'

const reactiveToRaw = new WeakMap<any, any>()
const reactiveToProxy = new WeakMap<any, any>()

export function reactive<T extends object>(target: T) {
  let observed = reactiveToProxy.get(target)
  // 如果是缓存代理过的
  if (observed) {
    return observed
  }
  // 重复调用reactive
  if (reactiveToRaw.has(target)) {
    return target
  }
  observed = new Proxy(target, handlers)
  reactiveToProxy.set(target, observed)
  reactiveToRaw.set(observed, target)
  return observed
}
