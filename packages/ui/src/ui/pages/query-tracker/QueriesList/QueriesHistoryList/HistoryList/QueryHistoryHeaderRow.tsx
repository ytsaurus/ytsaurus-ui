import React, {type FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './QueryHistoryHeaderRow.scss';

const b = cn('yt-queries-history-header-row');

type Props = {
    header: string;
};

export const QueryHistoryHeaderRow: FC<Props> = ({header}) => {
    return (
        <Flex alignItems="center" justifyContent="center" className={b()}>
            {header}
        </Flex>
    );
};
