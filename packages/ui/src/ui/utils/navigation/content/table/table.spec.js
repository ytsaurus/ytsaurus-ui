import {isPermissionDeniedOrNotFoundError} from '../../../errors';

import {getParsedError, parseErrorFromResponse} from './table';

jest.mock('./i18n', () => (key) => key);

const delimiter = '\n' + '='.repeat(80) + '\n';

function parseTableError(error) {
    const response = `partial table data${delimiter}${JSON.stringify(error)}${delimiter}`;
    return getParsedError(parseErrorFromResponse(response));
}

describe('table response errors', () => {
    it.each([500, 901])('preserves nested code %s for Health error filtering', (code) => {
        const error = {
            code: 1,
            message: 'Error reading table',
            inner_errors: [
                {
                    code: 1,
                    message: 'Error communicating with master',
                    inner_errors: [{code, message: 'Table is unavailable'}],
                },
            ],
        };

        const parsedError = parseTableError(error);

        expect(parsedError).toEqual(error);
        expect(isPermissionDeniedOrNotFoundError(parsedError)).toBe(true);
    });

    it('keeps other errors visible with their diagnostic attributes', () => {
        const error = {
            code: 1,
            message: 'Error reading table',
            attributes: {path: '//test/health'},
            inner_errors: [{code: 904, message: 'Request rate limit exceeded'}],
        };

        const parsedError = parseTableError(error);

        expect(parsedError).toEqual(error);
        expect(isPermissionDeniedOrNotFoundError(parsedError)).toBe(false);
    });

    it.each(['not JSON', 'null', '[]', '901', '"Access denied"'])(
        'retains unstructured error text: %s',
        (rawError) => {
            const parsedError = getParsedError(rawError);

            expect(parsedError).toEqual({
                message: expect.any(String),
                attributes: {stderrs: rawError},
            });
            expect(isPermissionDeniedOrNotFoundError(parsedError)).toBe(false);
        },
    );
});
