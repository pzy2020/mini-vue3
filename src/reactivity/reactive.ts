import { activeEffect } from "./effect"

// 存副作用的容器
const bucket:Set<Function> = new Set()

export function reactive(data){
    const obj = new Proxy(data, {
        // 拦截读取操作
        get(target, key){
            if(activeEffect){
                // 如果存在注册的副作用函数，则收集进容器
                bucket.add(activeEffect)
            }
            // 返回属性值
            return target[key]
        },
        // 拦截设置操作
        set(target, key, newValue){
            // 设置新属性值
            target[key] = newValue
            // 从容器内取出所有副作用函数，并执行
            bucket.forEach(fn => fn())
            return true
        }
    })

    return obj
}