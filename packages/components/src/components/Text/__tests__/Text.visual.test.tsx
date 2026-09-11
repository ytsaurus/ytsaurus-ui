import {type ReactElement} from 'react';

import {test} from '../../../../playwright-components/core';

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
import {
    type TextVisualCase,
    type TextVisualComponentName,
    textStoryFrameStyle,
    textVisualStoryCases,
} from '../textStorySetup';

const renderTextCase = <ComponentName extends TextVisualComponentName>(
    componentName: ComponentName,
    visualCase: TextVisualCase<ComponentName>,
): ReactElement => {
    switch (componentName) {
        case 'YTText': {
            const {props} = visualCase as TextVisualCase<'YTText'>;

            return <YTText {...props} />;
        }

        case 'Secondary': {
            const props = visualCase as TextVisualCase<'Secondary'>;

            return <Secondary {...props} />;
        }

        case 'Bold': {
            const {children} = visualCase as TextVisualCase<'Bold'>;

            return <Bold>{children}</Bold>;
        }

        case 'SecondaryBold': {
            const {children} = visualCase as TextVisualCase<'SecondaryBold'>;

            return <SecondaryBold>{children}</SecondaryBold>;
        }

        case 'Warning': {
            const {children} = visualCase as TextVisualCase<'Warning'>;

            return <Warning>{children}</Warning>;
        }

        case 'WarningLight': {
            const {children} = visualCase as TextVisualCase<'WarningLight'>;

            return <WarningLight>{children}</WarningLight>;
        }

        case 'NoWrap': {
            const {children} = visualCase as TextVisualCase<'NoWrap'>;

            return <NoWrap>{children}</NoWrap>;
        }

        case 'Escaped': {
            const {text} = visualCase as TextVisualCase<'Escaped'>;

            return <Escaped text={text} />;
        }

        default:
            throw new Error(`Unknown text component: ${componentName}`);
    }
};

for (const [componentName, componentCases] of Object.entries(textVisualStoryCases) as Array<
    [TextVisualComponentName, Record<string, TextVisualCase<TextVisualComponentName>>]
>) {
    for (const [caseId, caseData] of Object.entries(componentCases)) {
        test(`${componentName}: ${caseId}`, async ({mount, expectScreenshot}) => {
            const innerStyle = 'wrapperStyle' in caseData ? caseData.wrapperStyle : undefined;

            await mount(
                <div style={{...textStoryFrameStyle, ...innerStyle}}>
                    {renderTextCase(componentName, caseData)}
                </div>,
            );

            await expectScreenshot();
        });
    }
}
