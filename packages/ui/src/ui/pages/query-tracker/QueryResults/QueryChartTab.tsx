import {FC} from 'react';
import UIFactory from '../../../UIFactory';
import {QueryItem} from '../module/api';

type Props = {
    query: QueryItem;
};

export const QueryChartTab: FC<Props> = (props) => {
    return UIFactory.getQueryResultChartTab()?.renderContent(props) || null;
};
