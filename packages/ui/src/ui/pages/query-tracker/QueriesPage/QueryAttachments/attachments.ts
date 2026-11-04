import type {AttachItem} from '@gravity-ui/querieskit';
import type {QueryFile} from '../../../../types/query-tracker/api';

export type QueryAttachment = AttachItem & {file: QueryFile};

export function toAttachment(file: QueryFile): QueryAttachment {
    return {
        id: file.id,
        name: file.name,
        ...(file.type === 'url' ? {link: file.content} : {}),
        file,
    };
}

export function createAttachment(draft: AttachItem): QueryAttachment {
    return {
        ...draft,
        file: {
            id: draft.id,
            name: draft.name,
            content: draft.link ?? '',
            type: draft.link === undefined ? 'raw_inline_data' : 'url',
        },
    };
}

export function toQueryFile(attachment: QueryAttachment): QueryFile {
    return {
        ...attachment.file,
        id: attachment.id,
        name: attachment.name,
        content: attachment.file.type === 'url' ? (attachment.link ?? '') : attachment.file.content,
    };
}
