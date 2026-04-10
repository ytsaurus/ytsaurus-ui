import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import {Hotkey} from './Hotkey';

type HotkeyStoryArgs = {
    keys: string;
    scope: string;
    preventDefault: boolean;
    onHotkey: () => void;
};

const meta = {
    title: 'Components/Hotkey',
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Registers shortcuts through `hotkeys-js`. Renders nothing; bindings are created in `componentDidMount` and removed in `componentWillUnmount`. The component also sets a global `key.filter` so shortcuts in `INPUT` / `TEXTAREA` / `SELECT` are ignored when the active scope is `all`. After changing `keys` or `scope` in Controls, the story remounts so listeners stay in sync.',
            },
        },
    },
    args: {
        keys: 'ctrl+a',
        scope: 'all',
        preventDefault: true,
        onHotkey: fn(),
    },
    argTypes: {
        keys: {
            control: 'text',
            description: 'hotkeys-js combination; use commas for several (e.g. `a, b`).',
        },
        scope: {
            control: 'text',
            description: 'Must match the active scope (`all` by default in hotkeys-js).',
        },
        preventDefault: {control: 'boolean'},
        onHotkey: {table: {disable: true}},
    },
    render: ({keys, scope, preventDefault, onHotkey}: HotkeyStoryArgs) => (
        <div
            style={{
                padding: 24,
                maxWidth: 440,
                lineHeight: 1.45,
            }}
        >
            <Hotkey
                key={`${keys}|${scope}|${String(preventDefault)}`}
                settings={[
                    {
                        keys,
                        scope,
                        preventDefault,
                        handler: () => {
                            onHotkey();
                        },
                    },
                ]}
            />
            <p style={{marginTop: 0}}>
                Click the preview (focus the document) and press <kbd>{keys}</kbd>.
            </p>
            <p
                style={{
                    marginBottom: 0,
                    fontSize: 13,
                    color: 'var(--g-color-text-secondary, #888)',
                }}
            >
                The handler is connected to the Storybook mock (Actions / test panel). With scope{' '}
                <code>all</code>, shortcuts do not fire while typing in form fields.
            </p>
        </div>
    ),
} satisfies Meta<HotkeyStoryArgs>;

export default meta;

type Story = StoryObj<HotkeyStoryArgs>;

export const Default: Story = {};
