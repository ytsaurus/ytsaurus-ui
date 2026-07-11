import map_ from 'lodash/map';
import React from 'react';
import Select from '../../../../components/Select/Select';
import {YTPermissionTypeUI} from '../../../../utils/acl/acl-api';
import i18nPermissionValues from '../../i18n-permission-values';
import i18n from './i18n';

type Props = {
    value: YTPermissionTypeUI[];
    onUpdate: (value: YTPermissionTypeUI[]) => void;
    permissionList: ReadonlyArray<YTPermissionTypeUI>;
    className: string;
};

export function ObjectPermissionsSelectFilter({value, onUpdate, permissionList, className}: Props) {
    return (
        <Select
            className={className}
            multiple
            placeholder={i18n('context_filter-placeholder')}
            value={value}
            items={map_(permissionList, (p) => ({
                value: p,
                text: i18nPermissionValues(`value_${p}`),
            }))}
            onUpdate={onUpdate}
            label={i18n('field_permissions')}
            maxVisibleValuesTextLength={60}
            width="auto"
        />
    );
}
