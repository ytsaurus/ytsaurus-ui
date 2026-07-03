import type {FavouritePath} from './normalizeFavourites';

export const isFavourite = (
    path: string,
    favourites: FavouritePath[] | undefined | null,
): boolean => {
    return (favourites ?? []).some(
        (item) => (typeof item === 'string' ? item : item.path) === path,
    );
};
