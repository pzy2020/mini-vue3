import { shallowReactive } from "../reactivity/reactive"
import { hasOwn } from "../shared"

export function initProps(instance, rawProps){
    const props = {}
    const attrs = {}
    const options = instance.propsOptions || {}
    
    if(rawProps){
        for(const key in rawProps){
            const value = rawProps[key]
            if(hasOwn(options,key)){
                props[key] = value
            }else {
                attrs[key] = value
            }
        }
    }
    instance.props = shallowReactive(props)
    instance.attrs = attrs
}
export const hasPropsChanged = (prevProps = {},nextProps = {}) => {
    const nextKeys = Object.keys(nextProps)
    if(Object.keys(prevProps).length !== nextKeys.length){
        return true
    }
    for (let index = 0; index < nextKeys.length; index++) {
        const key = nextKeys[index];
        if(nextProps[key] !== prevProps[key]){
            return true
        }
    }
    return false
}
export function updateProps(prevProps,nextProps){
    // 属性有无变化，个数变化，值变化
    for (const key in nextProps) {
        prevProps[key] = nextProps[key]
    }
    for (const key in prevProps) {
        if(!hasOwn(nextProps,key)){
            delete prevProps[key]
        }
    }
}