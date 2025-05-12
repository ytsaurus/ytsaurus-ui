import React from 'react';
import b from 'bem-cn-lite';
import {Flex, Text} from '@gravity-ui/uikit';
import {PluginWidgetProps} from '@gravity-ui/dashkit/build/esm';

import Link from '../../../../../components/Link/Link';

import {Page} from '../../../../../../shared/constants/settings';

import './WidgetBase.scss';

const block = b('yt-dashboard-widget');

type Widgets = 'navigation' | 'operations' | 'pools' | 'accounts' | 'queries' | 'services';

type Props = {
    title: string;
    type: Widgets;
    content: React.ReactNode;
    controls?: React.ReactNode;
} & PluginWidgetProps;

const mapTypeToPage = {
    operations: Page.OPERATIONS,
    navigation: Page.NAVIGATION,
    pools: Page.SCHEDULING,
    accounts: Page.ACCOUNTS,
    queries: Page.QUERIES,
    services: undefined,
};

function WidgetTitle({title, name}: {title: string; name?: string}) {
    return (
        <Text variant="subheader-2" ellipsis>
            {String(name ?? title)}
        </Text>
    );
}

export function WidgetBase(props: Props) {
    const {title, type, content, controls, data} = props;

    return (
        <Flex gap={2} direction={'column'} className={block()}>
            <Flex direction={'row'} justifyContent={'space-between'}>
                {type === 'services' ? (
                    <WidgetTitle title={title} name={data?.name as string} />
                ) : (
                    <Link url={mapTypeToPage[type]} theme={'primary'} routed>
                        <WidgetTitle title={title} name={data?.name as string} />
                    </Link>
                )}
                <Flex direction={'row'} gap={3}>
                    {controls}
                </Flex>
            </Flex>
            <Flex className={block('content')}>{content}</Flex>
        </Flex>
    );
}
