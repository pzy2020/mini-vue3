import { ShapeFlags } from "../shared/ShapeFlags";
import { isString,isArray, isObject } from "../shared";

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export function isVNode(value){
    return !!(value && value.__v_isVnode)
}

export function isSameVNodeType(n1,n2){
    return n1.key === n2.key && n1.type === n2.type
}

export function createVNode(type, props?, children?){
    let shapeFlags = isString(type) ? ShapeFlags.ELEMENT : isObject(type) ? ShapeFlags.STATEFUL_COMPONENT : 0
    if(children){
        if(isString(children)){
            shapeFlags |= ShapeFlags.TEXT_CHILDREN
        }else if(isArray(children)) {
            shapeFlags |= ShapeFlags.ARRAY_CHILDREN
        }else if(isObject(children)){
            shapeFlags |= ShapeFlags.SLOTS_CHILDREN // 组件带有插槽
        }else {
            children = String(children)
        }
    }

    let vnode = {
        __v_isVnode: true,
        type,
        props,
        children,
        shapeFlags,
        key: props?.key,
        // 虚拟节点对应的真实节点，用于后续的diff算法
        el: null,
        // 组件实例
        component: null
    }
    return vnode
}

export function normalizeVNode(child){
    if(isString(child)){
        return createVNode(Text, null, child)
    }
    return child
}