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

    // 如果source是一个响应式对象的话，由于对象是引用类型，newVal、oldVal都是引用effectFn的返回值，
    // 所以导致cb里的参数newVal 和 oldVal相等，所以不建议直接监听一个响应式对象
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
function traverse(value,seen=new Set()) {
    // seen 解决循环引用问题
    if(typeof value !== 'object' || value === null || seen.has(value)) return
    seen.add(value)
    for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
            traverse(value[key], seen)
            
        }
    }
    return value
}