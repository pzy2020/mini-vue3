import { effect } from "../effect";
import { reactive } from "../reactive";
import { computed } from "../computed"

test("effect的lazy选项", () => {
    let obj = reactive({age: 18})
    const mockFn = jest.fn(() => {})
    const effectFn = effect(mockFn,{lazy: true})
    expect(mockFn).toBeCalledTimes(0)
    effectFn && effectFn()
    expect(mockFn).toBeCalledTimes(1)
})

test("computed懒执行", () => {
    let obj = reactive({age: 18})
    const mockFn = jest.fn(() => {
        return obj.age * 2
    })
    let numComputed = computed(mockFn)
    expect(mockFn).toBeCalledTimes(0)
    expect(numComputed.value).toBe(36)
    expect(mockFn).toBeCalledTimes(1)
    obj.age++
    expect(mockFn).toBeCalledTimes(2)
    expect(numComputed.value).toBe(38)
})

test("computed缓存特性", () => {
    let obj = reactive({age: 18})
    const mockFn = jest.fn(() => {
        return obj.age * 2
    })
    let numComputed = computed(mockFn)
    expect(mockFn).toBeCalledTimes(0)
    expect(numComputed.value).toBe(36)
    expect(mockFn).toBeCalledTimes(1)
    expect(numComputed.value).toBe(36)
    expect(numComputed.value).toBe(36)
    expect(mockFn).toBeCalledTimes(1)
    obj.age++
    expect(mockFn).toBeCalledTimes(2)
    expect(numComputed.value).toBe(38)
})