import React from 'react';
import cn from 'bem-cn-lite';

import {Flow} from '../../../pages/flow/Flow';
import './FlowPage.scss';
import {FlowMessagesDialogContext} from '../Flow/FlowGraph/renderers/FlowMessagesDialogContext/FlowMessagesDialogContext';

const block = cn('yt-flow-page');

export function FlowPage() {
    return (
        <div className={block(null, 'elements-main-section')}>
            <FlowMessagesDialogContext>
                <Flow />
            </FlowMessagesDialogContext>
        </div>
    );
}
