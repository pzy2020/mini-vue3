function createElement (type) {
    return document.createElement(type)
}

function insert (child, parent, anchor?) {
    parent.insertBefore(child, anchor || null)
}

function setElementText(el, text) {
    el.textContent = text
}

function shouldSetAsProps(el,key){
    return key in el
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
        }else if(Array.isArray(vnode.children)){
            vnode.children.forEach(child => {
                patch(null, child, el)
            })
        }
        if(vnode.props){
            for (const key in vnode.props) {
                const value = vnode.props[key]
                if(shouldSetAsProps(el,key)){
                    const type = typeof el[key]
                    if(type === 'boolean' && value === ''){
                        el[key] = true
                    }else{
                        el[key] = value
                    }
                }
            }
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