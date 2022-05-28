

export let jobQueue: Set<Function> = new Set()
export const p = Promise.resolve()
export let isFlushing = false

export function flushJob(){
    if(isFlushing) return
    isFlushing = true
    return p.then(()=>{
        jobQueue.forEach(job => job())
    }).finally(() => {
        isFlushing = false
    })
}