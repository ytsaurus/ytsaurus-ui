import * as monaco from 'monaco-editor';
import {BaseDecorator} from './BaseDecorator';

export const HIGHLIGHTED_LINE_CLASS = 'yt-monaco-editor__highlighted-line';

export class LineDecoration extends BaseDecorator {
    setActiveLine(lineNumber?: number): void {
        if (!lineNumber) {
            this.clearLines();
            return;
        }

        const model = this.editor.getModel();
        if (!model) return;

        this.clearDecorations();
        this.collection.set([
            {
                range: new monaco.Range(
                    lineNumber,
                    1,
                    lineNumber,
                    model.getLineLength(lineNumber) + 1,
                ),
                options: {
                    isWholeLine: true,
                    className: HIGHLIGHTED_LINE_CLASS,
                },
            },
        ]);

        this.editor.setSelection(new monaco.Selection(0, 0, 0, 0));
    }

    clearLines(): void {
        this.editor.setSelection(new monaco.Selection(0, 0, 0, 0));
        this.clearDecorations();
    }
}
