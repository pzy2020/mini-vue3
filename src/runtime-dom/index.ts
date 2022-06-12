import { createRenderer } from '../runtime-core'
import { patchEvent } from './modules/events'
import { patchStyle } from './modules/style'
import { nodeOps } from './nodeOps'
export function patchProp(el, key, preVal, nextVal) {
    if(key === 'style'){
        patchStyle(el, preVal, nextVal)
    }else if(key === 'class'){ 
        el.className = nextVal
    }else if(/^on[A-Z]/.test(key)){ // 处理事件
        patchEvent(el, key, nextVal)
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