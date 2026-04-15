type Falsy = false | '' | 0 | null | undefined;

export const isTruthy = <T>(value: T | Falsy): value is T => {
    return Boolean(value);
};
