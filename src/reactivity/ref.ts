import { track,trigger } from "./effect";
import { reactive,toRaw } from "./reactive";

class RefImpl {
    private __isRef: Boolean
    private _val: any
    private _rawVal: any
    constructor(val) {
        this.__isRef = true
        this._rawVal = val
        this._val = convert(val)
    }

    get value(){
        track(this, 'value')
        return this._val
    }

    set value(newVal) {
        if(newVal !== this._rawVal){
            this._val = convert(newVal)
            trigger(this, 'value')
        }

    }
}

export function ref(val){
    if(isRef(val)){
        return val
    }
    return new RefImpl(val)
}

function convert(val){
    return typeof val === 'object' && val !== null ? reactive(val) : val
}

export function isRef(val){
    return !!(val && val.__isRef)
}

export function unRef(ref) {
    return isRef(ref) ? ref.value : ref
}

export function proxyRefs(ref){
    return new Proxy(ref, {
        get(target, key, receiver){
            return unRef(Reflect.get(target, key, receiver))
        },
        set(target, key, newValue,receiver){
            if (isRef(target[key]) && !isRef(newValue)) {
                return target[key].value = newValue
            }
            return Reflect.set(target, key, newValue,receiver)
        }
    })
}