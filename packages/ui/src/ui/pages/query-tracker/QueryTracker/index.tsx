import React from 'react';
import withLazyLoading from '../../../hocs/withLazyLoading';

const QueryTracker = React.lazy(() => import('./QueryTracker'));

export default withLazyLoading(QueryTracker);
