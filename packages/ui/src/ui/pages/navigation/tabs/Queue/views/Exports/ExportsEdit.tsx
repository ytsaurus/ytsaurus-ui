import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {Button} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';

import {getExportsConfig} from '../../../../../../store/selectors/navigation/tabs/queue/exports';
import {updateExportsConfig} from '../../../../../../store/actions/navigation/tabs/queue/exports';

import {FormApi, YTDFDialog} from '../../../../../../components/Dialog';
import Icon from '../../../../../../components/Icon/Icon';

import {getExportFields, prepareInitialValues, prepareUpdateValues} from './helpers';

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

export type QueueExportConfig = Partial<{
    id: string;
    title: string;
    name: string;
    export_period: {value: number} | number;
    export_directory: string;
    output_table_name_pattern: string;
    use_upper_bound_for_table_names: boolean;
    export_ttl: {value: number} | number;
    [key: string]: ({value: number} | number) | string | boolean;
}>;

export type FormValues = {
    'exports': QueueExportConfig[];
};

function ExportsEditDialog(props: SettingsProps) {
    const {visible, onClose} = props;
    const configs = useSelector(getExportsConfig);
    const dispatch = useDispatch();
    const handleApply = async (form: FormApi<FormValues, Partial<FormValues>>) => {
        try {
            const {values} = form.getState();
            console.log(values['exports']);
            const preparedValues = prepareUpdateValues(values['exports']);
            dispatch(updateExportsConfig(preparedValues));
        } catch {}
    };

    const fields = getExportFields();
    const initialValues = prepareInitialValues(configs); 

    return (
        <YTDFDialog<FormValues>
            onAdd={handleApply}
            visible={visible}
            onClose={onClose}
            size="l"
            headerProps={{
                title: 'Edit config',
            }}
            initialValues={{
                'exports': initialValues,
            }}
            fields={[{
                id: 'root',
                type: 'yt-create-queue-export-tab',
                name: 'exports',
                isRemovable: () => true,
                getTitle: (values) => values.name,
                onCreateTab: () => {},
                renderControls: (_item, _onCreate, onRemove) => {
                    return (
                        <Button
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                onRemove?.();
                                e.stopPropagation();
                            }}
                        >
                            <Icon awesome={'trash-alt'} /> Delete column
                        </Button>
                    );
                },
                multiple: true,
                fields: fields,
            }]}
        />
    );
}
