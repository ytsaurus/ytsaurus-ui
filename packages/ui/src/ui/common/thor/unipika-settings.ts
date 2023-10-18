import {createSelector} from 'reselect';
import {uiSettings} from '../../config';
import {rumLogError} from '../../rum/rum-counter';
import {Settings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';

const makeValidateSrcUrl = createSelector(
    [(_v: {}) => uiSettings.reUnipikaAllowTaggedSources],
    (sourcesRegExps = []) => {
        const allowedRegexps = sourcesRegExps.reduce((acc, item, index) => {
            try {
                acc.push(new RegExp(item));
            } catch (error: any) {
                rumLogError(
                    {
                        message: `failed to create RegExp instance from reUnipikaAllowTaggedSources[${index}] = '${item}'`,
                    },
                    error,
                );
            }
            return acc;
        }, [] as Array<RegExp>);

        return function validateSrcUrl(url: string) {
            return allowedRegexps.some((re) => re.test(url));
        };
    },
);

const makeNormalizeUrl = createSelector(
    [(_v: {}) => uiSettings.hideReferrerUrl],
    (hideReferrerUrl) => {
        if (!hideReferrerUrl) {
            return undefined;
        }
        return function normalizeUrl(url?: string) {
            return `${hideReferrerUrl}?${encodeURIComponent(url!)}`;
        };
    },
);

export function getUnipikaSettingsFromConfig(): Partial<Settings> {
    return {
        validateSrcUrl: makeValidateSrcUrl({}),
        normalizeUrl: makeNormalizeUrl({}),
    };
}
