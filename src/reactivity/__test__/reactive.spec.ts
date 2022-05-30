import { effect } from "../effect";
import { reactive } from "../reactive";

test("为什么需要Reflect", () => {
    let obj = reactive({
        name: 'joy',
        get theName(){
            return this.name
        }
    })
    let theName
    const effectFn = jest.fn(()=> {
        theName = obj.theName
    })
    effect(effectFn)
    expect(effectFn).toHaveBeenCalledTimes(1)
    expect(theName).toBe(obj.name)
    obj.name = 'nike'
    expect(effectFn).toHaveBeenCalledTimes(2)
    expect(theName).toBe('nike')
})

test("对象的in操作符",() => {
    let obj= reactive({name: 'joy'})
    const effectFn = jest.fn(() => {
        'name' in obj
    })
    effect(effectFn)
    obj.name = 'nick'
    expect(effectFn).toHaveBeenCalledTimes(2)
})

test("对象的for in操作符",() => {
    let obj= reactive({name: 'joy',age: 18})
    const effectFn = jest.fn(() => {
        for (const key in obj) {
            console.log(key)
        }
    })
    effect(effectFn)
    expect(effectFn).toHaveBeenCalledTimes(1)
    obj.name = 'nick'
    expect(effectFn).toHaveBeenCalledTimes(1)
    obj.height = 60
    expect(effectFn).toHaveBeenCalledTimes(2)
})

test("对象的delete操作", () => {
    let obj= reactive({name: 'joy',age: 18})
    const effectFn = jest.fn(() => {
        for (const key in obj) {
            console.log(key)
        }
    })
    let name
    const effectFn1 = jest.fn(() => {
        name = obj.name
    })
    effect(effectFn)
    effect(effectFn1)
    delete obj.name
    expect(effectFn1).toHaveBeenCalledTimes(2)
    expect(effectFn).toHaveBeenCalledTimes(2)
})

test("合理地触发响应，设置的新值全等于旧值", () => {
    let obj= reactive({name: 'joy'})
    let name
    const effectFn = jest.fn(() => {
        name = obj.name
    })
    effect(effectFn)
    expect(effectFn).toHaveBeenCalledTimes(1)
    obj.name = 'nick'
    expect(effectFn).toHaveBeenCalledTimes(2)
    obj.name = 'nick'
    expect(effectFn).toHaveBeenCalledTimes(2)
})