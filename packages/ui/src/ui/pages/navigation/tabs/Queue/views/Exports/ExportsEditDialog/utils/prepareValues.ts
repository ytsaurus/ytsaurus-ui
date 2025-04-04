import isEmpty_ from 'lodash/isEmpty';

import {QueueExportConfig} from '../../../../../../../../types/navigation/queue/queue';
import {ExportConfig} from '../../ExportsEdit/ExportsEdit';
import {FormValues} from '../ExportsEditDialog';

export function prepareInitialValues(
    configs: {[key: string]: QueueExportConfig<number>} | undefined,
    config?: string,
): ExportConfig {
    if (isEmpty_(configs) || !config) {
        return {
            id: 'new_export',
            export_period: {value: 30000},
            export_directory: '//home/',
            export_name: 'new_export',
        };
    }

    const export_ttl = configs[config].export_ttl;
    const export_period = configs[config].export_period;

    const preparedConfig: ExportConfig = {
        ...configs[config],
        id: config,
        export_name: config,
        export_period: {value: export_period},
        export_ttl: export_ttl ? {value: export_ttl} : undefined,
    };

    return preparedConfig;
}

export function prepareUpdateValues(config: FormValues) {
    const {id: _id, export_name: _export_name, ...restConfig} = config;
    const preparedConfig: QueueExportConfig<number> = {
        ...restConfig,
        output_table_name_pattern: restConfig.output_table_name_pattern || undefined,
        use_upper_bound_for_table_names: restConfig.use_upper_bound_for_table_names || undefined,
        export_ttl: restConfig.export_ttl?.value,
        export_period: restConfig.export_period?.value,
    };
    return preparedConfig;
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
