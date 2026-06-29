import cn from 'bem-cn-lite';
import React from 'react';
import {Toolbar} from '../../../../../../../components/WithStickyToolbar/Toolbar/Toolbar';
import {ObjectPermissionsSelectFilter} from '../../../../../../../containers/ACL/ObjectPermissionsFilters/ObjectPermissionsSelectFilter/ObjectPermissionsSelectFilter';
import {ObjectPermissionsSubjectFilter} from '../../../../../../../containers/ACL/ObjectPermissionsFilters/ObjectPermissionsSubjectFilter/ObejctPermissionsSubjectFilter';
import {
    getPermissionsFilter,
    getSubjectFilter,
    setPermissionsFilter,
    setSubjectFilter,
} from '../../../../../../../store/reducers/operations/acl-filters';
import {useDispatch, useSelector} from '../../../../../../../store/redux-hooks';
import './OperationAclToolbar.scss';

const block = cn('yt-operation-acl-toolbar');

const OPERATION_PERMISSIONS = ['read', 'manage', 'administer'] as const;

export function OperationAclToolbar() {
    const dispatch = useDispatch();

    const subjectFilter = useSelector(getSubjectFilter);
    const permissionsFilter = useSelector(getPermissionsFilter);

    return (
        <Toolbar
            className={block()}
            itemsToWrap={[
                {
                    node: (
                        <ObjectPermissionsSubjectFilter
                            className={block('filter')}
                            onUpdate={(value) => {
                                dispatch(setSubjectFilter({subjectFilter: value}));
                            }}
                            value={subjectFilter}
                        />
                    ),
                    width: 250,
                },
                {
                    shrinkable: true,
                    node: (
                        <ObjectPermissionsSelectFilter
                            className={block('filter')}
                            value={permissionsFilter}
                            onUpdate={(value) => {
                                dispatch(setPermissionsFilter({permissionsFilter: value}));
                            }}
                            permissionList={OPERATION_PERMISSIONS}
                        />
                    ),
                    width: 400,
                },
            ]}
        />
    );
}
