import React from 'react';
import withLazyLoading from '../../hocs/withLazyLoading';

export const PathViewerLazy = withLazyLoading(
    React.lazy(async () => await import(/* webpackChunkName: "path-viewer" */ './PathViewer')),
);
