import React from 'react';
import cn from 'bem-cn-lite';

import {useDispatch, useSelector} from 'react-redux';
import {PageInfo, getPagesOrderedByUser} from '../../store/selectors/slideoutMenu';
import {Icon, List} from '@gravity-ui/uikit';
import {PAGE_ICONS_BY_ID} from '../../constants/slideoutMenu';
import {setPagesItemPosition, togglePinnedPage} from '../../store/actions/slideoutMenu';

import pinIcon from '../../../../img/svg/pin.svg';
import pinSolidIcon from '../../../../img/svg/pin-solid.svg';

import './PagesEditorPanel.scss';

const block = cn('pages-editor-panel');

export function PagesEditorPanel() {
    const pages = useSelector(getPagesOrderedByUser);

    const dispatch = useDispatch();

    const handleSort = React.useCallback(
        (data: {oldIndex: number; newIndex: number}) => {
            dispatch(setPagesItemPosition(data));
        },
        [dispatch, pages],
    );

    const handleClick = React.useCallback(
        (id: string) => {
            dispatch(togglePinnedPage(id));
        },
        [dispatch],
    );

    return (
        <List
            className={block()}
            itemClassName={block('list-item-container')}
            filterable={false}
            sortable={true}
            sortHandleAlign={'right'}
            items={pages}
            renderItem={(item) => <PagesEditorListItem {...item} onClick={handleClick} />}
            itemHeight={40}
            onSortEnd={handleSort}
            virtualized
        />
    );
}

function PagesEditorListItem(props: PageInfo & {pinned?: boolean; onClick: (id: string) => void}) {
    const {id, name, pinned, onClick} = props;

    const handleClick = React.useCallback(() => {
        onClick(id);
    }, [onClick, id]);

    return (
        <div className={block('list-item')}>
            <Icon className={block('icon')} data={PAGE_ICONS_BY_ID[id]} />
            <span className={block('name')}>{name}</span>
            <div className={block('pin-icon', {pinned})} onClick={handleClick}>
                <Icon data={pinned ? pinSolidIcon : pinIcon} />
            </div>
        </div>
    );
}
