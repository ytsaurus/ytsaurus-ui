import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RouteComponentProps, useHistory} from 'react-router';
import cn from 'bem-cn-lite';
import moment from 'moment';

import {Loader, Text} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';

import {useUpdater} from '../../../hooks/use-updater';
import Block from '../../../components/Block/Block';
import Button from '../../../components/Button/Button';
import Error from '../../../components/Error/Error';
import Label from '../../../components/Label/Label';
import Icon from '../../../components/Icon/Icon';
import MetaTable, {MetaTableItem} from '../../../components/MetaTable/MetaTable';
import {OperationId} from '../../../components/OperationId/OperationId';
import StatusLabel from '../../../components/StatusLabel/StatusLabel';

import {chytCliqueLoad, chytResetCurrentClique} from '../../../store/actions/chyt/clique';
import {
    getChytCliqueData,
    getChytCliqueError,
    getChytCliqueInitialLoading,
    getChytCliqueStartError,
} from '../../../store/selectors/chyt/clique';
import {getCluster} from '../../../store/selectors/global';

import {CliqueState} from '../components/CliqueState';

import {ChytPageCliqueTabs} from './ChytPageCliqueTabs';

import './ChytPageClique.scss';
import {Page} from '../../../../shared/constants/settings';
import {ChytCliqueActions} from '../ChytCliqueActions/ChytCliqueActions';

const block = cn('chyt-page-clique');

export function ChytPageClique(props: RouteComponentProps<{alias: string}>) {
    const dispatch = useDispatch();
    const history = useHistory();
    const cluster = useSelector(getCluster);

    const {alias} = props.match.params;
    const update = React.useCallback(() => {
        dispatch(chytCliqueLoad(alias));
    }, [alias]);

    React.useEffect(() => {
        return () => {
            dispatch(chytResetCurrentClique());
        };
    }, [alias]);

    const {yt_operation} = useSelector(getChytCliqueData) ?? {};
    const initialLoading = useSelector(getChytCliqueInitialLoading);

    useUpdater(update);

    return (
        <div className={block()}>
            <div className={block('header')}>
                <Text variant="header-1">CHYT clique *{alias}</Text>
                <StatusLabel
                    className={block('header-operation-state')}
                    label={yt_operation?.state as any}
                />
                {initialLoading && <Loader className={block('loader')} size="s" />}
                <span className={block('spacer')} />

                <ChytCliqueActions
                    alias={alias}
                    showAllButtons
                    onAction={(action) => {
                        if (action === 'remove') {
                            history.push(`/${cluster}/${Page.CHYT}`);
                        }
                    }}
                />
            </div>
            <ChytCliqueErrors />
            <ChytCliqueMetaTable />
            <div className={block('edit-speclet')}>
                <Button size="m" title={'Edit speclet'}>
                    <Icon awesome={'pencil'} />
                    Edit metadata
                </Button>
            </div>
            <ChytPageCliqueTabs className={block('tabs')} />
        </div>
    );
}

function ChytCliqueErrors() {
    const error = useSelector(getChytCliqueError);
    const startError = useSelector(getChytCliqueStartError);

    return (
        <React.Fragment>
            {error ? <Error className={block('error')} error={error} /> : null}
            {startError ? (
                <Block
                    type="alert"
                    header="Failed to start"
                    className={block('error')}
                    error={{message: startError}}
                />
            ) : null}
        </React.Fragment>
    );
}

function ChytCliqueMetaTable() {
    const cluster = useSelector(getCluster);
    const data = useSelector(getChytCliqueData);

    const items: Array<Array<MetaTableItem>> = React.useMemo(() => {
        const {operation_id, pool, state, stage, ctl_attributes, yt_operation} = data ?? {};

        const {start_time, finish_time} = yt_operation ?? {};

        const start_time_number = start_time ? moment(start_time).valueOf() : undefined;
        const finish_time_number = finish_time
            ? moment(finish_time).valueOf()
            : start_time_number
            ? Date.now()
            : undefined;

        const duration =
            !start_time_number || !finish_time_number
                ? undefined
                : finish_time_number - start_time_number;

        return [
            [
                {
                    key: 'Id',
                    value: (
                        <div className={block('operation-id')}>
                            <OperationId id={operation_id} cluster={cluster} />
                        </div>
                    ),
                },
                {
                    key: 'Pool',
                    value: pool ? pool : format.NO_VALUE,
                },
                {
                    key: 'Instance count',
                    value: format.Number(ctl_attributes?.instance_count),
                },
                {
                    key: 'Total cpu',
                    value: format.Number(ctl_attributes?.total_cpu),
                },
                {
                    key: 'Total memory',
                    value: format.Bytes(ctl_attributes?.total_memory),
                },
            ],
            [
                {key: 'State', value: <CliqueState state={state} />},
                {key: 'Stage', value: stage ? <Label capitalize text={stage} /> : format.NO_VALUE},
                {
                    key: 'Start time',
                    value: format.DateTime(start_time),
                },
                {
                    key: 'Finish time',
                    value: format.DateTime(finish_time),
                },
                {
                    key: 'Duration',
                    value: duration ? format.TimeDuration(duration) : format.NO_VALUE,
                },
            ],
        ];
    }, [data, cluster]);

    return <MetaTable items={items} />;
}
