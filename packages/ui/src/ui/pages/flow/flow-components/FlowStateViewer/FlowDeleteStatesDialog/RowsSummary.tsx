import React from 'react';

import {Alert, Flex, Text} from '@gravity-ui/uikit';

import {KIND_LABEL_KEYS} from '../FlowStateResults/FlowStateResults';
import {getStateRowId} from '../state-requests';
import {stringifyStateValue} from '../state-values';
import i18n from './i18n';
import i18nApiValues from '../i18n-api-values';
import type {FlowStateResultRow} from '../types';

const MAX_LISTED_ROWS = 20;

export function RowsSummary({rows}: {rows: Array<FlowStateResultRow>}) {
    const listed = rows.slice(0, MAX_LISTED_ROWS);
    return (
        <Flex direction="column" gap={1}>
            <Alert
                theme="warning"
                message={i18n('text_delete-selected-explanation', {count: String(rows.length)})}
            />
            {listed.map((row) => (
                <Flex key={getStateRowId(row)} gap={2} wrap>
                    <Text color="secondary">{i18nApiValues(KIND_LABEL_KEYS[row.section])}</Text>
                    <Text>{row.computationId ?? ''}</Text>
                    {row.partitionId !== undefined && <Text>{row.partitionId}</Text>}
                    {row.key !== undefined && <Text>{stringifyStateValue(row.key)}</Text>}
                    <Text>{row.stateName}</Text>
                </Flex>
            ))}
            {rows.length > MAX_LISTED_ROWS && (
                <Text color="secondary">
                    {i18n('text_and-n-more', {count: String(rows.length - MAX_LISTED_ROWS)})}
                </Text>
            )}
        </Flex>
    );
}
