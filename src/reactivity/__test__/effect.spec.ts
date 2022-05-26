import { effect } from "../effect";
import { reactive } from "../reactive";

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
        console.log('mockFn call')
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