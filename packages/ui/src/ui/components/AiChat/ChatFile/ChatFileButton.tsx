import React, {FC, useRef} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import PaperclipIcon from '@gravity-ui/icons/svgs/paperclip.svg';
import {useToggle} from 'react-use';
import {useSelector} from 'react-redux';
import {PopupWithCloseButton} from '../../../pages/query-tracker/QuerySettingsButton/PopupWithCloseButton';
import {ChatFilePopup} from './ChatFilePopup/ChatFilePopup';
import {selectAttachedFiles} from '../../../store/selectors/ai/chat';

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
