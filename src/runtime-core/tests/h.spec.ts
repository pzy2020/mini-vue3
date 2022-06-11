import { h } from "../h";
import { createVNode } from "../vnode";

// h 的用法
// h('div')
// h('div', {class: 'warm'})
// h('div', {class: 'warm'}, 'hello')
// h('div','hello')
// h('div',null,'hello','vue3')
// h('div',null,h('p','vue3'))
// h('div',null, [h('p','vue3')])
test("h", () => {
    expect(h('div')).toEqual(createVNode('div'))
    expect(h('div',{class: 'warm'})).toEqual(createVNode('div',{class: 'warm'}))
    expect(h('div', {class: 'warm'}, 'hello')).toEqual(createVNode('div', {class: 'warm'}, 'hello'))
    expect(h('div','hello')).toEqual(createVNode('div',null, 'hello'))
    expect(h('div',null,'hello','vue3')).toEqual(createVNode('div',null,['hello','vue3']))
    expect(h('div',null,h('p','vue3'))).toEqual(createVNode('div',null,[createVNode('p',null,'vue3')]))
    expect(h('div',null, [h('p','vue3')])).toEqual(createVNode('div',null,[createVNode('p',null,'vue3')]))
})