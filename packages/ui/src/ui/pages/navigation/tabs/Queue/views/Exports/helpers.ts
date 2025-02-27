import {FormValues, QueueExportConfig} from './ExportsEdit';

const NUMBER_TYPE_FIELDS = ['export_period', 'export_ttl']

/*
 * filter empty fields
 * */
export function prepareValues(configs: FormValues, {type}: {type: 'field' | 'request'}) {
    const preparedConfigs: {[key: string]: QueueExportConfig} = {};
    for (const config in configs) {
        const preparedConfig: QueueExportConfig = {};

        for (const attribute in configs[config]) {
            if (configs[config][attribute]) {
                if (NUMBER_TYPE_FIELDS.includes(attribute)) {
                    if (type === 'field') {
                        preparedConfig[attribute] = {value: (configs[config][attribute] as number)};
                    }
                    if (type === 'request') {
                        preparedConfig[attribute] = (configs[config][attribute] as {value: number}).value;
                    }
                    continue;
                }

                preparedConfig[attribute] = configs[config][attribute];
            }
        }

        preparedConfigs[config] = preparedConfig;
    }
    return preparedConfigs;
}

export function prepareFields(configs: FormValues) {
    const res = [];
    for (const config in configs) {
        res.push({
            type: 'tab-vertical' as const,
            name: config,
            title: config,
            fields: [
                {
                    type: 'path' as const,
                    name: 'export_directory',
                    required: true,
                    caption: 'Export directory',
                },
                {
                    type: 'number' as const,
                    name: 'export_period',
                    caption: 'Export period',
                    required: true,
                    extras: {
                        validator: (value: number | undefined) =>  {
                            return !value || value % 1000 ? 'Export period should be a multiple of 1000' : undefined;
                        }
                    }
                },
                {
                    type: 'text' as const,
                    name: 'output_table_name_pattern',
                    caption: 'Output table name pattern',
                },
                {
                    type: 'tumbler' as const,
                    name: 'use_upper_bound_for_table_names',
                    caption: 'Use upper bound for table names',
                },
                {
                    type: 'number' as const,
                    name: 'export_ttl',
                    caption: 'TTL',
                }
            ],
        });
    }
    return res;
}
