import {colord, extend} from 'colord';
import namesPlugin from 'colord/plugins/names';

extend([namesPlugin]);

type Options<T extends boolean | undefined> = {
    container?: HTMLElement | null;
} & AllowUndefined<T>;

type AllowUndefined<T> = T extends boolean ? {allowUndefined: T} : {allowUndefined?: undefined};

type Result<R, T> = T extends {allowUndefined: true} ? R | undefined : R;

export function getCSSPropertyValue(name: string, element = document.body) {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue(name);
}

export function getHEXColor<O extends undefined | Options<boolean | undefined> = undefined>(
    color: string,
    options?: O,
): Result<string, typeof options> {
    if (!color && options?.allowUndefined) {
        return undefined as any;
    }
    return colord(color).toHex() as any;
}

export function getCssColor<O extends undefined | Options<boolean | undefined> = undefined>(
    name: string,
    options?: O,
) {
    return getHEXColor(getCSSPropertyValue(name, document.body ?? options?.container), options);
}
