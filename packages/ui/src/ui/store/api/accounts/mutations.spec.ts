import {setAccountAbc, setAccountParent} from '../../../utils/accounts/editor';
import {updateAccountAbc, updateAccountParent} from './mutations';

jest.mock('../../../utils/accounts/editor', () => ({
    setAccountAbc: jest.fn(),
    setAccountParent: jest.fn(),
}));

const setAccountAbcMock = jest.mocked(setAccountAbc);
const setAccountParentMock = jest.mocked(setAccountParent);

describe('account general mutations', () => {
    beforeEach(() => {
        setAccountAbcMock.mockReset();
        setAccountParentMock.mockReset();
    });

    it('updates ABC through the existing account editor API', async () => {
        setAccountAbcMock.mockResolvedValue(undefined);

        await expect(
            updateAccountAbc({
                cluster: 'cluster',
                accountName: 'account',
                abc: {id: 42, slug: 'service'},
            }),
        ).resolves.toEqual({data: 'account'});
        expect(setAccountAbcMock).toHaveBeenCalledWith('account', 42, 'service');
    });

    it('updates Parent through the existing account editor API', async () => {
        setAccountParentMock.mockResolvedValue(undefined);

        await expect(
            updateAccountParent({
                cluster: 'cluster',
                accountName: 'account',
                parentName: 'parent',
            }),
        ).resolves.toEqual({data: 'account'});
        expect(setAccountParentMock).toHaveBeenCalledWith('account', 'parent');
    });

    it('returns mutation errors', async () => {
        const error = new Error('request failed');
        setAccountParentMock.mockRejectedValue(error);

        await expect(
            updateAccountParent({
                cluster: 'cluster',
                accountName: 'account',
                parentName: 'parent',
            }),
        ).resolves.toEqual({error});
    });
});
