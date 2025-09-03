import {formatByParams} from '../../../../../shared/utils/format';
import {TabItem} from '../../../../components/Tabs/Tabs';
import {SystemTabs} from '../../../../constants/system/tabs';
import {UIFactory} from '../../../../UIFactory';

type Props = (data: {
    url: string;
    tabSettings: ReturnType<UIFactory['getSystemMonitoringTab']>;
    cluster: string;
}) => TabItem[];

export const getSystemTabItems: Props = ({url, tabSettings, cluster}) => {
    if (!tabSettings) return [];

    const result: TabItem[] = [
        {
            value: SystemTabs.GENERAL,
            text: 'General',
            url: `${url}/${SystemTabs.GENERAL}`,
            show: true,
        },
    ];

    if ('urlTemplate' in tabSettings) {
        result.push({
            value: 'link',
            text: tabSettings.title || 'Monitoring',
            show: true,
            url: formatByParams(tabSettings.urlTemplate, {ytCluster: cluster}),
            routed: false,
            external: true,
        });
    } else {
        result.push({
            value: SystemTabs.MONITORING,
            text: tabSettings.title || 'Monitoring',
            url: `${url}/${SystemTabs.MONITORING}`,
            show: true,
        });
    }

    return result;
};
