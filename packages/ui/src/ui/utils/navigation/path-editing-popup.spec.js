import {NetworkCode} from '../../constants/navigation/modals/path-editing-popup';

import {prepareErrorMessage} from './path-editing-popup';

jest.mock('../../constants/navigation/modals/i18n', () => ({
    __esModule: true,
    default: (key) => key,
}));

describe('prepareErrorMessage', () => {
    test('prefers a known outer error code', () => {
        expect(
            prepareErrorMessage({
                code: NetworkCode.EXIST,
                inner_errors: [{code: NetworkCode.ACCESS_DENIED}],
            }),
        ).toBe('alert_path-already-exists');
    });

    test('uses a known inner error code when the outer code is unknown', () => {
        expect(
            prepareErrorMessage({
                code: -1,
                inner_errors: [{code: NetworkCode.ACCESS_DENIED}],
            }),
        ).toBe('alert_access-denied');
    });

    test('uses the fallback message when error codes are unknown', () => {
        expect(
            prepareErrorMessage({
                code: -1,
                inner_errors: [{code: -2}],
            }),
        ).toBe('alert_unknown-error');
    });
});
