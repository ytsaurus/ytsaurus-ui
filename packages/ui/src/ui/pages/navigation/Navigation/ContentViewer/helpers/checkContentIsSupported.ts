import getComponentByContentType from './getComponentByContentType';
import {Tab} from '../../../../../constants/navigation';
import getComponentByMode from './getComponentByMode';

export function checkContentIsSupported(type: string, mode: string) {
    if (mode === Tab.CONTENT) return Boolean(getComponentByContentType(type));
    return Boolean(getComponentByMode(mode));
}
