/* eslint-disable no-restricted-imports */
import {settings} from '@gravity-ui/date-utils';
import {subscribeConfigure} from '../i18n/configure';
export * from '@gravity-ui/date-utils';

settings.loadLocale('ru');
settings.loadLocale('en');

subscribeConfigure((config) => {
    if (config?.lang) {
        settings.loadLocale(config.lang);
    }
});
