import moment from 'moment';

import {configure} from '@gravity-ui/uikit';
import {I18N, KeyData, KeysData} from '@gravity-ui/i18n';

import type {AppLang} from '../../shared/constants/settings-types';

export const i18n = new I18N({lang: 'en', fallbackLang: 'en'});

configure({lang: 'en'});
ytSetLang('en');

export function ytSetLang(lang: AppLang) {
    i18n.setLang(lang);
    configure({lang});

    moment.updateLocale(lang, {
        week: {
            dow: 1,
        },
    });
}

/**
 * Add component's keysets data
 *
 * @param data - keysets data by languages
 * @param componentName - name of the component
 * @returns function to get keys' translations for current language
 *
 * @example
 * ```
 * import {addComponentKeysets} from '@gravity-ui/uikit/i18n';
 * import en from './en.json';
 * import ru from './ru.json';
 *
 * const t = addComponentKeysets({en, ru}, 'Alert');
 *
 * console.log(t('label_close')); // 'Close'
 * ```
 */
export function addI18Keysets<const T extends KeysData, const Name extends `yt:${string}`>(
    componentName: Name,
    data: Partial<Record<AppLang, T>>,
) {
    Object.entries(data).forEach(([lang, keys]) => i18n.registerKeyset(lang, componentName, keys));

    type TKey = Extract<keyof T, string>;
    const t = i18n.keyset<TKey>(componentName);

    return t as typeof t & {
        /**
         * Keyset data is used only for type inference, the value is always undefined.
         */
        keysetData: {[Key in Name]: Record<TKey, KeyData>};
    };
}
