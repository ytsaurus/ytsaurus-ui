/** @jest-environment jsdom */
import React from 'react';
import {act, fireEvent, render, screen, waitFor, within} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';

import type {FlowKeyColumn} from '../../../../../../shared/yt-types';

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(global as unknown as {ResizeObserver: unknown}).ResizeObserver = ResizeObserverStub;

window.matchMedia = (() => ({
    matches: false,
    addEventListener: () => {},
    removeEventListener: () => {},
})) as unknown as typeof window.matchMedia;

jest.mock('@ytsaurus/components', () => ({
    YTText: ({children}: {children: React.ReactNode}) => <span>{children}</span>,
    setLang: () => {},
}));
jest.mock('../../../../../containers/Block/Block', () => ({
    YTErrorBlock: () => null,
}));
jest.mock('./i18n', () => ({
    __esModule: true,
    default: (key: string) => key,
}));

import {FlowStateKeyBuilder} from './FlowStateKeyBuilder';
import {FlowStateKeyDialog, getKeyFieldId} from './FlowStateKeyDialog';
import {formatRawKeyDraft, parseRawKeyDraft} from '../state-filters';

const stringColumns: Array<FlowKeyColumn> = [
    {name: 'first', type: 'string'},
    {name: 'second', type: 'string'},
    {name: 'third', type: 'string'},
];

describe('raw key parsing', () => {
    it('accepts empty input as an all-empty key', () => {
        expect(parseRawKeyDraft('', stringColumns)).toEqual({
            values: {first: '', second: '', third: ''},
        });
    });

    it('preserves quoted semicolons and escaped quotes', () => {
        expect(parseRawKeyDraft('["foo;bar"; "say \\"hello\\""; "baz"]', stringColumns)).toEqual({
            values: {first: 'foo;bar', second: 'say "hello"', third: 'baz'},
        });
    });

    it.each(['foo; bar; baz', '[foo; [bar]; baz]', '[foo; {bar}; baz]', '[foo; <bar>; baz]'])(
        'rejects malformed or nested input %s',
        (raw) => {
            expect(parseRawKeyDraft(raw, stringColumns)).toEqual({
                error: {errorKey: 'validation_invalid-key-syntax'},
            });
        },
    );

    it('rejects the wrong arity', () => {
        expect(parseRawKeyDraft('[foo; bar]', stringColumns)).toEqual({
            error: {
                errorKey: 'validation_key-arity',
                params: {expected: '3'},
            },
        });
    });

    it('accepts identifier-form string tokens', () => {
        expect(parseRawKeyDraft('[foo; bar; baz]', stringColumns)).toEqual({
            values: {first: 'foo', second: 'bar', third: 'baz'},
        });
        expect(parseRawKeyDraft('[foo_bar; a-b; a.b]', stringColumns)).toEqual({
            values: {first: 'foo_bar', second: 'a-b', third: 'a.b'},
        });
    });

    it.each(['true', 'NaN', 'Infinity'])('accepts identifier-like string token %s', (value) => {
        expect(parseRawKeyDraft(`[${value}]`, [{name: 'key', type: 'string'}])).toEqual({
            values: {key: value},
        });
    });

    it('rejects an identifier token for an integer column', () => {
        expect(parseRawKeyDraft('[foo]', [{name: 'key', type: 'int64'}])).toEqual({
            error: {errorKey: 'validation_invalid-key-syntax'},
        });
    });

    it.each(['["foo"; ; "baz"]', '[foo; ; baz]'])('reports partial emptiness for %s', (raw) => {
        expect(parseRawKeyDraft(raw, stringColumns)).toEqual({
            error: {errorKey: 'validation_fill-all-keys'},
        });
    });

    it('reports malformed nonblank syntax before partial emptiness', () => {
        expect(parseRawKeyDraft('[01; ; baz]', stringColumns)).toEqual({
            error: {errorKey: 'validation_invalid-key-syntax'},
        });
    });

    it('rejects an all-blank bracket list', () => {
        expect(parseRawKeyDraft('[; ;]', stringColumns)).toEqual({
            error: {errorKey: 'validation_invalid-key-syntax'},
        });
    });

    it('accepts whitespace-only input as an all-empty key', () => {
        expect(parseRawKeyDraft('   ', stringColumns)).toEqual({
            values: {first: '', second: '', third: ''},
        });
    });

    it.each([
        ['["foo"]', {name: 'key', type: 'string'}, 'foo'],
        ['[42]', {name: 'key', type: 'int64'}, '42'],
        ['[42u]', {name: 'key', type: 'uint64'}, '42'],
        ['[1.5e2]', {name: 'key', type: 'double'}, '1.5e2'],
        ['[%true]', {name: 'key', type: 'boolean'}, 'true'],
    ] as const)('parses canonical token %s', (raw, column, value) => {
        expect(parseRawKeyDraft(raw, [column])).toEqual({values: {key: value}});
    });

    it.each(['[]', '[ ]', '[01]', '[0x10]', '[#]', '[["nested"]]', '["foo", "bar", "baz"]'])(
        'rejects noncanonical token list %s',
        (raw) => {
            expect(parseRawKeyDraft(raw, [{name: 'key', type: 'string'}]).error).toBeDefined();
        },
    );

    it.each([
        ['["42"]', 'int64'],
        ['["42"]', 'uint64'],
        ['["1.5"]', 'double'],
        ['["true"]', 'boolean'],
        ['[42]', 'uint64'],
        ['[true]', 'boolean'],
        ['[NaN]', 'double'],
        ['[Infinity]', 'double'],
    ])('rejects schema-compatible noncanonical token %s for %s', (raw, type) => {
        expect(parseRawKeyDraft(raw, [{name: 'key', type}])).toEqual({
            error: {errorKey: 'validation_invalid-key-syntax'},
        });
    });

    it('treats a quoted empty string as present and validates it', () => {
        expect(parseRawKeyDraft('[""]', [{name: 'key', type: 'string'}])).toEqual({
            error: {errorKey: 'validation_empty-key-value', params: {name: 'key'}},
        });
    });

    it('formats and round trips the canonical typed subset', () => {
        const columns: Array<FlowKeyColumn> = [
            {name: 'text', type: 'string'},
            {name: 'signed', type: 'int64'},
            {name: 'unsigned', type: 'uint64'},
            {name: 'fraction', type: 'double'},
            {name: 'enabled', type: 'boolean'},
        ];
        const values = {
            text: 'foo; "bar"',
            signed: '42',
            unsigned: '42',
            fraction: '1.5e2',
            enabled: 'true',
        };
        const formatted = formatRawKeyDraft(columns, values);

        expect(formatted).toBe('["foo; \\"bar\\""; 42; 42u; 1.5e2; %true]');
        expect(parseRawKeyDraft(formatted, columns)).toEqual({values});
    });
});

describe('FlowStateKeyBuilder', () => {
    it('opens typed key editing from an icon-only named launcher', async () => {
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={() => {}} />
            </ThemeProvider>,
        );

        const launcher = screen.getByRole('button', {name: 'action_edit-key-fields'});
        expect(launcher.querySelector('svg')).not.toBeNull();
        expect(launcher.textContent).toBe('');
        fireEvent.click(launcher);

        expect(await screen.findByRole('dialog', {name: 'title_edit-key-fields'})).not.toBeNull();
    });

    it('keeps an invalid raw draft visible without changing filters', () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );

        const raw = screen.getByPlaceholderText('[first; second; third]');
        fireEvent.change(raw, {target: {value: '[only; two]'}});

        expect((raw as HTMLInputElement).value).toBe('[only; two]');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps a present-empty raw string draft invalid without changing filters', () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder
                    columns={[{name: 'key', type: 'string'}]}
                    values={{}}
                    onChange={onChange}
                />
            </ThemeProvider>,
        );

        const raw = screen.getByPlaceholderText('[key]');
        fireEvent.change(raw, {target: {value: '[""]'}});

        expect((raw as HTMLInputElement).value).toBe('[""]');
        expect(onChange).not.toHaveBeenCalled();
        expect(screen.getByText('validation_empty-key-value')).not.toBeNull();
    });

    it('uses its localized visible header as the dialog accessible name', async () => {
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={() => {}} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));

        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        const titles = within(dialog).getAllByText('title_edit-key-fields');
        expect(titles).toHaveLength(1);
        expect(titles[0].hidden).toBe(false);
        expect(getComputedStyle(titles[0]).display).not.toBe('none');
        expect(getComputedStyle(titles[0]).visibility).not.toBe('hidden');
        const titleIds = dialog.getAttribute('aria-labelledby')?.split(/\s+/) ?? [];
        expect(titleIds).toEqual([titles[0].id]);
        expect(document.querySelectorAll(`[id="${titles[0].id}"]`)).toHaveLength(1);
    });

    it('renders schema fields in order and applies all-empty values', async () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));

        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        expect(
            within(dialog)
                .getAllByRole('textbox')
                .map((field) => field.id),
        ).toEqual([getKeyFieldId(0), getKeyFieldId(1), getKeyFieldId(2)]);
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));

        expect(onChange).toHaveBeenCalledWith({first: '', second: '', third: ''});
    });

    it('keeps field names primary and renders types as input placeholders', async () => {
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder
                    columns={[{name: 'count', type: 'int64'}]}
                    values={{}}
                    onChange={() => {}}
                />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));

        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        expect(within(dialog).getByRole('textbox', {name: 'count'})).not.toBeNull();
        expect(within(dialog).getByPlaceholderText('int64')).not.toBeNull();
        expect(within(dialog).queryByText('int64', {selector: 'span'})).toBeNull();
        expect(within(dialog).queryByText('count (int64)')).toBeNull();
    });

    it('closes from the exact localized close control without applying', async () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));
        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});

        const close = within(dialog).getByRole('button', {name: 'Close'});
        expect(within(dialog).getAllByRole('button', {name: 'Close'})).toHaveLength(1);
        expect(within(dialog).queryByRole('button', {name: 'Close dialog'})).toBeNull();
        expect(within(dialog).queryByRole('button', {name: '[object Object]'})).toBeNull();
        fireEvent.click(close);

        expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps partial and invalid typed values open with field errors', async () => {
        const columns: Array<FlowKeyColumn> = [
            {name: 'count', type: 'int64'},
            {name: 'enabled', type: 'boolean'},
        ];
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={columns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));

        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        const [count, enabled] = within(dialog).getAllByRole('textbox');
        fireEvent.change(count, {target: {value: '42'}});
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));
        expect(within(dialog).getByText('validation_fill-all-keys')).not.toBeNull();
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.change(count, {target: {value: 'nope'}});
        fireEvent.change(enabled, {target: {value: 'true'}});
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));
        expect(within(dialog).getByText('validation_expects-integer')).not.toBeNull();
        expect(onChange).not.toHaveBeenCalled();

        fireEvent.change(count, {target: {value: '42'}});
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));
        expect(onChange).toHaveBeenCalledWith({count: '42', enabled: 'true'});
    });

    it('trims typed values once before validation and Apply', async () => {
        const columns: Array<FlowKeyColumn> = [
            {name: 'count', type: 'int64'},
            {name: 'enabled', type: 'boolean'},
        ];
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={columns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));
        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        const [count, enabled] = within(dialog).getAllByRole('textbox');
        fireEvent.change(count, {target: {value: ' 42 '}});
        fireEvent.change(enabled, {target: {value: ' true '}});
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));

        expect(onChange).toHaveBeenCalledWith({count: '42', enabled: 'true'});
    });

    it('applies whitespace-only typed values as canonical empty strings', async () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));
        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        for (const field of within(dialog).getAllByRole('textbox')) {
            fireEvent.change(field, {target: {value: '   '}});
        }
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));

        expect(onChange).toHaveBeenCalledWith({first: '', second: '', third: ''});
    });

    it('preserves the current draft across equivalent prop rerenders while open', async () => {
        const onApply = jest.fn();
        const renderDialog = (columns: Array<FlowKeyColumn>, values: Record<string, string>) => (
            <ThemeProvider theme="light">
                <FlowStateKeyDialog
                    visible
                    columns={columns}
                    values={values}
                    onApply={onApply}
                    onClose={() => {}}
                />
            </ThemeProvider>
        );
        const view = render(renderDialog([{name: 'key', type: 'string'}], {key: 'initial'}));
        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        const field = within(dialog).getByRole('textbox') as HTMLInputElement;
        fireEvent.change(field, {target: {value: 'edited'}});

        view.rerender(renderDialog([{name: 'key', type: 'string'}], {key: 'initial'}));

        expect(field.value).toBe('edited');
    });

    it('initializes the draft from current props on every closed-to-open transition', async () => {
        const renderDialog = (visible: boolean, value: string) => (
            <ThemeProvider theme="light">
                <FlowStateKeyDialog
                    visible={visible}
                    columns={[{name: 'key', type: 'string'}]}
                    values={{key: value}}
                    onApply={() => {}}
                    onClose={() => {}}
                />
            </ThemeProvider>
        );
        const view = render(renderDialog(true, 'initial'));
        let dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        fireEvent.change(within(dialog).getByRole('textbox'), {target: {value: 'edited'}});
        view.rerender(renderDialog(false, 'current'));
        view.rerender(renderDialog(true, 'current'));
        dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});

        await waitFor(() =>
            expect((within(dialog).getByRole('textbox') as HTMLInputElement).value).toBe('current'),
        );
    });

    it('restores dotted and __proto__ schema names through opaque field ids', async () => {
        const columns: Array<FlowKeyColumn> = [
            {name: 'account.name', type: 'string'},
            {name: '__proto__', type: 'string'},
        ];
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder
                    columns={columns}
                    values={Object.fromEntries([
                        ['account.name', 'alice'],
                        ['__proto__', 'literal'],
                    ])}
                    onChange={onChange}
                />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));

        const dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        const [account, prototype] = within(dialog).getAllByRole(
            'textbox',
        ) as Array<HTMLInputElement>;
        expect(account.id).toBe(getKeyFieldId(0));
        expect(prototype.id).toBe(getKeyFieldId(1));
        expect(account.value).toBe('alice');
        expect(prototype.value).toBe('literal');
        fireEvent.change(account, {target: {value: 'bob'}});
        fireEvent.change(prototype, {target: {value: 'kept'}});
        fireEvent.click(within(dialog).getByRole('button', {name: 'action_apply-key-fields'}));

        const applied = onChange.mock.calls[0][0];
        expect(Object.keys(applied)).toEqual(['account.name', '__proto__']);
        expect(Object.prototype.hasOwnProperty.call(applied, '__proto__')).toBe(true);
        expect(JSON.stringify(applied)).toBe('{"account.name":"bob","__proto__":"kept"}');
    });

    it('cancels without applying and resets from current values when reopened', async () => {
        const onChange = jest.fn();
        const view = render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder
                    columns={stringColumns}
                    values={{first: 'initial', second: 'two', third: 'three'}}
                    onChange={onChange}
                />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));
        let dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        fireEvent.change(within(dialog).getAllByRole('textbox')[0], {
            target: {value: 'discarded'},
        });
        fireEvent.click(within(dialog).getByRole('button', {name: 'Cancel'}));
        expect(onChange).not.toHaveBeenCalled();
        await act(async () => {
            await new Promise((resolve) => setTimeout(resolve, 200));
        });

        view.rerender(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder
                    columns={stringColumns}
                    values={{first: 'current', second: 'two', third: 'three'}}
                    onChange={onChange}
                />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));
        dialog = await screen.findByRole('dialog', {name: 'title_edit-key-fields'});
        await waitFor(() =>
            expect((within(dialog).getAllByRole('textbox')[0] as HTMLInputElement).value).toBe(
                'current',
            ),
        );
    });
});
