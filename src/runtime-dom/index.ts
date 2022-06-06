function createElement (type) {
    return document.createElement(type)
}

function insert (child, parent, anchor?) {
    parent.insertBefore(child, anchor || null)
}

function setElementText(el, text) {
    el.textContent = text
}

export function createRenderer(options = {createElement, insert, setElementText}){
    const {
        createElement,
        insert,
        setElementText
    } = options

    function mountElement(vnode, container){
        const el = createElement(vnode.type)
        if(typeof vnode.children === 'string'){
            setElementText(el,vnode.children)
        }
        insert(el,container)
    }

    function patch(n1, n2, container){
        if(!n1){
            mountElement(n2, container)
        }
    }

    function render(vnode, container){
        if(vnode){ // 挂载
            patch(container._vnode, vnode, container)
        }else { // 卸载
            if(container._vnode){
                container.innerHTML = ''
            }
        }
        container._vnode = vnode
    }

    return { render }
}