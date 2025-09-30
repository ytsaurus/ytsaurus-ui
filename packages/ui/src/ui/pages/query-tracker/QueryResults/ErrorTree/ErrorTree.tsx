import React, {FC, useCallback, useMemo} from 'react';
import {ErrorPosition, QueryError} from '../../../../store/actions/queries/api';
import {ErrorTreeNode} from './ErrorTreeNode';
import {useMonaco} from '../../hooks/useMonaco';
import {Position} from 'monaco-editor';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import {Flex, Text} from '@gravity-ui/uikit';
import UIFactory from '../../../../UIFactory';

type Props = {
    rootError?: QueryError;
};

export const ErrorTree: FC<Props> = ({rootError}) => {
    const {getEditor} = useMonaco();
    const chatComponents = UIFactory.getAIChat();

    const handleErrorClick = useCallback(
        ({row, column}: ErrorPosition) => {
            const monaco = getEditor('queryEditor');
            monaco?.focus();
            monaco?.revealLine(row);
            monaco?.setPosition(new Position(row, column));
        },
        [getEditor],
    );

    const text = useMemo(() => {
        return JSON.stringify(rootError, null, 4);
    }, [rootError]);

    if (!rootError) return null;

    return (
        <div>
            <Flex gap={2} alignItems="center">
                <div>
                    <Text variant="subheader-3">Query error</Text>{' '}
                    <ClipboardButton
                        title="Copy error"
                        view="flat-secondary"
                        text={text}
                        size="l"
                    />
                </div>
                {chatComponents && chatComponents.askAboutErrorButton}
            </Flex>
            <ErrorTreeNode error={rootError} onErrorClick={handleErrorClick} expanded />
        </div>
    );
};
