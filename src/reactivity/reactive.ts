import { IEffectFn,track,trigger } from "./effect"
// 存副作用的容器
export const bucket:WeakMap<any,Map<any,Set<IEffectFn>>> = new WeakMap()

// 用于for in 操作符 传给track方法作为其特殊的key
export const ITERATE_KEY = Symbol()

export const ReactiveFlags = {
    IS_REACTIVE: '__v_isReactive',
    RAW: '__v_raw',
}

export function createReactive(data, isShallow = false){
    const obj = new Proxy(data, {
        // 拦截读取操作
        get(target, key, receiver){
            if(key === ReactiveFlags.IS_REACTIVE){
                return true
            }else if(key === ReactiveFlags.RAW) {
                return target
            }
            
            const res = Reflect.get(target, key, receiver)
            track(target, key)
            if(isShallow){
                return res
            }

            // 当访问的属性是对象时，再把属性对象代理成响应式对象，就是懒代理
            if(typeof res === 'object' && res !== null){
                return reactive(res)
            }
            // 返回属性值
            return res
            // return target[key]
        },
        // 拦截设置操作
        set(target, key, newValue,receiver){
            // 获取旧值
            const oldVal = target[key]
            const type = Object.prototype.hasOwnProperty.call(target,key) ? 'SET' : 'ADD'
            const res = Reflect.set(target,key,newValue,receiver)
            // receiver是target的代理对象才触发
            if(target === receiver[ReactiveFlags.RAW]){
                // 新旧值不同并且新旧值都不为NaN
                if(oldVal !== newValue && (oldVal === oldVal || newValue === newValue)){
                    trigger(target, key, type)
                }
            }
            
            return res
        },
        // 对象的in操作符 
        has(target, key){
            track(target, key)
            return Reflect.has(target, key)
        },
        // 对象的for in 操作符
        ownKeys(target){
            track(target, ITERATE_KEY)
            return Reflect.ownKeys(target)
        },
        // 对象的delete操作
        deleteProperty(target,key){
            const isOwn = Object.prototype.hasOwnProperty.call(target,key)
            const res = Reflect.deleteProperty(target,key)
            if(isOwn && res){
                trigger(target, key, 'DELETE')
            }
            return res
        }
    })

    return obj
}

export function reactive(data) {
    return createReactive(data)
}

export function shallowReactive(data) {
    return createReactive(data, true)
}

export function isReactive(value: object) {
    // 判断是不是有__isReactive属性
    return !!value[ReactiveFlags.IS_REACTIVE]
}

// export function reactive(data){
//     const obj = new Proxy(data, {
//         // 拦截读取操作
//         get(target, key){
//             track(target, key)
//             // 返回属性值
//             return target[key]
//         },
//         // 拦截设置操作
//         set(target, key, newValue){
//             // 设置新属性值
//             target[key] = newValue
//             trigger(target, key)
//             return true
//         }
//     })

//     return obj
// }