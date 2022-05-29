import { effect } from "../effect";
import { reactive } from "../reactive";
import { watch } from "../watch"

test("watch基本功能", () => {
    let obj = reactive({num1: 1, num2: 2})
    let new_val,old_val
    const mockFn = jest.fn((newVal, oldVal)=>{
        // console.log(newVal, oldVal)
        new_val = newVal
        old_val = oldVal
    })
    watch(() => obj.num1,(newVal, oldVal)=>{
        mockFn(newVal, oldVal)
    })
    expect(mockFn).toHaveBeenCalledTimes(0)
    obj.num1++
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(new_val).toBe(2)
    expect(old_val).toBe(1)
    obj.num2++
    expect(mockFn).toHaveBeenCalledTimes(1)
    obj.num1++
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(new_val).toBe(3)
    expect(old_val).toBe(2)
})

test("watch立即执行",() => {
    let obj = reactive({num1: 1, num2: 2})
    let new_val,old_val
    const mockFn = jest.fn((newVal, oldVal)=>{
        // console.log(newVal, oldVal)
        new_val = newVal
        old_val = oldVal
    })
    watch(() => obj.num1,(newVal, oldVal)=>{
        mockFn(newVal, oldVal)
    },{
        immediate: true
    })

    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(new_val).toBe(1)
    expect(old_val).toBeUndefined()
})

test("watch的调度优化", () => {
    let obj = reactive({num1: 1, num2: 2})
    let new_val,old_val
    const mockFn = jest.fn((newVal, oldVal)=>{
        // console.log(newVal, oldVal)
        new_val = newVal
        old_val = oldVal
    })
    watch(() => obj.num1,async (newVal, oldVal)=>{
        await mockFn(newVal, oldVal)
        expect(mockFn).toHaveBeenCalledTimes(1)
        expect(new_val).toBe(4)
        expect(old_val).toBe(1)
    },{
        flush: 'post'
    })

    expect(mockFn).toHaveBeenCalledTimes(0)
    // 合并执行多条更改，优化调度只触发一次cb函数执行
    obj.num1++
    obj.num1++
    obj.num1++
    
})