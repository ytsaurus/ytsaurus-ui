import React from 'react';
import cn from 'bem-cn-lite';
import {Button} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import Icon from '../../components/Icon/Icon';
import {YQLKitButton} from '../../containers/YQLKitButton/YQLKitButton';
import {QueryWidgetLazy} from '../../pages/query-tracker/QueryWidget/side-panel';
import {QueryEngine} from '../../pages/query-tracker/module/engines';
import {createQueryFromTablePath} from '../../pages/query-tracker/module/query/actions';
import {createNewQueryUrl} from '../../pages/query-tracker/utils/navigation';
import {getNavigationSqlService} from '../../store/selectors/settings/navigation';
import {getPath} from '../../store/selectors/navigation';
import UIFactory from '../../UIFactory';
import {useSidePanel} from '../../hooks/use-side-panel';
import {getCluster} from '../../store/selectors/global/cluster';
import {RootState} from '../../store/reducers';
import {NavigationState} from '../../store/reducers/navigation/navigation';
import {setNavigationSidePanelMode} from '../../store/actions/navigation';

import './OpenQueryButtons.scss';

const b = cn('yt-open-query-buttons');

function useNavigationSidePanelMode() {
    const dispatch = useDispatch();

    const path: string = useSelector(getPath);
    const cluster = useSelector(getCluster);
    const panelMode = useSelector((state: RootState) => state.navigation.navigation.sidePanelMode);

    const setPanelMode = React.useCallback(
        (mode: NavigationState['sidePanelMode']) => {
            dispatch(setNavigationSidePanelMode(mode));
        },
        [dispatch],
    );

    return {path, cluster, panelMode, setPanelMode};
}

export type OpenQueryButtonProps = {
    className?: string;
    autoOpen?: boolean;
};

export function OpenQueryButtonsContent() {
    const dispatch = useDispatch();
    const {panelMode, setPanelMode, path, cluster} = useNavigationSidePanelMode();

    const onClose = React.useCallback(() => {
        dispatch(setPanelMode(undefined));
    }, [dispatch, setPanelMode]);

    const {openWidget, closeWidget, widgetContent} = useSidePanel(panelMode + '_widget', {
        renderContent({visible}) {
            return panelMode === 'qt' ? (
                <QueryWidgetLazy onClose={onClose} />
            ) : (
                UIFactory.yqlWidgetSetup?.renderWidget({visible, onClose})
            );
        },
    });

    React.useEffect(() => {
        if (panelMode === undefined) {
            closeWidget();
            return;
        }

        if (panelMode === 'qt') {
            dispatch(createQueryFromTablePath(QueryEngine.YQL, cluster, path));
        }
        openWidget();
    }, [panelMode, openWidget, closeWidget]);

    return widgetContent;
}

export function OpenQueryButtons({className, autoOpen}: OpenQueryButtonProps) {
    const {path, cluster, panelMode, setPanelMode} = useNavigationSidePanelMode();

    const onOpenYqlKit = React.useCallback(() => setPanelMode('yqlkit'), []);
    const onClose = React.useCallback(() => setPanelMode(undefined), []);

    const {isQtKitEnabled, isYqlKitEnabled} = useSelector(getNavigationSqlService);

    const allowQtAutoOpen = autoOpen && isQtKitEnabled;

    React.useEffect(() => {
        if (autoOpen) {
            setPanelMode(allowQtAutoOpen ? 'qt' : 'yqlkit');
        }
    }, [autoOpen, allowQtAutoOpen, setPanelMode]);

    return (
        <div className={b(null, className)}>
            {isQtKitEnabled && (
                <div className={b('query')}>
                    <Button
                        onClick={() => {
                            setPanelMode(panelMode === 'qt' ? undefined : 'qt');
                        }}
                        pin="round-clear"
                        view="action"
                        className={b('btn')}
                        selected={panelMode === 'qt'}
                        title="Open Queries widget"
                    >
                        QT Kit
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
            )}
            {isYqlKitEnabled && (
                <YQLKitButton
                    opened={panelMode === 'yqlkit'}
                    onOpen={onOpenYqlKit}
                    onClose={onClose}
                />
            )}
        </div>
    );
}
