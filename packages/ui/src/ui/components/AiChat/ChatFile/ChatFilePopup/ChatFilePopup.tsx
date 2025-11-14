import React, {FC} from 'react';
import {Button, Flex, Icon, Text, Toaster} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {FileDropZone} from '../../../FileDropZone/FileDropZone';
import {addAttachedFile, removeAttachedFile} from '../../../../store/reducers/ai/chatSlice';
import {selectAttachedFiles} from '../../../../store/selectors/ai/chat';
import TrashBinIcon from '@gravity-ui/icons/svgs/trash-bin.svg';
import i18n from './i18n';
import {textFileValidator} from './textFileValidator';
import './ChatFilePopup.scss';

const block = cn('yt-chat-file-popup');

const toaster = new Toaster();

export const ChatFilePopup: FC = () => {
    const dispatch = useDispatch();
    const files = useSelector(selectAttachedFiles);

    const handleFileAdd = async (fileList: FileList | null) => {
        if (!fileList) return;

        for (const file of Array.from(fileList)) {
            const {isValid, error} = await textFileValidator(file);

            if (!isValid) {
                toaster.add({
                    name: 'file-validation-error',
                    title: error,
                    theme: 'danger',
                });
                continue;
            }

            dispatch(addAttachedFile(file));
        }
    };

    const handleFileRemove = (index: number) => {
        dispatch(removeAttachedFile(index));
    };

    return (
        <Flex direction="column" className={block()} gap={3}>
            <Text variant="subheader-3">{i18n('title_attach-files')}</Text>
            <FileDropZone isEmpty={files.length === 0} isDropable={true} onFile={handleFileAdd} />
            {files.length > 0 && (
                <Flex direction="column" gap={1} className={block('files-list')}>
                    {files.map((file, index) => (
                        <Flex
                            key={index}
                            alignItems="center"
                            justifyContent="space-between"
                            className={block('file-item')}
                        >
                            <Text variant="body-1" ellipsis>
                                {file.name}
                            </Text>
                            <Button view="flat" onClick={() => handleFileRemove(index)}>
                                <Icon data={TrashBinIcon} size={16} />
                            </Button>
                        </Flex>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};
