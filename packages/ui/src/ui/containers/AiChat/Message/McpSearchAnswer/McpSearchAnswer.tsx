import React, {FC} from 'react';
import {Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import ArrowUpRightFromSquareIcon from '@gravity-ui/icons/svgs/arrow-up-right-from-square.svg';
import {SearchMcpAnswer} from '../../../../types/ai-chat';
import i18n from './i18n';
import {McpMessage} from '../McpMessage';

type Props = {
    value: SearchMcpAnswer['value'];
    className?: string;
};

export const McpSearchAnswer: FC<Props> = ({value, className}) => {
    return (
        <McpMessage
            className={className}
            title={i18n('title_search-results')}
            clipboardValue={JSON.stringify(value)}
        >
            <Flex direction="column" gap={1}>
                {value.map(({url, title}) => (
                    <Link key={url} href={url} target="_blank">
                        <Icon data={ArrowUpRightFromSquareIcon} /> {title}
                    </Link>
                ))}
                {value.length === 0 && <Text variant="code-1">[]</Text>}
            </Flex>
        </McpMessage>
    );
};
