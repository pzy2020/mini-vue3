let queue:any[] = []
let isFlushing = false
const resolvePromise = Promise.resolve()

export function queueJob(job){
    if(!queue.includes(job))[
        queue.push(job)
    ]
    if(!isFlushing){
        isFlushing = true
        resolvePromise.then(() => {
            isFlushing = false
            let copy = queue.slice(0)
            queue.length = 0
            for (let index = 0; index < copy.length; index++) {
                const job = copy[index];
                job()
            }
            copy.length = 0
        })
    }
}