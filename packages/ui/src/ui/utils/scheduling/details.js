import hammer from '../../common/hammer';

export function calculateTotalOverPools(pools) {
    const summedProperties = [
        'weight',
        'minShareRatio',
        'demandRatio',
        'fairShareRatio',
        'usageRatio',
        'maxOperationCount',
        'maxRunningOperationCount',
        'runningOperationCount',
        'operationCount',
    ].map((name) => ({name, type: 'sum'}));

    ['cpu', 'user_memory', 'gpu', 'user_slots'].forEach((resource) => {
        ['min', 'guaranteed', 'usage', 'demand'].forEach((metric) => {
            const name = ['resources', resource, metric].join('.');
            summedProperties.push({name, type: 'nested/sum'});
        });
    });

    // We can aggregate only pools with resources
    const items = pools.filter((pool) => Boolean(pool.resources));

    return Object.assign(hammer.aggregation.prepare(items, summedProperties)[0], {
        key: 'aggregation',
        name: 'Aggregation',
        type: 'aggregation',
        aggregation: true,
    });
}
