import {useEffect, useMemo, useState} from 'react';

import {ytSetLang} from '../i18n';
import {type Lang, getConfig} from '../i18n/configure';
import {rumLogError} from '../rum/rum-counter';
import {settings as dateSettings, loadDateLocale} from '../utils/date-utils';
import i18n from '../utils/i18n';
import {wrapApiPromiseByToaster} from '../utils/utils';

export function useI18nLang(lang: Lang) {
    const [dateLocale, setDateLocale] = useState(() => dateSettings.getLocale());

    useMemo(() => {
        ytSetLang(lang);
    }, [lang]);

    useEffect(() => {
        let cancelled = false;

        const isStale = () => cancelled || getConfig().lang !== lang;

        wrapApiPromiseByToaster(loadDateLocale(lang), {
            toasterName: 'date-locales',
            skipSuccessToast: true,
            skipErrorFn: isStale,
            errorTitle: i18n('alert_load-date-locales'),
            errorContent: (error) => error.message,
        })
            .then(() => {
                if (!isStale()) {
                    setDateLocale(lang);
                }
            })
            .catch((error: Error) => {
                if (!isStale()) {
                    rumLogError({message: 'Failed to load date locales', level: 'warn'}, error);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [lang]);

    return {locale: lang, dateLocale};
}
