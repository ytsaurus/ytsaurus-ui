import isEmpty_ from 'lodash/isEmpty';
import omitBy_ from 'lodash/omitBy';

import {QueueExportConfig} from '../../../../../../../../../types/navigation/queue/queue';
import {ExportConfig} from '../../ExportsEdit';
import {FormValues} from '../ExportsEditDialog';

export function prepareInitialValues(
    configs: {[key: string]: QueueExportConfig<number>} | undefined,
): {exports: ExportConfig[]} {
    if (isEmpty_(configs)) {
        const name = 'new_export';
        return {
            exports: [
                {
                    id: name,
                    export_period: {value: 30000},
                    export_directory: '//home/',
                    name,
                },
            ],
        };
    }

    const preparedConfigs: ExportConfig[] = [];
    for (const config in configs) {
        if (configs[config]) {
            const {export_period, export_ttl, ...restConfig} = configs[config];
            const preparedConfig: ExportConfig = {
                id: config,
                name: config,
                export_period: {value: export_period},
                export_ttl: export_ttl ? {value: export_ttl} : undefined,
                ...restConfig,
            };

            preparedConfigs.push(preparedConfig);
        }
    }
    return {exports: preparedConfigs};
}

export function prepareUpdateValues(configs: FormValues['exports']): {
    [key: string]: QueueExportConfig<number>;
} {
    const preparedConfigs: {[key: string]: QueueExportConfig<number>} = {};
    for (const config of configs) {
        const {id: _id, name, export_period, export_ttl, export_directory, ...restConfig} = config;

        const preparedConfig: QueueExportConfig<number> = {
            export_directory: export_directory,
            export_period: export_period.value,
            export_ttl: export_ttl?.value,
            ...omitBy_(restConfig, (value) => value === ''),
        };

        preparedConfigs[name] = preparedConfig;
    }
    return preparedConfigs;
}

export function prepareNewExport(id: number) {
    const name = `new_export_${id}`;
    return {
        name: name,
        id: name,
        export_period: {value: 30000},
        export_directory: '//home/',
    };
}
