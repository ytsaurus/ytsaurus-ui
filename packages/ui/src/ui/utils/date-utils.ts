/* eslint-disable no-restricted-imports */
import {settings} from '@gravity-ui/date-utils';
import {type Lang, getConfig} from '../i18n/configure';
export * from '@gravity-ui/date-utils';

export function loadDateLocale(lang: Lang) {
    return settings.loadLocale(lang).then(() => {
        // The UI language may have changed while this locale was loading.
        if (getConfig().lang === lang) {
            settings.setLocale(lang);
        }
    });
}
