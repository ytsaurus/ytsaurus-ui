import {withRouter} from 'react-router-dom';
import React, {Component} from 'react';
import {Redirect} from 'react-router';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {compose} from 'redux';

import MaintenancePage from '../../containers/MaintenancePage/MaintenancePage';

import {Page} from '../../constants/index';

class HandleRedirect extends Component {
    static propTypes = {
        location: PropTypes.object.isRequired,
        cluster: PropTypes.string,
        eventsFirstUpdate: PropTypes.bool.isRequired,
        maintenancePageEvent: PropTypes.object,
    };

    shouldComponentUpdate(nextProps) {
        const {location} = this.props;
        const {eventsFirstUpdate, location: nextLocation} = nextProps;
        const isDifferentLocation = location !== nextLocation;

        return isDifferentLocation || eventsFirstUpdate;
    }

    render() {
        const {location, cluster, maintenancePageEvent} = this.props;

        if (maintenancePageEvent) {
            const isMaintenancePage = MaintenancePage.checkMaintenancePageUrl(location);
            const isIgnored = MaintenancePage.getBypassCookie(cluster);
            const makeRedirect = Boolean(!isMaintenancePage && !isIgnored);

            if (makeRedirect) {
                const referrer = location.pathname + location.search;

                return (
                    <Redirect
                        to={{
                            pathname: `/${cluster}/${Page.MAINTENANCE}`,
                            state: {referrer},
                        }}
                    />
                );
            }

            return null;
        }

        return null;
    }
}

const mapStateToProps = ({global}) => {
    const {maintenancePageEvent, eventsFirstUpdate, cluster} = global;

    return {maintenancePageEvent, eventsFirstUpdate, cluster};
};

export default compose(withRouter, connect(mapStateToProps))(HandleRedirect);
