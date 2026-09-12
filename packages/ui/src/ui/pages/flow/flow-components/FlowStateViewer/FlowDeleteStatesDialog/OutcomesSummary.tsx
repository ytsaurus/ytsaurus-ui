import React from 'react';

import {Flex, Text} from '@gravity-ui/uikit';

import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';

import {aggregateMatchedTotal} from '../state-delete';
import i18n from './i18n';
import type {FlowRowDeleteOutcome} from '../types';

export function OutcomesSummary({outcomes}: {outcomes: Array<FlowRowDeleteOutcome>}) {
    return (
        <Flex direction="column" gap={1}>
            <Text variant="subheader-2">
                {i18n('text_matched-total')}: {aggregateMatchedTotal(outcomes)}
            </Text>
            {outcomes.map(({rowId, response, error}) => (
                <React.Fragment key={rowId}>
                    {error !== undefined && (
                        <YTErrorBlock error={error as YTErrorBlockProps['error']} />
                    )}
                    {(response?.errors ?? []).map((message, index) => (
                        <YTErrorBlock key={`${index}:${message}`} error={{message}} />
                    ))}
                </React.Fragment>
            ))}
        </Flex>
    );
}
