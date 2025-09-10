import {composeStories} from '@storybook/react';

import * as CountsListStoriesComponents from './CountsList.stories';

export const CountsListStories = composeStories(CountsListStoriesComponents);

export default CountsListStoriesComponents;
