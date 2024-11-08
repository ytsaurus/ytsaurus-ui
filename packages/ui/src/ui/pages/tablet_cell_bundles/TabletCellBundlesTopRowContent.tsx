import React from 'react';
import {useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import {Breadcrumbs, BreadcrumbsItem} from '../../components/Breadcrumbs';
import {useHistory} from 'react-router';

import Favourites, {FavouritesItem} from '../../components/Favourites/Favourites';
import {Page} from '../../constants/index';
import {TabletsTab} from '../../constants/tablets';
import {RowWithName} from '../../containers/AppNavigation/TopRowContent/SectionName';
import {getCluster, getClusterUiConfig} from '../../store/selectors/global';
import type {TabletsCellBundlesBreadcrumbsItem} from '../../store/selectors/tablet_cell_bundles';
import type {ValueOf} from '../../types';

import './TabletCellBundlesTopRowContent.scss';
import {getAppBrowserHistory} from '../../store/window-store';
import UIFactory from '../../UIFactory';
import {TabletBundle} from '../../store/reducers/tablet_cell_bundles';

const block = cn('tablet-cell-bundles-top-row-content');

export interface PropsFromRedux {
    isActiveBundleInFavourites: boolean;
    activeBundle: string;
    activeBundleData?: TabletBundle;
    bcItems: TabletsCellBundlesBreadcrumbsItem[];
    page: ValueOf<typeof Page>;
    setActiveBundle(activeBundle: string): void;
    favourites: Array<FavouritesItem>;
    toggleFavourite(bundle: string): void;
}

function TabletCellBundlesTopRowContent({
    isActiveBundleInFavourites,
    favourites,
    toggleFavourite,
    activeBundle,
    activeBundleData,
    bcItems,
    page,
    setActiveBundle,
}: PropsFromRedux) {
    const clusterUiConfig = useSelector(getClusterUiConfig);

    return (
        <RowWithName page={page} urlParams={{activeBundle: ''}}>
            <BundleFavourites
                isActiveBundleInFavourites={isActiveBundleInFavourites}
                activeBundle={activeBundle}
                page={page}
                setActiveBundle={setActiveBundle}
                items={favourites}
                toggleFavourite={toggleFavourite}
            />
            <BundleBreadcrumbs
                className={block('breadcrumbs')}
                bcItems={bcItems}
                setActiveBundle={setActiveBundle}
            />
            {UIFactory.renderTopRowExtraControlsForBundle({
                itemClassName: block('extra-control'),
                clusterUiConfig,
                bundle: activeBundleData,
            })}
        </RowWithName>
    );
}

interface BundleFavouritesProps {
    isActiveBundleInFavourites: boolean;
    activeBundle: string;
    page: ValueOf<typeof Page>;
    setActiveBundle(activeBundle: string): void;
    toggleFavourite(bundle: string): void;
    items: Array<FavouritesItem>;
}

function BundleFavourites({
    isActiveBundleInFavourites,
    items,
    activeBundle,
    page,
    setActiveBundle,
    toggleFavourite,
}: BundleFavouritesProps) {
    const cluster = useSelector(getCluster);

    const handleFavouriteItemClick = React.useCallback(
        (item: FavouritesItem) => {
            setActiveBundle(item.path);
            if (!item.path) {
                getAppBrowserHistory().push(`/${cluster}/${page}`);
            } else {
                getAppBrowserHistory().push(
                    `/${cluster}/${page}/${TabletsTab.TABLET_CELLS}?activeBundle=${item.path}`,
                );
            }
        },
        [cluster, setActiveBundle],
    );

    const handleFavouriteToggle = React.useCallback(() => {
        toggleFavourite(activeBundle);
    }, [toggleFavourite]);

    return (
        <Favourites
            className={block('favourites')}
            isActive={isActiveBundleInFavourites}
            items={items}
            onItemClick={handleFavouriteItemClick}
            onToggle={handleFavouriteToggle}
            toggleDisabled={!activeBundle}
            theme={'clear'}
        />
    );
}

interface BundleBreadcrumbsProps {
    className: string;
    bcItems: TabletsCellBundlesBreadcrumbsItem[];
    setActiveBundle(activeBundle: string): void;
}

function BundleBreadcrumbs({className, bcItems, setActiveBundle}: BundleBreadcrumbsProps) {
    const history = useHistory();

    const handleItemClick = React.useCallback(
        (item: string | number) => {
            setActiveBundle(item.toString());
        },
        [setActiveBundle],
    );

    const items = React.useMemo(() => {
        return bcItems.map((item) => {
            const text = item.text || item.title || '';
            return (
                <BreadcrumbsItem key={text} href={item.href}>
                    {text}
                </BreadcrumbsItem>
            );
        });
    }, [bcItems]);

    return (
        <Breadcrumbs
            navigate={history.push}
            onAction={handleItemClick}
            className={className}
            showRoot
        >
            {items}
        </Breadcrumbs>
    );
}

export default TabletCellBundlesTopRowContent;
