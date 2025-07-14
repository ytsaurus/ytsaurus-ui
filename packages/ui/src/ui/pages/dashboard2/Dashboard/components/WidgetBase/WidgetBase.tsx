import React from 'react';
import b from 'bem-cn-lite';
import {Flex} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit';

import './WidgetBase.scss';

const block = b('yt-dashboard-widget');

type Props = {
    content: React.ReactNode;
    controls?: React.ReactNode;
    header?: React.ReactNode;
} & PluginWidgetProps;

export function WidgetBase(props: Props) {
    const {content, controls, header, id} = props;

    return (
        <Flex id={id} gap={2} direction={'column'} className={block()}>
            <Flex direction={'row'} justifyContent={'space-between'} width={'100%'} gap={2}>
                {header}
                <Flex direction={'row'} gap={3}>
                    {controls}
                </Flex>
            </Flex>
            <Flex className={block('content')}>{content}</Flex>
        </Flex>
    );
}
