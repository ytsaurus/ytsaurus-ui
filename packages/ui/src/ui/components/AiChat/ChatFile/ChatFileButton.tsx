import React, {FC, useRef} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import PaperclipIcon from '@gravity-ui/icons/svgs/paperclip.svg';
import {useToggle} from 'react-use';
import {useSelector} from '../../../store/redux-hooks';
import {PopupWithCloseButton} from '../../../pages/query-tracker/QuerySettingsButton/PopupWithCloseButton';
import {ChatFilePopup} from './ChatFilePopup';
import {selectAttachedFiles} from '../../../store/selectors/ai/chat';
import cn from 'bem-cn-lite';
import './ChatFileButton.scss';

const block = cn('yt-chat-file-button');

export const ChatFileButton: FC = () => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [open, toggleOpen] = useToggle(false);
    const {length} = useSelector(selectAttachedFiles);

    return (
        <>
            <Button ref={btnRef} onClick={toggleOpen}>
                <Icon data={PaperclipIcon} size={16} />
                {length ? ` ${length}` : undefined}
            </Button>
            <PopupWithCloseButton
                className={block('popup')}
                anchorRef={btnRef}
                open={open}
                onClose={toggleOpen}
                placement="top"
            >
                <ChatFilePopup />
            </PopupWithCloseButton>
        </>
    );
};
