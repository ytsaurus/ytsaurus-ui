import type {ReactNode} from 'react';

import {Flex, Icon, type IconData, Link, Text} from '@gravity-ui/uikit';

import {ClipboardButton} from '../../ClipboardButton';

import {metaTableItemBlock} from '../utils';

type Props = {
    url: string;
    text: string;
    icon?: IconData;
    withClipboard?: boolean;
    shiftText?: string;
    hoverContent?: ReactNode;
    maxWidth?: string | number;
};

export function TemplateLink({
    url,
    icon: IconComponent,
    text,
    shiftText,
    withClipboard,
    hoverContent,
    maxWidth,
}: Props) {
    return (
        <Flex
            gap={1}
            wrap="nowrap"
            alignItems="center"
            className={metaTableItemBlock('link')}
            style={{maxWidth}}
        >
            <Text ellipsis>
                <Link title={url} href={url}>
                    {IconComponent && <Icon data={IconComponent} size={14} />}
                    {text}
                </Link>
            </Text>

            {withClipboard && (
                <ClipboardButton
                    view="flat-secondary"
                    text={text}
                    shiftText={shiftText}
                    hoverContent={hoverContent}
                    size="s"
                />
            )}
        </Flex>
    );
}
