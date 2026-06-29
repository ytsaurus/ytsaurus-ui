import cn from 'bem-cn-lite';
import React from 'react';
import Filter from '../../../components/Filter/Filter';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {AclMode} from '../../../constants/acl';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectObjectPermissionsTypesList} from '../../../store/selectors/acl/acl';
import {
    selectAclRowAccessPredicateFilter,
    selectObjectPermissionsFilter,
    selectObjectSubjectFilter,
} from '../../../store/selectors/acl/acl-filters';
import {type ACLReduxProps} from '../ACL-connect-helpers';
import {ColumnGroupsFilter} from '../ColumnGroups/ColumnGroups';
import i18n from './i18n';
import './ObjectPermissionsFilters.scss';
import {ObjectPermissionsSelectFilter} from './ObjectPermissionsSelectFilter/ObjectPermissionsSelectFilter';
import {ObjectPermissionsSubjectFilter} from './ObjectPermissionsSubjectFilter/ObejctPermissionsSubjectFilter';

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
    const subjectFilter = useSelector(selectObjectSubjectFilter);
    const selectedPermissons = useSelector(selectObjectPermissionsFilter);
    const permissionList = useSelector(selectObjectPermissionsTypesList(idmKind));

    const rowAccessPredicateFilter = useSelector(selectAclRowAccessPredicateFilter);

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <ObjectPermissionsSubjectFilter
                            className={block('filter')}
                            value={subjectFilter}
                            onUpdate={(value: string) => {
                                dispatch(
                                    updateAclFilters({
                                        objectSubject: value,
                                    }),
                                );
                            }}
                        />
                    ),
                },
                {
                    shrinkable: true,
                    node: {
                        [AclMode.COLUMN_GROUPS_PERMISSIONS]: (
                            <ColumnGroupsFilter
                                {...{
                                    columnsFilter,
                                    updateAclFilters,
                                    userPermissionsAccessColumns,
                                }}
                            />
                        ),
                        [AclMode.MAIN_PERMISSIONS]: (
                            <ObjectPermissionsSelectFilter
                                className={block('filter')}
                                value={selectedPermissons}
                                onUpdate={(value: string[]) => {
                                    dispatch(
                                        updateAclFilters({
                                            objectPermissions: value as typeof selectedPermissons,
                                        }),
                                    );
                                }}
                                permissionList={permissionList}
                            />
                        ),
                        [AclMode.ROW_GROUPS_PERMISSIONS]: (
                            <Filter
                                className={block('filter')}
                                placeholder={i18n('context_filter-by-predicate')}
                                onChange={(value) => {
                                    dispatch(
                                        updateAclFilters({
                                            rowAccessPredicateFilter: value,
                                        }),
                                    );
                                }}
                                value={rowAccessPredicateFilter}
                                size="m"
                                autofocus={false}
                            />
                        ),
                    }[aclMode],
                },
            ]}
        />
    );
}
