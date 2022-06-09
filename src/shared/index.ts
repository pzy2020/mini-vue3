export const isObject = (val) => {
    return val !== null && typeof val === 'object'
}

export const isString = (val) => typeof val === 'string'

export const isArray = (val) => Array.isArray(val)