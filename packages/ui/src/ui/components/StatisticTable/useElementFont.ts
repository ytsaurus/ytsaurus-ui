import {useEffect, useState} from 'react';

import {useSelector} from '../../store/redux-hooks';
import {selectFontType} from '../../store/selectors/global/fonts';

const getElementFont = (element: HTMLElement): string => {
    const {fontStyle, fontWeight, fontSize, fontFamily} = getComputedStyle(element);

    return `${fontStyle} ${fontWeight} ${fontSize} ${fontFamily}`;
};

export const useElementFont = (element: HTMLElement | null): string | undefined => {
    const [font, setFont] = useState<string>();
    const fontType = useSelector(selectFontType);

    useEffect(() => {
        if (!element) {
            return undefined;
        }

        let cancelled = false;

        const prepareFont = () => {
            const currentFont = getElementFont(element);

            const onFontSettled = () => {
                if (cancelled) {
                    return;
                }

                if (getElementFont(element) !== currentFont) {
                    prepareFont();
                } else {
                    setFont(currentFont);
                }
            };

            // A failed web font is rendered with its fallback, which still needs measuring.
            document.fonts.load(currentFont).then(onFontSettled, onFontSettled);
        };

        prepareFont();

        return () => {
            cancelled = true;
        };
    }, [element, fontType]);

    return font;
};
