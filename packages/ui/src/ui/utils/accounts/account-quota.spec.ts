// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {setAccountLimit} from './editor';
import {setAccountQuotaImpl} from './account-quota';

jest.mock('@ytsaurus/javascript-wrapper/lib/yt', () => ({
    v4: {transferAccountResources: jest.fn()},
}));
jest.mock('./editor', () => ({setAccountLimit: jest.fn()}));

const setAccountLimitMock = jest.mocked(setAccountLimit);
const transferMock = jest.mocked(yt.v4.transferAccountResources);

describe('setAccountQuotaImpl', () => {
    beforeEach(() => {
        setAccountLimitMock.mockReset();
        transferMock.mockReset();
    });

    it('sets the limit directly without a distribution account', async () => {
        setAccountLimitMock.mockResolvedValue(undefined);

        await setAccountQuotaImpl({
            account: 'account',
            limit: 10,
            limitDiff: 2,
            resourcePath: 'node_count',
        });

        expect(setAccountLimitMock).toHaveBeenCalledWith(
            10,
            'account',
            '/@resource_limits/node_count',
        );
    });

    it('transfers an increase from the source to the edited account', async () => {
        transferMock.mockResolvedValue(undefined);

        await setAccountQuotaImpl({
            account: 'account',
            distributeAccount: 'source',
            limit: 12,
            limitDiff: 2,
            resourcePath: 'disk_space_per_medium/default',
        });

        expect(transferMock).toHaveBeenCalledWith({
            parameters: {
                source_account: 'source',
                destination_account: 'account',
                resource_delta: {disk_space_per_medium: {default: 2}},
            },
        });
    });

    it('transfers a decrease from the edited account to the selected account', async () => {
        transferMock.mockResolvedValue(undefined);

        await setAccountQuotaImpl({
            account: 'account',
            distributeAccount: 'target',
            limit: 7,
            limitDiff: -3,
            resourcePath: 'node_count',
        });

        expect(transferMock).toHaveBeenCalledWith({
            parameters: {
                source_account: 'account',
                destination_account: 'target',
                resource_delta: {node_count: 3},
            },
        });
    });
});
