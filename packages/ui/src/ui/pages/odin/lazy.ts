import React from 'react';

import i18n from './i18n';
import {withDisableMaxContentWidth} from '../../containers/MaxContentWidth';
import withLazyLoading from '../../hocs/withLazyLoading';
import {type UIFactoryClusterPageInfo, type UIFactoryRootPageInfo} from '../../UIFactory';
import {PageOdin} from '../../icons/PageOdin';
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
    title: i18n('title_odin'),
    pageId: ODIN_PAGE_ID,
    svgIcon: PageOdin,
    reactComponent: OdinLazy,
    topRowComponent: OdinTopRowLazy,
    urlMapping: {
        [`/*/odin/details`]: [odinParams, getOdinPreparedState],
        [`/*/odin/overview`]: [odinOverviewParams, getOdinOverviewPreparedState],
    },
};

export const odinRootPageInfo: UIFactoryRootPageInfo = {
    title: i18n('title_odin'),
    pageId: ODIN_PAGE_ID,
    reactComponent: IndependentOdinLazy,
    reducers: {},
    urlMapping: {
        [`/odin/details`]: [odinIndependentParams, getOdinPreparedState],
        [`/odin/overview`]: [odinOverviewParams, getOdinOverviewPreparedState],
    },
};
