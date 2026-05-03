function isObject(o: unknown): o is object {
    return Object.prototype.toString.call(o) === '[object Object]';
}

export const isPlainObject = (value: unknown): value is Record<PropertyKey, unknown> => {
    if (isObject(value) === false) return false;

    // If has modified constructor
    const ctor = value.constructor;
    if (ctor === undefined) return true;

    // If has modified prototype
    const prot = ctor.prototype;
    if (isObject(prot) === false) return false;

    // If constructor does not have an Object-specific method
    return Object.prototype.hasOwnProperty.call(prot, 'isPrototypeOf');
};
