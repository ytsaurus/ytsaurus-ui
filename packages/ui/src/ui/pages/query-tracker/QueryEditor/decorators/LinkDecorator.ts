import * as monaco from 'monaco-editor';
import {getClustersAndPaths} from '../../../../libs/monaco-yql-languages/helpers/getClusterAndPath';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {BaseDecorator} from './BaseDecorator';
import {CommandKey} from '../../../../utils/keyboard';
import isEqual_ from 'lodash/isEqual';

type Link = {
    path: string;
    line: number;
    position: {start: number; end: number};
    cluster: string | null;
};

export class LinkDecorator extends BaseDecorator {
    private links: Link[];
    private engine: QueryEngine;
    private commandKey: CommandKey;

    constructor(
        editor: monaco.editor.IStandaloneCodeEditor,
        engine: QueryEngine,
        commandKey: CommandKey,
    ) {
        super(editor);
        this.engine = engine;
        this.commandKey = commandKey;
        this.links = [];
    }

    setEngine(engine: QueryEngine): void {
        this.engine = engine;
    }

    updateLinks(): void {
        const model = this.editor.getModel();
        if (!model) return;

        const lineCount = model.getLineCount();
        if (!lineCount) return;

        const newLinks: Link[] = [];
        const decorations: monaco.editor.IModelDeltaDecoration[] = [];
        for (let i = 1; i <= lineCount; i++) {
            const line = model.getLineContent(i);
            const paths = getClustersAndPaths(line, this.engine);

            paths.forEach(({path, position, cluster}) => {
                if (!path || !position) return;

                newLinks.push({
                    path,
                    line: i,
                    position,
                    cluster,
                });

                decorations.push({
                    range: new monaco.Range(i, position.start, i, position.end),
                    options: {
                        hoverMessage: {
                            value: `Follow link (${this.commandKey} + click)`,
                        },
                    },
                });
            });
        }

        if (!isEqual_(newLinks, this.links)) {
            this.clearDecorations();
            this.collection.set(decorations);
            this.links = newLinks;
        }
    }

    findLink({lineNumber, column}: monaco.Position): Link | undefined {
        const model = this.editor.getModel();
        if (!model) return;

        return this.links.find(
            ({position: {start, end}, line}) =>
                lineNumber === line && column >= start && column <= end,
        );
    }
}
