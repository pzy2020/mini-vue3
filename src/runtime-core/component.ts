import { IEffectFn } from "../reactivity/effect"
import { reactive } from "../reactivity/reactive"
import { proxyRefs } from "../reactivity/ref"
import { hasOwn, isFunction, isObject } from "../shared"
import { initProps } from "./componentProps"

export function createComponentInstance(vnode) {
    const emit =  (event, ...args) => {
        const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
        const handler = instance.vnode.props[eventName]
        if(handler){
            handler(...args)
        }
    }
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
        render: null,
        next: null,
        setupState: {},
        emit,
    }

    return instance
}

const publicPropertyMap = {
    $attrs: (i) => i.attrs,
    $emit: (i) => i.emit
}
const publicInstanceProxy = {
    get(target, key){
        const { data, props, setupState } = target
        if(data && hasOwn(data, key)){
            return data[key]
        }else if(setupState && hasOwn(setupState, key)){
            return setupState[key]
        }else if(props && hasOwn(props,key)){
            return props[key]
        }
        let getter = publicPropertyMap[key]
        if(getter){
            return getter(target)
        }
        
    },
    set(target, key, value){
        const { data, props, setupState } = target
        if(data && hasOwn(data, key)){
            data[key] = value
        // 用户操作的是代理对象，这里被屏蔽了，但是我们可以通过instance.props 拿到真实的props ，可以更改
        }else if(setupState && hasOwn(setupState,key)){
            setupState[key] = value
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

    let setup = type.setup
    if(setup){
        // setup函数第二个参数
        const setupContext = {
            // emit: (event, ...args) => {
            //     const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
            //     const handler = instance.vnode.props[eventName]
            //     if(handler){
            //         handler(...args)
            //     }
            // }
            emit: instance.emit
        }
        const setupResult = setup(instance.props, setupContext)
        if(isFunction(setupResult)){
            instance.render = setupResult
        }else if(isObject(setupResult)) {
            // 脱ref ，不需要.value进行访问
            instance.setupState = proxyRefs(setupResult)
        }
    }
    if(!instance.render){
        instance.render = type.render
    }
}