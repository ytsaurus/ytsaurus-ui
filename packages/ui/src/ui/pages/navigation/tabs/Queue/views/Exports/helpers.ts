import {FormValues, QueueExportConfig} from './ExportsEdit';

const NUMBER_ATTRIBUTES = new Set(['export_period', 'export_ttl']);
const UTILITY_ATTRIBUTES = new Set(['name', 'id', 'title']);
/*
 * filter empty fields
 * */
export function prepareInitialValues(configs: FormValues['exports'] | undefined) {
    if (!configs) {
        return [{
            name: 'default',
            id: 'default',
            title: 'default',
            export_period: 30000,
            export_directory: '//home/'
        }];
    }
    const preparedConfigs: QueueExportConfig[] = [];
    for (const config in configs) {
        const preparedConfig: QueueExportConfig = {};

        for (const attribute in configs[config]) {
            if (configs[config][attribute]) {
                if (NUMBER_ATTRIBUTES.has(attribute)) {
                    preparedConfig[attribute] = {value: (configs[config][attribute] as number)};
                    continue;
                }
                preparedConfig[attribute] = configs[config][attribute];
            }
        }
        preparedConfig['name'] = config;
        preparedConfig['id'] = preparedConfig['name'];
        preparedConfig['title'] = preparedConfig['name'];
        preparedConfigs.push(preparedConfig);
    }
    return preparedConfigs;
}

export function prepareUpdateValues(configs: FormValues['exports']) {
    const preparedConfigs: {[key: string]: QueueExportConfig} = {};
    for (const config of configs) {

        const preparedConfig: QueueExportConfig = {};

        for (const attribute in config) {
            if (config[attribute]) {
                if (NUMBER_ATTRIBUTES.has(attribute)) {
                    preparedConfig[attribute] = (config[attribute] as {value: number}).value;
                    continue;
                }
                if (UTILITY_ATTRIBUTES.has(attribute)) {
                    continue;
                }

                preparedConfig[attribute] = config[attribute];
            }
        }

        preparedConfigs[config['name']!] = preparedConfig;
    }
    return preparedConfigs;
}

export function getExportFields () {
    return [
        {
            name: 'name',
            type: 'text' as const,
            caption: 'Export name',
        },
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
                validator: (value: number) =>  {
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
    ]
}
