import { renderer } from "../../runtime-dom"
import { h } from "../h"

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