import {Component} from 'react';
import PropTypes from 'prop-types';

export class PageTrackerBase extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.object,
        }),
        trackTabVisit: PropTypes.func.isRequired,
        trackPageVisit: PropTypes.func.isRequired,
    };

    componentDidMount() {
        const {match, trackPageVisit, trackTabVisit} = this.props;

        const page = this.getPage(match);
        const tab = this.getTab(match);
        trackPageVisit(page);
        if (tab) {
            trackTabVisit(page, tab);
        }
    }

    componentDidUpdate(prevProps) {
        const {match, trackPageVisit, trackTabVisit} = this.props;

        const currentPage = this.getPage(match);
        const prevPage = this.getPage(prevProps.match);

        const currentTab = this.getTab(match);
        const prevTab = this.getTab(prevProps.match);

        if (prevPage !== currentPage) {
            trackPageVisit(currentPage);
        }

        if (currentTab && prevTab !== currentTab) {
            trackTabVisit(currentPage, currentTab);
        }
    }

    getPage = (match) => match.params.page;
    getTab = (match) => match.params.tab;
    render = () => null;
}
