import React from 'react';
import {useSelector} from 'react-redux';

import format from '../../../common/hammer/format';

import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import type {NodeMaintenanceState} from '../../../store/reducers/components/node-maintenance-modal';
import {getNodeMaintenanceModalData} from '../../../store/selectors/components/node-maintenance-modal';
import {
    applyMaintenance,
    closeNodeMaintenanceModal,
} from '../../../store/actions/components/node-maintenance-modal';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';

type FieldValues = Pick<NodeMaintenanceState, 'address' | 'comment' | 'type' | 'otherComments'>;

export function NodeMaintenanceModal() {
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState<YTError | undefined>();

    const data = useSelector(getNodeMaintenanceModalData);
    const {address, command, component} = data;

    const isRemove = command === 'remove_maintenance';

    return address ? (
        <YTDFDialog<FieldValues>
            visible
            pristineSubmittable
            headerProps={{title: format.ReadableField(command)}}
            initialValues={data}
            onClose={() => dispatch(closeNodeMaintenanceModal())}
            onAdd={async (form) => {
                const {values} = form.getState();
                try {
                    await dispatch(
                        applyMaintenance(command, {
                            ...values,
                            component,
                        }),
                    );
                } catch (e: any) {
                    setError(e);
                    throw e;
                }
            }}
            fields={[
                {
                    name: 'type',
                    type: 'text',
                    caption: 'Type',
                    extras: {
                        disabled: true,
                    },
                },
                {
                    name: 'address',
                    type: 'text',
                    caption: 'Address',
                    required: true,
                    extras: {
                        disabled: true,
                    },
                },
                {
                    name: 'comment',
                    type: 'textarea',
                    caption: isRemove ? 'Comment' : 'Mine comment',
                    extras: {
                        disabled: isRemove,
                    },
                },
                {
                    name: 'otherComments',
                    type: 'textarea',
                    caption: 'Other users comments',
                    visibilityCondition: {
                        when: 'otherComments',
                        isActive(v: string) {
                            return v?.length > 0;
                        },
                    },
                    extras: {
                        disabled: true,
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    ) : null;
}
