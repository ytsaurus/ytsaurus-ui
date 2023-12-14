import React, {ReactElement, useCallback, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {Button, Loader} from '@gravity-ui/uikit';
import {QueryEngine} from '../../../../query-tracker/module/engines';
import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';
import type {QueryWidgetProps} from '../../../../query-tracker/QueryWidget';
import withLazyLoading from '../../../../../hocs/withLazyLoading';
import {createQueryFromTablePath} from '../../../../query-tracker/module/query/actions';
import Icon from '../../../../../components/Icon/Icon';
import {createNewQueryUrl} from '../../../../query-tracker/utils/navigation';
import withSplit from '../../../../../hocs/withSplit';
import {mergeScreen, splitScreen} from '../../../../../store/actions/global';
import {SPLIT_TYPE} from '../../../../../constants/components/nodes/nodes';
import './CreateQueryFromTable.scss';

const b = cn('create-query-btn');

const QueryWidgetLazy = React.lazy(() => import('../../../../query-tracker/QueryWidget'));

export const QueryWidgetPortal = withSplit(
    withLazyLoading<QueryWidgetProps>(QueryWidgetLazy, <Loader className={b('loader')} />),
) as unknown as ReactElement<QueryWidgetProps>;

export function CreateQueryFromTable({className}: {className: string}) {
    const [widgetOpened, setWidgetOpened] = useState(false);
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);

    const openWidget = useCallback(() => {
        dispatch(createQueryFromTablePath(QueryEngine.YQL, cluster, path));
        dispatch(splitScreen(SPLIT_TYPE));
        setWidgetOpened(true);
    }, [setWidgetOpened, dispatch, path, cluster]);

    const onClose = useCallback(() => {
        setWidgetOpened(false);
        dispatch(mergeScreen());
    }, [setWidgetOpened, dispatch]);

    return (
        <>
            <div className={b(null, className)}>
                <Button
                    onClick={openWidget}
                    pin="round-clear"
                    view="action"
                    className={b('btn')}
                    disabled={widgetOpened}
                    title="Open Queries widget"
                >
                    YQL query
                </Button>
                <Button
                    className={b('btn')}
                    pin="clear-round"
                    view="action"
                    href={createNewQueryUrl(cluster, QueryEngine.YQL, {path})}
                    target="_blank"
                    title="Open Queries page"
                >
                    <Icon awesome="table" />
                </Button>
            </div>
            {widgetOpened && (
                // @ts-ignore
                <QueryWidgetPortal onClose={onClose} />
            )}
        </>
    );
}
