import {connect} from 'react-redux';

import {trackPageVisit, trackTabVisit} from '../../../store/actions/menu';

import {PageTrackerBase} from './PageTrackerBase';

const mapDispatchToProps = {
    trackPageVisit,
    trackTabVisit,
};

export const PageTracker = connect(null, mapDispatchToProps)(PageTrackerBase);
