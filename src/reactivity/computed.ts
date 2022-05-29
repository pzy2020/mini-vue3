import { effect, track, trigger } from "./effect";
export function computed(getter:Function){
    const effectFn = effect(getter,{lazy: true})


    return {
        get value(){
            return effectFn && effectFn()
        }
    }
}