import React, {FC, useRef} from 'react';
import {RawJob} from '../../../../../../types/operations/job';
import hammer from '../../../../../../common/hammer';
import {ClipboardButton, Flex, Label, Popup} from '@gravity-ui/uikit';
import {useToggle} from 'react-use';
import './StatusInfo.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-job-status-info');

type Props = {
    state: RawJob['state'];
    info: RawJob['interruption_info'];
};

export const StatusInfo: FC<Props> = ({state, info}) => {
    const [open, toggleOpen] = useToggle(false);
    const anchorRef = useRef<HTMLDivElement>(null);
    const reason = hammer.format['ReadableField'](
        info?.preemption_reason || info?.interruption_reason,
    );

    return (
        <Flex alignItems="center" gap={1} className={block()}>
            {hammer.format['ReadableField'](state)}
            {Boolean(reason) && (
                <>
                    <div onMouseEnter={toggleOpen}>
                        <Label theme="warning" ref={anchorRef}>
                            Interrupted
                        </Label>
                    </div>

                    <Popup open={open} hasArrow anchorRef={anchorRef} onMouseLeave={toggleOpen}>
                        <div className={block('popup')}>
                            <div>{reason}</div>
                            <ClipboardButton
                                title="Copy reason"
                                view="flat-secondary"
                                size="s"
                                text={reason}
                            />
                        </div>
                    </Popup>
                </>
            )}
        </Flex>
    );
};
