import React, {FC, useCallback, useState} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import {changeMasterMaintenance} from '../../../store/actions/system/masters';
import {changeSchedulerMaintenance} from '../../../store/actions/system/schedulers';
import {useDispatch} from 'react-redux';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import {FormApi, YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import hammer from '../../../common/hammer';
import {useToggle} from 'react-use';

type Props = {
    className?: string;
    address: string;
    maintenance: boolean;
    maintenanceMessage: string;
    type: 'master' | 'scheduler' | 'agent';
};

type FormData = {maintenance: string; message: string};

export const ChangeMaintenanceButton: FC<Props> = ({
    className,
    maintenance,
    maintenanceMessage,
    type,
    address,
}) => {
    const [error, setError] = useState<Error | undefined>(undefined);
    const [visible, toggleVisible] = useToggle(false);
    const dispatch = useDispatch();

    const handleMaintenanceChange = useCallback(
        async (form: FormApi<FormData>) => {
            const {values} = form.getState();
            const action = type === 'master' ? changeMasterMaintenance : changeSchedulerMaintenance;
            try {
                await dispatch(
                    action({
                        address,
                        message: values.message,
                        maintenance: values.maintenance === 'enabled',
                        type,
                    }),
                );
                setError(undefined);
            } catch (e) {
                setError(e as Error);
                throw e as Error;
            }
        },
        [address, dispatch, type],
    );

    const handleOnClose = () => {
        toggleVisible();
        setError(undefined);
    };

    return (
        <>
            <YTDFDialog<FormData>
                pristineSubmittable
                headerProps={{
                    title: `Edit ${hammer.format['Address'](address)}`,
                }}
                initialValues={{
                    maintenance: maintenance ? 'enabled' : 'disabled',
                    message: maintenanceMessage,
                }}
                fields={[
                    {
                        name: 'maintenance',
                        type: 'radio',
                        caption: 'Maintenance',
                        extras: {
                            options: [
                                {value: 'enabled', label: 'Enabled'},
                                {value: 'disabled', label: 'Disabled'},
                            ],
                        },
                    },
                    {
                        name: 'message',
                        type: 'textarea',
                        caption: 'Maintenance message',
                        extras: (values: FormData) => ({
                            placeholder: 'Enter maintenance message',
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
