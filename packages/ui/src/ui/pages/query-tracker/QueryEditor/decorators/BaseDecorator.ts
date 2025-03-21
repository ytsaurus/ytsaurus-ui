import * as monaco from 'monaco-editor';

export abstract class BaseDecorator {
    protected editor: monaco.editor.IStandaloneCodeEditor;
    protected collection: monaco.editor.IEditorDecorationsCollection;

    constructor(editor: monaco.editor.IStandaloneCodeEditor) {
        this.editor = editor;
        this.collection = this.editor.createDecorationsCollection([]);
    }

    protected clearDecorations(): void {
        this.collection.clear();
    }
}
