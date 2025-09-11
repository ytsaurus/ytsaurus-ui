import {composeStories} from '@storybook/react';

import * as StatusLabelStoriesComponents from './StatusLabel.stories';

export const StatusLabelStories = composeStories(StatusLabelStoriesComponents);

export default StatusLabelStoriesComponents;
