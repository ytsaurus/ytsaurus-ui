import {
    type OptionsGroup,
    descriptionToDialogField,
} from '../../../containers/Dialog/df-dialog-utils';
import format from '../../../common/hammer/format';

import {isCreationOptionsUnsupported, parseCreationOptions} from './creation-options';

const groups: OptionsGroup[] = [
    {
        title: 'Resources',
        hidden: false,
        options: [
            {name: 'instance_count', type: 'int64', default_value: 2, min_value: 1, max_value: 50},
            {name: 'instance_cpu', type: 'int64', default_value: 8, min_value: 2, max_value: 32},
            {
                name: 'instance_total_memory',
                type: 'byte_count',
                default_value: 48 * 1024 ** 3,
                min_value: 24 * 1024 ** 3,
                max_value: 128 * 1024 ** 3,
            },
        ],
    },
];

describe('CHYT creation descriptors', () => {
    it('uses controller defaults and bounds with the existing edit field formatter', () => {
        const resources = parseCreationOptions(groups);
        const settings = {allowEdit: true, defaultPoolTree: 'default', unipikaSettings: {}};
        const cpu = descriptionToDialogField(resources.instanceCpu, settings);
        const memory = descriptionToDialogField(resources.instanceMemory, settings);
        if (cpu.type !== 'number' || memory.type !== 'number') {
            throw new Error('Expected numeric resource fields');
        }

        expect(resources.instanceCount.default_value).toBe(2);
        expect(cpu.extras).toMatchObject({placeholder: format.Number(8), min: 2, max: 32});
        expect(memory.extras).toMatchObject({
            placeholder: format.Bytes(48 * 1024 ** 3),
            min: 24 * 1024 ** 3,
            max: 128 * 1024 ** 3,
            format: 'Bytes',
        });
        // A displayed default never becomes an explicitly chosen resource value.
        expect(cpu.converter.toFieldValue(resources.instanceCpu.current_value)).toEqual({
            value: undefined,
        });
        expect(memory.converter.toFieldValue(resources.instanceMemory.current_value)).toEqual({
            value: undefined,
        });
    });

    it('rejects incomplete descriptions instead of silently using hardcoded defaults', () => {
        expect(() => parseCreationOptions([])).toThrow();
        expect(() =>
            parseCreationOptions([{...groups[0], options: groups[0].options.slice(0, 2)}]),
        ).toThrow('instance_total_memory');
    });

    it.each([404, 501])('allows the legacy form when the method is unavailable (%s)', (status) => {
        expect(isCreationOptionsUnsupported({response: {status}})).toBe(true);
    });

    it('recognizes an old UI proxy allowlist error', () => {
        expect(
            isCreationOptionsUnsupported({
                response: {
                    status: 400,
                    data: {message: "CHYT action - 'describe_creation_options', is not supported"},
                },
            }),
        ).toBe(true);
    });

    it.each([400, 401, 403, 500, 502, 503, 504])(
        'does not hide validation, authentication or server errors (%s)',
        (status) => {
            expect(
                isCreationOptionsUnsupported({response: {status, data: {message: 'Failed'}}}),
            ).toBe(false);
        },
    );

    it('does not hide network failures or cancellations', () => {
        expect(isCreationOptionsUnsupported(new Error('Network error'))).toBe(false);
        expect(isCreationOptionsUnsupported({code: 'ERR_CANCELED'})).toBe(false);
    });
});
