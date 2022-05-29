import { effect } from "./effect"
import { jobQueue,flushJob } from "../util/scheduler"
export interface IWatchOptions {
    immediate?: boolean
    flush?: 'post' | 'sync'
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
        scheduler(){
            if(options.flush == 'post'){
                jobQueue.add(job)
                flushJob()
            }else{
                job()
            }
        }
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