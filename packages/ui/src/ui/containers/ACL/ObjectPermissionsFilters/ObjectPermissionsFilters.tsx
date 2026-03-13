import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import Filter from '../../../components/Filter/Filter';
import Select from '../../../components/Select/Select';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {AclMode} from '../../../constants/acl';
import {
    changeObjectPermissionsFilter,
    changeObjectSubjectFilter,
} from '../../../store/actions/acl-filters';
import {getObjectPermissionsTypesList} from '../../../store/selectors/acl';
import {
    getObjectPermissionsFilter,
    getObjectSubjectFilter,
} from '../../../store/selectors/acl-filters';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {ColumnGroupsFilter} from '../ColumnGroups/ColumnGroups';
import i18nPermissionValues from '../i18n-permission-values';
import i18n from './i18n';
import './ObjectPermissionsFilters.scss';

const block = cn('object-permissions-filters');

type Props = Pick<
    ACLReduxProps,
    'aclMode' | 'idmKind' | 'columnsFilter' | 'updateAclFilters' | 'userPermissionsAccessColumns'
>;

export default function ObjectPermissionsFilters({
    aclMode,
    idmKind,
    columnsFilter,
    updateAclFilters,
    userPermissionsAccessColumns,
}: Props) {
    const dispatch = useDispatch();
    const subjectFilter = useSelector(getObjectSubjectFilter);
    const selectedPermissons = useSelector(getObjectPermissionsFilter);
    const permissionList = useSelector(getObjectPermissionsTypesList(idmKind));

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <Filter
                            className={block('filter')}
                            placeholder={i18n('placeholder_filter-by-subject')}
                            onChange={(value: string) => {
                                dispatch(
                                    changeObjectSubjectFilter({
                                        objectSubject: value,
                                    }),
                                );
                            }}
                            value={subjectFilter}
                            size="m"
                            autofocus={false}
                        />
                    ),
                },
                {
                    shrinkable: true,
                    node:
                        aclMode === AclMode.COLUMN_GROUPS_PERMISSISONS ? (
                            <ColumnGroupsFilter
                                {...{columnsFilter, updateAclFilters, userPermissionsAccessColumns}}
                            />
                        ) : (
                            <Select
                                className={block('filter')}
                                multiple
                                placeholder={i18n('placeholder_filter')}
                                value={selectedPermissons}
                                items={map_(permissionList, (p) => ({
                                    value: p,
                                    text: i18nPermissionValues(`value_${p}`),
                                }))}
                                onUpdate={(value: string[]) => {
                                    dispatch(
                                        changeObjectPermissionsFilter({
                                            objectPermissions: value as typeof selectedPermissons,
                                        }),
                                    );
                                }}
                                label={i18n('label_permissions')}
                                maxVisibleValuesTextLength={60}
                                width="auto"
                            />
                        ),
                },
            ]}
        />
    );
}
