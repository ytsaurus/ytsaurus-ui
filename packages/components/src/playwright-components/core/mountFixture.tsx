import React from 'react';
import type {MountFixture, PlaywrightFixture} from './types';

export const mountFixture: PlaywrightFixture<MountFixture> = async ({mount: baseMount}, use) => {
    const mount: MountFixture = async (component, options) => {
        return baseMount(
            <div
                style={{
                    padding: 20,
                    boxSizing: options?.width ? 'content-box' : undefined,
                    width: options?.width ? options.width : 'fit-content',
                    height: 'fit-content',
                    ...options?.rootStyle,
                }}
                className="playwright-wrapper-test"
            >
                <style>{'.g-button, .g-button::after { transform: scale(1) !important; }'}</style>
                {component}
            </div>,
            options,
        );
    };

    await use(mount);
};
