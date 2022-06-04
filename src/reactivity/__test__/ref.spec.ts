import { ref, isRef, unRef } from "../ref";
import { effect } from "../effect";
import { reactive } from "../reactive";


test("ref基本使用, 原始类型", () => {
    const num = 1
    let refObj = ref(num)
    let count
    const fn = jest.fn(() => {
        count = refObj.value
    })
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(count).toBe(1)
    refObj.value = 2
    expect(fn).toHaveBeenCalledTimes(2)
    expect(count).toBe(2)
})

test("ref基本使用,引用类型", () => {
    let refObj = ref({num: 1})
    let count
    const fn = jest.fn(() => {
        count = refObj.value.num
    })
    effect(fn)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(count).toBe(1)
    refObj.value.num = 2
    expect(fn).toHaveBeenCalledTimes(2)
    expect(count).toBe(2)
})

test("isRef", () => {
    const count = ref(1)
    const obj = reactive({num: 1})
    expect(isRef(count)).toBeTruthy()
    expect(isRef(obj)).toBeFalsy()
})

test("unRef", () => {
    const num = 1
    const obj = {
        name: 'joy'
    }
    const count = ref(num)
    const user = ref(obj)
    expect(unRef(count)).toBe(1)
    expect(unRef(num)).toBe(1)
    expect(unRef(user)).toEqual(obj)
    expect(unRef(obj)).toEqual(obj)
})