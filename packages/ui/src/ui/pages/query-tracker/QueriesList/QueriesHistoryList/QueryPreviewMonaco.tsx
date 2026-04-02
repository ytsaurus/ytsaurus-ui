import React, {type FC, useMemo} from 'react';
import MonacoEditor, {type MonacoEditorConfig} from '../../../../components/MonacoEditor';
import {type QueryEngine} from '../../../../../shared/constants/engines';
import {getLanguageByEngine} from '../../QueryEditor/helpers/getLanguageByEngine';

const PREVIEW_FONT_SIZE_PX = 14;

const MONACO_CONFIG: MonacoEditorConfig = {
    contextmenu: false,
    fontSize: PREVIEW_FONT_SIZE_PX,
    language: 'plaintext',
    renderWhitespace: 'boundary',
    minimap: {
        enabled: false,
    },
    wordWrap: 'off',
    scrollBeyondLastLine: false,
    overviewRulerLanes: 0,
    lineNumbersMinChars: 2,
    glyphMargin: false,
    scrollbar: {
        vertical: 'hidden',
        verticalHasArrows: false,
        horizontal: 'auto',
        useShadows: false,
        alwaysConsumeMouseWheel: false,
    },
};

function truncatePreviewText(text: string, maxLines: number): string {
    if (maxLines <= 0) {
        return '';
    }
    const lines = text.split(/\r?\n/);
    if (lines.length <= maxLines) {
        return text;
    }
    return lines.slice(0, maxLines).join('\n');
}

type Props = {
    value: string;
    engine: QueryEngine;
    maxPreviewLines: number;
    previewFirstLineNumber?: number;
    className?: string;
};

export const QueryPreviewMonaco: FC<Props> = ({
    value,
    engine,
    maxPreviewLines,
    previewFirstLineNumber = 1,
    className,
}) => {
    const previewValue = useMemo(
        () => truncatePreviewText(value, maxPreviewLines),
        [value, maxPreviewLines],
    );

    const monacoConfig = useMemo(
        (): MonacoEditorConfig => ({
            ...MONACO_CONFIG,
            lineNumbers: (lineNumber: number) => String(previewFirstLineNumber + lineNumber - 1),
        }),
        [previewFirstLineNumber],
    );

    return (
        <div className={className}>
            <MonacoEditor
                value={previewValue}
                language={getLanguageByEngine(engine)}
                readOnly
                monacoConfig={monacoConfig}
            />
        </div>
    );
};
