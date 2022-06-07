import { createRenderer } from '../index'
import { ref } from '../../reactivity/ref'
import { effect } from '../../reactivity/effect'

afterEach(()=>{
    let appDom = document.querySelector('#app')
    if(appDom){
        let parent = appDom.parentNode
        parent && parent.removeChild(appDom)
    }
})

test("挂载渲染普通的简单元素", () => {
    let text = 'hello vue3'
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    const vnode = {
        type: 'p',
        children: text
    }
    let renderer = createRenderer()
    renderer.render(vnode, document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe(text)
})

test("挂载渲染嵌套的普通元素", () => {
    let text = 'hello vue3'
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    const vnode = {
        type: 'div',
        children: [
            {
                type: 'p',
                children: text
            }
        ]
    }
    let renderer = createRenderer()
    renderer.render(vnode, document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe(text)
})

test("普通的简单元素更新", () => {
    let text = ref('hello vue3')
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    const vnode = {
        type: 'p',
        children: text.value
    }
    let renderer = createRenderer()
    let textVal
    effect(() => {
        textVal = text.value
        renderer.render(vnode, document.querySelector('#app'))
    })
    
    expect(dom.querySelector('p')?.innerHTML).toBe(text.value)
    text.value = 'vue3 hello'
    expect(textVal).toBe(text.value)
    expect(dom.querySelector('p')?.innerHTML).toBe(text.value)
})

test("正确的设置元素属性:disabled", () => {
    let dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
    const vnode = {
        type: 'button',
        props:{
            disabled: '',
            id: 'submit'
        },
        children: 'Submit'
    }
    let renderer = createRenderer()
    renderer.render(vnode, document.querySelector('#app'))
    let submitDom = document.querySelector('button')
    expect(submitDom?.innerHTML).toBe('Submit')
    expect(submitDom?.disabled).toBe(true)
})