import ypath from '../../../../../../../../common/thor/ypath';
import {ytApiV3} from '../../../../../../../../rum/rum-wrap-api';

import {type BatchApiResults} from '../../../../../../../../store/api/yt/executeBatch';

import {type QueueExport} from '../../../../../../../../types/navigation/queue/queue';

import {type ExportsFormValues} from '../ExportsEditDialog';
import i18n from '../i18n';

export function validateExportPeriod(period?: {value?: number; error?: string}) {
    return !period?.value || period?.value % 1000 !== 0
        ? i18n('alert_export-period-multiple')
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
            return i18n('alert_target-path-not-exist');
        }

        if (ypath.getValue(res[0].output, '/type') !== 'map_node') {
            return i18n('alert_target-path-not-directory');
        }

        return undefined;
    } catch (err) {
        const e = err as Error;
        return e?.message || i18n('alert_unexpected-error-type', {type: typeof e});
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
            export_name: i18n('alert_export-name-duplicate'),
        };
    }

    if (paths.has(values.export_directory) && type === 'create') {
        return {
            export_directory: i18n('alert_export-directory-duplicate'),
        };
    }

    return undefined;
}
