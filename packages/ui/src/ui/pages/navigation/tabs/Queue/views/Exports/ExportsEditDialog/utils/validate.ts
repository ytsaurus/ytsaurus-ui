import ypath from '../../../../../../../../common/thor/ypath';
import {ytApiV3} from '../../../../../../../../rum/rum-wrap-api';

import {BatchApiResults} from '../../../../../../../../store/api/yt/endpoints/executeBatch';

import {QueueExport} from '../../../../../../../../types/navigation/queue/queue';

import {FormValues} from '../ExportsEditDialog';

export function validateExportPeriod(value?: number) {
    return !value || value % 1000 ? 'Export period should be a multiple of 1000' : undefined;
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

export function validate(values: FormValues, configs?: BatchApiResults<QueueExport<number>>) {
    if (!configs) {
        return undefined;
    }

    const paths = new Set();
    const confs = configs[0].output;

    for (const config in confs) {
        if (confs[config]) {
            paths.add(confs[config].export_directory);
        }
    }

    if (Object.keys(configs).includes(values.export_name)) {
        return {
            export_name: 'Export with the same name already exists',
        };
    }

    if (paths.has(values.export_directory)) {
        return {
            export_directory: 'Export with the same export_directory already exists',
        };
    }

    return undefined;
}
