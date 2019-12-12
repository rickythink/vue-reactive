import { reactive } from '../index'

describe('reactive', () => {
  test('should cache observe', () => {
    const data = {
      msg: 'Hello World',
      number: 1
    }
    const observe1 = reactive(data)
    const observe2 = reactive(data)
    expect(observe1 === observe2).toBeTruthy()
  })
})
