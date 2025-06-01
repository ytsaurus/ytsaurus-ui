import React from 'react';
import {useDispatch} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {setPathsType} from '../../../../../../store/reducers/dashboard2/navigation';

export function NavigationWidgetControls(props: PluginWidgetProps) {
    const dispatch = useDispatch();
    const onUpdate = (value: 'last_visited' | 'favourite') => {
        dispatch(setPathsType({id: props.id, type: value}));
    };

    return (
        <RadioButton
            options={[
                {value: 'last_visited', content: 'Last visited'},
                {value: 'favourite', content: 'Favourite'},
            ]}
            onUpdate={onUpdate}
        ></RadioButton>
    );
}
