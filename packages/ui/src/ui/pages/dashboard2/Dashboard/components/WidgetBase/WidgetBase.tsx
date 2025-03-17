import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import Link from '../../../../../components/Link/Link';

import './WidgetBase.scss';

const block = b('yt-widget');

type Props = {
    title: string;
    type: string;
    content: React.ReactNode;
    controls?: React.ReactNode;
};

export function WidgetBase(props: Props) {
    const {title, type, content, controls} = props;

    return (
        <Flex gap={2} direction={'column'} className={block()}>
            <Flex direction={'row'} justifyContent={'space-between'}>
                <Link url={type} theme={'primary'} routed>
                    <Text variant="subheader-2" ellipsis>
                        {title}
                    </Text>
                </Link>
                <Flex direction={'row'} gap={3}>
                    {controls}
                </Flex>
            </Flex>
            <Flex className={block('content')}>{content}</Flex>
        </Flex>
    );
}
