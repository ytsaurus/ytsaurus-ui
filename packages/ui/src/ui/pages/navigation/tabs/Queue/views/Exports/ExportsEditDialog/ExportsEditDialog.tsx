import React, {useEffect, useState} from 'react';
import {useSelector} from '../../../../../../../store/redux-hooks';
import {Text} from '@gravity-ui/uikit';

import {useFetchBatchQuery} from '../../../../../../../store/api/yt';
import {useExportMutation} from '../../../../../../../store/api/navigation/tabs/queue/queue';
import {makeGetExportsParams} from '../../../../../../../store/api/navigation/tabs/queue/exports';
import {selectPath} from '../../../../../../../store/selectors/navigation';

import {type FormApi, YTDFDialog, makeErrorFields} from '../../../../../../../containers/Dialog';

import {
    type QueueExport,
    type QueueExportConfig,
} from '../../../../../../../types/navigation/queue/queue';
import {type YTError} from '../../../../../../../types';

import {type ExportConfigUtility} from '../Exports';

import {
    prepareInitialValues,
    prepareUpdateValues,
    validate,
    validateExportDirectory,
    validateExportPeriod,
} from './utils';

import i18n from './i18n';

interface DialogProps {
    type: 'edit' | 'create';
    visible: boolean;
    prevConfig?: QueueExportConfig<number> & {export_name: string};
    onClose: () => void;
}

export type ExportsFormValues = ExportConfigUtility & QueueExportConfig<{value: number}>;

const fields = [
    {
        type: 'text' as const,
        name: 'export_name',
        get caption() {
            return i18n('field_export-name');
        },
        required: true,
    },
    {
        type: 'path' as const,
        name: 'export_directory',
        get caption() {
            return i18n('field_export-directory');
        },
        required: true,
        validator: validateExportDirectory,
    },
    {
        type: 'time-duration' as const,
        name: 'export_period',
        get caption() {
            return i18n('field_export-period');
        },
        required: true,
        get tooltip() {
            return i18n('context_export-period-mask');
        },
        validator: validateExportPeriod,
    },
    {
        type: 'time-duration' as const,
        name: 'export_ttl',
        caption: 'TTL',
        get tooltip() {
            return i18n('context_ttl-mask');
        },
    },
    {
        type: 'text' as const,
        name: 'output_table_name_pattern',
        get caption() {
            return i18n('field_output-table-name-pattern');
        },
        get tooltip() {
            return (
                <Text whiteSpace={'break-spaces'}>{i18n('context_output-table-name-pattern')}</Text>
            );
        },
        extras: {
            placeholder: '%UNIX_TS-%PERIOD',
        },
    },
    {
        type: 'tumbler' as const,
        name: 'use_upper_bound_for_table_names',
        get caption() {
            return i18n('field_use-upper-bound-for-table-names');
        },
        get tooltip() {
            return (
                <Text whiteSpace={'break-spaces'}>
                    {i18n('context_use-upper-bound-for-table-names')}
                </Text>
            );
        },
    },
];

export function ExportsEditDialog(props: DialogProps) {
    const {type, prevConfig, visible, onClose} = props;
    const path = useSelector(selectPath);

    const {data: configs} = useFetchBatchQuery<QueueExport<number>>(makeGetExportsParams(path));
    const [update, {isLoading, error}] = useExportMutation();

    const [initialValues, setInitialValues] = useState<ExportsFormValues>();

    useEffect(() => {
        const rawValues = configs ? configs[0].output : {};
        setInitialValues(prepareInitialValues(rawValues, prevConfig?.export_name));
    }, [prevConfig?.export_name, configs]);

    const onAdd = async (form: FormApi<ExportsFormValues, Partial<ExportsFormValues>>) => {
        const {values} = form.getState();
        const preparedValues = prepareUpdateValues(values);
        await update({
            prevConfig,
            newConfig: {...preparedValues, export_name: values.export_name},
            type: 'edit',
        }).unwrap();
    };

    return (
        <YTDFDialog<ExportsFormValues>
            onAdd={onAdd}
            visible={visible}
            onClose={onClose}
            size="l"
            headerProps={{
                title: type === 'create' ? i18n('title_create-export') : i18n('title_edit-export'),
            }}
            initialValues={initialValues}
            fields={[...fields, ...makeErrorFields([error as YTError])]}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            validate={(values) => validate(values, type, configs)}
        />
    );
}
