import React from 'react';
import {SegmentedRadioGroup} from '@gravity-ui/uikit';
import {ACL_MODES, AclMode} from '../../constants/acl';
import i18nPermissionValues from './i18n-permission-values';
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

            return {value, content: i18nPermissionValues(`view_mode_${value}`) + counterStr};
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
