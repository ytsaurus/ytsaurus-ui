import {MonacoLanguage} from '../../constants/monaco';
import {CancellationToken, Emitter, IEvent, Position, editor, languages} from 'monaco-editor';

interface ILang extends languages.ILanguageExtensionPoint {
    loader: () => Promise<ILangImpl>;
}

interface ILangImpl {
    conf: languages.LanguageConfiguration;
    language: languages.IMonarchLanguage;
    provideSuggestionsFunction?: (
        model: editor.ITextModel,
        monacoCursorPosition: Position,
        _context: languages.CompletionContext,
        _token: CancellationToken,
    ) =>
        | {suggestions: languages.CompletionItem[]}
        | Promise<{suggestions: languages.CompletionItem[]}>;
    provideInlineSuggestionsFunction?: (
        model: editor.ITextModel,
        monacoCursorPosition: Position,
        _context: languages.InlineCompletionContext,
        _token: CancellationToken,
    ) => Promise<{items: languages.InlineCompletion[]}>;
}

const languageDefinitions: {[languageId: string]: ILang} = {};
const lazyLanguageLoaders: {[languageId: string]: LazyLanguageLoader} = {};

class LazyLanguageLoader {
    static getOrCreate(languageId: string): LazyLanguageLoader {
        if (!lazyLanguageLoaders[languageId]) {
            lazyLanguageLoaders[languageId] = new LazyLanguageLoader(languageId);
        }
        return lazyLanguageLoaders[languageId];
    }

    private readonly _languageId: string;
    private _loadingTriggered: boolean;
    private _lazyLoadPromise: Promise<ILangImpl>;
    private _lazyLoadPromiseResolve!: (value: ILangImpl) => void;
    private _lazyLoadPromiseReject!: (err: any) => void;

    constructor(languageId: string) {
        this._languageId = languageId;
        this._loadingTriggered = false;
        this._lazyLoadPromise = new Promise((resolve, reject) => {
            this._lazyLoadPromiseResolve = resolve;
            this._lazyLoadPromiseReject = reject;
        });
    }

    whenLoaded(): Promise<ILangImpl> {
        return this._lazyLoadPromise;
    }

    load(): Promise<ILangImpl> {
        if (!this._loadingTriggered) {
            this._loadingTriggered = true;
            languageDefinitions[this._languageId].loader().then(
                (mod) => this._lazyLoadPromiseResolve(mod),
                (err) => this._lazyLoadPromiseReject(err),
            );
        }
        return this._lazyLoadPromise;
    }
}

export function registerLanguage(def: ILang): void {
    const languageId = def.id;

    languageDefinitions[languageId] = def;
    languages.register(def);

    const lazyLanguageLoader = LazyLanguageLoader.getOrCreate(languageId);

    if (languageId !== MonacoLanguage.YQL) {
        languages.setMonarchTokensProvider(
            languageId,
            lazyLanguageLoader.whenLoaded().then((mod) => mod.language),
        );
        languages.onLanguage(languageId, () => {
            lazyLanguageLoader.load().then((mod) => {
                languages.setLanguageConfiguration(languageId, mod.conf);
            });
        });
    }

    lazyLanguageLoader.whenLoaded().then((mod) => {
        if (mod.provideSuggestionsFunction) {
            languages.registerCompletionItemProvider(languageId, {
                triggerCharacters: ['`', ':', '/', '', ' '],
                provideCompletionItems: mod.provideSuggestionsFunction,
            });
        }
        if (mod.provideInlineSuggestionsFunction) {
            languages.registerInlineCompletionsProvider(languageId, {
                provideInlineCompletions: mod.provideInlineSuggestionsFunction,
                freeInlineCompletions: () => {},
            });
        }
    });
}

export interface ModeConfiguration {
    /**
     * Defines whether the built-in completionItemProvider is enabled.
     */
    readonly completionItems?: boolean;

    /**
     * Defines whether the built-in hoverProvider is enabled.
     */
    readonly hovers?: boolean;

    /**
     * Defines whether the built-in documentSymbolProvider is enabled.
     */
    readonly documentSymbols?: boolean;

    /**
     * Defines whether the built-in definitions provider is enabled.
     */
    readonly definitions?: boolean;

    /**
     * Defines whether the built-in references provider is enabled.
     */
    readonly references?: boolean;

    /**
     * Defines whether the built-in references provider is enabled.
     */
    readonly documentHighlights?: boolean;

    /**
     * Defines whether the built-in rename provider is enabled.
     */
    readonly rename?: boolean;

    /**
     * Defines whether the built-in color provider is enabled.
     */
    readonly colors?: boolean;

    /**
     * Defines whether the built-in foldingRange provider is enabled.
     */
    readonly foldingRanges?: boolean;

    /**
     * Defines whether the built-in diagnostic provider is enabled.
     */
    readonly diagnostics?: boolean;

    /**
     * Defines whether the built-in selection range provider is enabled.
     */
    readonly selectionRanges?: boolean;
}

export interface DiagnosticsOptions {
    readonly validate?: boolean;
}

export interface LanguageServiceDefaults {
    readonly languageId: string;
    readonly onDidChange: IEvent<LanguageServiceDefaults>;
    readonly diagnosticsOptions: DiagnosticsOptions;
    readonly modeConfiguration: ModeConfiguration;
    setDiagnosticsOptions(options: DiagnosticsOptions): void;
    setModeConfiguration(modeConfiguration: ModeConfiguration): void;
}

export class LanguageServiceDefaultsImpl implements LanguageServiceDefaults {
    private _onDidChange = new Emitter<LanguageServiceDefaults>();
    private _diagnosticsOptions!: DiagnosticsOptions;
    private _modeConfiguration!: ModeConfiguration;
    private _languageId: string;

    constructor(
        languageId: string,
        diagnosticsOptions: DiagnosticsOptions,
        modeConfiguration: ModeConfiguration,
    ) {
        this._languageId = languageId;
        this.setDiagnosticsOptions(diagnosticsOptions);
        this.setModeConfiguration(modeConfiguration);
    }

    get onDidChange(): IEvent<LanguageServiceDefaults> {
        return this._onDidChange.event;
    }

    get languageId(): string {
        return this._languageId;
    }

    get modeConfiguration(): ModeConfiguration {
        return this._modeConfiguration;
    }

    get diagnosticsOptions(): DiagnosticsOptions {
        return this._diagnosticsOptions;
    }

    setDiagnosticsOptions(options: DiagnosticsOptions): void {
        this._diagnosticsOptions = options || Object.create(null);
        this._onDidChange.fire(this);
    }

    setModeConfiguration(modeConfiguration: ModeConfiguration): void {
        this._modeConfiguration = modeConfiguration || Object.create(null);
        this._onDidChange.fire(this);
    }
}

export const modeConfigurationDefault: Required<ModeConfiguration> = {
    completionItems: true,
    hovers: true,
    documentSymbols: true,
    definitions: true,
    references: true,
    documentHighlights: true,
    rename: true,
    colors: true,
    foldingRanges: true,
    diagnostics: true,
    selectionRanges: true,
};

export const diagnosticDefault: Required<DiagnosticsOptions> = {
    validate: true,
};
