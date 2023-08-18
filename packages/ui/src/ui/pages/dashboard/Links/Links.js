import React, {Component} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';
import _ from 'lodash';

import Tabs from '../../../components/Tabs/Tabs';
import Link from '../../../components/Link/Link';

import {changeActiveTab} from '../../../store/actions/dashboard/dashboad';
import {LinksTab} from '../../../constants/dashboard';
import {Page} from '../../../constants/index';
import hammer from '../../../common/hammer';
import {
    getFavouriteAccounts,
    getFavouritePaths,
    getLastVisitedAccounts,
    getLastVisitedPaths,
    getPopularAccounts,
    getPopularPaths,
} from '../../../store/selectors/favourites';

import './Links.scss';
import {genAccountsUrl} from '../../accounts/AccountLink';
import {getCluster, getUISizes} from '../../../store/selectors/global';

const linksBlock = cn('dashboard-links');
const listBlock = cn('elements-list');

const FavouriteItemType = PropTypes.shape({
    path: PropTypes.string.isRequired,
});
const PopularItemType = PropTypes.shape({
    path: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
});

class Links extends Component {
    static propTypes = {
        // from connect
        activeTab: PropTypes.string.isRequired,

        lastVisited: PropTypes.arrayOf(PopularItemType).isRequired,
        popular: PropTypes.arrayOf(PopularItemType).isRequired,
        favourites: PropTypes.arrayOf(FavouriteItemType).isRequired,

        lastVisitedAccounts: PropTypes.arrayOf(PopularItemType).isRequired,
        popularAccounts: PropTypes.arrayOf(PopularItemType).isRequired,
        favouriteAccounts: PropTypes.arrayOf(FavouriteItemType).isRequired,

        changeActiveTab: PropTypes.func.isRequired,

        // from hoc
        cluster: PropTypes.string.isRequired,
    };

    renderLink(defaultUrl, path) {
        return (
            <li key={path} className={linksBlock('item')}>
                <Link
                    className="elements-ellipsis"
                    url={defaultUrl + encodeURIComponent(path)}
                    theme="primary"
                    routed
                >
                    {path}
                </Link>
            </li>
        );
    }

    renderLinks(listName, links, defaultUrl) {
        const {activeTab} = this.props;
        const content =
            links.length > 0 ? (
                <ul className={listBlock({type: 'unstyled'}, linksBlock('list'))}>
                    {_.map(links, ({path}) => this.renderLink(defaultUrl, path))}
                </ul>
            ) : (
                <span className={linksBlock('list', {empty: 'yes'})}>
                    You have no {hammer.format['ReadableField'](activeTab)} {listName} yet
                </span>
            );

        return (
            <div className={linksBlock('tab-content-item')}>
                <div className={linksBlock('tab-content-item-header')}>{listName}</div>
                {content}
            </div>
        );
    }

    renderLists(paths, accounts) {
        const {cluster} = this.props;
        const navigationUrl = `/${cluster}/${Page.NAVIGATION}?path=`;
        const accountsUrl = genAccountsUrl(cluster, '');

        return (
            <React.Fragment>
                {paths && this.renderLinks('paths', paths, navigationUrl)}
                {accounts && this.renderLinks('accounts', accounts, accountsUrl)}
            </React.Fragment>
        );
    }

    renderTabContent() {
        const {
            activeTab,
            lastVisited,
            popular,
            favourites,
            lastVisitedAccounts,
            popularAccounts,
            favouriteAccounts,
        } = this.props;

        switch (activeTab) {
            case LinksTab.LAST_VISITED:
                return this.renderLists(lastVisited, lastVisitedAccounts);
            case LinksTab.POPULAR:
                return this.renderLists(popular, popularAccounts);
            case LinksTab.FAVOURITES:
                return this.renderLists(favourites, favouriteAccounts);
        }
    }

    renderTabs() {
        const {changeActiveTab, activeTab} = this.props;

        return (
            <Tabs
                size="m"
                active={activeTab}
                onTabChange={changeActiveTab}
                className={linksBlock('tabs')}
                items={[
                    {
                        value: LinksTab.LAST_VISITED,
                        text: 'Last Visited',
                        show: true,
                    },
                    {value: LinksTab.POPULAR, text: 'Popular', show: true},
                    {
                        value: LinksTab.FAVOURITES,
                        text: 'Favourite',
                        show: true,
                    },
                ]}
            />
        );
    }

    render() {
        return (
            <div className={linksBlock()}>
                {this.renderTabs()}
                <div className={linksBlock('tab-content')}>{this.renderTabContent()}</div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const {activeTab} = state.dashboard;

    return {
        activeTab,
        lastVisited: getLastVisitedPaths(state),
        popular: getPopularPaths(state),
        favourites: getFavouritePaths(state),
        lastVisitedAccounts: getLastVisitedAccounts(state),
        popularAccounts: getPopularAccounts(state),
        favouriteAccounts: getFavouriteAccounts(state),
        tabSize: getUISizes().tabSize,
        cluster: getCluster(state),
    };
};

export default connect(mapStateToProps, {changeActiveTab})(Links);
