import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';
import {type AiChatProps} from '../../UIFactory';

export const ChatLazy = withLazyLoading<AiChatProps>(
    React.lazy(() => import(/* webpackChunkName: 'code-assistant-chat' */ './Chat')),
);
