import {FormValues} from './ExportsEdit';

/*
 * delete empty fields
 * */
export function prepareValues(configs: {[key: string]: FormValues}) {
    const newConfigs = {};
    for (const config in configs) {
        const newConfig = {};
        for (const attribute in configs[config]) {
            if (configs[config][attribute]) {
                if (attribute === 'export_period') {
                    newConfig[attribute] = configs[config][attribute].value;
                    continue;
                }
                newConfig[attribute] = configs[config][attribute];
            }
        }
        newConfigs[config] = newConfig;
    }
    return newConfigs;
}

export function prepareConfigs(configs: {[key: string]: FormValues}) {
    const newConfigs = {};
    for (const config in configs) {
        newConfigs[config] = {
            ...configs[config],
            export_period: {value: configs[config]['export_period']},
        };
    }
    return newConfigs;
}

export function prepareFields(configs: {[key: string]: FormValues}) {
    const res = [];
    for (const config in configs) {
        res.push({
            type: 'tab-vertical' as const,
            name: config,
            title: config,
            fields: [
                {
                    type: 'text' as const,
                    name: 'export_directory',
                    caption: 'Export directory',
                },
                {
                    type: 'number' as const,
                    name: 'export_period',
                    caption: 'Duration',
                },
                {
                    type: 'text' as const,
                    name: 'pattern',
                    caption: 'Export table name pattern',
                },
                {
                    type: 'tumbler' as const,
                    name: 'use-upper-bound',
                    caption: 'Use upper bound for table names',
                },
            ],
        });
    }
    return res;
}
