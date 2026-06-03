import cn from 'bem-cn-lite';
import React from 'react';
import ypath from '../../../../common/thor/ypath';
import {useSelector} from '../../../../store/redux-hooks';
import {selectPath} from '../../../../store/selectors/navigation';
import {selectNavigationPathAttributes} from '../../../../store/selectors/navigation/navigation';
import PathActions from '../../content/MapNode/PathActions';

const block = cn('current-path-actions');

export function CurrentPathActions({className}: {className?: string}) {
    const path = useSelector(selectPath);
    const attributes = useSelector(selectNavigationPathAttributes);
    const type = ypath.getValue(attributes, '/type');

    return (
        <PathActions
            onlyDropdown={true}
            dropDownBtnClassName={block(null, className)}
            dropDownBtnTheme={'outlined'}
            dropDownBtnSize={'m'}
            item={{
                name: '',
                path,
                type,
                dynamic: ypath.getValue(attributes, '/dynamic'),
                tabletState: ypath.getValue(attributes, '/tablet_state'),
                $value: undefined,
                $attributes: attributes,
            }}
        />
    );
}
