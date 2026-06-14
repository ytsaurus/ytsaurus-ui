import {formatByParams} from '../../../../../shared/utils/format';
import {type TabItem} from '../../../../components/Tabs/Tabs';
import {SystemTabs} from '../../../../constants/system/tabs';
import {type UIFactory} from '../../../../UIFactory';
import i18n from './i18n';

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
            text: i18n('title_general'),
            url: `${url}/${SystemTabs.GENERAL}`,
            show: true,
        },
    ];

    if ('urlTemplate' in tabSettings) {
        result.push({
            value: 'link',
            text: tabSettings.title || i18n('title_monitoring'),
            show: true,
            url: formatByParams(tabSettings.urlTemplate, {ytCluster: cluster}),
            routed: false,
            external: true,
        });
    } else {
        result.push({
            value: SystemTabs.MONITORING,
            text: tabSettings.title || i18n('title_monitoring'),
            url: `${url}/${SystemTabs.MONITORING}`,
            show: true,
        });
    }

    return result;
};
