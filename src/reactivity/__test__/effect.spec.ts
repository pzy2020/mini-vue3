import { effect } from "../effect";
import { reactive } from "../reactive";
import { jobQueue,flushJob } from "../../util/scheduler"

test("effect and reactive基本使用", () => {
    let obj = reactive({
        num: 1
    })
    let num
    effect(() => {
        num = obj.num
    })
    expect(num).toBe(1)
    obj.num ++
    expect(num).toBe(2)
    obj.num = 6
    expect(num).toBe(6)
})

// test("effect收集对应的依赖,也只触发对应的副作用函数", () => {
//     let obj = reactive({
//         num1: 1,
//         num2: 1
//     })
//     let num1,num2 = 0
//     effect(() => {
//         num1 = obj.num1
//         num2++
//     })
//     expect(num1).toBe(1)
//     expect(num2).toBe(1)
//     obj.num1++
//     expect(num1).toBe(2)
//     expect(num2).toBe(2)
//     obj.num2++ // 这一次设置obj.num2不应该触发副作用函数的重新执行
//     expect(num1).toBe(2)
//     expect(num2).toBe(3)
// })

test("effect收集对应的依赖,也只触发对应的副作用函数", () => {
    let obj = reactive({
        num1: 1,
        num2: 1
    })
    let num = 0
    const mockFn = jest.fn(() => {
        // console.log('mockFn call')
        num = obj.num1
    })
    effect(mockFn)
    expect(mockFn).toHaveBeenCalledTimes(1)
    expect(num).toBe(1)
    obj.num1 = 2
    expect(mockFn).toHaveBeenCalledTimes(2)
    expect(num).toBe(2)
    obj.num2=3 // 这一次设置obj.num2不应该触发副作用函数的重新执行
    expect(mockFn).toHaveBeenCalledTimes(2) // 副作用函数依旧只执行2次
    expect(num).toBe(2)
})

test("effect内代码分支", () => {
    let obj = reactive({
        hasName: true,
        name: 'joy'
    })
    let name = ''
    const noName = 'no name'
    const mockFn = jest.fn(() => {
        name = obj.hasName ? obj.name : noName
    })
    effect(mockFn)
    expect(name).toBe(obj.name)
    expect(mockFn).toHaveBeenCalledTimes(1)
    obj.hasName = false
    expect(name).toBe(noName)
    expect(mockFn).toHaveBeenCalledTimes(2)
    obj.name = 'jack' // 这一次更改name不应该触发副作用函数的重新执行，因为在hasName为false的情况下，name的改变永远影响不到最终执行后的结果
    expect(name).toBe(noName)
    expect(mockFn).toHaveBeenCalledTimes(2)
})

test("effect嵌套", () => {
    let obj = reactive({
        foo: 'foo',
        bar: 'bar'
    })
    let foo,bar
    const fn1 = jest.fn()
    const fn2 = jest.fn()
    effect(() => {
        fn1()
        effect(() => {
            fn2()
            bar = obj.bar
        })
        foo = obj.foo
    })

    expect(foo).toBe(obj.foo)
    expect(bar).toBe(obj.bar)
    expect(fn1).toBeCalledTimes(1)
    expect(fn2).toBeCalledTimes(1)
    obj.bar = 'barbar'
    expect(bar).toBe(obj.bar)
    expect(fn2).toBeCalledTimes(2)
    obj.foo = 'foofoo'
    expect(foo).toBe(obj.foo)
    expect(fn1).toBeCalledTimes(2)
    expect(fn2).toBeCalledTimes(3)
})

test("effect内响应式数据自增", () => {
    let obj = reactive({
        num: 1,
    })
    const mockFn = jest.fn(() => {
        obj.num ++
    })
    effect(mockFn)
    expect(mockFn).toHaveBeenCalledTimes(1)
})

// test("可调度的effect", () => {
//     let obj = reactive({
//         num: 1,
//     })
//     let num
//     const mockFn = jest.fn(() => {
//         console.log(obj.num)
//         num = obj.num
//     })
//     effect(mockFn,{
//         scheduler(fn){
//             jobQueue.add(fn)
//             flushJob()
//         }
//     })

//     obj.num++
//     obj.num++
//     obj.num++

//     expect(num).toBe(4)
//     // expect(mockFn).toHaveBeenCalledTimes(2)
// })

test("可调度的effect", () => {
    let obj = reactive({
        num: 1,
    })
    let num
    const fn = jest.fn()
    const scheduler = jest.fn(async (fn) => {
        jobQueue.add(fn)
        await flushJob()
        expect(num).toBe(4)
    })
    effect(() => {
        fn()
        console.log(obj.num)
        num = obj.num
    },{
        scheduler
    })
    expect(scheduler).not.toHaveBeenCalled()
    obj.num++
    obj.num++
    obj.num++

    
    expect(scheduler).toHaveBeenCalledTimes(3)
    // expect(fn).toHaveBeenCalledTimes(2)
    // expect(num).toBe(4)
})