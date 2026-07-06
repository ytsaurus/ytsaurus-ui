import React from 'react';
import {type DialogField} from '../../../../../containers/Dialog';
import {Alert} from '@gravity-ui/uikit';
import i18n from './i18n';

export function getAlterOutputToDynamicFields<
    FormValues extends {alterOutputToDynamic: boolean},
>(): Array<DialogField<FormValues>> {
    return [
        {
            name: 'alterOutputToDynamic',
            type: 'tumbler',
            caption: i18n('field_prepare-to-dynamic-mode'),
        },
        {
            name: 'alterOutputToDynamicNotice',
            type: 'block',
            visibilityCondition: {
                when: 'alterOutputToDynamic',
                isActive: (v) => v === true,
            },
            extras: {
                children: (
                    <Alert
                        theme="info"
                        message={<div>{i18n('alert_prepare-to-dynamic-mode-info')}</div>}
                    />
                ),
            },
        },
    ];
}
