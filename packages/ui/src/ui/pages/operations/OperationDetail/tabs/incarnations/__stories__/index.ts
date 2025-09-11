import {composeStories} from '@storybook/react';

import * as IncarnationTemplateStories from './Incarnations.stories';

export const IncarnationStories = composeStories(IncarnationTemplateStories);

export default IncarnationStories;
