import {type OptionsGroup} from '../../../containers/Dialog/df-dialog-utils';

import {parseCreationOptions} from './creation-options';

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
    it.each(['default_value', 'min_value', 'max_value'] as const)(
        'rejects a missing instance count %s',
        (field) => {
            const options = groups[0].options.map((option) =>
                option.name === 'instance_count' ? {...option, [field]: undefined} : option,
            );

            expect(() => parseCreationOptions([{...groups[0], options}])).toThrow(
                'Invalid instance count defaults or bounds',
            );
        },
    );

    it('rejects incomplete descriptions instead of silently using hardcoded defaults', () => {
        expect(() => parseCreationOptions([])).toThrow();
        expect(() =>
            parseCreationOptions([{...groups[0], options: groups[0].options.slice(0, 2)}]),
        ).toThrow('instance_total_memory');
    });
});
