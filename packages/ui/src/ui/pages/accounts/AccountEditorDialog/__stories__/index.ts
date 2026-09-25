import {composeStories} from '@storybook/react';

import * as AccountEditorHostStoryComponents from './AccountEditorHost.stories';
import * as AccountQuotaEditorStoryComponents from './AccountQuotaEditor.stories';

export const AccountEditorHostStories = composeStories(AccountEditorHostStoryComponents);
export const AccountQuotaEditorStories = composeStories(AccountQuotaEditorStoryComponents);

export default AccountEditorHostStoryComponents;
