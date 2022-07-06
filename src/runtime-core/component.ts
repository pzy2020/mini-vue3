import { IEffectFn } from "../reactivity/effect"
import { reactive } from "../reactivity/reactive"
import { hasOwn, isFunction } from "../shared"
import { initProps } from "./componentProps"

export function createComponentInstance(vnode) {
    let instance:{update: IEffectFn | null} & any = {
        data: null,
        vnode,
        subTree: null,
        isMounted: false,
        update: null,
        propsOptions: vnode.type.props,
        props: {},
        attrs: {},
        proxy: null,
        render: null
    }

    return instance
}

const publicPropertyMap = {
    $attrs: (i) => i.attrs
}
const publicInstanceProxy = {
    get(target, key){
        const { data, props } = target
        if(data && hasOwn(data, key)){
            return data[key]
        }else if(props && hasOwn(props,key)){
            return props[key]
        }
        let getter = publicPropertyMap[key]
        if(getter){
            return getter(target)
        }
        
    },
    set(target, key, value){
        const { data, props } = target
        if(data && hasOwn(data, key)){
            data[key] = value
        // 用户操作的是代理对象，这里被屏蔽了，但是我们可以通过instance.props 拿到真实的props ，可以更改
        }else if(props && hasOwn(props,key)){
            console.error(`组件内的props ${String(key)}不能被赋值`)
            return false
        }
        return true
    }
}
export function setupComponent(instance) {
    let { props , type} = instance.vnode
    initProps(instance, props)
    instance.proxy = new Proxy(instance, publicInstanceProxy)
    let data = type.data
    if(data){
        if(!isFunction(data)){
            return console.error("data must be a function")
        }
        instance.data = reactive(data.call(instance.proxy))
    }
    instance.render = type.render
}