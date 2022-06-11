import { isArray, isString } from "../shared"
import { isSameVNodeType } from "./vnode"
export function createRenderer(options){
    const {
        createElement,
        insert,
        setElementText,
        remove,
        patchProp
    } = options

    const patchChildren = function(n1, n2, container){
        if(isString(n2.children)){
            setElementText(container, n2.children)
        }
    }

    const unmount = function(vnode){
        remove(vnode.el)
    }

    const patchElement = function(n1, n2){
        const el = n2.el = n1.el
        const oldProps = n1.props
        const newProps = n2.props
        for (const key in newProps) {
            if(newProps[key] !== oldProps[key]){
                patchProp(el, key, oldProps[key], newProps[key])
            }
        }

        for (const key in oldProps) {
            if(!(key in newProps)){
                patchProp(el, key, oldProps[key], null)
            }
        }

        patchChildren(n1, n2, el)
    }

    const mountElement = function(vnode, container){
        const el = vnode.el = createElement(vnode.type)
        if(isString(vnode.children)){
            setElementText(el,vnode.children)
        }else if(isArray(vnode.children)){
            vnode.children.forEach(child => {
                patch(null, child, el)
            })
        }
        if(vnode.props){
            for (const key in vnode.props) {
                const nextVal = vnode.props[key]
                patchProp(el, key, null, nextVal)
            }
        }
        insert(el,container)
    }

    const patch = function(n1, n2, container){
        if(n1 === n2) return
        if(n1 && !isSameVNodeType(n1,n2)){
            unmount(n1)
            n1 = null
        }
        const { type } = n2
        if(isString(type)){
            if(!n1){
                mountElement(n2, container)
            }else{
                console.log(n1,n2)
                patchElement(n1, n2)
            }
        }
        
    }

    const render = function(vnode, container){
        console.log(container._vnode,vnode)
        if(vnode){ // 挂载
            patch(container._vnode, vnode, container)
        }else { // 卸载
            if(container._vnode){
                unmount(container._vnode)
            }
        }
        container._vnode = vnode
    }

    return { render }
}