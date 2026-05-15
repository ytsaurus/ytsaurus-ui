import React from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import cn from 'bem-cn-lite';

import {selectPath} from '../../../../../store/selectors/navigation';
import ypath from '../../../../../common/thor/ypath';

import './EditTableAction.scss';

import {selectNavigationPathAttributes} from '../../../../../store/selectors/navigation/navigation';
import PathActions from '../../MapNode/PathActions';

const block = cn('edit-table-actions');

export default function EditTableActions() {
    const path = useSelector(selectPath);
    const attributes = useSelector(selectNavigationPathAttributes);

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
