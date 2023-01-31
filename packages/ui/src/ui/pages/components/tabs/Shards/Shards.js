import React, {useEffect} from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import cn from 'bem-cn-lite';

import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {FormattedId} from '../../../../components/formatters';

import LoadDataHandler from '../../../../components/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {Loader} from '@gravity-ui/uikit';

import Name from './Name';
import NodeCount from './NodeCount';

import {getShards, abortAllRequests} from '../../../../store/actions/components/shards';

import './Shards.scss';
import {getCluster} from '../../../../store/selectors/global';

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
    computeKey(item) {
        return item.id;
    },
};

function Shards(props) {
    const {cluster, getShards, abortAllRequests} = props;
    useEffect(() => {
        getShards();
        return abortAllRequests;
    }, [cluster]);

    const idTemplate = (item) => <FormattedId id={item.id} />;
    const nameTemplate = (item) => <Name className={block('name')} name={item.name} id={item.id} />;
    const nodeCountTemplate = (item) => (
        <NodeCount
            count={item['total_account_statistics']['node_count']}
            statistics={item['account_statistics']}
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

Shards.propTypes = {
    // from connect
    loading: PropTypes.bool.isRequired,
    loaded: PropTypes.bool.isRequired,
    error: PropTypes.bool.isRequired,
    errorData: PropTypes.object.isRequired,

    shards: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            total_account_statistics: PropTypes.shape({
                node_count: PropTypes.number.isRequired,
            }).isRequired,
        }),
    ).isRequired,

    getShards: PropTypes.func.isRequired,
    abortAllRequests: PropTypes.func.isRequired,
    cluster: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
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
