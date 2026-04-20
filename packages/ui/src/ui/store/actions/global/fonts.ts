import {type ThunkAction} from 'redux-thunk';
import FontFaceObserver from 'fontfaceobserver';
import {selectFontFamilies} from '../../../store/selectors/global/fonts';
import {type RootState} from '../../../store/reducers';

// TODO: consider switching back for <link rel="preload"> once it's supported in all major browsers
export function waitForFontFamily(fontFamily: string) {
    return new FontFaceObserver(fontFamily).load(null, 10000);
}

export function waitForFontFamilies<T>(
    promiseToWrap: T,
): ThunkAction<Promise<T>, RootState, unknown, any> {
    return (_dispatch, getState) => {
        const fontFamilies = selectFontFamilies(getState());
        return Promise.all([
            waitForFontFamily(fontFamilies.regular),
            waitForFontFamily(fontFamilies.monospace),
        ]).then(() => {
            return promiseToWrap;
        });
    };
}
