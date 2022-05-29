import { effect } from "./effect"
export interface IWatchOptions {
    immediate?: boolean
}
export function watch(source:unknown,cb:Function,options:IWatchOptions={}){
    let getter
    if(typeof source === 'function'){
        getter = source
    }else{
        getter = () => traverse(source)
    }

    let newVal,oldVal

    const job = () => {
        newVal = effectFn && effectFn()
        cb(newVal,oldVal)
        oldVal = newVal
    }

    const effectFn = effect(getter,{
        lazy: true,
        scheduler: job
    })

    if(options.immediate){
        job()
    }else{
        oldVal = effectFn && effectFn()
    }
    
}

// 循环遍历访问每个响应式数据
function traverse(source) {

}