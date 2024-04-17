import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {Redirect} from 'react-router';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import block from 'bem-cn-lite';
import Cookies from 'js-cookie';
import _ from 'lodash';
import moment from 'moment';

import hammer from '@ytsaurus/interface-helpers/lib/hammer';

import {SubjectCard} from '../../components/SubjectLink/SubjectLink';
import withBlockedNavigation from '../../hocs/withBlockedNavigation';
import Icon from '../../components/Icon/Icon';
import Button from '../../components/Button/Button';
import {Linkify} from '../../components/Linkify/Linkify';
import {uiSettings} from '../../config/ui-settings';

import './MaintenancePage.scss';

const b = block('maintenance');
const getCookiesClusterName = (cluster) => `override_${cluster}_maintenance`;

const EVENT_TYPE = {
    ISSUE: 'issue',
    MAINTENANCE: 'maintenance',
};

class MaintenancePage extends Component {
    static propTypes = {
        // from connect
        cluster: PropTypes.string.isRequired,
        maintenancePageEvent: PropTypes.object,
        // from react-router
        location: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    static defaultProps = {
        referrer: null,
        estimatedFinishTime: null,
        estimatedStartTime: null,
        publicationTime: null,
    };

    static setBypassCookie(cluster) {
        const name = getCookiesClusterName(cluster);

        Cookies.set(name, cluster, {
            expires: moment().add(3, 'hours').toDate(),
        });
    }

    static getBypassCookie(cluster) {
        const name = getCookiesClusterName(cluster);

        return Cookies.get(name) === cluster;
    }

    static checkMaintenancePageUrl(location) {
        return location.pathname.endsWith('/maintenance');
    }

    static getNotificationWithMaintenance(notifications) {
        return _.find(notifications, (notification) => {
            try {
                const meta = JSON.parse(notification.meta);
                return meta && meta.show_maintenance_page;
            } catch (err) {
                console.error('Failed to parse notification meta', err);
                return null;
            }
        });
    }

    static parsePath(path) {
        const pagePathRe = new RegExp('^/([^/]+)/(.*)$');
        const match = pagePathRe.exec(path);
        return {cluster: match[1], restPath: match[2]};
    }

    static getReferrerFromProps(props) {
        const {
            location: {state},
        } = props;
        return state && state.referrer;
    }

    static getDerivedStateFromProps(props, state) {
        const referrer = MaintenancePage.getReferrerFromProps(props);
        if (referrer && (!state || state.referrer !== referrer)) {
            return {referrer};
        }
        return null;
    }

    state = {referrer: null};

    get referrer() {
        return this.state.referrer;
    }

    get redirect() {
        const {location, maintenancePageEvent} = this.props;
        const referrer = this.referrer;

        if (referrer) {
            const {cluster} = MaintenancePage.parsePath(location.pathname);
            const {cluster: prevCluster, restPath} = MaintenancePage.parsePath(referrer);

            if (cluster === prevCluster) {
                return !maintenancePageEvent ? referrer : null;
            } else {
                return `/${cluster}/${restPath}`;
            }
        }

        return null;
    }

    get title() {
        const {type} = this.props.maintenancePageEvent;

        switch (type) {
            case 'maintenance':
                return 'Maintenance is under way';
            case 'issue':
                return 'Cluster experiences problems';
            default:
                return 'Oops! Something went wrong';
        }
    }

    handleGoToClusterClick = () => {
        const {cluster} = this.props;

        MaintenancePage.setBypassCookie(cluster);
    };

    renderTimeLine(notification) {
        const {startTime, finishTime} = notification;

        if ([EVENT_TYPE.ISSUE, EVENT_TYPE.MAINTENANCE].indexOf(notification.type) > -1) {
            const finishTimeString = finishTime && moment(finishTime).format('D MMM YYYY H:mm');
            const startTimeString = moment(startTime).format('D MMM YYYY H:mm');

            return finishTimeString ? (
                <p className={b('time-line')}>
                    <time>{startTimeString}</time>
                    &mdash;
                    <time>{finishTimeString}</time>
                </p>
            ) : (
                <p className={b('time-line')}>
                    <time>{startTimeString}</time>
                </p>
            );
        }

        return null;
    }

    render() {
        const {maintenancePageEvent} = this.props;
        const redirect = this.redirect;

        if (redirect || !maintenancePageEvent) {
            return <Redirect to={redirect} />;
        }

        const {severity, title, description, createdBy} = maintenancePageEvent;

        const {announcesMailListUrl} = uiSettings;

        return (
            <div className={b()}>
                <div className={b('content')}>
                    <div className={b('info')}>
                        <h2 className={b('title')}>{this.title}</h2>

                        <div className={b('severity', {type: severity})}>
                            <Icon awesome="exclamation-triangle" />
                            <span>{hammer.format['Readable'](severity)}</span>
                        </div>

                        <h3 className={b('user-title')}>{title}</h3>

                        <div className={b('user-description')}>
                            <Linkify text={description} />
                        </div>

                        {this.renderTimeLine(maintenancePageEvent)}

                        <SubjectCard className={b('author')} name={createdBy} />

                        <ul className={b('links')}>
                            {announcesMailListUrl && (
                                <li className={b('link')}>
                                    <Button
                                        href={announcesMailListUrl}
                                        target="_blank"
                                        view="action"
                                        type="link"
                                        size="m"
                                    >
                                        Subscribe to YT announces
                                    </Button>
                                </li>
                            )}

                            <li className={b('link')}>
                                <Link to={this.referrer} onClick={this.handleGoToClusterClick}>
                                    <Button size="m">Proceed to cluster anyway</Button>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div className={b('illustration')}></div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({global}) => {
    const {cluster, maintenancePageEvent} = global;
    return {cluster, maintenancePageEvent};
};

export default connect(mapStateToProps)(withBlockedNavigation(MaintenancePage));
