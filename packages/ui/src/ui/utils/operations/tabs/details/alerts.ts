import {docsUrl} from '../../../../config';
import _ from 'lodash';
import UIFactory from '../../../../UIFactory';

export function prepareFaqUrl(type: string) {
    return docsUrl(UIFactory.docsUrls['faq:alert_type'] + type.replace(/_/g, ''));
}

export function prepareAlerts(alerts?: Record<string, unknown>) {
    if (alerts) {
        return _.map(alerts, (error, type) => ({
            error: error,
            helpURL: prepareFaqUrl(type),
        }));
    }

    return undefined;
}
