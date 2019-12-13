export interface ReactiveEffect<T = any> {
  /**
   * effect 函数
   */
  (): T
  /**
   * 选项
   */
  options: ReactiveEffectOptions
}

interface ReactiveEffectOptions {
  /**
   * 是否立即执行 effect 包裹的函数 fn
   */
  lazy?: boolean
  computed?: boolean
}

type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<any, Dep>
/**
 * 所有响应式监听的变量Map
 *
 * reactive 变量只要有 get 就会被 track() 依赖收集加入 targetMap
 * @example
 * ```
 * targetMap = [
 *  <target>: {
 *    <key>: [<effect1>,<effect2>,...]
 *  }
 * ]
 * ```
 */
const targetMap = new WeakMap<any, KeyToDepMap>()

/**
 * effect 栈
 *
 * - effect 没有`lazy` 选项时，effect 因为执行而入栈->执行->出栈
 * - 有`lazy`选项，effect 会存在 effectStack 中
 */
const effectStack: ReactiveEffect[] = []

/**
 * effect 顶层函数
 * @param fn 包裹响应式变量的函数
 * @param options 响应式监听的参数
 */
export function effect(fn: () => any, options: ReactiveEffectOptions = {}) {
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}

/**
 * 实际创建 effect 的函数
 * @param fn 包裹响应式变量的函数
 * @param options 响应式监听的参数
 */
function createReactiveEffect(fn: () => any, options: ReactiveEffectOptions) {
  const effect = function reactiveEffect(...args: unknown[]): unknown {
    return run(effect, fn, args)
  } as ReactiveEffect
  effect.options = options
  return effect
}

/**
 * effect 执行栈管理相关
 * @param effect effect 函数本身
 * @param fn effect 包裹的函数
 * @param args effect 额外的参数
 *
 * @description finally 语句块一定会执行
 */
function run(effect: ReactiveEffect, fn: Function, args: unknown[]): unknown {
  if (effectStack.indexOf(effect) === -1) {
    try {
      effectStack.push(effect)
      return fn(...args)
    } finally {
      effectStack.pop()
    }
  }
}

/**
 * 依赖收集
 * @param target 被依赖收集的对象
 * @param key 被依赖收集的对象key
 */
export function track(target: object, key: string | symbol) {
  // 获取最新入栈的 effect
  const effect = effectStack[effectStack.length - 1]
  if (effect) {
    let depsMap = targetMap.get(target)
    if (depsMap === undefined) {
      depsMap = new Map()
      targetMap.set(target, depsMap)
    }
    let dep = depsMap.get(key)
    if (dep === undefined) {
      dep = new Set()
      depsMap.set(key, dep)
    }
    if (!dep.has(effect)) {
      // 收集当前的effect
      dep.add(effect)
    }
  }
}

/**
 * 触发更新
 * @param target 触发更新的对象
 * @param key 触发更新的对象的key
 */
export function trigger(target: object, key?: string | symbol) {
  const depsMap = targetMap.get(target)
  // 没有被订阅到
  if (depsMap === undefined) {
    return
  }
  const effects = new Set<ReactiveEffect>()
  const computedRunners = new Set<ReactiveEffect>()
  if (key !== undefined) {
    const deps = depsMap.get(key)
    if (deps !== undefined) {
      deps.forEach((effect: ReactiveEffect) => {
        if (effect.options.computed) {
          computedRunners.add(effect)
        } else {
          effects.add(effect)
        }
      })
    }
  }
  const run = (effect: ReactiveEffect) => {
    effect()
  }
  computedRunners.forEach(run)
  effects.forEach(run)
}
