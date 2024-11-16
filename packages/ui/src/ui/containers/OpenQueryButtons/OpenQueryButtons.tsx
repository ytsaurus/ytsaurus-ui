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
import UIFactory from '../../UIFactory';
import {useSidePanel} from '../../hooks/use-side-panel';

import './OpenQueryButtons.scss';

const b = cn('yt-open-query-buttons');

export type OpenQueryButtonProps = {
    className?: string;
    path: string;
    cluster: string;

    autoOpen?: boolean;
};

export function OpenQueryButtons({className, path, cluster, autoOpen}: OpenQueryButtonProps) {
    const dispatch = useDispatch();
    const [panelMode, setPanelMode] = React.useState<'qt' | 'yqlkit' | undefined>();

    const onOpenYqlKit = React.useCallback(() => setPanelMode('yqlkit'), []);
    const onClose = React.useCallback(() => setPanelMode(undefined), []);

    const {openWidget, closeWidget, widgetContent} = useSidePanel(panelMode + '_widget', {
        renderContent({visible}) {
            return panelMode === 'qt' ? (
                <QueryWidgetLazy onClose={onClose} />
            ) : (
                UIFactory.yqlWidgetSetup?.renderWidget({visible, onClose})
            );
        },
    });

    const {isQtKitEnabled, isYqlKitEnabled} = useSelector(getNavigationSqlService);

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

    const allowQtAutoOpen = autoOpen && isQtKitEnabled;

    React.useEffect(() => {
        if (autoOpen) {
            setPanelMode(allowQtAutoOpen ? 'qt' : 'yqlkit');
        }
    }, [autoOpen, allowQtAutoOpen]);

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
                        disabled={panelMode === 'yqlkit'}
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
                    disabled={panelMode === 'qt'}
                    opened={panelMode === 'yqlkit'}
                    onOpen={onOpenYqlKit}
                    onClose={onClose}
                />
            )}
            {widgetContent}
        </div>
    );
}
