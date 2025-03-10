import React, {useEffect, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {getExportsConfig} from '../../../../../../../../store/selectors/navigation/tabs/queue';
import {updateExportsConfig} from '../../../../../../../../store/actions/navigation/tabs/queue/exports';

import {FormApi, YTDFDialog} from '../../../../../../../../components/Dialog';

import {renderControls} from './TabControls';
import {ExportConfig} from '../ExportsEdit';
import {
    fields,
    prepareInitialValues,
    prepareNewExport,
    prepareUpdateValues,
    validate,
} from './utils';

interface DialogProps {
    visible: boolean;
    onClose: () => void;
}

export type FormValues = {
    exports: ExportConfig[];
};

export function ExportsEditDialog(props: DialogProps) {
    const {visible, onClose} = props;
    const configs = useSelector(getExportsConfig);
    const dispatch = useDispatch();

    const [initialValues, setInitialValues] = useState<FormValues>();
    const [nextId, setNextId] = useState(1);

    useEffect(() => {
        setInitialValues(prepareInitialValues(configs));
    }, [configs]);

    const onCreateTab = () => {
        const res = prepareNewExport(nextId);
        setNextId((id) => id + 1);
        return res;
    };

    const onAdd = async (form: FormApi<FormValues, Partial<FormValues>>) => {
        const {values} = form.getState();
        const preparedValues = prepareUpdateValues(values['exports']);
        dispatch(updateExportsConfig(preparedValues));
    };

    return (
        <YTDFDialog<FormValues>
            onAdd={onAdd}
            visible={visible}
            onClose={onClose}
            size="l"
            headerProps={{
                title: 'Edit config',
            }}
            initialValues={initialValues}
            validate={validate}
            fields={[
                {
                    type: 'yt-create-queue-export-tab',
                    name: 'exports',
                    isRemovable: () => false,
                    getTitle: (values) => values.name,
                    onCreateTab: onCreateTab,
                    renderControls: renderControls,
                    multiple: true,
                    fields: fields,
                },
            ]}
            virtualized
        />
    );
}
