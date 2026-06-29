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
import UIFactory from '../../../../../../../UIFactory';
import {OperationAclAddButton} from '../OperationAclAddButton/OperationAclAddButton';
import './OperationAclToolbar.scss';

const block = cn('yt-operation-acl-toolbar');

export function OperationAclToolbar() {
    const dispatch = useDispatch();

    const subjectFilter = useSelector(getSubjectFilter);
    const permissionsFilter = useSelector(getPermissionsFilter);

    const {permissionTypes} = UIFactory.getAclPermissionsSettings()['operation'];

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
                            permissionList={permissionTypes}
                        />
                    ),
                    width: 400,
                },
                {node: <OperationAclAddButton />},
            ]}
        />
    );
}
