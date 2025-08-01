import {PluginWidgetProps} from '@gravity-ui/dashkit';

type Author = {
    value: string;
    type: 'users';
};

export type QueriesWidgetData = {
    name: string;
    authors: Array<Author>;
    limit: {value: number};
};

export type QueriesWidgetProps = PluginWidgetProps & {
    data?: QueriesWidgetData;
};
