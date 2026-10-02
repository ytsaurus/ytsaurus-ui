import {
    type OptionDescription,
    type OptionsGroup,
    descriptionToDialogField,
} from '../../../containers/Dialog/df-dialog-utils';

type ResourceOption = Extract<OptionDescription, {type: 'int64' | 'uint64' | 'byte_count'}>;

export function creationNumberField<FormValues = unknown>(
    option: ResourceOption,
    settings: Parameters<typeof descriptionToDialogField>[1],
) {
    const field = descriptionToDialogField<FormValues>(option, settings);
    if (field.type !== 'number') throw new Error(`Invalid numeric resource: ${option.name}`);
    return {name: field.name, type: field.type, extras: field.extras};
}

export type CreationOptions =
    | {legacy: false; resources: ReturnType<typeof parseCreationOptions>}
    | {legacy: true; resources?: never};

export function isCreationOptionsUnsupported(error: unknown): boolean {
    const response = (error as {response?: {status?: number; data?: unknown}})?.response;
    // Missing command routes on older Strawberry versions return 404.
    if (response?.status === 404 || response?.status === 501) return true;
    // Also support an older UI proxy that has not allowed this action yet.
    const message =
        typeof response?.data === 'string'
            ? response.data
            : (response?.data as {message?: string})?.message;
    return (
        response?.status === 400 &&
        Boolean(message?.includes("action - 'describe_creation_options', is not supported"))
    );
}

export function parseCreationOptions(groups: OptionsGroup[]) {
    const options = groups.flatMap((group) => group.options);
    function resource(name: string, types: ResourceOption['type'][]): ResourceOption {
        const option = options.find((item) => item.name === name);
        if (!option || !types.includes(option.type as ResourceOption['type'])) {
            throw new Error(`Invalid creation resource description: ${name}`);
        }
        return option as ResourceOption;
    }

    const instanceCount = resource('instance_count', ['int64', 'uint64']);
    const {default_value: defaultValue, min_value: minValue, max_value: maxValue} = instanceCount;
    if (
        defaultValue === undefined ||
        minValue === undefined ||
        maxValue === undefined ||
        !Number.isSafeInteger(defaultValue) ||
        defaultValue < 1 ||
        !Number.isSafeInteger(minValue) ||
        minValue < 1 ||
        !Number.isSafeInteger(maxValue) ||
        defaultValue < minValue ||
        defaultValue > maxValue
    ) {
        throw new Error('Invalid instance count defaults or bounds');
    }

    return {
        instanceCount,
        instanceCpu: resource('instance_cpu', ['int64', 'uint64']),
        instanceMemory: resource('instance_total_memory', ['byte_count']),
    };
}
