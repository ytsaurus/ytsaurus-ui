import React from 'react';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {ServiceInfo} from '../../../../../../store/api/dashboard2/services/services';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';
import {GeneralCell} from '../../../../../../pages/dashboard2/Dashboard/components/GeneralCell/GeneralCell';
import {WidgetText} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetText/WidgetText';

import {Health} from '../../../../../../components/Health/Health';

import {Type} from './cells/Type';

import {useServicesWidget} from '../hooks/use-services-widget';
import type {ServicesWidgetProps} from '../types';

const columnHelper = createColumnHelper<ServiceInfo>();

const columns = [
    columnHelper.accessor('general', {
        cell: (general) => <GeneralCell {...general.getValue()} />,
        header: 'Name',
        maxSize: 150,
    }),
    columnHelper.accessor('type', {
        cell: (type) => <Type type={type.getValue()} />,
        header: 'Type',
    }),
    columnHelper.accessor('status', {
        cell: (status) => <Health value={status.getValue()} />,
        header: 'Health',
    }),
    columnHelper.accessor('config', {
        cell: (config) => <WidgetText>{config.getValue()}</WidgetText>,
        header: 'Config',
    }),
];

export function ServicesWidgetContent(props: ServicesWidgetProps) {
    const {data, error, isLoading} = useServicesWidget(props);

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
