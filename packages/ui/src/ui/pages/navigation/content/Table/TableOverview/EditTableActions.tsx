import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {getPath} from '../../../../../store/selectors/navigation';
import ypath from '../../../../../common/thor/ypath';

import './EditTableAction.scss';

import {getNavigationPathAttributes} from '../../../../../store/selectors/navigation/navigation';
import PathActions from '../../MapNode/PathActions';

const block = cn('edit-table-actions');

export default function EditTableActions() {
    const path = useSelector(getPath);
    const attributes = useSelector(getNavigationPathAttributes);

    return (
        <PathActions
            onlyDropdown={true}
            dropDownBtnClassName={block('button')}
            dropDownBtnTheme={'outlined'}
            dropDownBtnSize={'m'}
            item={{
                name: '',
                path,
                type: 'table',
                dynamic: ypath.getValue(attributes, '/dynamic'),
                tabletState: ypath.getValue(attributes, '/tablet_state'),
                $value: undefined,
                $attributes: attributes,
            }}
        />
    );
}
