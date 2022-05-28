export interface IEffectFn {
    (): void
    deps: Array<Set<Function>>
}
export let activeEffect
export function effect(fn: Function){
    try {
        const effectFn:IEffectFn = () => {
            clear(effectFn)
            activeEffect = effectFn
            fn()
        }
        effectFn.deps = []
        effectFn()
        return effectFn
    } catch (error) {
        console.log(error)
    } finally {
        activeEffect = null
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