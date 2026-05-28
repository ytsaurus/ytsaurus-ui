import React from 'react';
import {useHistory} from 'react-router';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import {Breadcrumbs, Flex, type Key, Select} from '@gravity-ui/uikit';
import some_ from 'lodash/some';

import ErrorBoundary from '../../../containers/ErrorBoundary/ErrorBoundary';
import {RowWithName} from '../../../containers/AppNavigation/TopRowContent/SectionName';
import Favourites from '../../../components/Favourites/Favourites';
import {PoolsSuggest} from '../PoolsSuggest/PoolsSuggest';
import {
    getCurrentPool,
    getCurrentPoolPath,
    getPool,
    getTree,
    getTreesSelectItems,
    selectSchedulingError,
} from '../../../store/selectors/scheduling/scheduling';
import {
    selectFavouritePools,
    selectIsActivePoolInFavourites,
} from '../../../store/selectors/favourites';
import {
    changePool,
    changeTree,
    togglePoolFavourites,
} from '../../../store/actions/scheduling/scheduling';

import {
    ROOT_POOL_NAME,
    SCHEDULING_ALLOWED_ROOT_TABS,
    SchedulingTab,
} from '../../../constants/scheduling';
import {ClipboardButton} from '@ytsaurus/components';
import {getSchedulingBreadcrumbItems} from '../../../store/selectors/scheduling/scheduling-ts';
import {Page} from '../../../constants';
import {EditableBreadcrumbs} from '../../../components/EditableBreadcrumbs/EditableBreadcrumbs';
import CreatePoolButton from '../Instruments/CreatePoolDialog/CreatePoolDialog';

import {selectCluster, selectClusterUiConfig} from '../../../store/selectors/global';
import {makeRoutedURL} from '../../../store/location';
import UIFactory from '../../../UIFactory';

import './SchedulingTopRowContent.scss';
import i18n from './i18n';

const block = cn('scheduling-top-row-content');

function SchedulingTopRowContent() {
    const pool = useSelector(getCurrentPool);
    const clusterUiConfig = useSelector(selectClusterUiConfig);

    return (
        <RowWithName page={Page.SCHEDULING} className={block()} urlParams={{pool: ''}}>
            <SchedulingFavourites />
            <SchedulingPhysicalTree />
            <Flex
                grow={1}
                shrink={1}
                justifyContent={'space-between'}
                alignItems={'center'}
                overflow="hidden"
            >
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
    const favouritesPools = useSelector(selectFavouritePools);
    const isActivePool = useSelector(selectIsActivePoolInFavourites);

    const onFavouriteClick = React.useCallback(
        ({path}: {path: string}) => {
            const [, pool, tree] = path.match(/(.+)\[(.+)]/)!;
            dispatch(changeTree(tree));
            dispatch(changePool(pool));
        },
        [dispatch],
    );
    const onFavouriteToggle = React.useCallback(
        () => dispatch(togglePoolFavourites(pool, tree)),
        [dispatch, pool, tree],
    );

    return (
        <Favourites
            className={block('favourites')}
            theme={'clear'}
            items={favouritesPools || []}
            isActive={isActivePool}
            onToggle={onFavouriteToggle}
            onItemClick={onFavouriteClick}
            toggleDisabled={ROOT_POOL_NAME === pool}
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
            hoverContent={i18n('context_shift-copy-full-path')}
        />
    );
}

function SchedulingBreadcrumbs() {
    const bcItems = useSelector(getSchedulingBreadcrumbItems);
    const dispatch = useDispatch();
    const history = useHistory();
    const tree = useSelector(getTree);
    const cluster = useSelector(selectCluster);
    const pool = useSelector(getPool);

    const error = useSelector(selectSchedulingError);

    const handleChangePool = (name: string | number) => {
        dispatch(changePool(name.toString()));
        const pathname = calcPathname(window.location.pathname, cluster, name.toString());
        history.push(makeRoutedURL(pathname, {tree, filter: ''}));
    };

    const items = React.useMemo(() => {
        const pathList = bcItems.filter((item) => item !== '<Root>');
        return ['<Root>', ...pathList].map((text, index) => {
            const pathname = calcPathname(window.location.pathname, cluster, text);
            return (
                <Breadcrumbs.Item
                    href={makeRoutedURL(pathname, {tree, pool: text, filter: ''})}
                    key={`${JSON.stringify({text, index})}`}
                    onClick={(e) => e.preventDefault()}
                >
                    {text}
                </Breadcrumbs.Item>
            );
        });
    }, [bcItems, cluster, tree, pool, error]);

    return (
        <EditableBreadcrumbs
            view={'top-row'}
            onAction={(key: Key) => {
                const {text: keyText} = JSON.parse(key as string);
                const isErrorPool = keyText === pool && error;
                if (!isErrorPool) {
                    handleChangePool(keyText);
                }
            }}
            className={block('breadcrumbs')}
            showRoot
            afterEditorContent={<CurrentPoolToClipboardButton />}
            renderEditor={(props) => (
                <PoolsSuggest
                    autoFocus
                    onCancelEdit={props.onBlur}
                    className={block('pool-suggest')}
                />
            )}
        >
            {items}
        </EditableBreadcrumbs>
    );
}

function calcPathname(pathname: string, cluster: string, pool?: string) {
    // it is not allowed to stay on ACL and Monitor tabs for <Root> link
    if (pool === '<Root>') {
        const isAllowedTab = some_(SCHEDULING_ALLOWED_ROOT_TABS, (_v, tab) =>
            pathname.endsWith('/' + tab),
        );
        return isAllowedTab ? pathname : `/${cluster}/${Page.SCHEDULING}/${SchedulingTab.OVERVIEW}`;
    }

    return pathname;
}

function SchedulingPhysicalTree() {
    const tree = useSelector(getTree);
    const treeItems = useSelector(getTreesSelectItems);
    const dispatch = useDispatch();

    const onChange = React.useCallback((tree: string) => dispatch(changeTree(tree)), [dispatch]);

    return (
        <div className={block('tree')}>
            <Select
                value={[tree]}
                filterable={treeItems?.length >= 5}
                options={treeItems}
                onUpdate={(vals) => onChange(vals[0])}
                className={block('path-tree')}
                placeholder={i18n('action_select-tree')}
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
