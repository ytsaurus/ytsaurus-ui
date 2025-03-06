import set_ from 'lodash/set';
import forEach_ from 'lodash/forEach';
import isEmpty_ from 'lodash/isEmpty';

import {ExportConfig} from '../../ExportsEdit';
import {FormValues} from '../ExportsEditDialog';
import {ytApiV3} from '../../../../../../../../../rum/rum-wrap-api';

export function validate(values: FormValues) {
    const configs = values['exports'];
    const errors = {};

    validateTabsNoDuplicates(configs, 'name', errors);
    validateTabsNoDuplicates(configs, 'export_directory', errors);

    return isEmpty_(errors) ? undefined : errors;
}

function validateTabsNoDuplicates(
    configs: FormValues['exports'],
    fieldName: keyof ExportConfig,
    errors: any,
) {
    const counters: Record<string, Array<number>> = {};
    forEach_(configs, (config: ExportConfig, index: number) => {
        const field = String(config[fieldName]);
        const indexes = counters[field];
        if (!indexes) {
            counters[field] = [index];
        } else {
            indexes.push(index);
        }
    });

    forEach_(counters, (indices) => {
        if (indices.length > 1) {
            indices.forEach((index) => {
                set_(
                    errors,
                    `exports[${index}].${fieldName}`,
                    'The export with this export directory already exists',
                );
            });
        }
    });
}

export function validateExportPeriod(value?: number) {
    return !value || value % 1000 ? 'Export period should be a multiple of 1000' : undefined;
}

export async function validateExportDirectory(path: string) {
    try {
        const res = await ytApiV3.exists({path});
        if (!res) {
            return 'Target path should exist';
        }
        return undefined;
    } catch (err) {
        const e = err as Error;
        return e?.message || 'Unexpected type of error: ' + typeof e;
    }
}
