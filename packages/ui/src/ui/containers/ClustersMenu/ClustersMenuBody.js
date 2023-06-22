import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';
import _ from 'lodash';

import {CLUSTER_GROUPS, CLUSTER_GROUPS_ORDER, DEFAULT_GROUP} from '../../constants/cluster-menu';
import format from '@ytsaurus/interface-helpers/lib/hammer/format';
import {utils} from '../../common/hammer/utils';
import ElementsTable from '../../components/ElementsTable/ElementsTable';
import {sortStateType} from '../../components/ElementsTable/ElementsTableHeader';
import {fetchClusterAvailability, fetchClusterVersions} from '../../store/actions/clusters-menu';
import {CLUSTER_MENU_TABLE_ID} from '../../constants/tables';
import {getClusterAppearance} from '../../appearance';
import YT from '../../config/yt-config';
import './ClusterMenuBody.scss';

const b = block('cluster-menu');

class ClustersMenuBody extends Component {
    static propTypes = {
        // from connect
        clusterFilter: PropTypes.string,
        viewMode: PropTypes.oneOf(['dashboard', 'table']),
        clusters: PropTypes.object,
        fetchClusterVersions: PropTypes.func.isRequired,
        fetchClusterAvailability: PropTypes.func.isRequired,
        sortState: sortStateType.isRequired,
    };

    componentDidMount() {
        const {fetchClusterVersions, fetchClusterAvailability} = this.props;

        fetchClusterVersions();
        if (YT.environment !== 'localmode') {
            fetchClusterAvailability();
        }
    }

    prepareGroups(clusters) {
        function sortByClusterName(clusterA, clusterB) {
            return clusterA.name > clusterB.name ? 1 : -1;
        }

        const groups = _.reduce(
            clusters,
            (groups, cluster) => {
                const currentGroup = cluster.group || DEFAULT_GROUP;
                groups[currentGroup] = groups[currentGroup] || [];
                groups[currentGroup].push(cluster);
                return groups;
            },
            {},
        );

        _.each(groups, (clusters) => {
            clusters.sort(sortByClusterName);
        });

        return groups;
    }

    renderVersion({loadState, access, version, status}) {
        let title;
        let text = '—';
        if (loadState === 'loaded') {
            if (access === 'granted') {
                title = `Current cluster version: ${version}`;
                text = version;
            } else if (access === 'none' && status === 'available') {
                title = 'Please refer to Getting Started for more details';
                text = 'No access';
            } else if (access === 'none' && status !== 'available') {
                title = 'Could not load version, cluster is unavailable';
            }
        } else {
            title = 'Please wait, loading cluster version';
        }
        return (
            <div className={b('item-version')} title={title}>
                {text}
            </div>
        );
    }

    renderCluster(cluster, size) {
        const {status, access, id, name, environment, descriptionEnglish, description, theme} =
            cluster;
        const className = b('item', {
            state: status,
            access: status === 'available' && access,
            size,
        });

        const clusterTheme = theme ? `cluster-color_theme_${theme}` : 'cluster-color';
        const {iconbig, icon2x} = getClusterAppearance(id);

        return (
            <Link key={id} className={className} to={'/' + id}>
                <div className={b('item-body')}>
                    <div className={b('item-heading')}>{name}</div>

                    <div className={b('item-image-wrapper')}>
                        <div
                            className={b('item-image', clusterTheme)}
                            style={{
                                backgroundImage: 'url(' + (iconbig || icon2x) + ')',
                            }}
                        />
                    </div>

                    <div className={b('item-image-veil')} />

                    {this.renderVersion(cluster)}

                    <div className={b('item-environment')}>
                        <span>{format['ValueOrDefault'](environment)}</span>
                    </div>

                    <div className={b('item-description', 'elements-multiline-ellipsis')}>
                        {descriptionEnglish ? descriptionEnglish : description}
                    </div>
                </div>
            </Link>
        );
    }

    renderDashboard(clusters) {
        const clusterGroups = this.prepareGroups(clusters);

        const unknown = _.filter(
            Object.keys(clusterGroups),
            (groupName) => !(groupName in CLUSTER_GROUPS),
        );

        return (
            <main key="body" className={b(false, 'elements-page__content')}>
                {_.map(CLUSTER_GROUPS_ORDER.concat(unknown), (groupName) => {
                    const clusters = clusterGroups[groupName];
                    const {caption, size} = CLUSTER_GROUPS[groupName] ?? {caption: groupName};

                    return (
                        clusters &&
                        clusters.length && (
                            <div key={groupName} className={b('group')}>
                                <div
                                    className={b(
                                        'heading',
                                        {position: 'center', size: 'l'},
                                        b('group-heading'),
                                    )}
                                >
                                    {caption}
                                </div>
                                <div className={b('list')}>
                                    {_.map(clusters, (cluster) =>
                                        this.renderCluster(cluster, size),
                                    )}
                                </div>
                            </div>
                        )
                    );
                })}
            </main>
        );
    }

    renderTable(clusters) {
        const tableSettings = {
            css: 'cluster-menu',
            theme: 'light',
            striped: true,
            tableId: CLUSTER_MENU_TABLE_ID,
            computeKey: function (item) {
                return item.name;
            },
            onItemClick: function (item) {
                // FIXME: give back control to react-router once we no longer need to render full page on server
                // to get cluster credentials
                window.location = `/${item.id}`;
            },
            columns: {
                items: {
                    image: {
                        align: 'center',
                        caption: '',
                        sort: false,
                    },
                    name: {
                        get: function (cluster) {
                            return cluster.name;
                        },
                        sort: true,
                        align: 'left',
                    },
                    environment: {
                        get: function (cluster) {
                            return cluster.environment;
                        },
                        sort: true,
                        align: 'left',
                    },
                    version: {
                        get: function (cluster) {
                            return [cluster.version, cluster.id];
                        },
                        sort: true,
                        align: 'right',
                    },
                    status: {
                        get: function (cluster) {
                            return [cluster.status, cluster.id];
                        },
                        sort: true,
                        align: 'center',
                    },
                    access: {
                        get: function (cluster) {
                            return [cluster.access, cluster.id];
                        },
                        sort: true,
                        align: 'center',
                    },
                },
                sets: {
                    default: {
                        items: ['image', 'name', 'environment', 'version', 'status', 'access'],
                    },
                },
                mode: 'default',
            },
            templates: {
                key: 'cluster-menu',
                data: {},
            },
        };

        const {sortState} = this.props;
        const table = Object.assign({}, tableSettings, {
            items: utils.sort(clusters, sortState, tableSettings.columns.items),
            columns: Object.assign({}, tableSettings.columns),
        });

        return (
            <main key="body" className={b(false, 'elements-page__content')}>
                <div className={b('table-wrapper')}>
                    <ElementsTable {...table} />
                </div>
            </main>
        );
    }

    renderEmptyContent() {
        const className = b('heading', {position: 'center', size: 'l'});
        return (
            <main key="body" className={b(false, 'elements-page__content')}>
                <div className={b('message', className)}>No clusters matching your selection</div>
            </main>
        );
    }

    render() {
        const {viewMode, clusterFilter, clusters} = this.props;
        const regexp = new RegExp(clusterFilter, 'i');

        const filterByField = (field) => {
            return typeof field === 'string' && field.search(regexp) > -1;
        };

        const filteredClusters = _.filter(clusters, ({id, version, environment}) => {
            return [id, version, environment].some(filterByField);
        });

        if (viewMode === 'dashboard' && filteredClusters.length) {
            return this.renderDashboard(filteredClusters);
        } else if (viewMode === 'table' && filteredClusters.length) {
            return this.renderTable(filteredClusters);
        } else if (!filteredClusters.length) {
            return this.renderEmptyContent();
        }
    }
}

function mapStateToProps({clustersMenu, tables}) {
    const {viewMode, clusterFilter, clusters} = clustersMenu;
    return {
        viewMode,
        clusterFilter,
        clusters,
        sortState: tables[CLUSTER_MENU_TABLE_ID],
    };
}

const mapDispatchToProps = {
    fetchClusterVersions,
    fetchClusterAvailability,
};

export default connect(mapStateToProps, mapDispatchToProps)(ClustersMenuBody);
