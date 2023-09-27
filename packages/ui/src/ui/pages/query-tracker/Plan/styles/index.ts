import {colord, extend} from 'colord';
import namesPlugin from 'colord/plugins/names';

extend([namesPlugin]);

export function getCSSPropertyValue(name: string, element = document.body) {
    const styles = getComputedStyle(element);
    return styles.getPropertyValue(name);
}

export function getHEXColor(color: string) {
    return colord(color).toHex();
}
