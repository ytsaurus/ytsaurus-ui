import React, {FC} from 'react';
import {Text} from '@gravity-ui/uikit';
import {TableSchemaMcpAnswer} from '../../../../types/ai-chat';
import i18n from './i18n';
import {McpMessage} from '../McpMessage';

type Props = {
    value: TableSchemaMcpAnswer['value'];
    className?: string;
};

export const McpSchemaAnswer: FC<Props> = ({value, className}) => {
    return (
        <McpMessage
            className={className}
            title={i18n('title_table-schema')}
            clipboardValue={JSON.stringify(value)}
        >
            <Text variant="code-1">{value}</Text>
        </McpMessage>
    );
};
