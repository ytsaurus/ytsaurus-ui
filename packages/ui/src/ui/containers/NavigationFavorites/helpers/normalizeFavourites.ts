import type {FavouritesItem} from '../../../components/Favourites/Favourites';

export type FavouritePath = string | FavouritesItem;

export const normalizeFavourites = (
    favourites: FavouritePath[] | undefined | null,
): FavouritesItem[] => {
    return (favourites ?? []).map((item) => (typeof item === 'string' ? {path: item} : item));
};
