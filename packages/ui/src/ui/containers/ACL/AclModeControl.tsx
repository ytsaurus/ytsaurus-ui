import React from 'react';

import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {AclMode} from '../../constants/acl';
import format from '../../common/hammer/format';

import {ACLReduxProps} from './ACL-connect-helpers';

const ACL_MODE_OPTIONS = [
    AclMode.MAIN_PERMISSIONS,
    AclMode.COLUMN_GROUPS_PERMISSIONS,
    AclMode.ROW_GROUPS_PERMISSIONS,
];

export function AclModeControl({
    updateAclFilters,
    aclMode,
    permissionCounters,
}: Pick<ACLReduxProps, 'aclMode' | 'updateAclFilters'> & {
    permissionCounters: Record<AclMode, number>;
}) {
    const options = React.useMemo(() => {
        return ACL_MODE_OPTIONS.map((value) => {
            const {[value]: counter} = permissionCounters;
            const counterStr = counter >= 0 ? ` ${counter}` : '';

            return {value, content: format.ReadableField(value) + counterStr};
        });
    }, [permissionCounters]);

    return (
        <SegmentedRadioGroup
            value={aclMode}
            options={options}
            onUpdate={(value) => {
                updateAclFilters({aclCurrentTab: value as AclMode});
            }}
        />
    );
}
