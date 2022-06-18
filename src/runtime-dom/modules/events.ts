import { isArray } from "../../shared";

export function patchEvent(el, key, nextVal){
    // 定义一个_vei属性在真实dom上，用于缓存事件处理函数和名称的映射
    const invokers = el._vei || (el._vei = {})
    let invoker = invokers[key]
    const name = key.slice(2).toLowerCase()
    if(nextVal){
        if(!invoker){
            invoker = el._vei[key] = (e) => {
                console.log('patchEvent:',invoker,e.timeStamp,invoker.attached)
                if(e.timeStamp < invoker.attached) return
                if(isArray(invoker.value)){
                    invoker.value.forEach(fn => {
                        fn(e)
                    });
                }else{
                    invoker.value(e)
                }
            }
            invoker.value = nextVal
            invoker.attached = Date.now()
            el.addEventListener(name, invoker)
        }else{
            invoker.value = nextVal
        }
    }else if(invoker){
        el.removeEventListener(name, invoker)
    }
}