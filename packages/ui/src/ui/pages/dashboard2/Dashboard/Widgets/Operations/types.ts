import {PluginWidgetProps} from '@gravity-ui/dashkit/build/esm';

export type Author = {
    value: string;
    type: 'users';
};

export type OperationsWidgetData = {
    name: string;
    authors: Array<Author>;
    pool: Array<{tree: string; pool: string}>;
    limit: {value: number};
};

export type OperationsWidgetProps = PluginWidgetProps & {
    data?: OperationsWidgetData;
};
