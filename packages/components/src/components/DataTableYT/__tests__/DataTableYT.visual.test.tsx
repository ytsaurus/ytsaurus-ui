import {type ReactElement} from 'react';

import {test} from '../../../playwright-components/core';

import {DataTableYT} from '../DataTableYT';
import {
    type DataTableYTDemoRow,
    type DataTableYTVisualCaseId,
    THEME_LEGACY,
    THEME_YANDEX_CLOUD,
    dataTableYTDefaultSettings,
    dataTableYTDemoColumns,
    dataTableYTSampleData,
    dataTableYTStoryFrameStyle,
    dataTableYTVisualCaseOrder,
} from '../dataTableYTStorySetup';

const noopOnRowClick = () => undefined;

const commonTableProps = {
    columns: dataTableYTDemoColumns,
    disableRightGap: false,
    settings: dataTableYTDefaultSettings,
    onRowClick: noopOnRowClick,
} as const;

const renderDataTable = (id: DataTableYTVisualCaseId): ReactElement => {
    switch (id) {
        case 'default':
            return (
                <DataTableYT<DataTableYTDemoRow>
                    {...commonTableProps}
                    data={dataTableYTSampleData}
                    loaded
                    loading={false}
                    useThemeYT
                />
            );
        case 'gravity-yandex-cloud':
            return (
                <DataTableYT<DataTableYTDemoRow>
                    {...commonTableProps}
                    data={dataTableYTSampleData}
                    loaded
                    loading={false}
                    theme={THEME_YANDEX_CLOUD}
                />
            );
        case 'gravity-legacy':
            return (
                <DataTableYT<DataTableYTDemoRow>
                    {...commonTableProps}
                    data={dataTableYTSampleData}
                    loaded
                    loading={false}
                    theme={THEME_LEGACY}
                />
            );
        case 'empty':
            return (
                <DataTableYT<DataTableYTDemoRow>
                    {...commonTableProps}
                    data={[]}
                    loaded
                    loading={false}
                    useThemeYT
                />
            );
        case 'loading':
            return (
                <DataTableYT<DataTableYTDemoRow>
                    {...commonTableProps}
                    data={[]}
                    loaded={false}
                    loading
                    useThemeYT
                />
            );
        default: {
            const _exhaustive: never = id;
            return _exhaustive;
        }
    }
};

for (const caseId of dataTableYTVisualCaseOrder) {
    test(`DataTableYT: ${caseId}`, async ({mount, expectScreenshot}) => {
        await mount(<div style={dataTableYTStoryFrameStyle}>{renderDataTable(caseId)}</div>);
        await expectScreenshot();
    });
}
