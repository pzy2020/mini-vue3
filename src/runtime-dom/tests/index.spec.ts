import { createRenderer } from '../index'
import { ref } from '../../reactivity/ref'
import { effect } from '../../reactivity/effect'

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
