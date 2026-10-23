import React, {useEffect, useState} from 'react';
import type {Meta, StoryObj} from '@storybook/react';
import {Button, ToasterProvider} from '@gravity-ui/uikit';
import Chat from '../Chat';
import ChatProvider from '../../ChatProvider/ChatProvider';
import {chatHistoryHandlers, chatResponseHandler} from './mocks';
import {useDispatch} from '../../../../store/redux-hooks';
import {toaster} from '../../../../utils/toaster';
import {
    addAttachedFile,
    addConversationItem,
    resetChat,
    setSending,
} from '../../../../store/reducers/ai/chatSlice';

type Scenario = 'empty' | 'messages' | 'streaming' | 'error' | 'attachments';
export function ChatFixture({scenario = 'empty'}: {scenario?: Scenario}) {
    const dispatch = useDispatch();
    const [ready, setReady] = useState(false);
    const [open, setOpen] = useState(true);
    useEffect(() => {
        dispatch(resetChat());
        if (scenario === 'messages' || scenario === 'streaming') {
            dispatch(
                addConversationItem({
                    id: 'question',
                    role: 'user',
                    content: 'Explain this query',
                }),
            );
            dispatch(
                addConversationItem({
                    id: 'answer',
                    role: 'assistant',
                    content: '## Query\n\nThis query returns a number.\n\n```sql\nSELECT 1;\n```',
                }),
            );
        }
        if (scenario === 'attachments') {
            dispatch(addAttachedFile(new File(['SELECT 1;'], 'query.sql', {type: 'text/plain'})));
        }
        if (scenario === 'streaming') {
            dispatch(setSending(true));
            dispatch(
                addConversationItem({
                    id: 'streaming',
                    role: 'assistant',
                    content: 'Still generating',
                }),
            );
        }
        if (scenario === 'error')
            dispatch(
                addConversationItem({
                    id: 'error',
                    role: 'assistant',
                    content: {type: 'text', data: {text: ''}},
                    error: new globalThis.Error('Unable to send message'),
                }),
            );
        setReady(true);
        return () => {
            dispatch(resetChat());
        };
    }, [dispatch, scenario]);
    if (!ready) return null;
    return (
        <ChatProvider>
            <div style={{height: 640, width: 420}}>
                {open ? (
                    <Chat onClose={() => setOpen(false)} />
                ) : (
                    <Button onClick={() => setOpen(true)}>Open chat</Button>
                )}
            </div>
        </ChatProvider>
    );
}
const meta: Meta<typeof ChatFixture> = {
    title: 'Containers/AiChat',
    component: ChatFixture,
    decorators: [
        (Story) => (
            <ToasterProvider toaster={toaster}>
                <Story />
            </ToasterProvider>
        ),
    ],
    parameters: {msw: {handlers: [chatResponseHandler, ...chatHistoryHandlers]}},
};
export default meta;
type Story = StoryObj<typeof ChatFixture>;
export const Empty: Story = {args: {scenario: 'empty'}};
export const Messages: Story = {args: {scenario: 'messages'}};
export const Streaming: Story = {args: {scenario: 'streaming'}};
export const Error: Story = {args: {scenario: 'error'}};
export const Attachments: Story = {args: {scenario: 'attachments'}};
