import { IEffectFn,track,trigger } from "./effect"
// 存副作用的容器
export const bucket:WeakMap<any,Map<any,Set<IEffectFn>>> = new WeakMap()

export function reactive(data){
    const obj = new Proxy(data, {
        // 拦截读取操作
        get(target, key){
            track(target, key)
            // 返回属性值
            return target[key]
        },
        // 拦截设置操作
        set(target, key, newValue){
            // 设置新属性值
            target[key] = newValue
            trigger(target, key)
            return true
        }
    })

    return obj
}

