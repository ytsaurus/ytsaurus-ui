type Falsy = false | '' | 0 | null | undefined;

export const isTruthy = <T>(value: T): value is Exclude<T, Falsy> => {
    return Boolean(value);
};
