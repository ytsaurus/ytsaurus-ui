import React, {FC} from 'react';
import {ChytInfo} from '../../../../store/reducers/chyt/list';
import './QueryCliqueItem.scss';
import cn from 'bem-cn-lite';
import {Text} from '@gravity-ui/uikit';

const block = cn('query-clique-item');

type Props = {
    name: ChytInfo['alias'];
    ytId: ChytInfo['yt_operation_id'];
};

export const QueryCliqueItem: FC<Props> = ({name, ytId}) => {
    return (
        <div className={block()}>
            {name}
            <Text color="secondary">{ytId}</Text>
        </div>
    );
};
