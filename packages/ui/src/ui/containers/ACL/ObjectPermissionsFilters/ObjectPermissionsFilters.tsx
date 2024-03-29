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
import {IdmKindType} from '../../../utils/acl/acl-types';
import Select from '../../../components/Select/Select';
import './ObjectPermissionsFilters.scss';

const block = cn('object-permissions-filters');

interface Props {
    idmKind: IdmKindType;
}

export default function ObjectPermissionsFilters({idmKind, ...rest}: Props) {
    const dispatch = useDispatch();
    const subjectFilter = useSelector(getObjectSubjectFilter);
    const selectedPermissons = useSelector(getObjectPermissionsFilter);
    const permissionList = useSelector(getObjectPermissionsTypesList(idmKind));

    return (
        <div className={block()} {...rest}>
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
            />
            <Select
                className={block('filter')}
                multiple
                placeholder={'filter'}
                value={selectedPermissons}
                items={map(permissionList, (p) => ({value: p, text: format.ReadableField(p)}))}
                onUpdate={(value: string[]) => {
                    dispatch(
                        changeObjectPermissionsFilter({
                            objectPermissions: value as typeof selectedPermissons,
                        }),
                    );
                }}
                label={'Permissions'}
                maxVisibleValues={4}
                width="auto"
            />
        </div>
    );
}
