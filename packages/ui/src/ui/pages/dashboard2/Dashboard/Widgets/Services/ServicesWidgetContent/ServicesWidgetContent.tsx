import React from 'react';
import {useSelector} from '../../../../../../store/redux-hooks';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {RootState} from '../../../../../../store/reducers';
import {ServiceInfo} from '../../../../../../store/api/dashboard2/services/services';
import {getServicesTypeFilter} from '../../../../../../store/selectors/dashboard2/services';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {GeneralCell} from '../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';
import {WidgetText} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

import {Health} from '../../../../../../components/Health/Health';

import {Type} from './cells/Type';

import {useServicesWidget} from '../hooks/use-services-widget';
import type {ServicesWidgetProps} from '../types';

import i18n from '../i18n';

const columnHelper = createColumnHelper<ServiceInfo>();

const columns = [
    columnHelper.accessor('general', {
        cell: (general) => <GeneralCell {...general.getValue()} />,
        header: () => i18n('field_name'),
        maxSize: 150,
    }),
    columnHelper.accessor('type', {
        cell: (type) => <Type type={type.getValue()} />,
        header: () => i18n('field_type'),
    }),
    columnHelper.accessor('status', {
        cell: (status) => <Health value={status.getValue()} />,
        header: () => i18n('field_health'),
    }),
    columnHelper.accessor('config', {
        cell: (config) => <WidgetText>{config.getValue()}</WidgetText>,
        header: () => i18n('field_config'),
    }),
];

export function ServicesWidgetContent(props: ServicesWidgetProps) {
    const {data, error, isLoading} = useServicesWidget(props);

    const type = useSelector((state: RootState) => getServicesTypeFilter(state, props.id));
    const itemsName = i18n(`fallback-item_${type || 'default'}`);

    return (
        <WidgetTable
            columns={columns}
            data={data || []}
            itemHeight={40}
            isLoading={isLoading}
            fallback={{itemsName}}
            error={error}
        />
    );
}
