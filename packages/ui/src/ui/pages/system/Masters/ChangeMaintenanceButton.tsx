import React, {type FC, useState} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import {type FormApi, YTDFDialog, makeErrorFields} from '../../../containers/Dialog';
import {useToggle} from 'react-use';
import i18n from './i18n';

type Props = {
    className?: string;
    path: string | null;
    title?: string;
    host?: string;
    container?: string;
    maintenance: boolean;
    maintenanceMessage: string;
    onMaintenanceChange: (data: {
        path: string;
        message: string;
        maintenance: boolean;
    }) => Promise<void>;
};

type FormData = {host: string; container: string; maintenance: string; message: string};

export const ChangeMaintenanceButton: FC<Props> = ({
    className,
    path,
    title,
    host,
    container,
    maintenance,
    maintenanceMessage,
    onMaintenanceChange,
}) => {
    const [error, setError] = useState<Error | undefined>(undefined);
    const [visible, toggleVisible] = useToggle(false);

    if (!path) return;

    const handleMaintenanceChange = async (form: FormApi<FormData>) => {
        const {values} = form.getState();
        try {
            await onMaintenanceChange({
                path,
                message: values.message,
                maintenance: values.maintenance === 'enabled',
            });
        } catch (e) {
            setError(e as Error);
            throw e as Error;
        }
    };

    const handleOnClose = () => {
        toggleVisible();
        setError(undefined);
    };

    return (
        <>
            <YTDFDialog<FormData>
                pristineSubmittable
                headerProps={{
                    title,
                }}
                initialValues={{
                    host,
                    container,
                    maintenance: maintenance ? 'enabled' : 'disabled',
                    message: maintenanceMessage,
                }}
                fields={[
                    {
                        name: 'host',
                        type: 'plain',
                        caption: i18n('field_host'),
                    },
                    {
                        name: 'container',
                        type: 'plain',
                        caption: i18n('field_container'),
                    },
                    {
                        name: 'maintenance',
                        type: 'radio',
                        caption: i18n('field_maintenance'),
                        extras: {
                            options: [
                                {value: 'enabled', label: i18n('value_enabled')},
                                {value: 'disabled', label: i18n('value_disabled')},
                            ],
                        },
                    },
                    {
                        name: 'message',
                        type: 'textarea',
                        caption: i18n('field_maintenance-message'),
                        extras: (values: FormData) => ({
                            placeholder: i18n('context_enter-maintenance-message'),
                            disabled: values.maintenance === 'disabled',
                        }),
                    },
                    ...makeErrorFields([error]),
                ]}
                visible={visible}
                onAdd={handleMaintenanceChange}
                onClose={handleOnClose}
            />
            <Button view="flat-secondary" className={className} onClick={toggleVisible}>
                <Icon data={PencilIcon} size={14} />
            </Button>
        </>
    );
};
