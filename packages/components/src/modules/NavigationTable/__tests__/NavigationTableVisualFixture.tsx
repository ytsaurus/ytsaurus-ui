import React from 'react';

import {YSON_DEFAULT_UNIPIKA_SETTINGS} from '../../../internal/Yson';

import {NavigationTable, type NavigationTableInitialTab} from '../NavigationTable';
import {
    navigationTableSampleAdditionalColumns,
    navigationTableSampleTable,
    navigationTableStoryEmptyMessage,
    navigationTableStoryFrameStyle,
} from '../navigationTableStorySetup';

export type NavigationTableVisualFixtureProps = {
    empty?: boolean;
    initialActiveTab?: NavigationTableInitialTab;
    withExtraColumns?: boolean;
};

export const NavigationTableVisualFixture: React.FC<NavigationTableVisualFixtureProps> = ({
    empty,
    initialActiveTab,
    withExtraColumns,
}) => {
    return (
        <div style={navigationTableStoryFrameStyle}>
            <NavigationTable
                table={empty ? undefined : navigationTableSampleTable}
                emptyMessage={navigationTableStoryEmptyMessage}
                ysonSettings={YSON_DEFAULT_UNIPIKA_SETTINGS}
                initialActiveTab={initialActiveTab}
                additionalSchemaColumns={
                    withExtraColumns ? navigationTableSampleAdditionalColumns : undefined
                }
                onInsertTableSelect={() => undefined}
                logError={() => undefined}
            />
        </div>
    );
};
