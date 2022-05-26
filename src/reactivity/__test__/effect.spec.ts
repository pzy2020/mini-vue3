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