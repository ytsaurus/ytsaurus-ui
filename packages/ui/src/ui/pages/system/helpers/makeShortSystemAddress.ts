import {makeRegexpFromSettings} from '../../../../shared/utils';
import {uiSettings} from '../../../config/ui-settings';

const reShortNameFromSystemAddress = makeRegexpFromSettings(
    uiSettings.reShortNameFromSystemAddress,
);

export const makeShortSystemAddress = (address: string): string | undefined => {
    const res = reShortNameFromSystemAddress?.exec(address);
    return res?.groups?.shortname;
};
