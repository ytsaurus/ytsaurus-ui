import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import reduce_ from 'lodash/reduce';

import format from '../../../common/hammer/format';

import {AddMaintenanceParams} from '../../../../shared/yt-types';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import type {
    NodeMaintenanceState,
    NodeResourceLimits,
} from '../../../store/reducers/components/node-maintenance-modal';
import {
    getNodeMaintenanceModalInitialValues,
    getNodeMaintenanceModalState,
} from '../../../store/selectors/components/node-maintenance-modal';
import {
    applyMaintenance,
    // applyMaintenance,
    closeNodeMaintenanceModal,
} from '../../../store/actions/components/node-maintenance-modal';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';
import {Host} from '../../../containers/Host/Host';

import './NodeMaintenanceModal.scss';

const block = cn('node-maintenance-modal');

type FormValues = NodeMaintenanceState['maintenance'] & {
    limits: Partial<{[K in keyof NodeResourceLimits]: {value?: number}}>;
};

function makeLabels(type: AddMaintenanceParams['type']) {
    const labels: Record<typeof type, [string, string]> = {
        ban: ['Unban', 'Ban'],
        disable_scheduler_jobs: ['Enable scheduler jobs', 'Disable scheduler jobs'],
        disable_write_sessions: ['Enable write sessions', 'Disable write sessions'],

        disable_tablet_cells: ['Enable tablet cells', 'Disable tablet cells'],
        decommission: ['Recommission', 'Decommission'],
    };
    const [labelLeft, labelRight] = labels[type];
    return {labelLeft, labelRight};
}

export function NodeMaintenanceModal() {
    const dispatch = useThunkDispatch();
    const [error, setError] = React.useState<YTError | undefined>();

    const initialValues = useSelector(getNodeMaintenanceModalInitialValues);
    const {maintenance} = initialValues;
    const {address, component, resourceLimits} = useSelector(getNodeMaintenanceModalState);

    function makeMaintenanceFields({
        type,
        allowOthers,
    }: {
        type: AddMaintenanceParams['type'];
        allowOthers: boolean;
    }) {
        return [
            {
                name: 'state',
                type: 'tumbler' as const,
                caption: 'State',
                extras: makeLabels(type),
            },
            {
                name: 'comment',
                type: 'textarea' as const,
                caption: allowOthers ? 'Mine comment' : 'Comment',
                tooltip: 'Changes of the field affects only activated maintenances',
                extras: (values: FormValues) => {
                    return values[type]?.state ? {} : {disabled: true};
                },
            },
            ...(allowOthers
                ? [
                      {
                          name: 'otherComments',
                          type: 'textarea' as const,
                          caption: 'Other users comments',
                          tooltip: 'Do not edit the field, any changes of it affect nothing',
                          extras: {
                              disabled: true,
                          },
                      },
                  ]
                : []),
        ];
    }

    function makeResourceLimitField(
        name: keyof NodeResourceLimits,
        options?: {
            caption?: string;
            format?: 'Number' | 'Bytes';
        },
    ) {
        return {
            type: 'number' as const,
            name,
            caption: options?.caption || format.ReadableField(name),
            extras: {
                format: options?.format ?? 'Number',
                showDefaultValue: true,
                defaultValue: resourceLimits?.[name],
                defaultValueClassName: block('limit-default'),
                bottomLineVisibility: 'focused' as const,
            },
        };
    }

    return address ? (
        <YTDFDialog<FormValues>
            visible
            headerProps={{
                title: (
                    <>
                        <Host asText prefix={<>Edit &nbsp;</>} address={address} />
                    </>
                ),
            }}
            initialValues={initialValues}
            onClose={() => dispatch(closeNodeMaintenanceModal())}
            onAdd={async (form) => {
                const {
                    values: {limits, ...rest},
                } = form.getState();

                const diff = reduce_(
                    rest,
                    (acc, item, t) => {
                        const type = t as keyof typeof rest;
                        if (Boolean(maintenance?.[type]?.state) !== Boolean(item?.state)) {
                            acc[type] = item;
                        }
                        return acc;
                    },
                    {} as Partial<FormValues>,
                );

                const limitsDiff = reduce_(
                    limits,
                    (acc, item, k) => {
                        const key = k as keyof typeof limits;
                        if (initialValues.limits[key] !== item?.value) {
                            acc[key] = item?.value;
                        }
                        return acc;
                    },
                    {} as Partial<NodeResourceLimits>,
                );

                try {
                    dispatch(applyMaintenance(address, component, diff, limitsDiff));
                } catch (e: any) {
                    setError(e);
                }
            }}
            fields={[
                {
                    name: 'ban',
                    type: 'tab',
                    title: 'Ban',
                    fields: [
                        ...makeMaintenanceFields({
                            type: 'ban',
                            allowOthers: true,
                        }),
                        ...makeErrorFields([error]),
                    ],
                },
                {
                    name: 'disable_scheduler_jobs',
                    type: 'tab',
                    title: 'Scheduler jobs',
                    fields: [
                        ...makeMaintenanceFields({
                            type: 'disable_scheduler_jobs',
                            allowOthers: true,
                        }),
                        ...makeErrorFields([error]),
                    ],
                },
                {
                    name: 'disable_write_sessions',
                    type: 'tab',
                    title: 'Write sessions',
                    fields: [
                        ...makeMaintenanceFields({
                            type: 'disable_write_sessions',
                            allowOthers: true,
                        }),
                        ...makeErrorFields([error]),
                    ],
                },
                {
                    name: 'disable_tablet_cells',
                    type: 'tab',
                    title: 'Tablet cells',
                    fields: [
                        ...makeMaintenanceFields({
                            type: 'disable_tablet_cells',
                            allowOthers: true,
                        }),
                        ...makeErrorFields([error]),
                    ],
                },
                {
                    name: 'decommission',
                    type: 'tab',
                    title: 'Decommission',
                    fields: [
                        ...makeMaintenanceFields({
                            type: 'decommission',
                            allowOthers: true,
                        }),
                        ...makeErrorFields([error]),
                    ],
                },
                {
                    name: 'limits',
                    type: 'tab',
                    title: 'Limits',
                    fields: [
                        makeResourceLimitField('cpu', {caption: 'vCPU'}),
                        makeResourceLimitField('gpu', {caption: 'GPU'}),
                        makeResourceLimitField('network'),
                        makeResourceLimitField('replication_slots'),
                        makeResourceLimitField('replication_data_size', {format: 'Bytes'}),
                        makeResourceLimitField('removal_slots'),
                        makeResourceLimitField('repair_slots'),
                        makeResourceLimitField('repair_data_size', {format: 'Bytes'}),
                        makeResourceLimitField('seal_slots'),
                        makeResourceLimitField('system_memory', {format: 'Bytes'}),
                        makeResourceLimitField('user_memory', {format: 'Bytes'}),
                        ...makeErrorFields([error]),
                    ],
                },
            ]}
        />
    ) : null;
}
