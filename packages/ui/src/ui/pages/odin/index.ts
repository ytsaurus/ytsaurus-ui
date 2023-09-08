import axios from 'axios';
import UIFactory, {
    UIFactoryClusterPageInfo,
    UIFactoryRootPageInfo,
} from '@ytsaurus/ui/build/esm/ui/UIFactory';
import {odinPageId} from '../../../../ya-shared/constants';
import svgOdin from '../../icons/page-odin.svg';
import Odin, {IndependentOdin} from './controls/Odin';
import OdinTopRowContent from './controls/OdinTopRowContent';
import reducers from './_reducers';
import {
    getOdinPreparedState,
    odinIndependentParams,
    odinOverviewParams,
    odinParams,
} from './_reducers/url-mapping';

export const odinPageInfo: UIFactoryClusterPageInfo = {
    title: 'Odin',
    pageId: odinPageId,
    svgIcon: svgOdin,
    reducers,
    reactComponent: Odin,
    topRowComponent: OdinTopRowContent,
    urlMapping: {
        [`/*/${odinPageId}/details`]: [odinParams, getOdinPreparedState],
    },
};

export const odinRootPageInfo: UIFactoryRootPageInfo = {
    title: 'Odin',
    pageId: odinPageId,
    reactComponent: IndependentOdin,
    reducers: {},
    urlMapping: {
        [`/${odinPageId}/details`]: [odinIndependentParams, getOdinPreparedState],
        [`/${odinPageId}/overview`]: [odinOverviewParams, getOdinPreparedState],
    },
};

export const fetchClustersAvailability: typeof UIFactory.loadClustersAvailability = () => {
    return axios.request({
        method: 'get',
        url: '/api/odin/clusters/availability',
    });
};
