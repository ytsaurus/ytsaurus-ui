import {createAttachment, toAttachment, toQueryFile} from './attachments';
import type {QueryFile} from '../../../../types/query-tracker/api';

describe('native attachments adapter', () => {
    it.each<QueryFile>([
        {id: 'inline', name: 'file.sql', type: 'raw_inline_data', content: 'SELECT 1;'},
        {id: 'link', name: 'remote.sql', type: 'url', content: 'yt://cluster/path'},
    ])('preserves $type through delete/restore and rename', (file) => {
        expect(toQueryFile(toAttachment(file))).toEqual(file);
        expect(toQueryFile({...toAttachment(file), name: 'renamed'})).toEqual({
            ...file,
            name: 'renamed',
        });
    });
    it('updates a link without persisting library metadata', () => {
        const item = createAttachment({id: 'link', name: 'remote', link: '', isNew: true});
        expect(
            toQueryFile({...item, link: 'yt://new/path', token: 'unused', isNew: false}),
        ).toEqual({
            id: 'link',
            name: 'remote',
            type: 'url',
            content: 'yt://new/path',
        });
    });
    it('creates an empty inline file and retains edits from the external editor', () => {
        const item = createAttachment({id: 'inline', name: 'new.sql', isNew: true});
        expect(toQueryFile(item)).toEqual({
            id: 'inline',
            name: 'new.sql',
            type: 'raw_inline_data',
            content: '',
        });
        const edited = {...toQueryFile(item), content: 'SELECT 42;'};
        expect(toQueryFile({...toAttachment(edited), name: 'edited.sql'})).toEqual({
            ...edited,
            name: 'edited.sql',
        });
    });
});
