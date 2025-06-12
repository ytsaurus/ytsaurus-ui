import React, { useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {RadioButton} from '@gravity-ui/uikit';

import {getConfigData} from '../../../../config/ui-settings';
import {updateTabletErrorsViewMode} from '../../../../store/actions/navigation/tabs/tablet-errors/tablet-errors-background';
import {tabletErrorsByPathActions} from '../../../../store/reducers/navigation/tabs/tablet-errors/tablet-errors-by-path';
import {
    getTabletErrorsBackgroundCount,
    getTabletErrorsViewMode,
} from '../../../../store/selectors/navigation/tabs/tablet-errors-background';

import TabletErrorsBackground from './TabletErrorsBackground';
import {TabletErrorsRequest} from './TabletErrorsByPath/TabletErrorsByPath';

export default function TabletErrors() {
    const dispatch = useDispatch();

    const viewMode = useSelector(getTabletErrorsViewMode);
    const backgroundErrorCount = useSelector(getTabletErrorsBackgroundCount);

    const allowTabletErrorsAPI = getConfigData().allowTabletErrorsAPI;

    const content =
        viewMode === 'request_errors' ? <TabletErrorsRequest /> : <TabletErrorsBackground />;

    useEffect(() => {
      return () => {
        dispatch(tabletErrorsByPathActions.updateFilter({timeRangeFilter: undefined}));
        dispatch(updateTabletErrorsViewMode());
      };
    }, []);

    return (
        <div>
            {allowTabletErrorsAPI && (
                <RadioButton<typeof viewMode>
                    value={viewMode}
                    onUpdate={(v) => dispatch(updateTabletErrorsViewMode(v))}
                    options={[
                        {value: 'request_errors', content: 'Request errors'},
                        {
                            value: 'background_errors',
                            content: `Background errors ${backgroundErrorCount}`,
                        },
                    ]}
                />
            )}
            {content}
        </div>
    );
}
