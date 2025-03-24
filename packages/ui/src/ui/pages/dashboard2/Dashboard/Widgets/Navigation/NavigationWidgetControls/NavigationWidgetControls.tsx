import React from 'react';
import {useDispatch} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';

import {setPathsType} from '../../../../../../store/reducers/dashboard2/navigation';

export function NavigationWidgetControls() {
    const dispatch = useDispatch();
    const onUpdate = (value: string) => {
        dispatch(setPathsType({type: value}));
    };

    return (
        <RadioButton
            options={[
                {value: 'last_visited', content: 'Last visited'},
                {value: 'favourite', content: 'Favorite'},
            ]}
            onUpdate={onUpdate}
        ></RadioButton>
    );
}
