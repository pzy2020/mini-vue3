import { ShapeFlags } from "../shared/ShapeFlags";
import { isString,isArray } from "../shared";

export function isVNode(value){
    return !!(value && value.__v_isVnode)
}

export function isSameVNodeType(n1,n2){
    return n1.key === n2.key && n1.type === n2.type
}

export function createVNode(type, props?, children?){
    let shapeFlags = isString(type) ? ShapeFlags.ELEMENT : 0
    if(children){
        if(isString(children)){
            shapeFlags |= ShapeFlags.TEXT_CHILDREN
        }else if(isArray(children)) {
            shapeFlags |= ShapeFlags.ARRAY_CHILDREN
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
        el: null
    }
    return vnode
}