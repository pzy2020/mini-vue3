import { effect } from "../effect";
import { reactive } from "../reactive";

test("effect的lazy选项", () => {
    let obj = reactive({age: 18})
    const mockFn = jest.fn(() => {})
    const effectFn = effect(mockFn,{lazy: true})
    expect(mockFn).toBeCalledTimes(0)
    effectFn()
    expect(mockFn).toBeCalledTimes(1)
})