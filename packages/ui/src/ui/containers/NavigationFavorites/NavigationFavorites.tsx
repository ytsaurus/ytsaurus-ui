import React, {type FC, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {selectSettingsData} from '../../store/selectors/settings/settings-base';
import {navigationToggleFavourite} from '../../store/actions/favourites';
import Favourites, {type FavouritesItem} from '../../components/Favourites/Favourites';
import {normalizeFavourites} from './helpers/normalizeFavourites';
import {isFavourite} from './helpers/isFavourite';

export type NavigationFavoritesProps = {
    path: string;
    cluster: string;
    onItemClick: (item: FavouritesItem) => void;
};

export const NavigationFavorites: FC<NavigationFavoritesProps> = ({path, cluster, onItemClick}) => {
    const dispatch = useDispatch();
    const settingsData = useSelector(selectSettingsData);

    const favouriteItems = useMemo(() => {
        if (!cluster) return [];
        const items = settingsData[`local::${cluster}::favourites`] || [];

        return normalizeFavourites(items).sort((a, b) => a.path.localeCompare(b.path));
    }, [settingsData, cluster]);

    const isActive = isFavourite(path, favouriteItems);

    const handleToggle = useCallback(() => {
        dispatch(navigationToggleFavourite(path, cluster));
    }, [dispatch, path, cluster]);

    return (
        <Favourites
            theme="clear"
            isActive={isActive}
            items={favouriteItems}
            onItemClick={onItemClick}
            onToggle={handleToggle}
        />
    );
};
