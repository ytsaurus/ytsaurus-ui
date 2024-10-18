import {makeRegexpFromSettings} from '../../../../shared/utils';
import {uiSettings} from '../../../config/ui-settings';

const reShortNameSystemPage = makeRegexpFromSettings(uiSettings.reShortNameSystemPage);

export const makeShortSystemAddress = (address: string): string | undefined => {
    const res = reShortNameSystemPage?.exec(address);
    return res?.groups?.shortname;
};
