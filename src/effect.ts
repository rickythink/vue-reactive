interface ReactiveEffect<T = any> {
  (): T
  deps: Array<Dep>
  options: ReactiveEffectOptions
}

interface ReactiveEffectOptions {
  lazy?: boolean
  computed?: boolean
  onStop?: () => void
}

type Dep = Set<ReactiveEffect>
type KeyToDepMap = Map<any, Dep>
// 存储effect
const targetMap = new WeakMap<any, KeyToDepMap>()
const effectStack: ReactiveEffect[] = []

export function effect(fn: () => any, options: ReactiveEffectOptions = {}) {
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}

function createReactiveEffect(fn: () => any, options: ReactiveEffectOptions) {
  const effect = function reactiveEffect(...args: unknown[]): unknown {
    return run(effect, fn, args)
  } as ReactiveEffect
  effect.options = options
  effect.deps = []
  return effect
}

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

// 跟踪订阅effect
export function track(target: object, key: unknown) {
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
      // effect 收集当前的dep
      effect.deps.push(dep)
    }
  }
}

export function trigger(target: object, key?: unknown) {
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
