import React from 'react';

import {Switch} from '@gravity-ui/uikit';

import StatusBulb from '../../../../../components/StatusBulb/StatusBulb';
import Dialog, {FormApi, makeErrorFields} from '../../../../../components/Dialog/Dialog';
import {YTError} from '../../../../../types';

export interface Props {
    value?: boolean;
    onEdit?: (currentValue?: Props['value']) => Promise<void>;
}

interface FormValues {
    value?: string;
}

function AutomaticModeSwitchEditor({value, onEdit, onClose}: Props & {onClose: () => void}) {
    const [error, setError] = React.useState<YTError | undefined>(undefined);

    const handleAdd = React.useCallback(
        async (form: FormApi<FormValues>) => {
            const {values} = form.getState();
            try {
                await onEdit?.(values.value === 'enabled');
            } catch (e: any) {
                setError(e);
                throw e;
            }
        },
        [setError],
    );

    return (
        <Dialog<FormValues>
            pristineSubmittable={true}
            headerProps={{
                title: 'Edit',
            }}
            onAdd={handleAdd}
            onClose={onClose}
            visible={true}
            initialValues={{
                value: value ? 'enabled' : 'disabled',
            }}
            fields={[
                {
                    name: 'value',
                    type: 'radio',
                    caption: 'Automatic mode switch',
                    extras: {
                        options: [
                            {value: 'enabled', label: 'Enabled'},
                            {value: 'disabled', label: 'Disabled'},
                        ],
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
}

function AutomaticModeSwitch({value, onEdit}: Props) {
    const [showEditor, setShowEditor] = React.useState(false);

    const handleShow = React.useCallback(() => {
        setShowEditor(true);
    }, []);

    const handleClose = React.useCallback(() => {
        setShowEditor(false);
    }, []);

    if (onEdit) {
        return (
            <React.Fragment>
                <Switch
                    checked={value}
                    onUpdate={handleShow}
                    title={value ? 'Enabled' : 'Disabled'}
                />
                {showEditor && (
                    <AutomaticModeSwitchEditor
                        value={!value}
                        onEdit={onEdit}
                        onClose={handleClose}
                    />
                )}
            </React.Fragment>
        );
    }

    return (
        <React.Fragment>
            <StatusBulb theme={value ? 'enabled' : 'unknown'} />{' '}
        </React.Fragment>
    );
}

export default React.memo(AutomaticModeSwitch);
