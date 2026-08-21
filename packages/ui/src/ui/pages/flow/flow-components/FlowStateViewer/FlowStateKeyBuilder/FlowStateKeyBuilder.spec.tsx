/** @jest-environment jsdom */
import React from 'react';
import {act, fireEvent, render, screen} from '@testing-library/react';
import {ThemeProvider} from '@gravity-ui/uikit';

import type {FlowKeyColumn} from '../../../../../../shared/yt-types';

class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
}
(global as unknown as {ResizeObserver: unknown}).ResizeObserver = ResizeObserverStub;

type DialogProps = {
    visible: boolean;
    initialValues: Record<string, string>;
    fields: Array<{
        name: string;
        validator?: (value: string) => string | undefined;
    }>;
    validate: (values: Record<string, string>) => Record<string, string> | undefined;
    onAdd: (form: {getState: () => {values: Record<string, string>}}) => Promise<void>;
};

let dialogProps: DialogProps | undefined;

jest.mock('@ytsaurus/components', () => ({setLang: () => {}}));

jest.mock('../../../../../containers/Dialog', () => ({
    YTDFDialog: (props: DialogProps) => {
        dialogProps = props;
        return props.visible ? <div data-testid="key-dialog" /> : null;
    },
}));

jest.mock('./i18n', () => ({
    __esModule: true,
    default: (key: string) => key,
}));

import {FlowStateKeyBuilder} from './FlowStateKeyBuilder';
import {getKeyFieldId} from './FlowStateKeyDialog';
import {formatRawKeyDraft, parseRawKeyDraft} from '../state-filters';

const stringColumns: Array<FlowKeyColumn> = [
    {name: 'first', type: 'string'},
    {name: 'second', type: 'string'},
    {name: 'third', type: 'string'},
];

beforeEach(() => {
    dialogProps = undefined;
});

describe('raw key parsing', () => {
    it('accepts empty input as an all-empty key', () => {
        expect(parseRawKeyDraft('', stringColumns)).toEqual({
            values: {first: '', second: '', third: ''},
        });
    });

    it('parses positional values', () => {
        expect(parseRawKeyDraft('[foo; bar; baz]', stringColumns)).toEqual({
            values: {first: 'foo', second: 'bar', third: 'baz'},
        });
    });

    it('preserves quoted semicolons and escaped quotes', () => {
        expect(parseRawKeyDraft('["foo;bar"; "say \\"hello\\""; baz]', stringColumns)).toEqual({
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

    it('rejects partial emptiness', () => {
        expect(parseRawKeyDraft('[foo; ; baz]', stringColumns)).toEqual({
            error: {errorKey: 'validation_fill-all-keys'},
        });
    });

    it.each([
        [{name: 'count', type: 'int64'}, 'hello', 'validation_expects-integer'],
        [{name: 'enabled', type: 'boolean'}, 'yes', 'validation_expects-boolean'],
    ] as const)('validates %s values', (column, value, errorKey) => {
        expect(parseRawKeyDraft(`[${value}]`, [column])).toEqual({
            error: {errorKey, params: expect.any(Object)},
        });
    });

    it('round trips values that need quoting', () => {
        const values = {first: 'foo;bar', second: 'say "hello"', third: 'baz'};
        expect(parseRawKeyDraft(formatRawKeyDraft(stringColumns, values), stringColumns)).toEqual({
            values,
        });
    });
});

describe('FlowStateKeyBuilder', () => {
    it('keeps an invalid raw draft visible without changing filters', () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );

        const raw = screen.getByPlaceholderText('placeholder_raw-key');
        fireEvent.change(raw, {target: {value: '[only; two]'}});

        expect((raw as HTMLInputElement).value).toBe('[only; two]');
        expect(onChange).not.toHaveBeenCalled();
    });

    it('configures a vertical typed dialog that applies all-empty values', async () => {
        const onChange = jest.fn();
        render(
            <ThemeProvider theme="light">
                <FlowStateKeyBuilder columns={stringColumns} values={{}} onChange={onChange} />
            </ThemeProvider>,
        );
        fireEvent.click(screen.getByRole('button', {name: 'action_edit-key-fields'}));

        expect(screen.getByTestId('key-dialog')).not.toBeNull();
        expect(dialogProps?.fields.map(({name}) => name)).toEqual(['key_0', 'key_1', 'key_2']);
        expect(dialogProps?.validate({key_0: '', key_1: '', key_2: ''})).toBeUndefined();
        expect(dialogProps?.validate({key_0: 'value', key_1: '', key_2: ''})).toEqual({
            key_1: 'validation_fill-all-keys',
            key_2: 'validation_fill-all-keys',
        });
        await act(async () => {
            await dialogProps?.onAdd({
                getState: () => ({values: {key_0: '', key_1: '', key_2: ''}}),
            });
        });
        expect(onChange).toHaveBeenCalledWith({first: '', second: '', third: ''});
    });

    it('validates and applies a complete typed key', async () => {
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

        expect(dialogProps?.fields[0].validator?.('nope')).toBe('validation_expects-integer');
        expect(dialogProps?.validate({key_0: '42', key_1: 'true'})).toBeUndefined();
        await act(async () => {
            await dialogProps?.onAdd({
                getState: () => ({values: {key_0: '42', key_1: 'true'}}),
            });
        });
        expect(onChange).toHaveBeenCalledWith({count: '42', enabled: 'true'});
    });

    it('uses opaque field ids and restores dotted and __proto__ schema names', async () => {
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

        expect(dialogProps?.fields.map(({name}) => name)).toEqual([
            getKeyFieldId(0),
            getKeyFieldId(1),
        ]);
        expect(dialogProps?.initialValues).toEqual({key_0: 'alice', key_1: 'literal'});
        await act(async () => {
            await dialogProps?.onAdd({
                getState: () => ({values: {key_0: 'bob', key_1: 'kept'}}),
            });
        });
        const applied = onChange.mock.calls[0][0];
        expect(Object.keys(applied)).toEqual(['account.name', '__proto__']);
        expect(Object.prototype.hasOwnProperty.call(applied, '__proto__')).toBe(true);
        expect(JSON.stringify(applied)).toBe('{"account.name":"bob","__proto__":"kept"}');
    });
});
