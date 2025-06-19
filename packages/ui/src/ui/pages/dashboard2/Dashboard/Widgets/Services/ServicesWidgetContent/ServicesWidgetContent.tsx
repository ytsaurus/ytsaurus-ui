import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {ServiceInfo} from '../../../../../../store/api/dashboard2/services/services';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {GeneralCell} from '../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';
import {useAutoHeight} from '../../../../../../pages/dashboard2/Dashboard/hooks/use-autoheight';

import {Health} from '../../../../../../components/Health/Health';

import {Type} from './cells/Type';

import {useServicesWidget} from './use-services-widget';

const columnHelper = createColumnHelper<ServiceInfo>();

const columns = [
    columnHelper.accessor('general', {
        cell: (general) => <GeneralCell {...general.getValue()} />,
        header: 'Name',
    }),
    columnHelper.accessor('type', {
        cell: (type) => <Type type={type.getValue()}/>,
        header: 'Type',
    }),
    columnHelper.accessor('status', {
        cell: (status) => <Health value={status.getValue()} />,
        header: 'Health',
    }),
    columnHelper.accessor('config', {
        cell: (config) => <Text whiteSpace={'nowrap'}>{config.getValue()}</Text>,
        header: 'Config',
    }),
];

// 1 react-grid height value ~ 25.3px
const servicesLayout = {
    baseHeight: 4.5,
    defaultHeight: 12,

    rowHeight: 1.6,

    minWidth: 10,
};

export function ServicesWidgetContent(props: PluginWidgetProps) {
    const {data, error, isLoading} = useServicesWidget(props);

    useAutoHeight(props, servicesLayout, data?.length || 0);

    return (
        <WidgetTable
            columns={columns}
            data={data || []}
            itemHeight={40}
            isLoading={isLoading}
            fallback={{itemsName: 'services'}}
            error={error}
        />
    );
}
