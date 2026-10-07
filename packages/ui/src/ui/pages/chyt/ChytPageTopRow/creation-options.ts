import {
    type OptionDescription,
    type OptionsGroup,
} from '../../../containers/Dialog/df-dialog-utils';

type ResourceOption = Extract<OptionDescription, {type: 'int64' | 'uint64' | 'byte_count'}>;

export type CreationOptions = {
    resources?: ReturnType<typeof parseCreationOptions>;
};

export function parseCreationOptions(groups: OptionsGroup[]) {
    const options = groups.flatMap((group) => group.options);

    function resource(name: string, types: ResourceOption['type'][]): ResourceOption {
        const option = options.find((item) => item.name === name);
        if (!option || !types.includes(option.type as ResourceOption['type'])) {
            throw new Error(`Invalid creation resource description: ${name}`);
        }
        return option as ResourceOption;
    }

    return {
        instanceCount: resource('instance_count', ['int64', 'uint64']),
        instanceCpu: resource('instance_cpu', ['int64', 'uint64']),
        instanceMemory: resource('instance_total_memory', ['byte_count']),
    };
}
