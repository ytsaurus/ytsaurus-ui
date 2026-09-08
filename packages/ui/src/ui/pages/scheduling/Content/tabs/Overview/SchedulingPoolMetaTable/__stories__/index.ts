import {composeStories} from '@storybook/react';

import * as SchedulingPoolMetaTableStoryComponents from './SchedulingPoolMetaTable.stories';

export const SchedulingPoolMetaTableStories = composeStories(
    SchedulingPoolMetaTableStoryComponents,
);

export default SchedulingPoolMetaTableStoryComponents;
