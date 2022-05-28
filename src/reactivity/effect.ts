export interface IEffectFn {
    (): void
    deps: Array<Set<Function>>
    options?: IEffectOptions
}
export interface IEffectOptions{
    scheduler?: (fn:Function) => void
}
export let activeEffect:IEffectFn | undefined
export let effectStack:IEffectFn[] = []
export function effect(fn: Function, options?:IEffectOptions){
    try {
        const effectFn:IEffectFn = () => {
            clear(effectFn)
            activeEffect = effectFn
            effectStack.push(effectFn)
            fn()
            effectStack.pop()
            activeEffect = effectStack.length > 0 ? effectStack[effectStack.length - 1] : undefined
        }
        effectFn.deps = []
        effectFn.options = options
        effectFn()
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