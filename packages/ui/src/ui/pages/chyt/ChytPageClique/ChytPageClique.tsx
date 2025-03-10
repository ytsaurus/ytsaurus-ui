import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RouteComponentProps, useHistory} from 'react-router';
import moment from 'moment';
import cn from 'bem-cn-lite';

import {Loader, Text} from '@gravity-ui/uikit';

import format from '../../../common/hammer/format';

import {useUpdater} from '../../../hooks/use-updater';
import {YTAlertBlock} from '../../../components/Alert/Alert';
import {YTErrorBlock} from '../../../components/Error/Error';
import Label from '../../../components/Label/Label';
import {OperationPool} from '../../../components/OperationPool/OperationPool';
import MetaTable, {MetaTableItem} from '../../../components/MetaTable/MetaTable';
import {OperationId} from '../../../components/OperationId/OperationId';
import {SubjectCard} from '../../../components/SubjectLink/SubjectLink';

import {useQueryWidgetSidePanel} from '../../../pages/query-tracker/QueryWidget/side-panel';

import {chytCliqueLoad, chytResetCurrentClique} from '../../../store/actions/chyt/clique';
import {
    getChytCliqueData,
    getChytCliqueError,
    getChytCliqueInitialLoading,
    getChytCliqueStartError,
} from '../../../store/selectors/chyt/clique';
import {getCluster} from '../../../store/selectors/global';
import {Page} from '../../../../shared/constants/settings';

import {CHYT_TABLE_TITLES} from '../../../constants/chyt-page';
import {CliqueState} from '../components/CliqueState';
import {ChytCliqueActions, useCliqueOnSqlAction} from '../ChytCliqueActions/ChytCliqueActions';
import {ChytPageCliqueTabs} from './ChytPageCliqueTabs';
import {ChytSpecletEditButton} from './ChytPageCliqueSpeclet';

import './ChytPageClique.scss';

const block = cn('chyt-page-clique');

export function ChytPageClique(props: RouteComponentProps<{alias: string}>) {
    const dispatch = useDispatch();
    const history = useHistory();
    const cluster = useSelector(getCluster);

    const {alias} = props.match.params;
    const update = React.useCallback(() => {
        dispatch(chytCliqueLoad(alias));
    }, [alias, dispatch]);

    React.useEffect(() => {
        return () => {
            dispatch(chytResetCurrentClique());
        };
    }, [alias, dispatch]);

    const {pool} = useSelector(getChytCliqueData) ?? {};
    const initialLoading = useSelector(getChytCliqueInitialLoading);

    useUpdater(update);

    const {openWidget, widgetContent} = useQueryWidgetSidePanel();
    const onSqlClick = useCliqueOnSqlAction(openWidget);

    return (
        <div className={block()}>
            <div className={block('header')}>
                <Text variant="header-1">
                    CHYT clique{' '}
                    <Text variant="header-1" color="secondary">
                        {alias}
                    </Text>
                </Text>
                {initialLoading && <Loader className={block('loader')} size="s" />}
                <span className={block('spacer')} />

                <ChytCliqueActions
                    alias={alias}
                    pool={pool}
                    showAllButtons
                    onAction={(action) => {
                        if (action === 'remove') {
                            history.push(`/${cluster}/${Page.CHYT}`);
                        } else {
                            update();
                        }
                    }}
                    onSqlClick={onSqlClick}
                />
                <span className={block('edit')}>
                    <ChytSpecletEditButton compact />
                </span>
            </div>
            <ChytCliqueErrors />
            <ChytCliqueMetaTable />
            <ChytPageCliqueTabs className={block('tabs')} />
            {widgetContent}
        </div>
    );
}

function ChytCliqueErrors() {
    const error = useSelector(getChytCliqueError);
    const startError = useSelector(getChytCliqueStartError);
    const {health_reason} = useSelector(getChytCliqueData) ?? {};

    return (
        <React.Fragment>
            {error ? <YTErrorBlock className={block('error')} error={error} bottomMargin /> : null}
            {startError ? (
                <YTErrorBlock
                    header="Failed to start"
                    className={block('error')}
                    error={{message: startError}}
                    bottomMargin
                />
            ) : null}
            {health_reason ? (
                <YTAlertBlock
                    header="Health reason"
                    type="alert"
                    message={health_reason}
                    bottomMargin
                />
            ) : null}
        </React.Fragment>
    );
}

function ChytCliqueMetaTable() {
    const cluster = useSelector(getCluster);
    const data = useSelector(getChytCliqueData);

    const items: Array<Array<MetaTableItem>> = React.useMemo(() => {
        const {
            pool,
            state,
            stage,
            ctl_attributes,
            yt_operation,
            health,
            incarnation_index,
            creator,
            speclet_modification_time,
            strawberry_state_modification_time,
        } = data ?? {};

        const {start_time, finish_time, id} = yt_operation ?? {};

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
                {key: 'Health', value: <CliqueState state={health} />},
                {key: 'State', value: <CliqueState state={state} />},
                {
                    key: 'Pool',
                    value: pool ? (
                        <OperationPool cluster={cluster} pool={{pool, tree: 'physical'}} />
                    ) : (
                        format.NO_VALUE
                    ),
                },
                {key: 'Instances', value: format.Number(ctl_attributes?.instance_count)},
                {key: 'Cores', value: format.Number(ctl_attributes?.total_cpu)},
                {key: 'Memory', value: format.Bytes(ctl_attributes?.total_memory)},
            ],
            [
                {key: 'Stage', value: stage ? <Label capitalize text={stage} /> : format.NO_VALUE},
                {key: 'Incarnation index', value: format.Number(incarnation_index)},
                {
                    key: 'Creator',
                    value: creator ? <SubjectCard name={creator} /> : format.NO_VALUE,
                },
                {
                    key: CHYT_TABLE_TITLES['speclet_modification_time'],
                    value: format.DateTime(speclet_modification_time),
                },
                {
                    key: CHYT_TABLE_TITLES['strawberry_state_modification_time'],
                    value: format.DateTime(strawberry_state_modification_time),
                },
            ],
            [
                {
                    key: 'YT operation id',
                    value: (
                        <div className={block('operation-id')}>
                            <OperationId id={id} cluster={cluster} />
                        </div>
                    ),
                },
                {
                    key: 'YT operation state',
                    value: yt_operation?.state
                        ? format.ReadableField(yt_operation?.state)
                        : format.NO_VALUE,
                },
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
