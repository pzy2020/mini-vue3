import { currentInstance, setCurrentInstance } from "./component"

export const enum LifecycleHooks {
    BEFORE_MOUNT = 'bm',
    MOUNTED = 'm',
    BEFORE_UPDATE = 'bu',
    UPDATED = 'u'
}

function createHook(type){
    return (hook, target = currentInstance) => { // hook需要绑定到对应的组件实例上
        if(target){
            const hooks:any[] = target[type] || ((target[type] as any[]) = [])
            const wrappedHook = () => {
                // 利用了闭包，保证在生命周期的方法里能访问到正确的实例
                setCurrentInstance(target)
                hook()
                setCurrentInstance(null)
            }
            hooks.push(wrappedHook)
        }
    }
}

// 工厂模式
export const onBeforeMount = createHook(LifecycleHooks.BEFORE_MOUNT)
export const onMounted = createHook(LifecycleHooks.MOUNTED)
export const onBeforeUpdate = createHook(LifecycleHooks.BEFORE_UPDATE)
export const onUpdated= createHook(LifecycleHooks.UPDATED)