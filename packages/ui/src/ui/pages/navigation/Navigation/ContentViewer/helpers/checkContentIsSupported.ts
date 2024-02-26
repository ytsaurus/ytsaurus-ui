import getComponentByMode from './getComponentByMode';
import getComponentByContentType from './getComponentByContentType';
import {Tab} from '../../../../../constants/navigation';

export default (type: string, mode: string) => {
    if (mode === Tab.CONTENT) return Boolean(getComponentByContentType(type));
    return Boolean(getComponentByMode(mode));
};
