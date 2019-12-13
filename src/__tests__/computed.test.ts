import { computed } from '../index'

describe('computed', () => {
  test('should return correct computed value as corresponding value changed', () => {
    const data = {
      msg: 'Hello World',
      number: 1
    }
    const c = computed(() => data.number * 2)
    data.number = 2
    expect(c.value === data.number * 2).toBeTruthy()
  })
})
