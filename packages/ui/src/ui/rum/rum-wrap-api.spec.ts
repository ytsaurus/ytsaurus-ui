import {YTApiId} from '../../shared/constants/yt-api-id';
import {RumMeasureTypes} from './rum-measure-types';
import {rumGetTime, rumSendDelta} from './rum-counter';
import {RumWrapper} from './rum-wrap-api';

jest.mock('./rum-counter', () => ({
    rumDebugLog2: jest.fn(),
    rumGetTime: jest.fn(),
    rumSendDelta: jest.fn(),
}));

const rumGetTimeMock = rumGetTime as jest.MockedFunction<typeof rumGetTime>;
const rumSendDeltaMock = rumSendDelta as jest.MockedFunction<typeof rumSendDelta>;

describe('RumWrapper.parse', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('starts measuring before calling the parse factory', async () => {
        const calls: Array<string> = [];
        rumGetTimeMock.mockImplementation(() => {
            calls.push('time');
            return calls.length === 1 ? 10 : 50;
        });
        rumSendDeltaMock.mockImplementation(() => {
            calls.push('send');
        });
        const parse = jest.fn(() => {
            calls.push('parse');
            return Promise.resolve('result');
        });
        const rum = new RumWrapper('cluster', RumMeasureTypes.ACCOUNTS);

        await expect(rum.parse(YTApiId.accountsData, parse)).resolves.toBe('result');

        expect(calls).toEqual(['time', 'parse', 'time', 'send']);
        expect(rumSendDeltaMock).toHaveBeenCalledWith(
            `cluster.${RumMeasureTypes.ACCOUNTS}.parse.${YTApiId.accountsData}`,
            40,
        );
    });
});
