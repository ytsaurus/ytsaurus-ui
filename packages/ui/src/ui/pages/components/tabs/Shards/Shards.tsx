import React, {useEffect} from 'react';
import {ResolveThunks, connect} from 'react-redux';
import cn from 'bem-cn-lite';

import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {FormattedId} from '../../../../components/formatters';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {Loader} from '@gravity-ui/uikit';

import Name from './Name';
import NodeCount from './NodeCount';

import {abortAllRequests, getShards} from '../../../../store/actions/components/shards';
import type {Shard} from '../../../../store/reducers/components/shards';

import './Shards.scss';
import {getCluster} from '../../../../store/selectors/global';
import type {RootState} from '../../../../store/reducers';

const block = cn('components-shards');

const tableSettings = {
    columns: {
        items: {
            id: {
                align: 'left',
            },
            name: {
                align: 'left',
            },
            account_statistics: {
                align: 'left',
            },
            node_count: {
                align: 'left',
                caption: 'Node count',
            },
        },
        sets: {
            default: {
                items: ['id', 'name', 'node_count'],
            },
        },
        mode: 'default',
    },
    theme: 'light',
    striped: false,
    cssHover: true,
    css: block('table'),
    computeKey(item: Shard) {
        return item.id;
    },
};

type OwnProps = {
    id: string;
    name: string;
    className: string;
};

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type ShardsProps = OwnProps & StateProps & DispatchProps;

function Shards(props: ShardsProps) {
    const {cluster, getShards, abortAllRequests} = props;
    useEffect(() => {
        getShards();
        return abortAllRequests;
    }, [cluster]);

    const idTemplate = (item: Shard) => <FormattedId id={item.id} />;
    const nameTemplate = (item: Shard) => (
        <Name className={block('name')} name={item.name} id={item.id} />
    );
    const nodeCountTemplate = (item: Shard) => (
        <NodeCount
            count={item['total_account_statistics']['node_count']}
            className={block('node-count')}
            name={item.name}
            id={item.id}
        />
    );

    const templates = {
        id: idTemplate,
        name: nameTemplate,
        node_count: nodeCountTemplate,
    };

    const {loading, loaded, error, errorData, shards} = props;
    const initialLoading = loading && !loaded;

    return (
        <ErrorBoundary>
            <LoadDataHandler loaded={loading} error={error} errorData={errorData}>
                <div className={block({loading: initialLoading})}>
                    {initialLoading ? (
                        <Loader />
                    ) : (
                        <ElementsTable
                            {...tableSettings}
                            templates={templates}
                            items={shards}
                            css={block()}
                        />
                    )}
                </div>
            </LoadDataHandler>
        </ErrorBoundary>
    );
}

const mapStateToProps = (state: RootState) => {
    const {loading, loaded, error, errorData, shards} = state.components.shards;

    return {
        loading,
        loaded,
        error,
        errorData,
        shards,
        cluster: getCluster(state),
    };
};

const mapDispatchToProps = {
    getShards,
    abortAllRequests,
};

export default connect(mapStateToProps, mapDispatchToProps)(Shards);
