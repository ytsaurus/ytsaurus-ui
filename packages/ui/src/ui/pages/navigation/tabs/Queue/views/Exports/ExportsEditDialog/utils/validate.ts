import ypath from '../../../../../../../../common/thor/ypath';
import {ytApiV3} from '../../../../../../../../rum/rum-wrap-api';

import {BatchApiResults} from '../../../../../../../../store/api/yt/endpoints/executeBatch';

import {QueueExport} from '../../../../../../../../types/navigation/queue/queue';

import {ExportsFormValues} from '../ExportsEditDialog';

export function validateExportPeriod(period?: {value?: number; error?: string}) {
    return !period?.value || period?.value % 1000 !== 0
        ? 'Export period should be a multiple of 1000ms'
        : undefined;
}

export async function validateExportDirectory(path: string) {
    try {
        const res = await ytApiV3.executeBatch({
            parameters: {
                requests: [
                    {
                        command: 'get' as const,
                        parameters: {
                            path: `${path}/@`,
                        },
                    },
                ],
            },
        });

        if (res[0].error) {
            return 'Target path should exist';
        }

        if (ypath.getValue(res[0].output, '/type') !== 'map_node') {
            return 'Target path should be a directory';
        }

        return undefined;
    } catch (err) {
        const e = err as Error;
        return e?.message || 'Unexpected type of error: ' + typeof e;
    }
}

export function validate(
    values: ExportsFormValues,
    type: 'create' | 'edit',
    configs?: BatchApiResults<QueueExport<number>>,
) {
    if (!configs) {
        return undefined;
    }

    const paths = new Set();
    const configsValues = configs[0].output;

    for (const config in configsValues) {
        if (configsValues[config]) {
            paths.add(configsValues[config].export_directory);
        }
    }

    if (
        configsValues &&
        Object.keys(configsValues).includes(values.export_name) &&
        type === 'create'
    ) {
        return {
            export_name: 'Export with the same name already exists',
        };
    }

    if (paths.has(values.export_directory) && type === 'create') {
        return {
            export_directory: 'Export with the same export_directory already exists',
        };
    }

    return undefined;
}
