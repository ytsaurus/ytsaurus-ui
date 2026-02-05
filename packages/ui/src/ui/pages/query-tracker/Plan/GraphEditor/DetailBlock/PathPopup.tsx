import React, {FC} from 'react';
import cn from 'bem-cn-lite';
import {ClipboardButton, Flex} from '@gravity-ui/uikit';
import Link from '../../../../../components/Link/Link';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';
import {parseTablePath} from '../../services/tables';
import './PathPopup.scss';

const b = cn('yt-detail-path');

type Props = {
    tablePath?: string;
};

export const PathPopup: FC<Props> = ({tablePath}) => {
    if (!tablePath) return null;

    const parsed = parseTablePath(tablePath);
    if (!parsed?.cluster || !parsed?.path) return null;

    const url = genNavigationUrl({cluster: parsed.cluster, path: parsed.path});

    return (
        <Flex gap={1} alignItems="center" className={b()}>
            <Link url={url} target="_blank">
                {parsed.path}
            </Link>
            <ClipboardButton text={parsed.path} />
        </Flex>
    );
};
