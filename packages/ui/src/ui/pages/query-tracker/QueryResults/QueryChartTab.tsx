import {FC} from 'react';
import UIFactory from '../../../UIFactory';
import {QueryItem} from '../module/api';

type Props = {
    query: QueryItem;
    resultIndex: number;
};

export const QueryChartTab: FC<Props> = (props) => {
    return UIFactory.getQueryResultChartTab()?.renderContent(props) || null;
};
