import { effect } from "../../reactivity/effect"
import { ref } from "../../reactivity/ref"
import { renderer } from "../../runtime-dom"
import { h } from "../h"

afterEach(()=>{
    let appDom = document.querySelector('#app')
    if(appDom){
        let parent = appDom.parentNode
        parent && parent.removeChild(appDom)
    }
})

test('更新子节点,文本节点更新为文本节点', () => {
    let text = ref('hello vue3')
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
    renderer.render(h('p','vue3'), document.querySelector('#app'))
    renderer.render(h('p'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('')
})

test('更新子节点，文本节点更新为数组节点', () => {
    let text = ref('hello vue3')
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
    renderer.render(h('p',[h('span','123'),h('span','456')]), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>123</span><span>456</span>')
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
})

test('更新子节点，数组节点更新为数组节点', () => {
    let text = ref('hello vue3')
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    renderer.render(h('p',[h('span','123'),h('span','456')]), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>123</span><span>456</span>')
    renderer.render(h('p',[h('span','789'),h('span','123')]), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>789</span><span>123</span>')
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
})