import {composeStories} from '@storybook/react';

import * as SegmentedRadioGroupOrSelectStoriesComponents from './SegmentedRadioGroupOrSelect.stories';

export const SegmentedRadioGroupOrSelectStories = composeStories(
    SegmentedRadioGroupOrSelectStoriesComponents,
);

export default SegmentedRadioGroupOrSelectStoriesComponents;
