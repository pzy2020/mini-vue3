export const nodeOps = {
    createElement (tag) {
        return document.createElement(tag)
    },
    
    insert (child, parent, anchor?) {
        parent.insertBefore(child, anchor || null)
    },
    
    setElementText(el, text) {
        el.textContent = text
    },
    
    parentNode(child:Element | null){
        return child?.parentNode
    },
    
    remove(child) {
        const parent = child.parentNode
        if(parent){
            parent.removeChild(child)
        }
    },

    createText(text) {
        return document.createTextNode(text)
    },

    setText(node, text) {
        node.nodeValue = text
    }
}