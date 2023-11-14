import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';
import {Loader} from '@gravity-ui/uikit';

import cn from 'bem-cn-lite';

import './index.scss';

const b = cn('query-tracker-page-lazy');

const QueryTracker = React.lazy(() => import('./QueryTracker'));

export default withLazyLoading(QueryTracker, <Loader className={b('loader')} size="l" />);
