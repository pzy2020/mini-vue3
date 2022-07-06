export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}

export const isString = (val) => typeof val === 'string'

export const isArray = (val) => Array.isArray(val)

const hasOwnProperty = Object.prototype.hasOwnProperty
export const hasOwn = (value,key) => hasOwnProperty.call(value,key)