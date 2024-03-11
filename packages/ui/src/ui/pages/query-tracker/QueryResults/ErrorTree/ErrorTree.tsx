import React, {FC, useCallback, useMemo} from 'react';
import {ErrorPosition, QueryError} from '../../module/api';
import {ErrorTreeNode} from './ErrorTreeNode';
import {useMonaco} from '../../hooks/useMonaco';
import {Position} from 'monaco-editor';
import ClipboardButton from '../../../../components/ClipboardButton/ClipboardButton';
import {Text} from '@gravity-ui/uikit';

type Props = {
    rootError?: QueryError;
};

export const ErrorTree: FC<Props> = ({rootError}) => {
    const {getEditor} = useMonaco();

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
            <Text variant="subheader-3">Query error</Text>{' '}
            <ClipboardButton title="Copy error" view="flat-secondary" text={text} size="l" />
            <ErrorTreeNode error={rootError} onErrorClick={handleErrorClick} expanded />
        </div>
    );
};
