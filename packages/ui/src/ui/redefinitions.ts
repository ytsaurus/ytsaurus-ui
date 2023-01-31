// peer-dependency for infra-news-popup

import {configure} from '@gravity-ui/uikit';

configure({lang: 'en'});

import {I18N} from '@gravity-ui/i18n';

const i18n = new I18N();

i18n.setLang('en');

// Update locale settings
import moment from 'moment';

moment.updateLocale('en', {
    week: {
        dow: 1,
    },
});
