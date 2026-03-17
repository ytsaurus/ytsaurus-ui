import React from 'react';

import {SegmentedRadioGroup} from '@gravity-ui/uikit';

import {ACL_MODES, AclMode} from '../../constants/acl';
import format from '../../common/hammer/format';

import {ACLReduxProps} from './ACL-connect-helpers';

export function AclModeControl({
    updateAclFilters,
    aclMode,
    permissionCounters,
}: Pick<ACLReduxProps, 'aclMode' | 'updateAclFilters'> & {
    permissionCounters: Record<AclMode, number>;
}) {
    const options = React.useMemo(() => {
        return ACL_MODES.map((value) => {
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
