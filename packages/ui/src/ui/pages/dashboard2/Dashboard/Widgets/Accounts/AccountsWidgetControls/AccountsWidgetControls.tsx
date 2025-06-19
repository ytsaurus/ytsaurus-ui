import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import {RootState} from '../../../../../../store/reducers';
import {getAccountsTypeFilter} from '../../../../../../store/selectors/dashboard2/accounts';
import {setAccountsTypeFilter} from '../../../../../../store/actions/dashboard2/accounts';

export function AccountsWidgetControls(props: PluginWidgetProps) {
    const dispatch = useDispatch();

    const type = useSelector((state: RootState) => getAccountsTypeFilter(state, props.id));

    const onUpdate = (value: 'favourite' | 'usable' | 'custom') => {
        dispatch(setAccountsTypeFilter(props.id, value));
    };

    return (
        <RadioButton
            options={[
                {value: 'favourite', content: 'Favourite'},
                {value: 'usable', content: 'Usable'},
                {value: 'custom', content: 'Custom'}
            ]}
            value={type}
            onUpdate={onUpdate}
        ></RadioButton>
    );
}
