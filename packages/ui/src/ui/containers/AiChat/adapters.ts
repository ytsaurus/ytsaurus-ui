import {type Conversation} from '../../../shared/ai-chat';
import {type ChatType} from '@gravity-ui/aikit';
import i18n from './i18n';

export function toChat(conversation: Conversation): ChatType {
    return {
        id: conversation.id,
        name: conversation.metadata?.topic || i18n('action_new-chat'),
        createTime: new Date(conversation.created_at * 1000).toISOString(),
    };
}
