import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {getNavigationTypeFilter} from '../../../../../../store/selectors/dashboard2/navigation';

import {setNavigationTypeFilter} from '../../../../../../store/actions/dashboard2/navigation';

export function NavigationWidgetControls(props: PluginWidgetProps) {
    const dispatch = useDispatch();
    const type = useSelector((state: RootState) => getNavigationTypeFilter(state, props.id));
    const onUpdate = (value: 'last_visited' | 'favourite') => {
        dispatch(setNavigationTypeFilter(props.id, value));
    };

    return (
        <RadioButton
            options={[
                {value: 'last_visited', content: 'Last visited'},
                {value: 'favourite', content: 'Favourite'},
            ]}
            value={type}
            onUpdate={onUpdate}
        ></RadioButton>
    );
}
