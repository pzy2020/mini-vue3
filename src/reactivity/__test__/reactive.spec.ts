import { effect } from "../effect";
import { reactive, shallowReactive, readonly, shallowReadonly, isReactive, isReadonly} from "../reactive";

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

test("合理地触发响应，NaN的情况", () => {
    let obj= reactive({num: 1})
    let age
    const effectFn = jest.fn(() => {
        age = obj.num
    })
    effect(effectFn)
    expect(effectFn).toHaveBeenCalledTimes(1)
    obj.num = NaN
    expect(effectFn).toHaveBeenCalledTimes(2)
    obj.num = NaN
    expect(effectFn).toHaveBeenCalledTimes(2)
})

test("合理地触发响应，原型链继承的情况", () => {
    let child = reactive({})
    let parent = reactive({name: 'joy'})
    Object.setPrototypeOf(child,parent)
    let name
    const effectFn = jest.fn(()=>{
        // 由于child自身没有name属性，所以会顺着原型链往上继续查找，找到parent的name
        // 所以child['name']和parent['name']都会和副作用产生关联
        name = child.name
    })
    effect(effectFn)
    expect(effectFn).toHaveBeenCalledTimes(1)
    child.name = 'nick'
    expect(effectFn).toHaveBeenCalledTimes(2)
})

test("响应式数据", () => {
    const realObj = { foo: 1, bar: { name: 'joy' } }
    const observed = reactive(realObj)
    expect(observed).not.toBe(realObj)
    expect(isReactive(observed.foo)).toBe(false)
    expect(isReactive(observed)).toBe(true)
    expect(isReactive(realObj)).toBe(false)
    // get
    expect(observed.foo).toBe(1)
    // has
    expect('foo' in observed).toBe(true)
    // ownKeys
    expect(Object.keys(observed)).toEqual(['foo', 'bar'])
    // delete
    delete observed.foo
    expect('foo' in observed).toBe(false)
    // deep reactive
    expect(observed.bar.name).toBe('joy')
    expect(isReactive(observed.bar)).toBe(true)
})

test("浅层响应式", () => {
    const realObj = { foo: 1, bar: { name: 'joy' } }
    const observed = shallowReactive(realObj)
    expect(isReactive(observed.foo)).toBe(false)
    expect(isReactive(observed.bar)).toBe(false)
    expect(isReactive(observed)).toBe(true)
    // get
    expect(observed.bar.name).toBe('joy')
})

test("只读数据", () => {
    const realObj = { foo: 1, bar: { name: 'joy' } }
    const observed = readonly(realObj)
    expect(observed).not.toBe(realObj)
    expect(isReadonly(observed.foo)).toBe(false)
    expect(isReadonly(observed)).toBe(true)
    expect(isReadonly(realObj)).toBe(false)
    // get
    expect(observed.foo).toBe(1)
    // has
    expect('foo' in observed).toBe(true)
    // ownKeys
    expect(Object.keys(observed)).toEqual(['foo', 'bar'])
    // delete
    // expect(delete observed.foo).toThrowError()
    // expect(observed.foo = 2).toThrowError()
    // expect(observed.bar.name = 'nick').toThrowError()
    delete observed.foo
    observed.foo = 2
    expect(observed.foo).toBe(1)
    observed.bar.name = 'nick'
    expect(observed.bar.name).toBe('joy')
})

test("浅只读数据", () => {
    const realObj = { foo: 1, bar: { name: 'joy' } }
    const observed = shallowReadonly(realObj)
    expect(isReadonly(observed.foo)).toBe(false)
    expect(isReadonly(observed.bar)).toBe(false)
    expect(isReadonly(observed)).toBe(true)
    delete observed.foo
    observed.foo = 2
    expect(observed.foo).toBe(1)
    observed.bar.name = 'nick'
    expect(observed.bar.name).toBe('nick')
})