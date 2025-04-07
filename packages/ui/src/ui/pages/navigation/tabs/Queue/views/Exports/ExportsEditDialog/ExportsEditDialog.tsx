import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import {Text} from '@gravity-ui/uikit';

import {useFetchBatchQuery} from '../../../../../../../store/api/yt';
import {
    makeGetExportsParams,
    useExportMutation,
} from '../../../../../../../store/api/navigation/tabs/queue/queue';
import {getPath} from '../../../../../../../store/selectors/navigation';

import {FormApi, YTDFDialog, makeErrorFields} from '../../../../../../../components/Dialog';

import {QueueExport, QueueExportConfig} from '../../../../../../../types/navigation/queue/queue';
import {YTError} from '../../../../../../../types';

import {ExportConfigUtility} from '../Exports';

import {
    outputTableNamePatternTooltip,
    prepareInitialValues,
    prepareUpdateValues,
    useUpperBoundForTableNamesTooltip,
    validate,
    validateExportDirectory,
    validateExportPeriod,
} from './utils';

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
        caption: 'Export name',
        required: true,
    },
    {
        type: 'path' as const,
        name: 'export_directory',
        caption: 'Export directory',
        required: true,
        validator: validateExportDirectory,
    },
    {
        type: 'time-duration' as const,
        name: 'export_period',
        caption: 'Export period',
        required: true,
        tooltip: 'Export period mask will be converted to milliseconds',
        validate: validateExportPeriod,
    },
    {
        type: 'time-duration' as const,
        name: 'export_ttl',
        caption: 'TTL',
        tooltip: 'TTL mask will be converted to milliseconds',
    },
    {
        type: 'text' as const,
        name: 'output_table_name_pattern',
        caption: 'Output table name pattern',
        tooltip: <Text whiteSpace={'break-spaces'}>{outputTableNamePatternTooltip}</Text>,
        extras: {
            placeholder: '%UNIX_TS-%PERIOD',
        },
    },
    {
        type: 'tumbler' as const,
        name: 'use_upper_bound_for_table_names',
        caption: 'Use upper bound for table names',
        tooltip: <Text whiteSpace={'break-spaces'}>{useUpperBoundForTableNamesTooltip}</Text>,
    },
];

export function ExportsEditDialog(props: DialogProps) {
    const {type, prevConfig, visible, onClose} = props;
    const path = useSelector(getPath);

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
        });

        return error ? Promise.reject(error) : Promise.resolve();
    };

    return (
        <YTDFDialog<ExportsFormValues>
            onAdd={onAdd}
            visible={visible}
            onClose={onClose}
            size="l"
            headerProps={{title: type === 'create' ? 'Create export' : 'Edit export'}}
            initialValues={initialValues}
            fields={[...fields, ...makeErrorFields([error as YTError])]}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            validate={(values) => validate(values, type, configs)}
        />
    );
}
