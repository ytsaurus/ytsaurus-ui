import {type TutorialHistoryRow} from '@gravity-ui/querieskit';

import {type QueryItem} from '../../../../types/query-tracker/api';

export type TutorialRow = TutorialHistoryRow & {queryItem: QueryItem};
