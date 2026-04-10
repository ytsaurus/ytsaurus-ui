import {type ReactElement} from 'react';

import {test} from '../../../playwright-components/core';

import {
    Bold,
    Escaped,
    NoWrap,
    Secondary,
    SecondaryBold,
    Warning,
    WarningLight,
    YTText,
} from '../Text';
import {type TextVisualCase, textStoryFrameStyle, textVisualStoryCases} from '../textStorySetup';

const renderTextCase = (c: TextVisualCase): ReactElement => {
    switch (c.kind) {
        case 'yt-text':
            return <YTText {...c.props} />;
        case 'Secondary':
            return <Secondary disabled={c.disabled}>{c.children}</Secondary>;
        case 'Bold':
            return <Bold>{c.children}</Bold>;
        case 'SecondaryBold':
            return <SecondaryBold>{c.children}</SecondaryBold>;
        case 'Warning':
            return <Warning>{c.children}</Warning>;
        case 'WarningLight':
            return <WarningLight>{c.children}</WarningLight>;
        case 'NoWrap':
            return <NoWrap>{c.children}</NoWrap>;
        case 'Escaped':
            return <Escaped text={c.text} />;
        default: {
            const _exhaustive: never = c;
            return _exhaustive;
        }
    }
};

for (const storyCase of textVisualStoryCases) {
    test(`Text: ${storyCase.id}`, async ({mount, expectScreenshot}) => {
        const innerStyle = storyCase.kind === 'yt-text' ? storyCase.wrapperStyle : undefined;
        await mount(
            <div style={{...textStoryFrameStyle, ...innerStyle}}>{renderTextCase(storyCase)}</div>,
        );
        await expectScreenshot();
    });
}
