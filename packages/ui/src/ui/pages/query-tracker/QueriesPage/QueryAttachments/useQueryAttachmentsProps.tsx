import {selectQuerySessionRevision} from '../../../../store/selectors/query-tracker/querySession';
import {useState} from 'react';
import type {AttachmentsProps} from '@gravity-ui/querieskit';
import {v4 as uuidv4} from 'uuid';
import isEqual_ from 'lodash/isEqual';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectQueryFiles} from '../../../../store/selectors/query-tracker/query';
import {selectDeletedFiles} from '../../../../store/selectors/query-tracker/queryFilesForm';
import {updateQueryDraft} from '../../../../store/actions/query-tracker/query';
import {
    setDeletedFiles,
    setFileEditor,
} from '../../../../store/reducers/query-tracker/queryFilesFormSlice';
import {VALIDATOR_ERRORS_TEXT} from '../../QuerySettingsButton/formValidator';
import {type QueryAttachment, createAttachment, toAttachment, toQueryFile} from './attachments';

export function useQueryAttachmentsProps(): AttachmentsProps<QueryAttachment> {
    const dispatch = useDispatch();
    const files = useSelector(selectQueryFiles);
    const deletedFiles = useSelector(selectDeletedFiles);
    const revision = useSelector(selectQuerySessionRevision);
    // Only unapplied rows are local. Saved content always comes from the shared file editor.
    const [draftState, setDraftState] = useState<{revision: number; items: QueryAttachment[]}>({
        revision,
        items: [],
    });
    const drafts = draftState.revision === revision ? draftState.items : [];
    const setDrafts = (items: QueryAttachment[]) => setDraftState({revision, items});
    return {
        attachments: [...files.map(toAttachment), ...drafts],
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
            setDrafts(attachments.filter(({isNew}) => isNew));
            const nextFiles = attachments.filter(({isNew}) => !isNew).map(toQueryFile);
            const nextDeleted = deletedAttachments.filter(({isNew}) => !isNew).map(toQueryFile);
            if (!isEqual_(files, nextFiles)) dispatch(updateQueryDraft({files: nextFiles}));
            if (!isEqual_(deletedFiles, nextDeleted)) dispatch(setDeletedFiles(nextDeleted));
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
