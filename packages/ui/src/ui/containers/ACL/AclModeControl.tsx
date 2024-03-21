import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import {RadioButton} from '@gravity-ui/uikit';

import {getAclCurrentTab} from '../../store/selectors/acl-filters';
import {AclMode} from '../../constants/acl';
import format from '../../common/hammer/format';
import {updateAclFilters} from '../../store/actions/acl-filters';

export function AclModeControl() {
    const dispatch = useDispatch();
    const currentTab = useSelector(getAclCurrentTab);

    const options = [AclMode.MAIN_PERMISSIONS, AclMode.COLUMN_GROUPS_PERMISSISONS].map((value) => {
        return {value, content: format.ReadableField(value)};
    });

    return (
        <RadioButton
            value={currentTab}
            options={options}
            onUpdate={(value) => {
                dispatch(updateAclFilters({aclCurrentTab: value}));
            }}
        />
    );
}
