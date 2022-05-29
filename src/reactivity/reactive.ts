import { IEffectFn,track,trigger } from "./effect"
// 存副作用的容器
export const bucket:WeakMap<any,Map<any,Set<IEffectFn>>> = new WeakMap()

// 用于for in 操作符 传给track方法作为其特殊的key
export const ITERATE_KEY = Symbol()

export function reactive(data){
    const obj = new Proxy(data, {
        // 拦截读取操作
        get(target, key, receiver){
            track(target, key)
            // 返回属性值
            return Reflect.get(target, key, receiver)
            // return target[key]
        },
        // 拦截设置操作
        set(target, key, newValue,receiver){
            const type = Object.prototype.hasOwnProperty.call(target,key) ? 'SET' : 'ADD'
            const res = Reflect.set(target,key,newValue,receiver)
            trigger(target, key, type)
            // 设置新属性值
            // target[key] = newValue
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
        }
    })

    return obj
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