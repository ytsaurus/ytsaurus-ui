import React from 'react';
import cn from 'bem-cn-lite';
import {updateEnableReplicatedTableTracker} from '../../../../store/actions/navigation/content/replicated-table';

import './ReplicatedTable.scss';
import TableMeta from '../Table/TableMeta/TableMeta';
import {useDispatch, useSelector} from 'react-redux';
import {getPath} from '../../../../store/selectors/navigation';

const block = cn('navigation-replicated-table');

export default function ReplicatedTableMeta() {
    const path = useSelector(getPath);
    const dispatch = useDispatch();

    const onEdit = (value?: boolean) => {
        return dispatch(
            updateEnableReplicatedTableTracker(path, value),
        ) as unknown as Promise<void>;
    };

    return (
        <div className={block()}>
            <TableMeta onEditEnableReplicatedTableTracker={onEdit} />
        </div>
    );
}
