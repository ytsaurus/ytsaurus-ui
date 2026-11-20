import {whenDocsEnabled} from '../../../../config';

import map_ from 'lodash/map';

import UIFactory from '../../../../UIFactory';

export function prepareFaqUrl(type: string) {
    return whenDocsEnabled(UIFactory.docsUrls['faq'] + '#' + type.replace(/_/g, ''));
}

export function prepareAlerts(alerts?: Record<string, unknown>) {
    if (alerts) {
        return map_(alerts, (error, type) => ({
            error,
            helpURL: prepareFaqUrl(type),
        }));
    }

    return undefined;
}
