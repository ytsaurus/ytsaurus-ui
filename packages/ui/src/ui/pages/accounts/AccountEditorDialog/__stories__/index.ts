import {composeStories} from '@storybook/react';

import * as AccountEditorHostStoryComponents from './AccountEditorHost.stories';
import * as AccountQuotaEditorStoryComponents from './AccountQuotaEditor.stories';
import * as AccountDeletedStoryComponents from './AccountDeleted.stories';
import * as AccountDeleteEditorStoryComponents from './AccountDeleteEditor.stories';

export const AccountEditorHostStories = composeStories(AccountEditorHostStoryComponents);
export const AccountQuotaEditorStories = composeStories(AccountQuotaEditorStoryComponents);
export const AccountDeletedStories = composeStories(AccountDeletedStoryComponents);
export const AccountDeleteEditorStories = composeStories(AccountDeleteEditorStoryComponents);

export default AccountEditorHostStoryComponents;
