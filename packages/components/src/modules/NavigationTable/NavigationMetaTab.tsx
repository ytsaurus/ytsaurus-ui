import {FC} from 'react';
import cn from 'bem-cn-lite';
import {MetaTable} from '../../components';
import './NavigationMetaTab.scss';
import {NavigationTableData} from '../../types';

const b = cn('ytc-navigation-table-meta-tab');

type Props = {
    metadata: NavigationTableData['meta'];
};

export const NavigationMetaTab: FC<Props> = ({metadata}) => {
    return <MetaTable className={b()} items={metadata} />;
};
