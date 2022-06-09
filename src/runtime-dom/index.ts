import { createRenderer } from '../runtime-core'
import { nodeOps } from './nodeOps'
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

export const renderer = createRenderer(Object.assign({patchProp},nodeOps))

export const render = renderer.render