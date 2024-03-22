import React from 'react';

import {RadioButton} from '@gravity-ui/uikit';

import {AclMode} from '../../constants/acl';
import format from '../../common/hammer/format';
import {ACLReduxProps} from './ACL-connect-helpers';

export function AclModeControl({
    updadeAclFilters,
    aclMode,
}: Pick<ACLReduxProps, 'aclMode' | 'updadeAclFilters'>) {
    const options = [AclMode.MAIN_PERMISSIONS, AclMode.COLUMN_GROUPS_PERMISSISONS].map((value) => {
        return {value, content: format.ReadableField(value)};
    });

    return (
        <RadioButton
            value={aclMode}
            options={options}
            onUpdate={(value) => {
                updadeAclFilters({aclCurrentTab: value as AclMode});
            }}
        />
    );
}
