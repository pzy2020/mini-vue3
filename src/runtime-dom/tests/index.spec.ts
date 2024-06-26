import { renderer } from '../index'
import { ref } from '../../reactivity/ref'
import { effect } from '../../reactivity/effect'
import { h } from '../../runtime-core/h'

let dom
beforeEach(()=>{
    dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
})

afterEach(()=>{
    let appDom = document.querySelector('#app')
    if(appDom){
        let parent = appDom.parentNode
        parent && parent.removeChild(appDom)
    }
})

test("挂载渲染普通的简单元素", () => {
    let text = 'hello vue3'
    
    
    renderer.render(h('p',text), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe(text)
})

test("挂载渲染嵌套的普通元素", () => {
    let text = 'hello vue3'
    
    const vnode = h('div',h('p',text))
    
    renderer.render(vnode, document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe(text)
})

test("普通的简单元素更新", () => {
    let text = ref('hello vue3')
    
    
    let textVal
    effect(() => {
        textVal = text.value
        renderer.render(h('p',text.value), document.querySelector('#app'))
    })
    
    expect(dom.querySelector('p')?.innerHTML).toBe(text.value)
    text.value = 'vue3 hello'
    expect(textVal).toBe(text.value)
    expect(dom.querySelector('p')?.innerHTML).toBe(text.value)
})

test("正确的设置元素属性:disabled", () => {
    
    const vnode = h('button',{
        disabled: '',
        id: 'submit'
    },'Submit')
    
    renderer.render(vnode, document.querySelector('#app'))
    let submitDom = document.querySelector('button')
    expect(submitDom?.innerHTML).toBe('Submit')
    expect(submitDom?.disabled).toBe(true)
})

test("正确的设置元素属性:class", () => {
    
    const vnode = h('button',{
        class: 'error',
        id: 'submit'
    },'Submit')
    
    renderer.render(vnode, document.querySelector('#app'))
    let submitDom = document.querySelector('button')
    expect(submitDom?.innerHTML).toBe('Submit')
    expect(submitDom?.className).toBe('error')
})

test("正确的设置元素属性:style", () => {
    
    const vnode = h('button',{
        class: 'error',
        id: 'submit',
        style: {color: 'rgb(0, 0, 0)'}
    },'Submit')
    
    renderer.render(vnode, document.querySelector('#app'))
    let submitDom:HTMLButtonElement|null = document.querySelector('#submit')
    expect(submitDom?.style.color).toBe('rgb(0, 0, 0)')
    expect(submitDom?.className).toBe('error')
})

test("render方法卸载元素", () => {
    let text = 'hello vue3'
    
    const vnode = h('p',text)
    
    renderer.render(vnode, document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe(text)
    renderer.render(null, document.querySelector('#app'))
    expect(dom.querySelector('p')).toBe(null)
    expect(document.querySelector('#app')?.innerHTML).toBe('')
})

test("给元素添加事件", () => {
    
    let clicked = false
    let vnode = h('button',{
        onClick: () => clicked = true
    },'click')
    renderer.render(vnode, document.querySelector('#app'))
    let submitDom = document.querySelector('button')
    expect(clicked).toBeFalsy()
    submitDom?.click()
    expect(clicked).toBeTruthy()
})

test("给元素添加事件", () => {
    
    let clickedCount = 0
    let vnode = h('button',{
        onClick: [() => clickedCount++,() => clickedCount++]
    },'click')
    renderer.render(vnode, document.querySelector('#app'))
    let submitDom = document.querySelector('button')
    expect(clickedCount).toBe(0)
    submitDom?.click()
    expect(clickedCount).toBe(2)
})

test("事件冒泡与更新时机", () => {
    let show = ref(false)
    
    
    let textVal
    effect(() => {
        renderer.render(h('div',show.value ? {onclick: () => {
            textVal = 'clicked'
        }}: {}, [h("button",{onclick: () => {
            show.value = true
        }},'click')]), document.querySelector('#app'))

    })
    let submitDom = dom.querySelector('button')
    submitDom && submitDom.click()
    expect(show.value).toBe(true)
    expect(textVal).toBeUndefined()
    let divDom = dom.querySelector('div')
    divDom && divDom.click()
    expect(textVal).toBe('clicked')
    
})