export interface IEffectFn {
    (): void
    deps: Array<Set<Function>>
}
export let activeEffect:IEffectFn | undefined
export let effectStack:IEffectFn[] = []
export function effect(fn: Function){
    try {
        const effectFn:IEffectFn = () => {
            clear(effectFn)
            activeEffect = effectFn
            effectStack.push(effectFn)
            fn()
        }
        effectFn.deps = []
        effectFn()
        return effectFn
    } catch (error) {
        console.log(error)
    } finally {
        effectStack.pop()
        activeEffect = effectStack.length > 0 ? effectStack[effectStack.length - 1] : undefined
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