import {composeStories} from '@storybook/react';

import * as AccountEditorHostStoryComponents from './AccountEditorHost.stories';
import * as AccountDeleteEditorStoryComponents from './AccountDeleteEditor.stories';

export const AccountEditorHostStories = composeStories(AccountEditorHostStoryComponents);
export const AccountDeleteEditorStories = composeStories(AccountDeleteEditorStoryComponents);

export default AccountEditorHostStoryComponents;
