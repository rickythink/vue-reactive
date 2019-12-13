import { reactive, effect, computed } from '../src'

const data = reactive({
  msg: 'Hello World',
  number: 1
})

effect(() => {
  document.getElementById('app').innerHTML = `
  <p>当前data的状态是：</p>
  ${JSON.stringify(data)}
  <p>请在控制台输入data，分别改变data.msg尝试效果</p>`
})

const cData = computed(() => data.number * 2)
const btn = document.createElement('button')
btn.innerHTML = '读取cData的值'
const info = document.createElement('p')
btn.onclick = () => {
  info.innerHTML = `cData的最新值为${cData.value}`
}
document.getElementById('capp').append(btn)
document.getElementById('capp').append(info)
;(window as any).data = data
;(window as any).cData = cData
