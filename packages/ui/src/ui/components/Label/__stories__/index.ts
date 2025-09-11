import {composeStories} from '@storybook/react';

import * as LabelStoriesComponents from './Label.stories';

export const LabelStories = composeStories(LabelStoriesComponents);

export default LabelStoriesComponents;
