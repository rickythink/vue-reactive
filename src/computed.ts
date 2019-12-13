import { effect, ReactiveEffect } from './effect'

interface ComputedRef {
  effect: ReactiveEffect
  readonly value: any
}

export function computed(fn: () => any): ComputedRef {
  const getter = fn
  const runner = effect(getter, { computed: true, lazy: true })
  let value
  return {
    effect: runner,
    get value() {
      value = runner()
      return value
    }
  }
}
