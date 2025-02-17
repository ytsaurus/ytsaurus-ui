import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';

import {getExportsConfig} from '../../../../../../store/selectors/navigation/tabs/queue/exports';
import {updateExportsConfig} from '../../../../../../store/actions/navigation/tabs/queue/exports';

import {FormApi, YTDFDialog} from '../../../../../../components/Dialog';
import Icon from '../../../../../../components/Icon/Icon';

import {prepareConfigs, prepareFields, prepareValues} from './helpers';

import './Exports.scss';

const block = b('exports-edit');

export function ExportsEdit() {
    const [visible, setVisible] = React.useState(false);

    const toggleVisibility = React.useCallback(() => {
        setVisible(!visible);
    }, [visible, setVisible]);

    return (
        <>
            <div className={block()}>
                <Button
                    className={block('button')}
                    title={'Edit speclet'}
                    view="outlined"
                    onClick={toggleVisibility}
                >
                    <Icon awesome="pencil" />
                    Edit config
                </Button>
            </div>
            <ExportsEditDialog visible={visible} onClose={toggleVisibility} />
        </>
    );
}

interface SettingsProps {
    visible: boolean;
    onClose: () => void;
}

export type FormValues = {
    export_period: number;
    export_directory: string;
    tableNamePattern: string;
    useUpperBoundForTableNames: boolean;
};

function ExportsEditDialog(props: SettingsProps) {
    const {visible, onClose} = props;
    const configs = useSelector(getExportsConfig);
    const dispatch = useDispatch();
    const handleApply = async (form: FormApi<FormValues, Partial<FormValues>>) => {
        try {
            const {values} = form.getState();
            const preparedValues = prepareValues(values);
            dispatch(updateExportsConfig(preparedValues));
        } catch {}
    };

    const preparedConfigs = prepareConfigs(configs);
    const fields = prepareFields(preparedConfigs);

    return (
        <YTDFDialog<FormValues>
            onAdd={handleApply}
            visible={visible}
            onClose={onClose}
            size="l"
            headerProps={{
                title: 'Edit config',
            }}
            title="Edit config"
            initialValues={preparedConfigs}
            fields={fields}
        />
    );
}
