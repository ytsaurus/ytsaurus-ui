import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import format from '../../../common/hammer/format';

import Filter from '../../../components/Filter/Filter';
import Select from '../../../components/Select/Select';
import {Toolbar} from '../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {AclMode} from '../../../constants/acl';
import {getObjectPermissionsTypesList} from '../../../store/selectors/acl';
import {
    getAclRowAccessPredicateFilter,
    getObjectPermissionsFilter,
    getObjectSubjectFilter,
} from '../../../store/selectors/acl-filters';
import {ACLReduxProps} from '../ACL-connect-helpers';
import {ColumnGroupsFilter} from '../ColumnGroups/ColumnGroups';
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

    const rowAccessPredicateFilter = useSelector(getAclRowAccessPredicateFilter);

    return (
        <Toolbar
            itemsToWrap={[
                {
                    node: (
                        <Filter
                            className={block('filter')}
                            placeholder={i18n('context_filter-by-subject')}
                            onChange={(value: string) => {
                                dispatch(
                                    updateAclFilters({
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
                            <Select
                                className={block('filter')}
                                multiple
                                placeholder={i18n('context_filter-placeholder')}
                                value={selectedPermissons}
                                items={map_(permissionList, (p) => ({
                                    value: p,
                                    text: format.ReadableField(p),
                                }))}
                                onUpdate={(value: string[]) => {
                                    dispatch(
                                        updateAclFilters({
                                            objectPermissions: value as typeof selectedPermissons,
                                        }),
                                    );
                                }}
                                label={i18n('field_permissions')}
                                maxVisibleValuesTextLength={60}
                                width="auto"
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
