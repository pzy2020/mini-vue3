import { isArray, isString } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { isSameVNodeType } from "./vnode"
export function createRenderer(options){
    const {
        createElement,
        insert,
        setElementText,
        remove,
        patchProp
    } = options

    const unmountChildren = function(children){
        for (let index = 0; index < children.length; index++) {
            unmount(children[index])
            
        }
    }

    const mountChildren = function(children,container){
        for (let index = 0; index < children.length; index++) {
            patch(null,children[index],container)
        }
    }

    const patchChildren = function(n1, n2, container){
        const c1 = n1.children
        const c2 = n2.children
        const pervShapeFlags= n1.shapeFlags
        const shapeFlags = n2.shapeFlags
        if(shapeFlags & ShapeFlags.TEXT_CHILDREN){
            if(pervShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                // 删除所有子节点
                unmountChildren(c1)
            }
            if(c1 !== c2){
                setElementText(container,c2)
            }
        }else { // 现在为数组或空
            if(pervShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){
                    // diff 算法
                    console.log(c1,c2)
                }else{
                    unmountChildren(c1)
                }
            }else{
                if(pervShapeFlags & ShapeFlags.TEXT_CHILDREN){
                    setElementText(container,'')
                }
                if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){
                    mountChildren(c2, container)
                }
            }
        }
    }

    const unmount = function(vnode){
        remove(vnode.el)
    }

    // 更新属性，更新子元素
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
        const { props, shapeFlags, children } = vnode
        
        if(shapeFlags & ShapeFlags.TEXT_CHILDREN){
            setElementText(el,children)
        }else if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){
            mountChildren(children,el)
        }
        
        if(props){
            for (const key in props) {
                const nextVal = props[key]
                patchProp(el, key, null, nextVal)
            }
        }
        insert(el,container)
    }

    const processElement = function(n1, n2, container){
        if(!n1){
            mountElement(n2, container)
        }else{
            patchElement(n1, n2)
        }
    }

    const patch = function(n1, n2, container){
        if(n1 === n2) return
        if(n1 && !isSameVNodeType(n1,n2)){
            unmount(n1)
            n1 = null
        }
        const { type, shapeFlags } = n2
        switch (type) {
            default:
                if(shapeFlags & ShapeFlags.ELEMENT){
                    processElement(n1, n2, container)
                }
                break;
        }
        
    }

    const render = function(vnode, container){
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