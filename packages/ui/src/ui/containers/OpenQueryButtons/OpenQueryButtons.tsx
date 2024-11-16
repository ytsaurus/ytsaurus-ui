import React from 'react';
import cn from 'bem-cn-lite';
import {Button} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import Icon from '../../components/Icon/Icon';
import {YQLKitButton} from '../../containers/YQLKitButton/YQLKitButton';
import {useQueryWidgetSidePanel} from '../../pages/query-tracker/QueryWidget/side-panel';
import {QueryEngine} from '../../pages/query-tracker/module/engines';
import {createQueryFromTablePath} from '../../pages/query-tracker/module/query/actions';
import {createNewQueryUrl} from '../../pages/query-tracker/utils/navigation';
import {getNavigationSqlService} from '../../store/selectors/settings/navigation';

import './OpenQueryButtons.scss';

const b = cn('yt-open-query-buttons');

export type OpenQueryButtonProps = {
    className?: string;
    path: string;
    cluster: string;
};

export function OpenQueryButtons({className, path, cluster}: OpenQueryButtonProps) {
    const dispatch = useDispatch();
    const {openWidget, widgetOpened, widgetContent} = useQueryWidgetSidePanel();

    const {isQtKitEnabled} = useSelector(getNavigationSqlService);

    const handleOpen = React.useCallback(() => {
        dispatch(createQueryFromTablePath(QueryEngine.YQL, cluster, path));
        openWidget();
    }, [dispatch, path, cluster, openWidget]);

    return !isQtKitEnabled ? null : (
        <div className={className}>
            <div className={b('query')}>
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
                {widgetContent}
            </div>
            <YQLKitButton />
        </div>
    );
}
