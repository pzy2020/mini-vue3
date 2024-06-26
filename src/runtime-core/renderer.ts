import { effect, IEffectFn } from "../reactivity/effect"
import { invokeArrayFns, isArray } from "../shared"
import { ShapeFlags } from "../shared/ShapeFlags"
import { createComponentInstance, setupComponent } from "./component"
import { updateProps, hasPropsChanged } from "./componentProps"
import { Fragment, isSameVNodeType, normalizeVNode, Text } from "./vnode"
export function createRenderer(options){
    const {
        createElement,
        insert,
        setElementText,
        remove,
        patchProp,
        createText,
        setText
    } = options

    const patchKeyedChildren = function(c1,c2,container){
        let i = 0
        const len2 = c2.length
        let end1 = c1.length - 1
        let end2 = len2 - 1

        // qutou
        while (i <= end1 && i <= end2) {
            const n1 = c1[i]
            const n2 = c2[i] = normalizeVNode(c2[i])
            if(isSameVNodeType(n1,n2)){
                patch(n1,n2,container)
                i++
            }else{
                break;
            }
        }
        //quwei
        while (i <= end1 && i <= end2) {
            const n1 = c1[end1]
            const n2 = c2[end2] = normalizeVNode(c2[end2])
            if(isSameVNodeType(n1,n2)){
                patch(n1,n2,container)
                end1--
                end2--
            }else{
                break;
            }
        }

        // i > end1 && i <= end2  mount
        if(i > end1 && i <= end2){
            const nextPos = end2 + 1
            const anchor = nextPos < len2 ? c2[nextPos].el : null
            while (i <= end2) {
                const n2 = c2[i] = normalizeVNode(c2[i])
                patch(null,n2,container,anchor)
                i++
            }
        // i <= end1 && i > end2  unmount
        }else if(i <= end1 && i > end2){
            while (i <= end1) {
                unmount(c1[i])
                i++
            }
        // luanxiu
        }else{
            const star1 = i
            const star2 = i
            // Map{key, newIndex} 
            let keyToNewIndexMap = new Map()
            for(i = star2; i <= end2; i++){
                let n2 = c2[i] = normalizeVNode(c2[i])
                if(n2.key !== null){
                    keyToNewIndexMap.set(n2.key,i)
                }
            }
            let j
            let patched = 0
            const tobePatched = end2 - star2 + 1
            let moved = false
            let maxNewIndexSoFar = 0
            const newIndexToOldIndexMap = new Array(tobePatched)
            newIndexToOldIndexMap.fill(0)
            
            for(i = star1; i <= end1; i++){
                const prevChild = c1[i]
                if(patched >= tobePatched){
                    unmount(prevChild)
                    continue
                }
                let newIndex
                if(prevChild.key != null){
                    newIndex = keyToNewIndexMap.get(prevChild.key)
                }
                if(newIndex === undefined){
                    unmount(prevChild)
                }else{
                    newIndexToOldIndexMap[newIndex - star2] = i + 1
                    if(newIndex >= maxNewIndexSoFar){
                        maxNewIndexSoFar = newIndex
                    }else{
                        moved = true
                    }
                    patch(prevChild,c2[newIndex],container)
                    patched++
                }
            }

            const increasingNewIndexSequence = moved ? getSequence(newIndexToOldIndexMap) : []
            j = increasingNewIndexSequence.length - 1
            for(i = tobePatched - 1; i >= 0; i--){
                const nextIndex = star2 + i
                const nextChild = c2[nextIndex]
                const anchor = nextIndex + 1 < len2 ? c2[nextIndex + 1].el : null
                if(newIndexToOldIndexMap[i] === 0){
                    patch(null,nextChild,container,anchor)
                }else if(moved){
                    if(j < 0 || i != increasingNewIndexSequence[j]){
                        insert(nextChild.el!, container, anchor)
                    }else{
                        j--
                    }
                }
            }
        }
    }

    const unmountChildren = function(children){
        for (let index = 0; index < children.length; index++) {
            unmount(children[index])
            
        }
    }

    const mountChildren = function(children,container){
        for (let index = 0; index < children.length; index++) {
            const child = children[index] = normalizeVNode(children[index])
            patch(null,child,container)
        }
    }

    const patchChildren = function(n1, n2, container){
        const c1 = n1.children
        const c2 = n2.children
        const pervShapeFlags= n1.shapeFlags
        const shapeFlags = n2.shapeFlags
        if(shapeFlags & ShapeFlags.TEXT_CHILDREN){
            if(pervShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                // 删除所有子节点
                unmountChildren(c1)
            }
            if(c1 !== c2){
                setElementText(container,c2)
            }
        }else { // 现在为数组或空
            if(pervShapeFlags & ShapeFlags.ARRAY_CHILDREN){
                if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){
                    // diff 算法
                    patchKeyedChildren(c1,c2,container)
                }else{
                    unmountChildren(c1)
                }
            }else{
                if(pervShapeFlags & ShapeFlags.TEXT_CHILDREN){
                    setElementText(container,'')
                }
                if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){
                    mountChildren(c2, container)
                }
            }
        }
    }

    const unmount = function(vnode){
        remove(vnode.el)
    }

    // 更新属性，更新子元素
    const patchElement = function(n1, n2){
        const el = n2.el = n1.el
        const oldProps = n1.props
        const newProps = n2.props
        for (const key in newProps) {
            if(newProps[key] !== oldProps[key]){
                patchProp(el, key, oldProps[key], newProps[key])
            }
        }

        for (const key in oldProps) {
            if(!(key in newProps)){
                patchProp(el, key, oldProps[key], null)
            }
        }

        patchChildren(n1, n2, el)
    }

    const mountElement = function(vnode, container, anchor){
        const el = vnode.el = createElement(vnode.type)
        const { props, shapeFlags, children } = vnode
        
        if(shapeFlags & ShapeFlags.TEXT_CHILDREN){
            setElementText(el,children)
        }else if(shapeFlags & ShapeFlags.ARRAY_CHILDREN){
            mountChildren(children,el)
        }
        
        if(props){
            for (const key in props) {
                const nextVal = props[key]
                patchProp(el, key, null, nextVal)
            }
        }
        insert(el,container,anchor)
    }

    const processElement = function(n1, n2, container, anchor){
        if(!n1){
            mountElement(n2, container, anchor)
        }else{
            patchElement(n1, n2)
        }
    }

    const processText = function(n1, n2, container){
        if(!n1){
            insert((n2.el = createText(n2.children)),container)
        }else{
            const el = n2.el = n1.el
            if(n1.children !== n2.children){
                setText(el,n2.children)
            }
        }
    }
    const processFragment = function(n1, n2, container){
        if (n1 == null) {
            if(isArray(n2.children)){
                mountChildren(n2.children,container)
            }
        }else{
            patchChildren(n1,n2,container)
        }
    }

    const mountComponent = function(vnode, container, anchor) {
        // 创建组件实例
        let instance = vnode.component = createComponentInstance(vnode)
        // 给组件实例赋值
        setupComponent(instance)
        // 创建一个effect
        setupRenderEffect(instance, container, anchor)
    }
    const updateComponentPreRender = function(instance,next){
        instance.next = null
        instance.vnode = next
        updateProps(instance.props, next.props)
    }
    const setupRenderEffect = function(instance, container, anchor) {
        const { render } = instance
        const componentUpdateFn = () => {
            if(!instance.isMounted){ // 初始化

                let { bm,m } = instance
                if(bm){
                    invokeArrayFns(bm)
                }

                const subTree = render.call(instance.proxy)
                patch(null,subTree,container,anchor)
                
                if(m){
                    invokeArrayFns(m)
                }

                instance.subTree = subTree
                instance.isMounted = true
            }else { // 组件内部更新
                let { next,bu,u } = instance
                if(next){
                    updateComponentPreRender(instance,next)
                }
                if(bu){
                    invokeArrayFns(bu)
                }
                const subTree = render.call(instance.proxy)
                patch(instance.subTree,subTree,container,anchor)
                if(u){
                    invokeArrayFns(u)
                }
                instance.subTree = subTree
            }
        }

        // const effect_ = effect(componentUpdateFn,{lazy: true})
        // let update = instance.update = (effect_ && effect_.bind(effect_)) as IEffectFn
        // update()
        // const effect_ = effect(componentUpdateFn,{
        //     scheduler(fn) {
        //         queueJob(instance.update)
        //     },
        // })
        const effect_ = effect(componentUpdateFn)
        instance.update = (effect_ && effect_.bind(effect_)) as IEffectFn
    }

    const shouldUpdateComponent = function(n1,n2){
        const { props: prevProps, children: prevChildren } = n1
        const { props: nextProps, children: nextChildren } = n2
        if(prevProps === nextProps){
            return false
        }
        if(prevChildren || nextChildren){
            return false
        }
        return hasPropsChanged(prevProps,nextProps)
    }

    const updateComponent = function(n1,n2) {
        const instance = n2.component = n1.component
        
        // 需要更新旧强制调用update
        if(shouldUpdateComponent(n1,n2)){
            instance.next = n2
            instance.update()
        }

        // updateProps(instance,prevProps,nextProps)
    }

    const processComponent = function(n1, n2, container, anchor){
        if(n1 == null){
            mountComponent(n2, container,anchor)
        }else{
            updateComponent(n1,n2)
        }
    }

    const patch = function(n1, n2, container, anchor = null){
        if(n1 === n2) return
        if(n1 && !isSameVNodeType(n1,n2)){
            unmount(n1)
            n1 = null
        }
        const { type, shapeFlags } = n2
        switch (type) {
            case Text:
                processText(n1, n2, container)
                break;
            case Fragment:
                processFragment(n1, n2, container)
            default:
                if(shapeFlags & ShapeFlags.ELEMENT){
                    processElement(n1, n2, container, anchor)
                }else if(shapeFlags & ShapeFlags.STATEFUL_COMPONENT){
                    processComponent(n1, n2, container, anchor)
                }
                break;
        }
       
    }

    const render = function(vnode, container){
        if(vnode){ // 挂载
            patch(container._vnode, vnode, container)
        }else { // 卸载
            if(container._vnode){
                unmount(container._vnode)
            }
        }
        container._vnode = vnode
    }

    return { render,patchKeyedChildren }
}

// https://en.wikipedia.org/wiki/Longest_increasing_subsequence
function getSequence(arr: number[]): number[] {
    const p = arr.slice()
    const result = [0]
    let i, j, u, v, c
    const len = arr.length
    for (i = 0; i < len; i++) {
      const arrI = arr[i]
      // 在vue3中0是没意义的，0代表当前节点不存在于旧vnode中，应该挂载mount
      if (arrI !== 0) {
        j = result[result.length - 1]
        if (arr[j] < arrI) {
            // 记录当前值的上一个值的索引
          p[i] = j
          // 下一个大于当前值，正常添加
          result.push(i)
          continue
        }
        u = 0
        v = result.length - 1
        // 二分法查找，下一个小的替换之前存在result中大的
        while (u < v) {
          c = (u + v) >> 1
          if (arr[result[c]] < arrI) {
            u = c + 1
          } else {
            v = c
          }
        }
        if (arrI < arr[result[u]]) {
          if (u > 0) {
              // 记录当前值替换result中大的值的上一个值的索引
            p[i] = result[u - 1]
          }
          // 贪心 ， 总把更有潜力的（小的值替换已经存在result中大的值）
          result[u] = i
        }
      }
    }
    u = result.length
    v = result[u - 1]
    // 根据最后的一个数，因为这个数是最大的，所以可以从后往前推出整个最长递增子序列，根据P
    while (u-- > 0) {
      result[u] = v
      v = p[v]
    }
    return result
  }