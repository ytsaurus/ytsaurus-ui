import hammer from '../../../common/hammer';
import _ from 'lodash';

import {pluralToSingular, typeToReadable} from '../../../constants/components/versions/versions';
import {tableProps} from './tables';

export function prepareVersions(data) {
    const prepared = _.mapValues(data, (componentVersions, type) => {
        return _.map(componentVersions, (hostVersion, hostName) => {
            const readableType = typeToReadable[type] || typeToReadable['default'];
            const actualType = pluralToSingular[readableType];

            hostVersion.address = hostName;
            hostVersion.type = actualType;

            if (hostVersion.error) {
                hostVersion.version = 'error';
            }

            return hostVersion;
        });
    });

    if (prepared.proxies) {
        prepared.http_proxies = prepared.proxies;
        delete prepared.proxies;
    }

    return prepared;
}

export function aggregateSummary(data) {
    let aggregation;

    aggregation = _.map(data, (componentVersions, componentName) => {
        return hammer.aggregation.prepare(
            componentVersions,
            [{name: componentName, type: 'count'}],
            'version',
        );
    });

    // Remove total aggregations and flatten
    aggregation = _.map(aggregation, (componentAggregation) => componentAggregation.slice(1));
    aggregation = _.flattenDeep(aggregation);

    aggregation = hammer.aggregation.prepare(
        aggregation,
        _.map(_.keys(data), (componentName) => ({
            name: componentName,
            type: 'sum',
        })),
        'version',
    );

    aggregation[0].version = 'total';

    return aggregation;
}

export function aggregateDetailed(data) {
    return _.flatten(_.values(data));
}

export function splitData(data, key) {
    const total = _.find(data, (el) => el[key].toLowerCase().startsWith('total'));
    const error = _.find(data, (el) => el[key].toLowerCase().startsWith('error'));
    const sortable = _.filter(
        data,
        (el) =>
            !el[key].toLowerCase().startsWith('total') &&
            !el[key].toLowerCase().startsWith('error'),
    );

    return {total, sortable, error};
}

export function sortColumns(columns) {
    const {total, sortable, error} = splitData(columns, 'value');

    const sorted = _.sortBy(sortable, (column) => column.text);
    const result = [total, ...sorted, error];

    return _.filter(result, (el) => Boolean(el));
}

export function sortSummary(summary, sortState) {
    const {total, sortable, error} = splitData(summary, 'version');

    const sorted = hammer.utils.sort(sortable, sortState, tableProps.columns.items);
    const result = [...sorted, error, total];

    return _.filter(result, (el) => Boolean(el));
}

export function sortDetailed(detailed, sortState) {
    return hammer.utils.sort(detailed, sortState, tableProps.columns.items);
}

export function filterData(data, filter, filterType) {
    if (filterType === 'address') {
        const filterAddress = filter.address.toLowerCase();

        return _.filter(data, (hostInfo) =>
            hostInfo.address.toLowerCase().startsWith(filterAddress),
        );
    }

    return filter[filterType].value === 'total'
        ? data
        : _.filter(data, (hostInfo) => hostInfo[filterType] === filter[filterType].value);
}

export function filterAndSortDetailed(data, sortState, filter) {
    const filteredByVersions = filterData(data, filter, 'version');
    const filteredByType = filterData(filteredByVersions, filter, 'type');
    const filteredByAddress = filterData(filteredByType, filter, 'address');

    return sortDetailed(filteredByAddress, sortState);
}

export function getFilterColumns(data, columnName) {
    const countTypes = hammer.aggregation.countValues(data, columnName);
    const resultTypes = {total: data.length, ...countTypes};

    return _.transform(
        resultTypes,
        (result, count, type) =>
            result.push({
                text: type === 'total' ? 'All' : hammer.format['ReadableField'](type),
                value: type,
                count,
            }),
        [],
    );
}

export function getAggregatedColumn(data, filter, options) {
    const filteredData = filterData(data, filter, options.filterType);
    const actualColumns = getFilterColumns(filteredData, options.columnName);

    return sortColumns(actualColumns);
}

export function getActiveFilter(allData, filterText) {
    return (
        _.find(allData, (item) => item.value === filterText) || {
            text: hammer.format['ReadableField'](filterText),
            value: filterText,
            count: 0,
        }
    );
}

export function getActualData(filter, data, sortState) {
    const {activeAddressFilter, activeVersionFilter, activeTypeFilter} = filter;
    const activeFilter = {
        version: activeVersionFilter,
        type: activeTypeFilter,
        address: activeAddressFilter,
    };

    const filteredDetailed = filterAndSortDetailed(data, sortState, activeFilter);
    const filteredDataByAddress = filterData(data, activeFilter, 'address');

    const versionsOptions = {columnName: 'version', filterType: 'type'};
    const actualVersions = getAggregatedColumn(
        filteredDataByAddress,
        activeFilter,
        versionsOptions,
    );

    const typesOptions = {columnName: 'type', filterType: 'version'};
    const actualTypes = getAggregatedColumn(filteredDataByAddress, activeFilter, typesOptions);

    return {actualVersions, actualTypes, filteredDetailed};
}
