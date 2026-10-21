import type {QueryItem} from '../../../../types/query-tracker/api';
import {filterTutorialItems, prepareTutorialItems} from './helpers';

jest.mock('../../../../utils/app-url/makeQueryUrl', () => ({
    makeQueryUrl: ({queryId}: {queryId: string}) => '/queries/' + queryId,
}));
const queries = [
    {id: 'uuid-one', annotations: {title: 'First lesson'}},
    {id: 'uuid-two', annotations: {title: 'Second lesson'}},
] as QueryItem[];
it('keeps original lesson numbers when searching', () => {
    const items = prepareTutorialItems({queries, cluster: 'test', noNameTitle: 'Untitled'});
    const filtered = filterTutorialItems(items, 'SECOND');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]).toMatchObject({id: 'uuid-two', number: 2, href: '/queries/uuid-two'});
});
it('keeps existing lesson numbers when appending another page', () => {
    const items = prepareTutorialItems({
        queries: [...queries, {id: 'uuid-three'} as QueryItem],
        cluster: 'test',
        noNameTitle: 'Untitled',
    });
    expect(items.map(({number}) => number)).toEqual([1, 2, 3]);
    expect(items[2].title).toBe('Untitled');
});
