import React from 'react';
import type {MountFixture, PlaywrightFixture} from './types';

export const MOCK_DATE = '2025-07-20T10:00:00';

export const mountFixture: PlaywrightFixture<MountFixture> = async (
    {mount: baseMount, page},
    use,
) => {
    const mount: MountFixture = async (component, options) => {
        await page.clock.setFixedTime(MOCK_DATE);
        return baseMount(
            <div
                style={{
                    padding: 20,
                    // When we set width we didn't expect that paddings for better screenshots would be included
                    boxSizing: options?.width ? 'content-box' : undefined,
                    width: options?.width ? options.width : 'fit-content',
                    height: 'fit-content',
                    ...options?.rootStyle,
                }}
                className="playwright-wrapper-test"
            >
                {/* Do not scale buttons while clicking. Floating UI might position its elements differently in every test run. */}
                <style>{'.g-button, .g-button::after { transform: scale(1) !important; }'}</style>
                {component}
            </div>,
            options,
        );
    };

    await use(mount);
};
