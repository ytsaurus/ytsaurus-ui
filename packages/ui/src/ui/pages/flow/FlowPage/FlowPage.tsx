import React from 'react';
import cn from 'bem-cn-lite';

import {Flow} from '../../../pages/flow/Flow';
import './FlowPage.scss';
import {FlowMessagesDialogContext} from '../Flow/FlowGraph/renderers/FlowMessagesDialogContext/FlowMessagesDialogContext';
import {FlowPartitionsDistributionDialogContext} from '../Flow/FlowGraph/renderers/FlowPartitionsDistributionDialogContext/FlowPartitionsDistributionDialogContext';

const block = cn('yt-flow-page');

export function FlowPage() {
    return (
        <div className={block(null, 'elements-main-section')}>
            <FlowMessagesDialogContext>
                <FlowPartitionsDistributionDialogContext>
                    <Flow />
                </FlowPartitionsDistributionDialogContext>
            </FlowMessagesDialogContext>
        </div>
    );
}
