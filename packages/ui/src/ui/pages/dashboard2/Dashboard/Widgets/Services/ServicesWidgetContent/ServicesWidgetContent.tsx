import React from 'react';
import {Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';
import {createColumnHelper} from '@gravity-ui/table/tanstack';

import {WidgetTable} from '../../../../../../pages/dashboard2/Dashboard/components/WidgetTable/WidgetTable';

import {Health} from '../../../../../../components/Health/Health';

import {YTHealth} from '../../../../../../types';
import {StrawberryCliqueHealthType} from '../../../../../../utils/strawberryControllerApi';

import {General} from './cells/General';
import {Type} from './cells/Type';

import {useServicesWidget} from './use-services-widget';

type Service = {
    general: {name: string; url: string};
    type: string;
    status?: YTHealth | StrawberryCliqueHealthType;
    config: string;
};

const columnHelper = createColumnHelper<Service>();

const columns = [
    columnHelper.accessor('general', {
        cell: (general) => <General {...general.getValue()} />,
        header: 'Name',
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
        cell: (config) => <Text whiteSpace={'nowrap'}>{config.getValue()}</Text>,
        header: 'Config',
    }),
];

export function ServicesWidgetContent(props: PluginWidgetProps) {
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
