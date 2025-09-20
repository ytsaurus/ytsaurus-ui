import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RadioButton} from '@gravity-ui/uikit';

import {RootState} from '../../../../../../store/reducers';
import {getAccountsTypeFilter} from '../../../../../../store/selectors/dashboard2/accounts';
import {setAccountsTypeFilter} from '../../../../../../store/actions/dashboard2/accounts';

import type {AccountsWidgetProps} from '../types';

import i18n from '../i18n';

export function AccountsWidgetControls(props: AccountsWidgetProps) {
    const dispatch = useDispatch();

    const type = useSelector((state: RootState) => getAccountsTypeFilter(state, props.id));

    const onUpdate = (value: 'favourite' | 'usable' | 'custom') => {
        dispatch(setAccountsTypeFilter(props.id, value));
    };

    return (
        <RadioButton
            options={[
                {value: 'favourite', content: i18n('value_favourite')},
                {value: 'usable', content: i18n('value_usable')},
                {value: 'custom', content: i18n('value_custom')},
            ]}
            value={type}
            onUpdate={onUpdate}
        ></RadioButton>
    );
}
