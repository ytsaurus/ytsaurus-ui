import React from 'react';
import {RadioButton} from '@gravity-ui/uikit';

export function NavigationWidgetControls() {
    const onChange = () => {};

    return (
        <RadioButton
            options={[
                {value: 'Last visited', content: 'Last visited'},
                {value: 'Favorite', content: 'Favorite'},
            ]}
            onChange={onChange}
        ></RadioButton>
    );
}
