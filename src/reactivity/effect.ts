import { bucket, ITERATE_KEY } from "./reactive"

export type triggerType = 'SET' | 'ADD' | 'DELETE'

export interface IEffectFn {
    (): void
    deps: Array<Set<Function>>
    options?: IEffectOptions
}
export interface IEffectOptions{
    scheduler?: (fn:Function) => void,
    lazy?: boolean
}
export let activeEffect:IEffectFn | undefined
export let effectStack:IEffectFn[] = []
export function effect(fn: Function, options?:IEffectOptions){
    try {
        const effectFn:IEffectFn = () => {
            clear(effectFn)
            activeEffect = effectFn
            effectStack.push(effectFn)
            let res = fn()
            effectStack.pop()
            activeEffect = effectStack.length > 0 ? effectStack[effectStack.length - 1] : undefined
            return res
        }
        effectFn.deps = []
        effectFn.options = options
        if(!options?.lazy){
            effectFn()
        }
        
        return effectFn
    } catch (error) {
        console.log(error)
    }
    
}

export function clear(effectFn:IEffectFn){
    if(effectFn.deps.length){
        for (let index = 0; index < effectFn.deps.length; index++) {
            let deps = effectFn.deps[index];
            deps.delete(effectFn)
        }
        effectFn.deps.length = 0
    }
}

export function track(target, key){
    // 如果不存在正在执行的副作用函数，则直接返回
    if (!activeEffect) return
    let depsMap = bucket.get(target)
    if(!depsMap){
        bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if(!deps){
        depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    activeEffect.deps.push(deps)
}

export function trigger(target, key, type:triggerType){
    const depsMap = bucket.get(target)
    if(!depsMap) return false
    const effects = depsMap.get(key)

    // 新建Set遍历循环执行，直接使用原Set会导致死循环
    // const newDeps = new Set(deps)
    // // 从容器内取出所有副作用函数，并执行
    // newDeps && newDeps.forEach(fn => fn())
    const effectsToRun:Set<IEffectFn> = new Set()
    effects && effects.forEach(effectFn => {
        if(effectFn !== activeEffect){
            effectsToRun.add(effectFn)
        }
    })
    
    if(type === 'ADD' || type === 'DELETE'){
        const iterateEffects = depsMap.get(ITERATE_KEY)
        iterateEffects && iterateEffects.forEach(effectFn => {
            if(effectFn !== activeEffect){
                effectsToRun.add(effectFn)
            }
        })
    }

    effectsToRun && effectsToRun.forEach(effectFn => {
        if(effectFn.options && effectFn.options.scheduler){
            effectFn.options.scheduler(effectFn)
        }else{
            effectFn()
        }
        
    })
}