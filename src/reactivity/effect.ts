export let activeEffect
export function effect(fn: Function){
    activeEffect = fn
    fn()
}