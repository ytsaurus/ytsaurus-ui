import React from 'react';

import {RadioButton} from '@gravity-ui/uikit';

import {AclMode} from '../../constants/acl';
import format from '../../common/hammer/format';

import {ACLReduxProps} from './ACL-connect-helpers';

const ACL_MODE_OPTIONS = [AclMode.MAIN_PERMISSIONS, AclMode.COLUMN_GROUPS_PERMISSISONS].map(
    (value) => {
        return {value, content: format.ReadableField(value)};
    },
);

export function AclModeControl({
    updateAclFilters,
    aclMode,
}: Pick<ACLReduxProps, 'aclMode' | 'updateAclFilters'>) {
    return (
        <RadioButton
            value={aclMode}
            options={ACL_MODE_OPTIONS}
            onUpdate={(value) => {
                updateAclFilters({aclCurrentTab: value as AclMode});
            }}
        />
    );
}
