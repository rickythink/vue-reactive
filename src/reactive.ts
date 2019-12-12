import { handlers } from './handler'

/**
 * [observed, target]
 */
const reactiveToRaw = new WeakMap<any, any>()
/**
 * [target, observed]
 */
const reactiveToProxy = new WeakMap<any, any>()

/**
 * reactive
 * @param target 要响应式监听的对象
 */
export function reactive<T extends object>(target: T) {
  let observed = reactiveToProxy.get(target)
  // 如果是缓存代理过的
  if (observed) {
    return observed
  }
  // 重复调用reactive(target与之前的observed相同)
  if (reactiveToRaw.has(target)) {
    return target
  }
  observed = new Proxy(target, handlers)
  reactiveToProxy.set(target, observed)
  reactiveToRaw.set(observed, target)
  return observed
}
