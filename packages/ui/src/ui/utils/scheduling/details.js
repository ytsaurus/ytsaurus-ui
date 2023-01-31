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

    return Object.assign(hammer.aggregation.prepare(pools, summedProperties)[0], {
        key: 'aggregation',
        name: 'Aggregation',
        type: 'aggregation',
        aggregation: true,
    });
}
