import { isArray, isObject } from "../shared";
import { createVNode, isVNode } from "./vnode";

export function h(type, propsChildren?, children?){
    const len = arguments.length
    // 2个参数
    if(len === 2){
        if(isObject(propsChildren) && !isArray(propsChildren)){
            if(isVNode(propsChildren)){
                return createVNode(type,null,[propsChildren])
            }
            return createVNode(type,propsChildren)
        }else{
            return createVNode(type, null, propsChildren)
        }
    }else{
        if(len === 3 && isVNode(children)){ // 3个参数
            children = [children]
        }else if(len > 3){ // 大于3个参数
            children = Array.prototype.slice.call(arguments, 2)
        }
        return createVNode(type, propsChildren, children)
    }
}