import React from 'react';
import cn from 'bem-cn-lite';

import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';

import modalI18n from '../../../../components/Modal/i18n';

import './FlowDialogCloseButton.scss';

const block = cn('yt-flow-dialog-close-button');

export type FlowDialogCloseButtonProps = {
    disabled?: boolean;
    onClick: () => void;
};

export function FlowDialogCloseButton({disabled, onClick}: FlowDialogCloseButtonProps) {
    const closeLabel = modalI18n('action_close');

    return (
        <div className={block()}>
            <Tooltip content={closeLabel}>
                <Button
                    view="flat"
                    size="l"
                    aria-label={closeLabel}
                    disabled={disabled}
                    onClick={onClick}
                >
                    <Icon data={XmarkIcon} size={20} />
                </Button>
            </Tooltip>
        </div>
    );
}
