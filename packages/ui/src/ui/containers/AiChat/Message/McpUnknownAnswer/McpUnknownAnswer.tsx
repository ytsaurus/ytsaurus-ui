import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';
import {UnknownMcpAnswer} from '../../../../types/ai-chat';
import {McpMessage} from '../McpMessage';
import i18n from './i18n';

type Props = {
    name: UnknownMcpAnswer['name'];
    value: UnknownMcpAnswer['value'];
    className?: string;
};

export const McpUnknownAnswer: FC<Props> = ({name, value, className}) => {
    const jsonString = JSON.stringify(value, null, 2);

    return (
        <McpMessage
            className={className}
            title={`${i18n('title_unknown-mcp-call')}: ${name}`}
            clipboardValue={jsonString}
        >
            <Text variant="code-1">{jsonString}</Text>
        </McpMessage>
    );
};
