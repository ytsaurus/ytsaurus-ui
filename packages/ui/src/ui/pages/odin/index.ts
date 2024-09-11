import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';
import {UIFactoryClusterPageInfo, UIFactoryRootPageInfo} from '../../UIFactory';
import {PageOdin} from '../../icons/PageOdin';
import reducers from './_reducers';
import {
    getOdinOverviewPreparedState,
    getOdinPreparedState,
    odinIndependentParams,
    odinOverviewParams,
    odinParams,
} from './_reducers/url-mapping';
import {ODIN_PAGE_ID} from './odin-constants';

function importOdin() {
    return import('./controls/Odin');
}

const OdinLazy = withLazyLoading(React.lazy(() => importOdin()));
const IndependentOdinLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importOdin()).IndependentOdin};
    }),
);
const OdinTopRowContentLazy = withLazyLoading(
    React.lazy(() => import('./controls/OdinTopRowContent')),
);

export const odinPageInfo: UIFactoryClusterPageInfo = {
    title: 'Odin',
    pageId: ODIN_PAGE_ID,
    svgIcon: PageOdin,
    reducers,
    reactComponent: OdinLazy,
    topRowComponent: OdinTopRowContentLazy,
    urlMapping: {
        [`/*/odin/details`]: [odinParams, getOdinPreparedState],
        [`/*/odin/overview`]: [odinOverviewParams, getOdinOverviewPreparedState],
    },
};

export const odinRootPageInfo: UIFactoryRootPageInfo = {
    title: 'Odin',
    pageId: ODIN_PAGE_ID,
    reactComponent: IndependentOdinLazy,
    reducers: {},
    urlMapping: {
        [`/odin/details`]: [odinIndependentParams, getOdinPreparedState],
        [`/odin/overview`]: [odinOverviewParams, getOdinOverviewPreparedState],
    },
};
