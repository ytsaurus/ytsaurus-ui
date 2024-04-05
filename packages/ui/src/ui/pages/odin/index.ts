import {UIFactoryClusterPageInfo, UIFactoryRootPageInfo} from '../../UIFactory';
import {PageOdin} from '../../icons/PageOdin';
import Odin, {IndependentOdin} from './controls/Odin';
import OdinTopRowContent from './controls/OdinTopRowContent';
import reducers from './_reducers';
import {
    getOdinOverviewPreparedState,
    getOdinPreparedState,
    odinIndependentParams,
    odinOverviewParams,
    odinParams,
} from './_reducers/url-mapping';
import {ODIN_PAGE_ID} from './odin-constants';

export const odinPageInfo: UIFactoryClusterPageInfo = {
    title: 'Odin',
    pageId: ODIN_PAGE_ID,
    svgIcon: PageOdin,
    reducers,
    reactComponent: Odin,
    topRowComponent: OdinTopRowContent,
    urlMapping: {
        [`/*/odin/details`]: [odinParams, getOdinPreparedState],
        [`/*/odin/overview`]: [odinOverviewParams, getOdinOverviewPreparedState],
    },
};

export const odinRootPageInfo: UIFactoryRootPageInfo = {
    title: 'Odin',
    pageId: ODIN_PAGE_ID,
    reactComponent: IndependentOdin,
    reducers: {},
    urlMapping: {
        [`/odin/details`]: [odinIndependentParams, getOdinPreparedState],
        [`/odin/overview`]: [odinOverviewParams, getOdinOverviewPreparedState],
    },
};
