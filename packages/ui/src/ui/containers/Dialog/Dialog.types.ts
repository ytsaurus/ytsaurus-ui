export type DialogControlProps<T, Extras = {}> = Extras & {
    value: T;
    onChange: (v: T) => void;
    required?: boolean;
    validator?: (v: T) => string | undefined;
    placeholder?: string;
};
