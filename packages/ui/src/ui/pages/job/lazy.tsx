import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const JobLazy = withLazyLoading(React.lazy(async () => import('./Job')));
