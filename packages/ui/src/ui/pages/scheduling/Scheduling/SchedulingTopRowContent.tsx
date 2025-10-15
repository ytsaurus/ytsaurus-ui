import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {Breadcrumbs, Flex, Key, Select} from '@gravity-ui/uikit';
import {useHistory} from 'react-router';
import some_ from 'lodash/some';

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
import {EditableBreadcrumbs} from '../../../components/EditableBreadcrumbs/EditableBreadcrumbs';
import CreatePoolButton from '../Instruments/CreatePoolDialog/CreatePoolDialog';

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
            <Flex grow={1} shrink={1} justifyContent={'space-between'} alignItems={'center'}>
                <SchedulingBreadcrumbs />
                <span className={block('actions')}>
                    {UIFactory.renderTopRowExtraControlsForPool({
                        itemClassName: block('extra-control'),
                        pool,
                        clusterUiConfig,
                    })}
                    <CreatePoolButton />
                </span>
            </Flex>
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
    const tree = useSelector(getTree);
    const cluster = useSelector(getCluster);
    const history = useHistory();
    const handleChangePool = (name: string | number) => {
        setTimeout(() => {
            dispatch(changePool(name.toString()));
            history.push(calcRootPathname(window.location.pathname, cluster));
        }, 0);
    };

    const items = React.useMemo(() => {
        return ['<Root>', ...bcItems.slice(1)].map((text, index) => {
            return (
                <Breadcrumbs.Item
                    href={calcRootPathname(window.location.pathname, cluster)}
                    key={`${JSON.stringify({text, index})}`}
                    onClick={(e) => e.preventDefault()}
                >
                    {text}
                </Breadcrumbs.Item>
            );
        });
    }, [bcItems, cluster, tree]);

    return (
        <EditableBreadcrumbs
            view={'top-row'}
            onAction={(key: Key) => {
                const {text: keyText} = JSON.parse(key as string);
                handleChangePool(keyText);
            }}
            className={block('breadcrumbs')}
            showRoot
            afterEditorContent={<CurrentPoolToClipboardButton />}
            renderEditor={(props) => <PoolsSuggest autoFocus onCancelEdit={props.onBlur} className={block('pool-suggest')} />}
        >
            {items}
        </EditableBreadcrumbs>
    );
}

function calcRootPathname(pathname: string, cluster: string) {
    // it is not allowed to stay on ACL and Monitor tabs for <Root> link
    const isAllowedTab = some_(SCHEDULING_ALLOWED_ROOT_TABS, (_v, tab) =>
        pathname.endsWith('/' + tab),
    );
    return isAllowedTab ? pathname : `/${cluster}/${Page.SCHEDULING}/${Tab.OVERVIEW}`;
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
                filterable={treeItems?.length <= 5}
                options={treeItems}
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
