import {useState} from 'react';
import type {AttachmentDraft, AttachmentsProps} from '@gravity-ui/querieskit';
import {v4 as uuidv4} from 'uuid';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectQueryFiles} from '../../../../../store/selectors/query-tracker/query';
import {selectDeletedFiles} from '../../../../../store/selectors/query-tracker/queryFilesForm';
import {applyQueryFiles} from '../../../../../store/actions/query-tracker/queryFilesForm';
import {setFileEditor} from '../../../../../store/reducers/query-tracker/queryFilesFormSlice';
import {VALIDATOR_ERRORS_TEXT} from '../../../QuerySettingsButton/formValidator';
import {type QueryAttachment, createAttachment, toAttachment, toQueryFile} from './attachments';

export function useQueryAttachmentsProps(): AttachmentsProps<QueryAttachment> {
    const dispatch = useDispatch();
    const files = useSelector(selectQueryFiles);
    const deletedFiles = useSelector(selectDeletedFiles);
    const [drafts, setDrafts] = useState<AttachmentDraft[]>([]);
    return {
        attachments: files.map(toAttachment),
        drafts,
        onDraftsChange: setDrafts,
        deletedAttachments: deletedFiles.map(toAttachment),
        createAttachment,
        tokenRequired: false,
        validateDuplicates: true,
        nameValidator: (name) => (name ? null : VALIDATOR_ERRORS_TEXT.NAME_REQUIRED),
        linkValidator: ({name, link}) =>
            name && link
                ? null
                : {
                      ...(!name ? {name: VALIDATOR_ERRORS_TEXT.NAME_REQUIRED} : {}),
                      ...(!link ? {link: VALIDATOR_ERRORS_TEXT.VALUE_REQUIRED} : {}),
                  },
        onSelectFile: async (file) =>
            toAttachment({
                id: uuidv4(),
                name: file.name,
                content: await file.text(),
                type: 'raw_inline_data',
            }),
        onChange: ({attachments, deletedAttachments}) => {
            const nextFiles = attachments.map(toQueryFile);
            const nextDeleted = deletedAttachments.map(toQueryFile);
            dispatch(applyQueryFiles(nextFiles, nextDeleted));
        },
        onItemClick: (item) =>
            dispatch(
                setFileEditor({
                    fileId: item.id,
                    fileType: deletedFiles.some(({id}) => id === item.id) ? 'deletedFile' : 'file',
                    isOpen: true,
                    isFullWidth: false,
                }),
            ),
    };
}
