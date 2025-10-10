import React, {FC, PropsWithChildren, useMemo} from 'react';
import './System.scss';
import {SystemGeneralTab} from './SystemGeneralTab';
import UIFactory from '../../../UIFactory';
import Tabs from '../../../components/Tabs/Tabs';
import {UI_TAB_SIZE} from '../../../constants/global';
import {Redirect, Route, Switch} from 'react-router';
import {SystemTabs} from '../../../constants/system/tabs';
import {getSystemTabItems} from './helpers/getSystemTabItems';
import {getCluster} from '../../../store/selectors/global';
import {useSelector} from '../../../store/redux-hooks';

const Wrap: FC<PropsWithChildren> = ({children}) => {
    return (
        <div className="elements-page__content">
            <div className={'elements-main-section system'}>{children}</div>
        </div>
    );
};

type Props = {
    match: {
        path: string;
        url: string;
    };
};

export const System: FC<Props> = ({match}) => {
    const cluster = useSelector(getCluster);
    const systemMonitoringTab = UIFactory.getSystemMonitoringTab();

    const items = useMemo(() => {
        return getSystemTabItems({url: match.url, tabSettings: systemMonitoringTab, cluster});
    }, [match.url, systemMonitoringTab, cluster]);

    if (!systemMonitoringTab) {
        return (
            <Wrap>
                <SystemGeneralTab />
            </Wrap>
        );
    }

    return (
        <Wrap>
            <Tabs items={items} active={SystemTabs.GENERAL} size={UI_TAB_SIZE} routed underline />
            <Switch>
                <Route path={`${match.path}/${SystemTabs.GENERAL}`} component={SystemGeneralTab} />
                {'component' in systemMonitoringTab && (
                    <Route
                        path={`${match.path}/${SystemTabs.MONITORING}`}
                        component={systemMonitoringTab.component}
                    />
                )}
                <Redirect to={`${match.path}/${SystemTabs.GENERAL}`} />
            </Switch>
        </Wrap>
    );
};
