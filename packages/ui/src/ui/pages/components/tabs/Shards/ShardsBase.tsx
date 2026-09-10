import React, {useEffect} from 'react';
import cn from 'bem-cn-lite';

import ElementsTable from '../../../../components/ElementsTable/ElementsTable';
import {FormattedId} from '../../../../components/formatters';

import LoadDataHandler from '../../../../containers/LoadDataHandler/LoadDataHandler';
import ErrorBoundary from '../../../../containers/ErrorBoundary/ErrorBoundary';
import {Loader} from '@gravity-ui/uikit';

import Name from './Name';
import NodeCount from './NodeCount';
import {type Shard} from '../../../../store/reducers/components/shards';
import {type YTError} from '../../../../types';

import i18n from './i18n';

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
                get caption() {
                    return i18n('field_node-count');
                },
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

type StateProps = {
    loading: boolean;
    loaded: boolean;
    error: boolean;
    errorData: YTError;
    shards: Shard[];
    cluster: string;
};

type DispatchProps = {
    getShards: () => void;
    abortAllRequests: () => void;
};

type ShardsProps = OwnProps & StateProps & DispatchProps;

export function ShardsBase(props: ShardsProps) {
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
