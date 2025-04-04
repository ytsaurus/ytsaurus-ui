import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';

import {useFetchBatchQuery} from '../../../../../../../store/api/yt';
import {
    makeGetExportsParams,
    useExportMutation,
} from '../../../../../../../store/api/navigation/tabs/queue/queue';
import {getPath} from '../../../../../../../store/selectors/navigation';

import {FormApi, YTDFDialog} from '../../../../../../../components/Dialog';

import {QueueExport, QueueExportConfig} from '../../../../../../../types/navigation/queue/queue';

import {ExportConfig} from '../ExportsEdit/ExportsEdit';

import {fields, prepareInitialValues, prepareUpdateValues, validate} from './utils';

interface DialogProps {
    title: string;
    visible: boolean;
    prevConfig?: QueueExportConfig<number> & {export_name: string};
    onClose: () => void;
}

export type FormValues = ExportConfig;

export function ExportsEditDialog(props: DialogProps) {
    const {title, prevConfig, visible, onClose} = props;
    const path = useSelector(getPath);

    const {data: configs} = useFetchBatchQuery<QueueExport<number>>(makeGetExportsParams(path));
    const [update, {isLoading}] = useExportMutation();

    const [initialValues, setInitialValues] = useState<FormValues>();

    useEffect(() => {
        const rawValues = configs ? configs[0].output : {};
        setInitialValues(prepareInitialValues(rawValues, prevConfig?.export_name));
    }, [prevConfig?.export_name, configs]);

    const onAdd = async (form: FormApi<FormValues, Partial<FormValues>>) => {
        const {values} = form.getState();
        const preparedValues = prepareUpdateValues(values);
        await update({
            prevConfig,
            newConfig: {...preparedValues, export_name: values.export_name},
            type: 'edit',
        });
    };

    return (
        <YTDFDialog<FormValues>
            onAdd={onAdd}
            visible={visible}
            onClose={onClose}
            size="l"
            headerProps={{title}}
            initialValues={initialValues}
            fields={fields}
            isApplyDisabled={(state) => {
                return state.hasValidationErrors || isLoading;
            }}
            validate={(values) => validate(values, configs)}
        />
    );
}
