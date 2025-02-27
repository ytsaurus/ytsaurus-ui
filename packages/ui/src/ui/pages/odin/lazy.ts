import React from 'react';

import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';
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

function importPage() {
    return import(/* webpackChunkName: "odin" */ './index');
}

const OdinLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importPage()).Odin};
        }),
    ),
);
const IndependentOdinLazy = withDisableMaxContentWidth(
    withLazyLoading(
        React.lazy(async () => {
            return {default: (await importPage()).IndependentOdin};
        }),
    ),
);
const OdinTopRowLazy = withLazyLoading(
    React.lazy(async () => {
        return {default: (await importPage()).OdinTopRow};
    }),
    '',
);

export const odinPageInfo: UIFactoryClusterPageInfo = {
    title: 'Odin',
    pageId: ODIN_PAGE_ID,
    svgIcon: PageOdin,
    reducers,
    reactComponent: OdinLazy,
    topRowComponent: OdinTopRowLazy,
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
