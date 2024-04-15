import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {map} from 'lodash';

import format from '../../../common/hammer/format';

import {
    changeObjectPermissionsFilter,
    changeObjectSubjectFilter,
} from '../../../store/actions/acl-filters';
import {
    getObjectPermissionsFilter,
    getObjectSubjectFilter,
} from '../../../store/selectors/acl-filters';
import {getObjectPermissionsTypesList} from '../../../store/selectors/acl';
import Filter from '../../../components/Filter/Filter';
import Select from '../../../components/Select/Select';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import './ObjectPermissionsFilters.scss';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {AclMode} from '../../../constants/acl';
import {ColumnGroupsFilter} from '../ColumnGroups/ColumnGroups';

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
                            placeholder="Filter by subject"
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
                                placeholder={'filter'}
                                value={selectedPermissons}
                                items={map(permissionList, (p) => ({
                                    value: p,
                                    text: format.ReadableField(p),
                                }))}
                                onUpdate={(value: string[]) => {
                                    dispatch(
                                        changeObjectPermissionsFilter({
                                            objectPermissions: value as typeof selectedPermissons,
                                        }),
                                    );
                                }}
                                label={'Permissions'}
                                maxVisibleValuesTextLength={60}
                                width="auto"
                                disablePortal={false}
                            />
                        ),
                },
            ]}
        />
    );
}
