import type {QueryCatalogRequest} from '@gravity-ui/querieskit';
import {ytApiV3Id} from '../../../rum/rum-wrap-api';
import {getQueryTableSchema, listQueryPathChildren} from './queryEditorCatalog';

jest.mock('../../../config/yt-config', () => ({YT: {clusters: {test: {id: 'test'}}}}));
jest.mock('../../../store/selectors/global', () => ({getClusterProxy: () => 'test-proxy'}));
jest.mock('../../../common/yt-api', () => ({JSONSerializer: {}}));
jest.mock('../../../rum/rum-wrap-api', () => ({
    YTApiId: {navigationListNodes: 'list', navigationGetPath: 'get'},
    ytApiV3Id: {list: jest.fn(), get: jest.fn()},
}));

function request(path: string, clusterId = 'test'): QueryCatalogRequest {
    return {
        path,
        clusterId,
        language: 'yql',
        token: {isCancellationRequested: false, onCancellationRequested: jest.fn()},
    };
}
const list = ytApiV3Id.list as jest.Mock;
const get = ytApiV3Id.get as jest.Mock;
beforeEach(() => jest.clearAllMocks());

it('adapts Cypress children, excluding unsupported and broken nodes', async () => {
    list.mockResolvedValue([
        {$value: 'table', $attributes: {type: 'table'}},
        {$value: 'directory', $attributes: {type: 'map_node'}},
        {$value: 'link', $attributes: {type: 'link', broken: false}},
        {$value: 'broken', $attributes: {type: 'link', broken: true}},
        {$value: 'file', $attributes: {type: 'file'}},
    ]);
    expect(await listQueryPathChildren(request('//home/'))).toEqual([
        {name: 'table', path: '//home/table', kind: 'table'},
        {name: 'directory', path: '//home/directory', kind: 'directory'},
        {name: 'link', path: '//home/link', kind: 'directory'},
    ]);
    expect(list).toHaveBeenCalledWith(
        'list',
        expect.objectContaining({parameters: {path: '//home', attributes: ['type', 'broken']}}),
    );
});
it('uses Cypress root without losing the double slash in child paths', async () => {
    list.mockResolvedValue([{$value: 'home', $attributes: {type: 'map_node'}}]);
    expect(await listQueryPathChildren(request('//'))).toEqual([
        {name: 'home', path: '//home', kind: 'directory'},
    ]);
});
it('does not send database names or unknown clusters to Cypress', async () => {
    expect(await listQueryPathChildren(request('database.'))).toEqual([]);
    expect(await listQueryPathChildren(request('//home/', 'unknown'))).toEqual([]);
    expect(list).not.toHaveBeenCalled();
});
it('drops responses after editor cancellation', async () => {
    const input = request('//home/');
    list.mockImplementation(async () => {
        Object.assign(input.token, {isCancellationRequested: true});
        return [{$value: 'table', $attributes: {type: 'table'}}];
    });
    expect(await listQueryPathChildren(input)).toEqual([]);
});
it('loads schema from the selected cluster and accepts SPYT table references', async () => {
    get.mockResolvedValue([{name: 'key', type: 'int64'}]);
    expect(await getQueryTableSchema(request('ytTable://home/table'))).toEqual([
        {name: 'key', type: 'int64'},
    ]);
    expect(get).toHaveBeenCalledWith(
        'get',
        expect.objectContaining({
            parameters: {path: '//home/table/@schema'},
            setup: {proxy: 'test-proxy', JSONSerializer: {}},
        }),
    );
});
it('does not treat ordinary SQL table names as Cypress paths', async () => {
    expect(await getQueryTableSchema(request('table'))).toEqual([]);
    expect(get).not.toHaveBeenCalled();
});
