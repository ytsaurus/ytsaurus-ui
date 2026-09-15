import {getOperationPageUrlFromNodeProgress} from './getOperationPageUrlFromNodeProgress';

describe('getOperationPageUrlFromNodeProgress', () => {
    it('builds a link from remoteId', () => {
        expect(getOperationPageUrlFromNodeProgress({remoteId: 'hahn/operation-1'})).toBe(
            '/hahn/operations/operation-1',
        );
    });

    it('builds a link from waitingRemoteId', () => {
        expect(getOperationPageUrlFromNodeProgress({waitingRemoteId: 'hahn/operation-1'})).toBe(
            '/hahn/operations/operation-1',
        );
    });

    it('prefers remoteId over waitingRemoteId', () => {
        expect(
            getOperationPageUrlFromNodeProgress({
                remoteId: 'hahn/operation-1',
                waitingRemoteId: 'arnold/operation-2',
            }),
        ).toBe('/hahn/operations/operation-1');
    });

    it('uses waitingRemoteId when remoteId is empty', () => {
        expect(
            getOperationPageUrlFromNodeProgress({
                remoteId: '',
                waitingRemoteId: 'hahn/operation-1',
            }),
        ).toBe('/hahn/operations/operation-1');
    });

    it('uses the cluster from statistics before remote data and remote id', () => {
        expect(
            getOperationPageUrlFromNodeProgress(
                {
                    waitingRemoteId: 'hahn/operation-1',
                    remoteData: {cluster_name: 'arnold'},
                },
                new Map([['operation-1', 'kikimr']]),
            ),
        ).toBe('/kikimr/operations/operation-1');
    });

    it('uses the cluster from remote data when statistics do not contain the operation', () => {
        expect(
            getOperationPageUrlFromNodeProgress({
                waitingRemoteId: 'hahn/operation-1',
                remoteData: {cluster_name: 'arnold'},
            }),
        ).toBe('/arnold/operations/operation-1');
    });

    it('builds a link from an operation id when remote data contains the cluster', () => {
        expect(
            getOperationPageUrlFromNodeProgress({
                waitingRemoteId: 'operation-1',
                remoteData: {cluster_name: 'arnold'},
            }),
        ).toBe('/arnold/operations/operation-1');
    });

    it('builds a link from an operation id when statistics contain the cluster', () => {
        expect(
            getOperationPageUrlFromNodeProgress(
                {waitingRemoteId: 'operation-1'},
                new Map([['operation-1', 'hahn']]),
            ),
        ).toBe('/hahn/operations/operation-1');
    });

    it('returns undefined when there is no remote operation id', () => {
        expect(getOperationPageUrlFromNodeProgress({})).toBeUndefined();
        expect(
            getOperationPageUrlFromNodeProgress({waitingRemoteId: 'operation-1'}),
        ).toBeUndefined();
        expect(getOperationPageUrlFromNodeProgress({waitingRemoteId: '/'})).toBeUndefined();
    });
});
