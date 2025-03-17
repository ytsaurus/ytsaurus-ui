import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';

import './WidgetBase.scss';

const block = b('yt-widget');

type Props = {
    title: string;
    content: React.ReactNode;
    controls?: React.ReactNode;
};

export function WidgetBase(props: Props) {
    const {title, content, controls} = props;
    return (
        <Flex gap={4} direction={'column'} className={block()}>
            <Flex direction={'row'} justifyContent={'space-between'}>
                <Text variant="subheader-2" ellipsis>
                    {title}
                </Text>
                <Flex direction={'row'} gap={3}>
                    {controls}
                </Flex>
            </Flex>
            <Flex className={block('content')}>{content}</Flex>
        </Flex>
    );
}
