import {I18N, KeyData, KeysData} from '@gravity-ui/i18n';

export type AppLang = 'en' | 'ru';

export const i18n = new I18N({lang: 'en', fallbackLang: 'en'});

export function setLang(lang: string) {
    i18n.setLang(lang);
}

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
