import { ref } from "../../reactivity/ref"
import { patchProp, renderer } from "../../runtime-dom"
import { nodeOps } from "../../runtime-dom/nodeOps"
import { h } from "../h"
import { createRenderer } from "../renderer"
import { Fragment } from "../vnode"


let dom
afterEach(()=>{
    let appDom = document.querySelector('#app')
    if(appDom){
        let parent = appDom.parentNode
        parent && parent.removeChild(appDom)
    }
})

beforeEach(()=>{
    dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
})

describe('patchKeyedChildren',() => {
    const mocks = {
        createElement: jest.fn(),
        setElementText: jest.fn(),
        remove: jest.fn(),
        insert: jest.fn(),
        patchProp:jest.fn(),
        createText:jest.fn(),
        setText:jest.fn(),
    }
    const mocksFn = {
        patch: jest.fn(),
        unmount: jest.fn(),
        insert: jest.fn(),
    }
    function patchKeyedChildrenTest(mockFns = mocks){
        const renderer = createRenderer(Object.assign({patchProp},nodeOps,mockFns))
        const patchKeyedChildren = renderer.patchKeyedChildren
        return function(c1,c2,container){
            patchKeyedChildren(c1,c2,container)
        }
    }

    test('patchKeyedChildren 去头',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d'),h('span',{key:'e'},'e')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 4次patch(但什么都没做) 1次mount
        expect(mocks.setElementText).toBeCalledTimes(1)
        expect(mocks.createElement).toBeCalledTimes(1)
        expect(mocks.patchProp).toBeCalledTimes(1)
    })

    test('patchKeyedChildren,去头1',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d'),h('span',{key:'e'},'e')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 4次patch(但什么都没做) 1次unmount
        expect(mocks.patchProp).toBeCalledTimes(0)
        expect(mocks.remove).toBeCalledTimes(1)
    })

    test('patchKeyedChildren 去尾',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'e'},'e'),h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 4次patch(但什么都没做) 1次mount
        expect(mocks.setElementText).toBeCalledTimes(1)
        expect(mocks.createElement).toBeCalledTimes(1)
        expect(mocks.patchProp).toBeCalledTimes(1)
    })

    test('patchKeyedChildren,去尾1',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'e'},'e'),h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 4次patch(但什么都没做) 1次unmount
        expect(mocks.patchProp).toBeCalledTimes(0)
        expect(mocks.remove).toBeCalledTimes(1)
    })

    test('patchKeyedChildren 有序',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'e'},'e'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 4次patch(但什么都没做) 1次mount
        expect(mocks.setElementText).toBeCalledTimes(1)
        expect(mocks.createElement).toBeCalledTimes(1)
        expect(mocks.patchProp).toBeCalledTimes(1)
    })

    test('patchKeyedChildren,有序1',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'e'},'e'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 4次patch(但什么都没做) 1次unmount
        expect(mocks.remove).toBeCalledTimes(1)
        expect(mocks.patchProp).toBeCalledTimes(0)
    })

    // a b h g e c d 
    // a b e g h c d 
    test('patchKeyedChildren 无序',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'h'},'h'),h('span',{key:'g'},'g'),h('span',{key:'e'},'e'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'e'},'e'),h('span',{key:'g'},'g'),h('span',{key:'h'},'h'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 7次patch(但什么都没做) 2次dom移动
        expect(mocks.setElementText).toBeCalledTimes(0)
        expect(mocks.createElement).toBeCalledTimes(0)
        expect(mocks.patchProp).toBeCalledTimes(0)
        expect(mocks.insert).toBeCalledTimes(2)
    }),

    // a b  h g p e  c d 
    // a b  e g p h  c d
    test('patchKeyedChildren 无序1',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'h'},'h'),h('span',{key:'g'},'g'),h('span',{key:'p'},'p'),h('span',{key:'e'},'e'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'e'},'e'),h('span',{key:'g'},'g'),h('span',{key:'p'},'p'),h('span',{key:'h'},'h'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 8次patch(但什么都没做) 2次dom移动
        expect(mocks.setElementText).toBeCalledTimes(0)
        expect(mocks.createElement).toBeCalledTimes(0)
        expect(mocks.patchProp).toBeCalledTimes(0)
        expect(mocks.insert).toBeCalledTimes(2)
    })

    // a b  h g p e  c d 
    // a b  g p h    c d
    test('patchKeyedChildren 无序2',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'h'},'h'),h('span',{key:'g'},'g'),h('span',{key:'p'},'p'),h('span',{key:'e'},'e'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'g'},'g'),h('span',{key:'p'},'p'),h('span',{key:'h'},'h'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 7次patch(但什么都没做) 1次dom移动 1次unmount卸载
        expect(mocks.setElementText).toBeCalledTimes(0)
        expect(mocks.createElement).toBeCalledTimes(0)
        expect(mocks.patchProp).toBeCalledTimes(0)
        expect(mocks.insert).toBeCalledTimes(1)
        expect(mocks.remove).toBeCalledTimes(1)
    })

        // a , b ,   g , p, h,      c , d
        // a , b ,   h , g, p, e ,  c , d
    test('patchKeyedChildren 无序3',()=>{
        const patchKeyedChildren = patchKeyedChildrenTest()
        let oldVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'g'},'g'),h('span',{key:'p'},'p'),h('span',{key:'h'},'h'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        let newVnode = [h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'h'},'h'),h('span',{key:'g'},'g'),h('span',{key:'p'},'p'),h('span',{key:'e'},'e'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')]
        patchKeyedChildren(oldVnode,newVnode,dom)
        // 7次patch(但什么都没做) 1次dom移动 1次mount挂载
        expect(mocks.setElementText).toBeCalledTimes(1)
        expect(mocks.createElement).toBeCalledTimes(1)
        expect(mocks.patchProp).toBeCalledTimes(1)
        expect(mocks.insert).toBeCalledTimes(2) // 挂载也会执行insert插入
    })
})

test('更新子节点,文本节点更新为文本节点', () => {
    let text = ref('hello vue3')
    
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
    renderer.render(h('p','vue3'), document.querySelector('#app'))
    renderer.render(h('p'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('')
})

test('更新子节点，文本节点更新为数组节点', () => {
    let text = ref('hello vue3')
    
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
    renderer.render(h('p',[h('span','123'),h('span','456')]), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>123</span><span>456</span>')
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
})

test('更新子节点，数组节点更新为数组节点', () => {
    
    renderer.render(h('p',[h('span','123'),h('span','456')]), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>123</span><span>456</span>')
    renderer.render(h('p',[h('span','789'),h('span','123')]), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>789</span><span>123</span>')
    renderer.render(h('p','hello'), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('hello')
})

test('更新子节点，字符串节点',() => {
    
    renderer.render(h('p',[h('span','123'),'456']), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>123</span>456')
    renderer.render(h('p',[h('span','789'),'123']), document.querySelector('#app'))
    expect(dom.querySelector('p')?.innerHTML).toBe('<span>789</span>123')
})

test('更新子节点,diff',() => {
    
    let oldVnode = h('p',[h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d')])
    let newVnode = h('p',[h('span',{key:'a'},'a'),h('span',{key:'b'},'b'),h('span',{key:'c'},'c'),h('span',{key:'d'},'d'),h('span',{key:'e'},'e')])
    renderer.render(oldVnode, document.querySelector('#app'))
    renderer.render(newVnode, document.querySelector('#app'))
    expect(dom.querySelectorAll('span')?.length).toBe(5)
})

test('Fragment',()=>{
    renderer.render(h(Fragment,[h('span','123'),h('span','456')]), document.querySelector('#app'))
    expect(document.querySelector('#app')?.innerHTML).toBe('<span>123</span><span>456</span>')
    renderer.render(h(Fragment,[h('span','789'),h('span','123')]), document.querySelector('#app'))
    expect(document.querySelector('#app')?.innerHTML).toBe('<span>789</span><span>123</span>')
})