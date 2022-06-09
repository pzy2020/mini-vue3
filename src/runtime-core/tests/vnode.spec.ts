import { createVNode, isVNode } from '../vnode'
test('createVNode', () => {
    const vnode = createVNode('div',{id: 'app'},'hello')
    expect(vnode).toEqual({type:'div',props: {id: 'app'},children: 'hello',key: undefined,__v_isVnode:true,shapeFlags: 5,el: null})
    expect(isVNode(vnode)).toBeTruthy()
})