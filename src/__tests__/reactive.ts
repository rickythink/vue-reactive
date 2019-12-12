import { reactive } from '../index'

describe('reactive', () => {
  test('should return same with repeat target reactive', () => {
    const data = {
      msg: 'Hello World',
      number: 1
    }
    const observe1 = reactive(data)
    const observe2 = reactive(data)
    expect(observe1 === observe2).toBeTruthy()
  })

  test('should return same with repeat reactive', () => {
    const data = {
      msg: 'Hello World',
      number: 1
    }
    const observe1 = reactive(data)
    const observe2 = reactive(observe1)
    expect(observe1 === observe2).toBeTruthy()
  })
})
