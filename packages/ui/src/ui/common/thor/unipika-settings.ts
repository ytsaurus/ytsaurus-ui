import {Settings} from '../../components/Yson/StructuredYson/StructuredYsonTypes';
import {uiSettings} from '../../config';
import {rumLogError} from '../../rum/rum-counter';

const {reUnipikaAllowTaggedSources = []} = uiSettings;

let res: undefined | Pick<Settings, 'validateSrcUrl'>;

export function getUnipikaSettingsFromConfig() {
    if (res) {
        return res;
    }

    const allowedRegexps: Array<RegExp> = reUnipikaAllowTaggedSources.reduce((acc, item, index) => {
        try {
            acc.push(new RegExp(item));
        } catch (error: any) {
            rumLogError(
                {
                    message: `failed to create RegExp insatnce from reUnipikaAllowTaggedSources[${index}] = '${item}'`,
                },
                error,
            );
        }
        return acc;
    }, [] as Array<RegExp>);

    res = {
        validateSrcUrl(url: string) {
            return allowedRegexps.some((re) => re.test(url));
        },
    };
    return res;
}
