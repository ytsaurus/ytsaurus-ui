import {composeStories} from '@storybook/react';

import * as NoContentStoriesComponents from './NoContent.stories';

export const NoContentStories = composeStories(NoContentStoriesComponents);

export default NoContentStoriesComponents;
