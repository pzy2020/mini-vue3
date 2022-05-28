import { activeEffect } from "./effect"

// 存副作用的容器
const bucket:WeakMap<any,Map<any,Set<Function>>> = new WeakMap()

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

function track(target, key){
    let depsMap = bucket.get(target)
    if(!depsMap){
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if(!deps){
        depsMap.set(key, (deps = new Set()))
    }

    if(activeEffect){
        // 如果存在注册的副作用函数，则收集进容器
        deps.add(activeEffect)
        activeEffect.deps.push(deps)
    }
}

function trigger(target, key){
    const depsMap = bucket.get(target)
    if(!depsMap) return false
    const effects = depsMap.get(key)
    // 新建Set遍历循环执行，直接使用原Set会导致死循环
    // const newDeps = new Set(deps)
    // // 从容器内取出所有副作用函数，并执行
    // newDeps && newDeps.forEach(fn => fn())
    const effectsToRun:Set<Function> = new Set()
    effects && effects.forEach(effectFn => {
        if(effectFn !== activeEffect){
            effectsToRun.add(effectFn)
        }
    })
    effectsToRun && effectsToRun.forEach(effectFn => {
        effectFn()
    })
}