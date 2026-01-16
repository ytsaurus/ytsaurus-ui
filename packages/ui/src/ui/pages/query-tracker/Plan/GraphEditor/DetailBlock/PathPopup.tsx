import React, {FC} from 'react';
import cn from 'bem-cn-lite';
import {ClipboardButton, Flex, Text} from '@gravity-ui/uikit';
import Link from '../../../../../components/Link/Link';
import {genNavigationUrl} from '../../../../../utils/navigation/navigation';
import {parseTablePath} from '../../services/tables';
import format from '../../../../../common/hammer/format';
import './PathPopup.scss';
import MetaTable from '../../../../../components/MetaTable/MetaTable';

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
        <MetaTable
            className={b()}
            items={[
                {
                    key: 'Cluster',
                    value: <Text>{format.ReadableField(parsed.cluster)}</Text>,
                },
                {
                    key: 'Path',
                    value: (
                        <Flex gap={1} alignItems="center">
                            <Link url={url} target="_blank">
                                {parsed.path}
                            </Link>
                            <ClipboardButton text={parsed.path} />
                        </Flex>
                    ),
                },
            ]}
        />
    );
};
