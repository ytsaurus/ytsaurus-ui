import React from 'react';
import _ from 'lodash';
import cn from 'bem-cn-lite';
import {useSelector} from 'react-redux';
import {getRecentPagesInfo, PageInfo} from '../../store/selectors/slideoutMenu';

import Link from '../../components/Link/Link';
import {makeRoutedURL} from '../../store/location';
import {Icon, List} from '@gravity-ui/uikit';
import {emptyPageIcon, PAGE_ICONS_BY_ID} from '../../constants/slideoutMenu';
import {isRecentPagesFirst} from '../../store/selectors/settings';

import './PagesPanel.scss';

const block = cn('pages-panel');

export default function PagesPanel({
    onItemClick,
    cluster,
}: {
    onItemClick: () => void;
    cluster?: string;
}) {
    const {all, recent, rest} = useSelector(getRecentPagesInfo);
    const isRecentFirst = useSelector(isRecentPagesFirst);

    const allFiltered = React.useMemo(() => {
        return _.sortBy(
            all.filter((item) => Boolean(PAGE_ICONS_BY_ID[item.id])),
            'name',
        );
    }, [all]);

    if (!cluster) {
        return null;
    }

    return isRecentFirst && (recent?.length || rest?.length) ? (
        <React.Fragment>
            <PagesList
                title={'Recent'}
                items={recent}
                cluster={cluster}
                onItemClick={onItemClick}
            />
            <PagesList title={'Other'} items={rest} cluster={cluster} onItemClick={onItemClick} />
        </React.Fragment>
    ) : (
        <React.Fragment>
            <PagesList items={allFiltered} cluster={cluster} onItemClick={onItemClick} />
        </React.Fragment>
    );
}

interface PagesListProps {
    title?: string;
    items: Array<PageInfo>;
    cluster: string;
    onItemClick: () => void;
}

function PagesList(props: PagesListProps) {
    const {title, items, cluster, onItemClick} = props;

    if (!items.length) {
        return null;
    }

    const {pathname} = window.location;

    const selectedItemIndex = _.findIndex(items, ({id}) => {
        const path = `/${cluster}/${id}`;
        return pathname.startsWith(path);
    });

    return (
        <div className={block('list')}>
            {title && <span className={block('list-title')}>{title}</span>}
            <List
                virtualized={false}
                className={block('list-list')}
                filterable={false}
                selectedItemIndex={selectedItemIndex}
                items={items}
                renderItem={({id, name}: PageInfo) => {
                    const url = makeRoutedURL(`/${cluster}/${id}`);
                    const icon = PAGE_ICONS_BY_ID[id] || emptyPageIcon;
                    return (
                        <Link
                            className={block('list-item-link')}
                            theme={'primary'}
                            url={url}
                            routed
                            onClick={onItemClick}
                        >
                            <div key={id} className={block('list-item')}>
                                <Icon className={block('list-item-icon')} data={icon} />
                                <span className={block('list-item-name')}>{name}</span>
                            </div>
                        </Link>
                    );
                }}
                itemHeight={40}
            />
        </div>
    );
}
