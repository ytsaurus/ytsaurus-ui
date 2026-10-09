import {type RootState} from '../../../../reducers';
import {ytApiV3Id} from '../../../../../rum/rum-wrap-api';
import {loadConsumerPartitions} from './partitions';

jest.mock('../../../../../rum/rum-wrap-api', () => ({
    YTApiId: {queueConsumerPartitions: 'partitions'},
    ytApiV3Id: {get: jest.fn()},
}));
jest.mock('../../../../../store/selectors/navigation', () => ({
    selectPath: () => '//consumer',
    selectTransaction: () => undefined,
}));
jest.mock('../../../../../store/selectors/global', () => ({selectCluster: () => 'markov'}));
jest.mock('../../../../../utils/navigation', () => ({
    prepareRequest: (suffix: string, {path}: {path: string}) => ({
        parameters: {path: path + suffix},
    }),
}));

describe('consumer partition requests', () => {
    const queue = 'markov://queue';
    function run(consumerName?: string) {
        const state = {
            navigation: {
                tabs: {
                    consumer: {
                        filters: {consumerName},
                        status: {
                            consumerData:
                                consumerName === undefined
                                    ? {registrations: [{queue, vital: false}]}
                                    : {
                                          queue_consumer_names: ['a/b@c'],
                                          consumers: {
                                              'a/b@c': {registrations: [{queue, vital: false}]},
                                          },
                                      },
                        },
                        partitions: {},
                    },
                },
            },
        } as unknown as RootState;
        return loadConsumerPartitions(queue)(jest.fn(), () => state, undefined);
    }

    beforeEach(() => jest.clearAllMocks());

    it('uses the ordinary endpoint without a consumer name', async () => {
        jest.mocked(ytApiV3Id.get).mockResolvedValue([]);
        await run();
        expect(ytApiV3Id.get).toHaveBeenCalledWith('partitions', {
            parameters: {path: '//consumer/@queue_consumer_partitions/markov:\\/\\/queue'},
        });
    });

    it('escapes the consumer name and queue as YPath segments', async () => {
        jest.mocked(ytApiV3Id.get).mockResolvedValue([]);
        await run('a/b@c');
        expect(ytApiV3Id.get).toHaveBeenCalledWith('partitions', {
            parameters: {
                path: '//consumer/@queue_consumer_partitions/consumers/a\\/b\\@c/markov:\\/\\/queue',
            },
        });
    });
});
