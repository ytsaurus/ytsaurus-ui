import React from 'react';
import {useSelector} from 'react-redux';

import reduce_ from 'lodash/reduce';

import {AddMaintenanceParams} from '../../../../shared/yt-types';
import {YTDFDialog, makeErrorFields} from '../../../components/Dialog/Dialog';
import type {NodeMaintenanceState} from '../../../store/reducers/components/node-maintenance-modal';
import {getNodeMaintenanceModalData} from '../../../store/selectors/components/node-maintenance-modal';
import {
    applyMaintenance,
    // applyMaintenance,
    closeNodeMaintenanceModal,
} from '../../../store/actions/components/node-maintenance-modal';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {YTError} from '../../../../@types/types';
import {Host} from 'containers/Host/Host';

type FormValues = NodeMaintenanceState['maintenance'] & {limits: unknown};

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

    const state = useSelector(getNodeMaintenanceModalData);
    const {address, component, maintenance} = state;

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
            initialValues={maintenance}
            onClose={() => dispatch(closeNodeMaintenanceModal())}
            onAdd={async (form) => {
                const {
                    values: {limits: _x, ...rest},
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

                try {
                    dispatch(applyMaintenance(address, component, diff));
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
                    name: 'Limits',
                    type: 'tab',
                    title: 'Limits',
                    fields: [
                        {type: 'plain', name: 'x', caption: 'Not implemented'},
                        ...makeErrorFields([error]),
                    ],
                },
            ]}
        />
    ) : null;
}
