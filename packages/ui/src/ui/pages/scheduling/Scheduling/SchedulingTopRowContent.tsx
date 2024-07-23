import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import map_ from 'lodash/map';
import some_ from 'lodash/some';

import {Breadcrumbs, BreadcrumbsItem} from '@gravity-ui/uikit';

import ErrorBoundary from '../../../components/ErrorBoundary/ErrorBoundary';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import Favourites from '../../../components/Favourites/Favourites';
import {PoolsSuggest} from '../PoolsSuggest/PoolsSuggest';
import {
    getCurrentPool,
    getCurrentPoolPath,
    getPool,
    getTree,
    getTreesSelectItems,
} from '../../../store/selectors/scheduling/scheduling';
import {getFavouritePools, isActivePoolInFavourites} from '../../../store/selectors/favourites';
import {
    changePool,
    changeTree,
    togglePoolFavourites,
} from '../../../store/actions/scheduling/scheduling';

import {ROOT_POOL_NAME, SCHEDULING_ALLOWED_ROOT_TABS, Tab} from '../../../constants/scheduling';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {getSchedulingBreadcrumbItems} from '../../../store/selectors/scheduling/scheduling-ts';
import {Page} from '../../../constants';
import Link from '../../../components/Link/Link';
import {EditButton} from '../../../components/EditableAsText/EditableAsText';
import Select from '../../../components/Select/Select';
import CreatePoolButton from '../Instruments/CreatePoolDialog/CreatePoolDialog';

import {makeRoutedURL} from '../../../store/location';
import {getCluster, getClusterUiConfig} from '../../../store/selectors/global';
import UIFactory from '../../../UIFactory';

import './SchedulingTopRowContent.scss';

const block = cn('scheduling-top-row-content');

function SchedulingTopRowContent() {
    const pool = useSelector(getCurrentPool);
    const clusterUiConfig = useSelector(getClusterUiConfig);

    return (
        <RowWithName page={Page.SCHEDULING} className={block()} urlParams={{pool: ''}}>
            <SchedulingFavourites />
            <SchedulingPhysicalTree />
            <EditableSchedulingBreadcrumbs />
            <span className={block('actions')}>
                {UIFactory.renderTopRowExtraControlsForPool({
                    itemClassName: block('extra-control'),
                    pool,
                    clusterUiConfig,
                })}
                <CreatePoolButton />
            </span>
        </RowWithName>
    );
}

function SchedulingFavourites() {
    const tree = useSelector(getTree);
    const dispatch = useDispatch();
    const pool = useSelector(getPool);
    const favouritesPools = useSelector(getFavouritePools);
    const isActivePool = useSelector(isActivePoolInFavourites);

    const onFavouriteClick = React.useCallback(
        ({path}: {path: string}) => {
            const [, pool, tree] = path.match(/(.+)\[(.+)]/)!;
            dispatch(changePool(pool));
            dispatch(changeTree(tree));
        },
        [dispatch],
    );
    const onFavouriteToggle = React.useCallback(
        () => dispatch(togglePoolFavourites(pool, tree)),
        [dispatch, pool, tree],
    );

    const currentPool = useSelector(getPool);

    return (
        <Favourites
            className={block('favourites')}
            theme={'clear'}
            items={favouritesPools || []}
            isActive={isActivePool}
            onToggle={onFavouriteToggle}
            onItemClick={onFavouriteClick}
            toggleDisabled={ROOT_POOL_NAME === currentPool}
        />
    );
}

function CurrentPoolToClipboardButton() {
    const currentPool = useSelector(getPool);
    const currentPoolPath = useSelector(getCurrentPoolPath);

    return (
        <ClipboardButton
            className={block('clipboard')}
            text={currentPool}
            shiftText={currentPoolPath}
            hoverContent={'Hold SHIFT-key to copy full path'}
        />
    );
}

function SchedulingBreadcrumbs() {
    const bcItems = useSelector(getSchedulingBreadcrumbItems);
    const dispatch = useDispatch();

    const items = React.useMemo(() => {
        // @ts-ignore
        const restItems = map_(bcItems.slice(1), (name) => {
            return {
                text: name,
                action: () => {
                    dispatch(changePool(name));
                },
            };
        });
        return [
            {
                text: '<Scheduler>',
                action: () => {
                    dispatch(changePool('<Root>'));
                },
            },
            ...restItems,
        ];
    }, [bcItems]);

    const renderItem = React.useCallback((item: BreadcrumbsItem, isCurrent: boolean) => {
        return <BreadcrumbLink isCurrent={isCurrent} title={item.text} pool={item.text} />;
    }, []);

    return (
        <Breadcrumbs
            className={block('breadcrumbs')}
            items={items}
            lastDisplayedItemsCount={2}
            firstDisplayedItemsCount={1}
            renderItemContent={renderItem}
            renderRootContent={renderEmpty}
        />
    );
}

function renderEmpty(_: unknown, isCurrent: boolean) {
    return <BreadcrumbLink isCurrent={isCurrent} title={'<Root>'} pool={''} />;
}

interface LinkProps {
    isCurrent: boolean;
    title: string;
    pool: string;
}

function BreadcrumbLink(props: LinkProps) {
    const tree = useSelector(getTree);
    const cluster = useSelector(getCluster);
    const {isCurrent, title, pool} = props;

    const pathname = pool
        ? window.location.pathname
        : calcRootPathname(window.location.pathname, cluster);
    const url = makeRoutedURL(pathname, {tree, pool, filter: ''});
    return (
        <Link
            className={block('breadcrumbs-link', {current: isCurrent})}
            theme={'ghost'}
            routed
            url={url}
        >
            {title}
        </Link>
    );
}

function calcRootPathname(pathname: string, cluster: string) {
    // it is not allowed to stay on ACL and Monitor tabs for <Root> link
    const isAllowedTab = some_(SCHEDULING_ALLOWED_ROOT_TABS, (_v, tab) =>
        pathname.endsWith('/' + tab),
    );
    return isAllowedTab ? pathname : `/${cluster}/${Page.SCHEDULING}/${Tab.OVERVIEW}`;
}

function EditableSchedulingBreadcrumbs() {
    const [editMode, setEditMode] = React.useState(false);
    const toggleEdit = React.useCallback(() => {
        setEditMode(!editMode);
    }, [editMode, setEditMode]);

    return (
        <div className={block('editable-breadcrumbs', {edit: editMode})}>
            {editMode ? (
                <PoolsSuggest autoFocus onCancelEdit={toggleEdit} />
            ) : (
                <React.Fragment>
                    <SchedulingBreadcrumbs />
                    <EditButton onClick={toggleEdit} />
                    <div className={block('btn-spacer')} />
                    <CurrentPoolToClipboardButton />
                </React.Fragment>
            )}
        </div>
    );
}

function SchedulingPhysicalTree() {
    const tree = useSelector(getTree);
    const treeItems = useSelector(getTreesSelectItems);
    const dispatch = useDispatch();

    const onChange = React.useCallback((tree: unknown) => dispatch(changeTree(tree)), [dispatch]);

    return (
        <div className={block('tree')}>
            <Select
                value={[tree]}
                hideFilter={treeItems?.length <= 5}
                items={treeItems}
                onUpdate={(vals) => onChange(vals[0])}
                className={block('path-tree')}
                placeholder="Select tree..."
                width="max"
            />
        </div>
    );
}

const SchedulingTopRowContentMemo = React.memo(SchedulingTopRowContent);

export default function SchedulingTopRowContentWithError() {
    return (
        <ErrorBoundary compact>
            <SchedulingTopRowContentMemo />
        </ErrorBoundary>
    );
}
