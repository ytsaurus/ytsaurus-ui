import React, {useRef, useState} from 'react';
import {FileDropZone} from '@gravity-ui/aikit/FileDropZone';
import {FileItem} from '@gravity-ui/aikit/FileItem';
import {Paperclip} from '@gravity-ui/icons';
import {Button, Flex, Icon, useToaster} from '@gravity-ui/uikit';
import {DialogWrapper as Dialog} from '../../../components/DialogWrapper/DialogWrapper';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectAttachedFiles, selectChatSending} from '../../../store/selectors/ai/chat';
import {attachFiles} from '../../../store/actions/ai/chat';
import {clearAttachedFiles} from '../../../store/reducers/ai/chatSlice';
import {textFileValidator} from './textFileValidator';
import i18n from '../i18n';

export function ChatAttachments() {
    const dispatch = useDispatch();
    const files = useSelector(selectAttachedFiles);
    const sending = useSelector(selectChatSending);
    const toaster = useToaster();
    const [draft, setDraft] = useState<File[]>();
    const [validating, setValidating] = useState(false);
    const generation = useRef(0);
    const onClose = () => {
        generation.current++;
        setDraft(undefined);
        setValidating(false);
    };
    const onAdd = async (added: File[]) => {
        const currentGeneration = generation.current;
        setValidating(true);
        const valid: File[] = [];
        for (const file of added) {
            const result = await textFileValidator(file);
            if (generation.current !== currentGeneration) return;
            if (result.isValid) valid.push(file);
            else toaster.add({name: 'file-validation-error', title: result.error, theme: 'danger'});
        }
        setDraft((current) => {
            if (!current) return current;
            const next = [...current];
            for (const file of valid) {
                if (!next.some((item) => item.name === file.name && item.size === file.size)) {
                    next.push(file);
                }
            }
            return next;
        });
        setValidating(false);
    };
    return (
        <>
            <Button
                view="flat"
                disabled={sending}
                title={i18n('title_attach-files')}
                aria-label={i18n('title_attach-files')}
                onClick={() => setDraft([...files])}
            >
                <Icon data={Paperclip} size={16} />
                {files.length ? ` ${files.length}` : undefined}
            </Button>
            <Dialog open={Boolean(draft)} onClose={onClose}>
                <Dialog.Header caption={i18n('title_attach-files')} />
                <Dialog.Body>
                    <Flex direction="column" gap={3}>
                        <FileDropZone
                            multiple
                            disabled={sending || validating}
                            hint={i18n('context_text-files-only')}
                            onAdd={onAdd}
                        />
                        {draft?.map((file) => (
                            <FileItem
                                key={`${file.name}-${file.size}`}
                                name={file.name}
                                size={file.size}
                                mimeType={file.type}
                                onRemove={() =>
                                    setDraft((current) => current?.filter((item) => item !== file))
                                }
                            />
                        ))}
                    </Flex>
                </Dialog.Body>
                <Dialog.Footer
                    textButtonApply={i18n('action_apply')}
                    textButtonCancel={i18n('action_cancel')}
                    propsButtonApply={{disabled: sending || validating}}
                    onClickButtonCancel={onClose}
                    onClickButtonApply={() => {
                        if (sending || validating || !draft) return;
                        dispatch(clearAttachedFiles());
                        dispatch(attachFiles(draft));
                        onClose();
                    }}
                />
            </Dialog>
        </>
    );
}
