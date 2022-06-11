export function patchStyle(el, preVal, nextVal){
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
}