import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {Button} from '@gravity-ui/uikit';
import {QueryEngine} from '../../../../query-tracker/module/engines';
import {getPath} from '../../../../../store/selectors/navigation';
import {getCluster} from '../../../../../store/selectors/global';
import {createQueryFromTablePath} from '../../../../query-tracker/module/query/actions';
import Icon from '../../../../../components/Icon/Icon';
import {createNewQueryUrl} from '../../../../query-tracker/utils/navigation';
import {useQueryWidgetSidePanel} from '../../../../query-tracker/QueryWidget/side-panel';
import './CreateQueryFromTable.scss';

const b = cn('create-query-btn');

export function CreateQueryFromTable({className}: {className: string}) {
    const {openWidget, widgetOpened, widgetContent} = useQueryWidgetSidePanel();

    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const path = useSelector(getPath);

    const handleOpen = React.useCallback(() => {
        dispatch(createQueryFromTablePath(QueryEngine.YQL, cluster, path));
        openWidget();
    }, [path, cluster, openWidget, dispatch]);

    return (
        <>
            <div className={b(null, className)}>
                <Button
                    onClick={handleOpen}
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
            {widgetContent}
        </>
    );
}
