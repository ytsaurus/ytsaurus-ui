import React from 'react';
import cn from 'bem-cn-lite';
import _ from 'lodash';
import {TextInput} from '@gravity-ui/uikit';

import {getGroupedClusters} from '../../config/yt-config';
import {getClusterAppearance} from '../../appearance';
import ClusterIcon from '../../components/ClusterIcon/ClusterIcon';
import {CLUSTER_GROUPS, CLUSTER_GROUPS_ORDER, DEFAULT_GROUP} from '../../constants/cluster-menu';

import {useSelector} from 'react-redux';
import {getRecentClustersInfo} from '../../store/selectors/slideoutMenu';
import {isRecentClustersFirst} from '../../store/selectors/settings';
import {useClusterColorClassName} from './ClusterColor';
import {ClusterConfig} from '../../../shared/yt-types';
import Link from '../../components/Link/Link';
import Icon from '../../components/Icon/Icon';
import {getCluster} from '../../store/selectors/global';

import './ClustersPanel.scss';

const block = cn('clusters-panel');

interface Props {
    className: string;
    onSelectCluster: (cluster: string) => void;
}

function f(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
}

export default function ClustersPanel({className, onSelectCluster}: Props) {
    const [filter, setFilter] = React.useState('');

    const onChange = React.useCallback(
        (value: string) => {
            setFilter(value);
        },
        [setFilter],
    );

    const onClusterClick = React.useCallback(
        (cluster: string) => {
            onSelectCluster(cluster);
        },
        [onSelectCluster],
    );

    const onRef = React.useCallback((input: HTMLInputElement | null) => {
        input?.focus();
    }, []);

    const lowerFilter = filter?.toLowerCase() || '';

    const recentInfo = useSelector(getRecentClustersInfo);
    const showRecent = useSelector(isRecentClustersFirst);
    const groups = React.useMemo(() => {
        const {recent, rest} = recentInfo;
        if (showRecent && (recent?.length || rest?.length)) {
            return getFilteredClusterGroups(lowerFilter, {
                recent,
                [DEFAULT_GROUP]: rest,
            });
        } else {
            const allGroups = getGroupedClusters();
            return getFilteredClusterGroups(lowerFilter, allGroups);
        }
    }, [lowerFilter, showRecent, recentInfo]);

    const handleKey = React.useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            let firstItem: ClusterConfig | undefined;

            if (event.key !== 'Enter') {
                return;
            }

            const groupKeys = [...CLUSTER_GROUPS_ORDER];

            _.some(groupKeys, (key) => {
                if (groups[key] && groups[key].length) {
                    firstItem = groups[key][0];
                    return true;
                }
                return false;
            });

            if (!firstItem) {
                return;
            }

            onClusterClick(firstItem.id);
        },
        [groups, onClusterClick],
    );

    const currentCluster = useSelector(getCluster);
    const {pathname, search} = window.location;
    let clusterState = '';
    if (currentCluster && pathname.startsWith(`/${currentCluster}/`)) {
        clusterState = pathname.substr(currentCluster.length + 1) + search;
    }

    return (
        <div className={block(null, className)} onClick={f}>
            <div className={block('input')}>
                <TextInput
                    controlRef={onRef}
                    onKeyDown={handleKey}
                    placeholder={'Cluster search'}
                    onUpdate={onChange}
                    value={filter}
                    autoFocus
                />
            </div>
            <div className={block('groups')}>
                {_.isEmpty(groups) ? (
                    <div className={block('no-items')}>No matching clusters</div>
                ) : (
                    _.map(CLUSTER_GROUPS, ({caption}, key) => {
                        if (!groups[key]) {
                            return null;
                        }
                        return (
                            <ClusterGroup
                                key={key}
                                name={caption}
                                items={groups[key]}
                                onClusterClick={onClusterClick}
                                clusterState={clusterState}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}

interface ClusterGroupProps {
    name: string;
    items: Array<ClusterConfig>;

    clusterState?: string;
    onClusterClick?: (cluster: string) => void;
}

function ClusterGroup(props: ClusterGroupProps) {
    const {name, items, onClusterClick, clusterState} = props;

    return !items.length ? null : (
        <div className={block('group')}>
            <div className={block('group-name')}>{name}</div>
            {_.map(items, (item) => {
                return (
                    <ClusterGroupItem
                        key={item.id}
                        className={block('group-item')}
                        onClick={onClusterClick}
                        {...item}
                        clusterState={clusterState}
                    />
                );
            })}
        </div>
    );
}

interface ClusterInfoProps extends ClusterConfig {
    className?: string;
    onClick?: (cluster: string) => void;
    forwardImageRef?: React.RefObject<HTMLElement>;
}

const SHORT_ENV = {
    production: 'prod',
    testing: 'test',
    development: 'dev',
    prestable: 'pre',
    localmode: undefined,
};

export function ClusterGroupItem(
    props: ClusterInfoProps & {
        shortEnv?: boolean;
        clusterState?: string;
    },
) {
    const {
        forwardImageRef,
        className,
        id,
        name,
        environment,
        onClick = () => {},
        shortEnv,
        clusterState,
    } = props;

    const allowLink = !shortEnv;

    const handleClick = React.useCallback(() => {
        onClick(id);
    }, [onClick, id]);

    return (
        <div className={block('cluster', className)} onClick={handleClick}>
            <ClusterImage cluster={id} name={name} forwardRef={forwardImageRef} />
            <div className={block('cluster-name')}>{name}</div>
            <div className={block('cluster-env')}>
                {shortEnv ? SHORT_ENV[environment] : environment}
            </div>
            {allowLink && (
                <Link
                    className={block('link')}
                    url={`${location.origin}/${id}${clusterState || ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <Icon awesome={'external-link'} />
                </Link>
            )}
        </div>
    );
}

export function ClusterImage(props: {
    cluster: string;
    name: string;
    forwardRef?: React.RefObject<HTMLElement>;
}) {
    const {cluster, name, forwardRef} = props;
    const clusterAppearance = getClusterAppearance(cluster);
    const clusterTheme = useClusterColorClassName(cluster);

    return (
        <ClusterIcon
            className={block('cluster-image')}
            icon={clusterAppearance.iconAvatar}
            size="m"
            theme={clusterTheme}
            name={name}
            forwardRef={forwardRef as React.RefObject<HTMLImageElement>}
        />
    );
}

function getFilteredClusterGroups(filter: string, groups: Record<string, Array<ClusterConfig>>) {
    if (!filter) {
        return groups;
    }

    const res = _.reduce(
        groups,
        (acc, items, key) => {
            const filtered = !filter
                ? items
                : _.filter(items, (item) => {
                      const {name, environment} = item;
                      return (
                          name.toLowerCase().indexOf(filter) !== -1 ||
                          environment.toLowerCase().indexOf(filter) !== -1
                      );
                  });
            if (filtered.length) {
                acc[key] = filtered;
            }
            return acc;
        },
        {} as typeof groups,
    );
    return res;
}
