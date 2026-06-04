import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';
import reduce_ from 'lodash/reduce';

import format from '../../../common/hammer/format';

import {type AddMaintenanceParams} from '../../../../shared/yt-types';
import {YTDFDialog, makeErrorFields} from '../../../containers/Dialog';
import {
    type NodeMaintenanceState,
    type NodeResourceLimits,
} from '../../../store/reducers/components/node-maintenance-modal';
import {
    selectNodeMaintenanceModalInitialValues,
    selectNodeMaintenanceModalState,
} from '../../../store/selectors/components/node-maintenance-modal';
import {
    applyMaintenance,
    closeNodeMaintenanceModal,
} from '../../../store/actions/components/node-maintenance-modal';
import {type YTError} from '../../../../@types/types';
import {Host} from '../../../containers/Host/Host';
import i18n from './i18n';

import './NodeMaintenanceModal.scss';

const block = cn('node-maintenance-modal');

type FormValues = NodeMaintenanceState['maintenance'] & {
    limits: Partial<{[K in keyof NodeResourceLimits]: {value?: number}}>;
    role: {role?: string};
};

export function NodeMaintenanceModal() {
    const dispatch = useDispatch();
    const [error, setError] = React.useState<YTError | undefined>();

    const initialValues = useSelector(selectNodeMaintenanceModalInitialValues);
    const {address, component, resourceLimits} = useSelector(selectNodeMaintenanceModalState);

    const allowedMaintenanceTypes: Array<AddMaintenanceParams['type']> =
        component === 'cluster_node'
            ? [
                  'ban',
                  'disable_scheduler_jobs',
                  'disable_write_sessions',
                  'disable_tablet_cells',
                  'decommission',
              ]
            : ['ban'];

    const allowLimitsTab = component === 'cluster_node';
    const allowChangeRole = component !== 'cluster_node';

    return address ? (
        <YTDFDialog<FormValues>
            visible
            headerProps={{
                title: (
                    <>
                        <Host useText prefix={<>{i18n('title_edit')} &nbsp;</>} address={address} />
                    </>
                ),
            }}
            initialValues={initialValues}
            onClose={() => dispatch(closeNodeMaintenanceModal())}
            onAdd={async (form) => {
                const {
                    values: {limits, role: roleTab, ...rest},
                } = form.getState();

                const diff = reduce_(
                    rest,
                    (acc, item, t) => {
                        const type = t as keyof typeof rest;
                        const {state, comment} = initialValues?.[type] ?? {};
                        if (
                            Boolean(state) !== Boolean(item?.state) ||
                            (item?.comment && comment !== item?.comment)
                        ) {
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
                        if (initialValues.limits[key]?.value !== item?.value) {
                            acc[key] = item?.value;
                        }
                        return acc;
                    },
                    {} as Partial<NodeResourceLimits>,
                );

                const role = initialValues.role.role !== roleTab.role ? roleTab.role : undefined;

                try {
                    dispatch(applyMaintenance(address, component, diff, limitsDiff, role));
                } catch (e: any) {
                    setError(e);
                }
            }}
            fields={[
                ...map_(allowedMaintenanceTypes, (name) => {
                    return {
                        name,
                        type: 'tab' as const,
                        title: i18n(`title_${name}`),
                        fields: [...makeMaintenanceFields(name), ...makeErrorFields([error])],
                    };
                }),
                ...(!allowLimitsTab
                    ? []
                    : [
                          {
                              name: 'limits',
                              type: 'tab' as const,
                              title: i18n('title_limits'),
                              fields: [
                                  makeResourceLimitField('cpu', resourceLimits),
                                  makeResourceLimitField('gpu', resourceLimits),
                                  makeResourceLimitField('network', resourceLimits),
                                  makeResourceLimitField('replication_slots', resourceLimits),
                                  makeResourceLimitField('replication_data_size', resourceLimits),
                                  makeResourceLimitField('removal_slots', resourceLimits),
                                  makeResourceLimitField('repair_slots', resourceLimits),
                                  makeResourceLimitField('repair_data_size', resourceLimits),
                                  makeResourceLimitField('seal_slots', resourceLimits),
                                  makeResourceLimitField('system_memory', resourceLimits),
                                  makeResourceLimitField('user_memory', resourceLimits),
                                  ...makeErrorFields([error]),
                              ],
                          },
                      ]),
                ...(!allowChangeRole
                    ? []
                    : [
                          {
                              name: 'role',
                              type: 'tab' as const,
                              title: i18n('title_role'),
                              fields: [
                                  {
                                      name: 'role',
                                      type: 'text' as const,
                                      caption: i18n('title_role'),
                                  },
                              ],
                          },
                      ]),
            ]}
        />
    ) : null;
}

function makeMaintenanceFields(type: AddMaintenanceParams['type'], allowOthers = true) {
    return [
        {
            name: 'state',
            type: 'radio' as const,
            caption: i18n('field_state'),
            extras: makeRadioExtras(type),
        },
        {
            name: 'comment',
            type: 'textarea' as const,
            caption: i18n('field_comment'),
            extras: (values: FormValues) => {
                return values[type]?.state ? {} : {disabled: true};
            },
        },
        ...(allowOthers
            ? [
                  {
                      name: 'otherComments',
                      type: 'textarea' as const,
                      caption: i18n('field_other-comments'),
                      extras: {
                          disabled: true,
                      },
                  },
              ]
            : []),
    ];
}

function makeRadioExtras(type: AddMaintenanceParams['type']) {
    const labels: Partial<Record<typeof type, [string, string]>> = {
        ban: [i18n('value_enabled'), i18n('value_banned')],
        decommission: [i18n('value_enabled'), i18n('value_decommissioned')],
    };
    const [activeLabel = i18n('value_enabled'), maintenanceLabel = i18n('value_disabled')] =
        labels[type] ?? [];
    return {
        options: [
            {value: '', label: activeLabel},
            {value: 'maintenance', label: maintenanceLabel},
        ],
    };
}

function makeResourceLimitField(
    name: keyof NodeResourceLimits,
    defaults?: Partial<Record<typeof name, number>>,
) {
    const OPTIONS: Partial<Record<typeof name, {format?: 'Bytes'; caption?: string}>> = {
        cpu: {caption: 'CPU'},
        gpu: {caption: 'GPU'},
        user_memory: {
            format: 'Bytes',
        },
        system_memory: {
            format: 'Bytes',
        },
        repair_data_size: {
            format: 'Bytes',
        },
        replication_data_size: {
            format: 'Bytes',
        },
    };

    const options = OPTIONS[name] ?? {};

    return {
        type: 'number' as const,
        name,
        caption: options?.caption || format.ReadableField(name),
        extras: {
            format: options?.format ?? ('Number' as const),
            showDefaultValue: true,
            defaultValue: defaults?.[name],
            defaultValueClassName: block('limit-default'),
            bottomLineVisibility: 'focused' as const,
        },
    };
}
