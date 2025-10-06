import React, {FC, useRef} from 'react';
import KeyIcon from '@gravity-ui/icons/svgs/key.svg';
import {Button, Icon} from '@gravity-ui/uikit';
import {QueryTokenDropdown} from './QueryTokenDropdown';
import {useToggle} from 'react-use';
import {PopupWithCloseButton} from '../../QuerySettingsButton/PopupWithCloseButton';
import {useSelector} from 'react-redux';
import {getQuerySecrets} from '../../../../store/selectors/query-tracker/query';

export const QueryTokenButton: FC = () => {
    const btnRef = useRef<HTMLButtonElement>(null);
    const [open, toggleOpen] = useToggle(false);
    const haveSecrets = useSelector(getQuerySecrets).length > 0;

    return (
        <>
            <Button
                ref={btnRef}
                view={haveSecrets ? 'outlined-info' : 'outlined'}
                size="l"
                onClick={toggleOpen}
            >
                <Icon data={KeyIcon} size={16} />
            </Button>
            <PopupWithCloseButton anchorRef={btnRef} open={open} onClose={toggleOpen}>
                <QueryTokenDropdown />
            </PopupWithCloseButton>
        </>
    );
};
