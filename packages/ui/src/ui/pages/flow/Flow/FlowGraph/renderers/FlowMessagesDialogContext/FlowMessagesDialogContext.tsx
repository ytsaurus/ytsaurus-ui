import cn from 'bem-cn-lite';
import React from 'react';
import {DialogWrapper} from '../../../../../../components/DialogWrapper/DialogWrapper';
import {FlowMessagesContent} from '../FlowGraphRenderer';
import '../FlowGraphRenderer.scss';
import i18n from './i18n';
import {FlowMessagesDialogCtx, type FlowMessagesDialogData} from './FlowMessagesDialogContextState';

const block = cn('yt-flow-graph-renderer');

export function FlowMessagesDialogContext({children}: {children: React.ReactNode}) {
    const [data = [], setVisibleMessages] = React.useState<FlowMessagesDialogData>();
    return (
        <FlowMessagesDialogCtx.Provider value={{data, setVisibleMessages}}>
            {children}
            {data.length > 0 && (
                <DialogWrapper
                    className={block('messages-dialog')}
                    open={true}
                    onClose={() => setVisibleMessages(undefined)}
                >
                    <DialogWrapper.Header caption={i18n('title_messages')} />
                    <DialogWrapper.Body className={block('messages-body')}>
                        <FlowMessagesContent data={data} />
                    </DialogWrapper.Body>
                </DialogWrapper>
            )}
        </FlowMessagesDialogCtx.Provider>
    );
}
