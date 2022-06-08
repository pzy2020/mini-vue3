function createElement (type) {
    return document.createElement(type)
}

function insert (child, parent, anchor?) {
    parent.insertBefore(child, anchor || null)
}

function setElementText(el, text) {
    el.textContent = text
}

function parentNode(child:Element | null){
    return child?.parentNode
}

function remove(child) {
    const parent = parentNode(child)
    if(parent){
        parent.removeChild(child)
    }
}

function patchProp(el, key, preVal, nextVal) {
    if(key === 'style'){
        // 遍历新的style对象直接覆盖
        for (const k in nextVal) {
            el.style[k] = nextVal[k]
        }
        // 遍历旧的style对象，把不存在于新的对象中的样式属性置空
        for (const k in preVal) {
            if(!(k in nextVal)){
                el.style[k] = null
            }
        }
    }else if(key === 'class'){ 
        el.className = nextVal
    }else if(shouldSetAsProps(el,key)){
        const type = typeof el[key]
        if(type === 'boolean' && nextVal === ''){
            el[key] = true
        }else{
            el[key] = nextVal
        }
    }else{
        el.setAttribute(key, nextVal)
    }
}

function shouldSetAsProps(el,key){
    return key in el
}

export function createRenderer(options = {createElement, insert, setElementText, remove}){
    const {
        createElement,
        insert,
        setElementText,
        remove
    } = options

    function patchChildren(n1, n2, container){
        if(typeof n2.children === 'string'){
            setElementText(container, n2.children)
        }
    }

    function unmount(vnode){
        remove(vnode.el)
    }

    function patchElement(n1, n2){
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

    function mountElement(vnode, container){
        const el = vnode.el = createElement(vnode.type)
        if(typeof vnode.children === 'string'){
            setElementText(el,vnode.children)
        }else if(Array.isArray(vnode.children)){
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

    function patch(n1, n2, container){
        if(n1 === n2) return
        if(n1 && n1.type !== n2.type){
            unmount(n1)
            n1 = null
        }
        const { type } = n2
        if(typeof type === 'string'){
            if(!n1){
                mountElement(n2, container)
            }else{
                console.log(n1,n2)
                patchElement(n1, n2)
            }
        }
        
    }

    function render(vnode, container){
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