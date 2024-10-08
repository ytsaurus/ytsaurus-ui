import {getCSSPropertyValue, getHEXColor} from '../../styles';

export const getColor = (name: string) => {
    return getHEXColor(getCSSPropertyValue(name, document.body ?? undefined));
};
