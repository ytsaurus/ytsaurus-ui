import {composeStories} from '@storybook/react';

import * as BlockStoriesComponents from './Block.stories';

export const BlockStories = composeStories(BlockStoriesComponents);

export default BlockStoriesComponents;
