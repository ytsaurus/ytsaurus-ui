import React, {useEffect} from 'react';
import {ConnectedProps, connect, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import capitalize_ from 'lodash/capitalize';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import {Loader} from '@gravity-ui/uikit';
import {YTErrorBlock} from '../../../../components/Error/Error';
import Link from '../../../../components/Link/Link';
import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import {Secondary} from '../../../../components/Text/Text';

import {getTabletErrors} from '../../../../store/actions/navigation/tabs/tablet-errors/tablet-errors-background';
import {getPath} from '../../../../store/selectors/navigation';
import {getEffectiveMode} from '../../../../store/selectors/navigation/navigation';
import {getCluster} from '../../../../store/selectors/global';
import {
    getTabletErrorsBackgroundCountNoticeVisbile,
    getTabletErrorsLoadingStatus,
    getTabletErrorsReplicationErrors,
} from '../../../../store/selectors/navigation/tabs/tablet-errors-background';
import {getReplicatedTableReplicasMap} from '../../../../store/selectors/navigation/content/replicated-table';
import {RootState} from '../../../../store/reducers';

import {useAppRumMeasureStart} from '../../../../rum/rum-app-measures';
import {RumMeasureTypes} from '../../../../rum/rum-measure-types';
import {useRumMeasureStop} from '../../../../rum/RumUiContext';
import {isFinalLoadingStatus} from '../../../../utils/utils';
import {YTError} from '../../../../types';

import './TabletErrorsBackground.scss';

const block = cn('navigation-tablet-errors-background');

function TabletErrors(props: ConnectedProps<typeof connector>) {
    const {path, mode, cluster, getTabletErrors} = props;
    useEffect(() => {
        getTabletErrors();
    }, [path, mode]);

    const {
        loading,
        loaded,
        tabletErrors: {tablet_errors},
        replicationErrors,
        error,
    } = props;
    const initialLoading = loading && !loaded;

    return (
        <LoadDataHandler loaded={loaded} error={Boolean(error)} errorData={error}>
            {initialLoading ? (
                <Loader />
            ) : (
                <div className={block({loading: initialLoading})}>
                    <TabletErrorsCountNotice />
                    <CollapsibleSection name="Tablet errors">
                        <TabletErrorsBlock
                            cluster={cluster}
                            items={tablet_errors}
                            sectionClassName={block('section')}
                        />
                    </CollapsibleSection>
                    <CollapsibleSection name="Replication errors">
                        <ReplicationErrorsBlock cluster={cluster} data={replicationErrors} />
                    </CollapsibleSection>
                </div>
            )}
        </LoadDataHandler>
    );
}

const mapStateToProps = (state: RootState) => {
    const {loading, loaded, error, tabletErrors} = state.navigation.tabs.tabletErrorsBackground;
    const path = getPath(state);
    const mode = getEffectiveMode(state);
    const cluster = getCluster(state);

    return {
        loading,
        loaded,
        error,

        path,
        mode,
        tabletErrors,
        cluster,
        replicationErrors: getTabletErrorsReplicationErrors(state),
    };
};

const mapDispatchToProps = {
    getTabletErrors,
};

const connector = connect(mapStateToProps, mapDispatchToProps);

const TabletErrorsConnected = connector(TabletErrors);

export default function TabletErrorsWithRum() {
    const loadState = useSelector(getTabletErrorsLoadingStatus);

    useAppRumMeasureStart({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLET_ERRORS,
        startDeps: [loadState],
        allowStart: ([loadState]) => {
            return !isFinalLoadingStatus(loadState);
        },
    });

    useRumMeasureStop({
        type: RumMeasureTypes.NAVIGATION_TAB_TABLET_ERRORS,
        stopDeps: [loadState],
        allowStop: ([loadState]) => {
            return isFinalLoadingStatus(loadState);
        },
    });

    return <TabletErrorsConnected />;
}

interface ReplicationErrorsBlockProps {
    cluster: string;
    data: ReturnType<typeof getTabletErrorsReplicationErrors>;
}

function ReplicationErrorsBlock({data, cluster}: ReplicationErrorsBlockProps) {
    let counter = 0;
    return (
        <React.Fragment>
            {map_(data, (items, replicaId) => {
                return (
                    <CollapsibleSection
                        key={replicaId}
                        name={<ReplicaErrorHeader id={replicaId} />}
                        className={block('group', block('section'))}
                        collapsed={0 < counter++}
                    >
                        <TabletErrorsBlock cluster={cluster} items={items} />
                    </CollapsibleSection>
                );
            })}
        </React.Fragment>
    );
}

function TabletErrorsCountNotice() {
    const visible = useSelector(getTabletErrorsBackgroundCountNoticeVisbile);
    if (!visible) {
        return null;
    }
    return (
        <div className={block('count-notice')}>
            Only limited number of errors is displayed. See Tablets tab for the complete list.
        </div>
    );
}

function TabletErrorsHeader({id, cluster}: {id: string; cluster: string}) {
    return (
        <React.Fragment>
            Errors of tablet <Link url={`/${cluster}/tablet/${id}`}>{id}</Link>
        </React.Fragment>
    );
}

function ReplicaErrorHeader({id}: {id: string}) {
    const data = useSelector(getReplicatedTableReplicasMap);
    const {[id]: attrs} = data;

    if (!attrs) return null;
    const {cluster_name: cluster, mode, replica_path: path} = attrs;

    const link =
        cluster && path ? <Link url={`/${cluster}/navigation?path=${path}`}>{path}</Link> : id;

    return (
        <React.Fragment>
            {id}{' '}
            <Secondary>
                ({mode ? `${mode} replica to ` : 'Replica to '}
                {capitalize_(cluster)}, table path {link})
            </Secondary>
        </React.Fragment>
    );
}

interface Props {
    cluster: string;
    items?: Record<string, Array<YTError>>;
    sectionClassName?: string;
}

function TabletErrorsBlock({items, cluster, sectionClassName}: Props) {
    if (isEmpty_(items)) {
        return null;
    }

    let counter = 0;
    return (
        <div className={block('items')}>
            {map_(items, (errors, id) => {
                return (
                    <CollapsibleSection
                        key={id}
                        className={block('group', sectionClassName)}
                        size="s"
                        name={<TabletErrorsHeader {...{id, cluster}} />}
                        collapsed={0 < counter++}
                    >
                        {map_(errors, (error, index) => {
                            return (
                                <YTErrorBlock
                                    key={index}
                                    className={block('error')}
                                    topMargin="none"
                                    error={error}
                                    disableLogger={true}
                                />
                            );
                        })}
                    </CollapsibleSection>
                );
            })}
        </div>
    );
}
