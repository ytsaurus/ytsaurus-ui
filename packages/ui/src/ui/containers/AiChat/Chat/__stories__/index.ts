import {composeStories} from '@storybook/react';

import * as ChatStoriesComponents from './Chat.stories';

export const ChatStories = composeStories(ChatStoriesComponents);

export default ChatStoriesComponents;
