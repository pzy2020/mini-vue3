import { IEffectFn,track,trigger } from "./effect"
// 存副作用的容器
export const bucket:WeakMap<any,Map<any,Set<IEffectFn>>> = new WeakMap()

// 用于for in 操作符 传给track方法作为其特殊的key
export const ITERATE_KEY = Symbol()

export const ReactiveFlags = {
    IS_REACTIVE: '__v_isReactive',
    RAW: '__v_raw',
    IS_READONLY: '__v_isReadonly',
}

// 禁止trace标志
export let shouldTrack = true

export const reactiveCache = new Map()
export const readonlyCache = new Map()

const arrayInstrumentations = {}
;['includes','indexOf','lastIndexOf'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentations[method] = function(...args) {
        // this 是代理对象, 先在代理对象中查找
        let res = originMethod.apply(this, args)
        if(res === false || res < 0){
            // 在代理对象找不到，就去原始对象里找
            res = originMethod.apply(this[ReactiveFlags.RAW], args)
        }
        return res
    }
})

;['push', 'pop', 'shift', 'unshift', 'splice'].forEach(method => {
    const originMethod = Array.prototype[method]
    arrayInstrumentations[method] = function(...args){
        // 调用原始方法前禁止追踪，阻止push方法内部会访问length属性引起不必要的依赖收集
        shouldTrack = false
        let res = originMethod.apply(this,args)
        // 执行完，允许追踪
        shouldTrack = true
        return res
    }
})

// const originIncludes = Array.prototype.includes
// const arrayInstrumentations = {
//     includes: function(...args:any){
//         // this 是代理对象, 先在代理对象中查找
//         let res = originIncludes.apply(this, args)
//         if(res === false){
//             // 在代理对象找不到，就去原始对象里找
//             res = originIncludes.apply(this[ReactiveFlags.RAW], args)
//         }
//         return res
//     }
// }

export function createReactive(data, isShallow = false, isReadonly = false){
    const obj = new Proxy(data, {
        // 拦截读取操作
        get(target, key, receiver){
            if(key === ReactiveFlags.IS_READONLY){
                return isReadonly
            }else if(key === ReactiveFlags.IS_REACTIVE){
                return !isReadonly
            }
            else if(key === ReactiveFlags.RAW) {
                return target
            }
            
            // 如果操作的目标对象是数组，并且key存在于arrayInstrumentations，则返回定义在arrayInstrumentations的值
            if(Array.isArray(target) && arrayInstrumentations.hasOwnProperty(key)){
                return Reflect.get(arrayInstrumentations, key, receiver)
            }

            const res = Reflect.get(target, key, receiver)

            if(!isReadonly && typeof key !== 'symbol'){
                track(target, key)
            }

            if(isShallow){
                return res
            }

            // 当访问的属性是对象时，再把属性对象代理成响应式对象，就是懒代理
            if(typeof res === 'object' && res !== null){
                return isReadonly ? readonly(res) : reactive(res)
            }
            // 返回属性值
            return res
            // return target[key]
        },
        // 拦截设置操作
        set(target, key, newValue,receiver){
            // 如果是只读的，则打印警告信息并返回
            if(isReadonly){
                console.warn(`属性 ${key} 是只读的`)
                return true
            }
            // 获取旧值
            const oldVal = target[key]
            const type = Array.isArray(target) 
                ? Number(key) >= target.length ? 'ADD' : 'SET'
                : Object.prototype.hasOwnProperty.call(target,key) ? 'SET' : 'ADD'
            const res = Reflect.set(target,key,newValue,receiver)
            // receiver是target的代理对象才触发
            if(target === receiver[ReactiveFlags.RAW]){
                // 新旧值不同并且新旧值都不为NaN
                if(oldVal !== newValue && (oldVal === oldVal || newValue === newValue)){
                    trigger(target, key , type, newValue)
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
            track(target, Array.isArray(target) ? 'length': ITERATE_KEY)
            return Reflect.ownKeys(target)
        },
        // 对象的delete操作
        deleteProperty(target,key){
            // 如果是只读的，则打印警告信息并返回
            if(isReadonly){
                console.warn(`属性 ${key} 是只读的`)
                return true
            }
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
    // 已代理过的对象直接返回
    const reactiveObj = reactiveCache.get(data)
    if(reactiveObj){
        return reactiveObj
    }
    const proxy = createReactive(data)
    reactiveCache.set(data,proxy)
    return proxy
}

export function shallowReactive(data) {
    return createReactive(data, true)
}

export function readonly(data) {
    // 已代理过的对象直接返回
    const readonlyObj = readonlyCache.get(data)
    if(readonlyObj){
        return readonlyObj
    }
    const proxy = createReactive(data, false, true)
    readonlyCache.set(data,proxy)
    return proxy
}

export function shallowReadonly(data) {
    return createReactive(data, true, true)
}

export function isReactive(value: object) {
    // 判断是不是有__isReactive属性
    return !!value[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(value: object) {
    // 判断是不是有__isReadonly属性
    return !!value[ReactiveFlags.IS_READONLY]
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