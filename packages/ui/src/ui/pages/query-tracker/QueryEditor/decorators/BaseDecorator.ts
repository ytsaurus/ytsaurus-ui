import type * as monaco from 'monaco-editor';

export abstract class BaseDecorator {
    protected editor: monaco.editor.IStandaloneCodeEditor;
    protected collection: monaco.editor.IEditorDecorationsCollection;

    constructor(editor: monaco.editor.IStandaloneCodeEditor) {
        this.editor = editor;
        this.collection = this.editor.createDecorationsCollection([]);
    }

    dispose(): void {
        this.collection.clear();
    }

    protected clearDecorations(): void {
        this.collection.clear();
    }
}
