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