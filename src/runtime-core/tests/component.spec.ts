import { ref } from "../../reactivity/ref"
import { renderer } from "../../runtime-dom"
import { h } from "../h"
import { Fragment } from "../vnode"

let dom
afterEach(()=>{
    let appDom = document.querySelector('#app')
    if(appDom){
        let parent = appDom.parentNode
        parent && parent.removeChild(appDom)
    }
})

beforeEach(()=>{
    dom = document.createElement('div')
    dom.setAttribute('id', 'app')
    document.body.append(dom)
})
test("组件初始化与状态变化更新", function(){
    const myComponent = {
        data(){
            return {
                name: 'joy',
                age: 18
            }
        },
        render() {
            return h('div',{'onClick': () => (this as any).age ++},`${(this as any).name} 今年 ${(this as any).age}岁了`)
        },
    }
    renderer.render(h(myComponent), dom)
    const div = dom.querySelector('div')
    expect(div?.innerHTML).toBe("joy 今年 18岁了")
    div?.click()
    expect(div?.innerHTML).toBe("joy 今年 19岁了")

})

// test("组件状态变化批量更新", function(done){
//     const mockFn = jest.fn(function(this:any) {
//         return h('div',{'onClick': () => this.age ++},`${this.name} 今年 ${this.age}岁了`)
//     })
//     const myComponent = {
//         data(){
//             return {
//                 name: 'joy',
//                 age: 18
//             }
//         },
//         render: mockFn
//     }
//     renderer.render(h(myComponent), dom)
//     const div = dom.querySelector('div')
//     expect(div?.innerHTML).toBe("joy 今年 18岁了")
//     div?.click()
//     div?.click()
//     div?.click()
//     expect(div?.innerHTML).toBe("joy 今年 19岁了")
//     expect(mockFn).toHaveBeenCalledTimes(2)

// })

test("组件props", function(){
    const myComponent = {
        props:{
            address: String,
            city: String
        },
        render() {
            return h('div',`住址${(this as any).city} ${(this as any).address}`)
        },
    }
    renderer.render(h(myComponent,{address: '白云区', city: '广州市'}), dom)
    const div = dom.querySelector('div')
    expect(div?.innerHTML).toBe("住址广州市 白云区")

})

test("组件$attrs", function(){
    const myComponent = {
        props:{
            city: String
        },
        render() {
            return h('div',`住址${(this as any).city} ${(this as any).$attrs.address}`)
        },
    }
    renderer.render(h(myComponent,{address: '白云区', city: '广州市'}), dom)
    const div = dom.querySelector('div')
    expect(div?.innerHTML).toBe("住址广州市 白云区")

})

test("组件props导致的更新", function(){
    const VueComponent = {
        data(){
            return {
                flag: true
            }
        },
        render(){
            return h(Fragment,[
                h('button',{onClick: () => (this as any).flag = !(this as any).flag}, '切换'),
                h(myComponent,{address: (this as any).flag ? '广州' : '深圳'})])
        }
    }
    const myComponent = {
        props:{
            address: String,
        },
        render() {
            return h('div',`住址${(this as any).address}`)
        },
    }
    renderer.render(h(VueComponent), dom)
    const div = dom.querySelector('div')
    expect(div?.innerHTML).toBe("住址广州")
    const button = dom.querySelector('button')
    button?.click()
    expect(div?.innerHTML).toBe("住址深圳")

})

test("setup函数", () => {
    const VueComponent = {
        props:{
            address: String,
        },
        setup(props){
            const name = ref('joy')
            const age = ref(18)
            return {
                name,
                age,
                address: props.address + '白云区'
            }
        },
        render() {
            return h('div',`姓名${(this as any).name} 年龄${(this as any).age} 住址${(this as any).address}`)
        },
    }

    renderer.render(h(VueComponent, {address: '广州'}), dom)
    const div = dom.querySelector('div')
    expect(div?.innerHTML).toBe("姓名joy 年龄18 住址广州白云区")
})

test("setup函数返回render函数", () => {
    const VueComponent = {
        props:{
            address: String,
        },
        setup(props){
            const name = ref('joy')
            const age = ref(18)
            return () => {
                return h('div',`姓名${name.value} 年龄${age.value} 住址${props.address}`)
            }
        },
    }

    renderer.render(h(VueComponent, {address: '广州'}), dom)
    const div = dom.querySelector('div')
    expect(div?.innerHTML).toBe("姓名joy 年龄18 住址广州")
})