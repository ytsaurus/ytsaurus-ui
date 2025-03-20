import * as monaco from 'monaco-editor';
import {QTEditorError} from '../../module/types/editor';
import {BaseDecorator} from './BaseDecorator';

export class ErrorDecorator extends BaseDecorator {
    setErrors(editorErrors: QTEditorError[], decorationClassName: string): void {
        const model = this.editor.getModel();
        if (!model) return;

        const markers: monaco.editor.IMarkerData[] = [];
        const decorations: monaco.editor.IModelDeltaDecoration[] = [];
        const lineNumbersSet = new Set<number>();

        editorErrors.forEach((error) => {
            const {attributes, message} = error;
            const range = new monaco.Range(
                attributes.start_position.row,
                attributes.start_position.column,
                attributes.end_position.row,
                attributes.end_position.column,
            );
            const {startLineNumber, startColumn, endLineNumber, endColumn} = range;

            const marker: monaco.editor.IMarkerData = {
                message: message,
                severity: monaco.MarkerSeverity.Error,
                startLineNumber,
                startColumn,
                endLineNumber,
                endColumn,
            };
            markers.push(marker);

            if (!lineNumbersSet.has(range.startLineNumber)) {
                decorations.push({
                    range: range,
                    options: {
                        isWholeLine: true,
                        className: decorationClassName,
                    },
                });
                lineNumbersSet.add(range.startLineNumber);
            }
        });

        this.clearDecorations();
        this.collection.set(decorations);
        monaco.editor.setModelMarkers(model, 'query-tracker', markers);
    }
}
