import { effect, track, trigger } from "./effect";
export function computed(getter:Function){
    let value,dirty=true

    const effectFn = effect(getter,{
        lazy: true,
        scheduler(){
            if(!dirty){
                dirty = true
                trigger(obj, 'value')
            }
        }
    })


    const obj = {
        get value(){
            if(dirty){
                value = effectFn && effectFn()
                dirty = false
            }
            track(obj, 'value')
            return value
        }
    }
    return obj
}