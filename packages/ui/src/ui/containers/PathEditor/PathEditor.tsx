import React, {Component, FocusEvent, Key, KeyboardEvent, MouseEvent} from 'react';
import {connect} from 'react-redux';
import ReactList from 'react-list';
import block from 'bem-cn-lite';
import key from 'hotkeys-js';

import debounce_ from 'lodash/debounce';
import find_ from 'lodash/find';
import isEmpty_ from 'lodash/isEmpty';

import {Popup, TextInput} from '@gravity-ui/uikit';

import Icon from '../../components/Icon/Icon';
import ErrorMessage from '../../components/ErrorMessage/ErrorMessage';

import {
    filterByCurrentPath,
    getCompletedPath,
    getIconNameForType,
    getNextSelectedIndex,
    getPrevSelectedIndex,
} from '../../utils/navigation/path-editor';
import {
    loadSuggestionsList,
    removeActiveRequests,
} from '../../store/actions/navigation/path-editor/path-editor';
import {RootState} from '../../store/reducers';
import {KeyCode} from '../../constants/index';

import './PathEditor.scss';

interface Suggestion {
    parentPath: string;
    childPath: string;
    path: string;
    targetPathBroken?: boolean;
    type?: string;
    dynamic?: unknown;
}

type SuggestionFilter = (suggestions: Suggestion[]) => Suggestion[];

export interface EventPayload {
    path: string;
}

export interface PathEditorProps {
    suggestions: Suggestion[];
    suggestionsError?: boolean;
    errorMessage?: string;
    loadSuggestionsList: (path: string, customFilter?: SuggestionFilter) => void;
    removeActiveRequests: () => void;
    // from parent component
    className?: string;
    placeholder?: string;
    defaultPath?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    hasClear?: boolean;
    showErrors?: boolean;
    customFilter?: SuggestionFilter;
    onChange?: (newPath: string) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>, payload: EventPayload) => void;
    onBlur?: (path: string) => void;
    onApply?: (newPath: string) => void;
    onCancel?: () => void;
}

interface PathEditorState {
    path: string;
    actualSuggestions: Suggestion[];
    inputFocus: boolean;
    inputChange: boolean;
    selectedIndex: number;
}

const debounceTime = 300;
const b = block('path-editor');

export class PathEditor extends Component<PathEditorProps, PathEditorState> {
    static defaultProps: Partial<PathEditorProps> = {
        errorMessage: 'Oops, something went wrong',
        placeholder: 'Enter the path...',
        suggestionsError: false,
        autoFocus: false,
        showErrors: true,
        defaultPath: undefined,
        disabled: false,
        hasClear: false,
    };

    state: PathEditorState;

    private suggestionsList = React.createRef<HTMLDivElement>();
    private input = React.createRef<HTMLInputElement>();
    private prevScope = '';

    constructor(props: PathEditorProps) {
        super(props);

        this.debounceLoading = debounce_(this.debounceLoading, debounceTime);

        this.state = {
            path: props.defaultPath ?? '',
            actualSuggestions: [],
            inputFocus: false,
            inputChange: false,
            selectedIndex: -1,
        };
    }

    static getDerivedStateFromProps(props: PathEditorProps, state: PathEditorState) {
        const res = {};
        if (state.inputFocus && state.inputChange) {
            Object.assign(res, {
                actualSuggestions: props.suggestions.length
                    ? filterByCurrentPath(state.path, props.suggestions)
                    : [],
            });
        }

        if (state.path === undefined && props.defaultPath !== undefined) {
            Object.assign(res, {
                path: props.defaultPath,
            });
        }

        return isEmpty_(res) ? null : res;
    }

    componentDidMount() {
        const {loadSuggestionsList, customFilter, autoFocus} = this.props;
        const {path} = this.state;

        this.prevScope = key.getScope();
        if (path) {
            loadSuggestionsList(path, customFilter);
        }
        if (autoFocus) {
            this._setFocus();
        }
    }

    componentDidUpdate(prevProps: PathEditorProps) {
        if (prevProps.disabled && !this.props.disabled && this.input.current) {
            this._setFocus();
        }
    }

    componentWillUnmount() {
        this.props.removeActiveRequests();
    }

    _setFocus() {
        this.input.current?.focus();
    }

    get inputWidth() {
        // Is there a way to avoid using private _control property?
        return this.input.current && this.input.current.offsetWidth - 2;
    }

    /**
     * @deprecated Please replace usages of it to direct call.\
     *             For example: use `onFocus?.(event, payload)` instead `callCallback(onFocus, [event, payload])`.\
     *             Also, pass event as first agument of callback.
     */
    callCallback<T extends unknown[] = unknown[]>(
        cb: undefined | ((...args: T) => unknown),
        ...params: T
    ) {
        if (typeof cb === 'function') {
            return cb(...params);
        }

        return undefined;
    }

    debounceLoading(path: string) {
        const {loadSuggestionsList, customFilter, onChange} = this.props;

        loadSuggestionsList(path, customFilter);
        this.callCallback(onChange, path);
    }

    hideSuggestions = () => {
        this.setState({inputFocus: false, selectedIndex: -1});
    };

    selectPrevSuggestion() {
        const {selectedIndex, actualSuggestions} = this.state;

        const prevIndex = getPrevSelectedIndex(actualSuggestions, selectedIndex);
        this.setState({selectedIndex: prevIndex});
    }

    selectNextSuggestion() {
        const {selectedIndex, actualSuggestions} = this.state;

        const nextIndex = getNextSelectedIndex(actualSuggestions, selectedIndex);
        this.setState({selectedIndex: nextIndex});
    }

    handleInputChange = (path: string) => {
        this.setState({path, selectedIndex: -1, inputChange: true});
        this.debounceLoading(path);
    };

    handleInputFocus = (e: FocusEvent<HTMLInputElement>) => {
        const {onFocus} = this.props;
        const {path} = this.state;

        key.setScope('path-editor');
        this.setState({inputFocus: true});
        onFocus?.(e, {path});
    };

    handleInputBlur = () => {
        const {onBlur} = this.props;
        const {path} = this.state;

        key.setScope(this.prevScope);
        this.hideSuggestions();
        this.callCallback(onBlur, path);
    };

    handleEnterClick(event: KeyboardEvent<HTMLInputElement>) {
        event.preventDefault();

        const {selectedIndex, actualSuggestions} = this.state;
        const {onApply} = this.props;
        const inputPath = event.currentTarget.value;

        if (selectedIndex === -1) {
            this.setState({path: inputPath, selectedIndex: -1});
            this.callCallback(onApply, inputPath);
        } else {
            const suggestion = find_(actualSuggestions, (_, index) => index === selectedIndex);
            const completedPath = getCompletedPath(suggestion);

            this.handleInputChange(completedPath);
        }
    }

    handleEscClick() {
        const {onCancel} = this.props;

        this.input.current?.blur();
        this.callCallback(onCancel);
    }

    handleTabClick(event: KeyboardEvent<HTMLInputElement>) {
        event.preventDefault();
        const {actualSuggestions} = this.state;

        if (actualSuggestions.length === 1) {
            const completedPath = getCompletedPath(actualSuggestions[0]);

            this.handleInputChange(completedPath);
        } else if (actualSuggestions.length > 1) {
            this.selectNextSuggestion();
        }
    }

    handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        const key = event.keyCode;

        switch (key) {
            case KeyCode.ARROW_DOWN:
                this.selectNextSuggestion();
                break;
            case KeyCode.ARROW_UP:
                this.selectPrevSuggestion();
                break;
            case KeyCode.ENTER:
                this.handleEnterClick(event);
                break;
            case KeyCode.ESCAPE:
                this.handleEscClick();
                break;
            case KeyCode.TAB:
                this.handleTabClick(event);
                break;
        }
    };

    renderInput() {
        const {placeholder, autoFocus, hasClear, disabled} = this.props;
        const {path} = this.state;

        return (
            <TextInput
                onKeyDown={this.handleKeyDown}
                onUpdate={this.handleInputChange}
                onFocus={this.handleInputFocus}
                onBlur={this.handleInputBlur}
                placeholder={placeholder}
                hasClear={hasClear}
                autoFocus={autoFocus}
                disabled={disabled}
                controlRef={this.input}
                value={path}
            />
        );
    }

    renderItem = (index: number, key: Key) => {
        const {selectedIndex, actualSuggestions} = this.state;

        const item = actualSuggestions[index];
        const {type, dynamic} = item;
        const iconType = type === 'table' && dynamic ? 'table_dynamic' : type;
        const completedPath = getCompletedPath(item);
        const isSelected = index === selectedIndex ? 'yes' : 'no';
        const iconName = getIconNameForType(iconType, item.targetPathBroken);

        const mouseDownHandler = (event: MouseEvent<HTMLDivElement>) => {
            this.handleInputChange(completedPath);
            event.preventDefault();
        };

        return (
            <div
                key={key}
                onMouseDown={mouseDownHandler}
                className={b('item', {selected: isSelected})}
            >
                <Icon awesome={iconName} />

                <span className={b('item-path')}>{item.path}</span>
            </div>
        );
    };

    renderSuggestions() {
        const {actualSuggestions} = this.state;

        return actualSuggestions.length ? (
            <ReactList
                itemRenderer={this.renderItem}
                length={actualSuggestions.length}
                type="simple"
            />
        ) : null;
    }

    renderError() {
        const {errorMessage} = this.props;

        if (!errorMessage) {
            return;
        }

        return <ErrorMessage className={b('item', {error: true})} message={errorMessage} />;
    }

    renderPopup() {
        const {suggestionsError, showErrors} = this.props;
        const {actualSuggestions, inputFocus} = this.state;

        const width = this.inputWidth || 0;
        const isVisible = Boolean(
            (actualSuggestions.length || (suggestionsError && showErrors)) && inputFocus,
        );
        const content =
            suggestionsError && showErrors ? this.renderError() : this.renderSuggestions();

        return (
            <Popup
                className={b('popup')}
                placement={['bottom-start', 'top-start']}
                onClose={this.hideSuggestions}
                anchorRef={this.input}
                open={isVisible}
                offset={[0, 0]}
            >
                <div className={b('items')} style={{width}} ref={this.suggestionsList}>
                    {content}
                </div>
            </Popup>
        );
    }

    render() {
        return (
            <div className={b(null, this.props.className)}>
                {this.renderInput()}
                {this.renderPopup()}
            </div>
        );
    }
}

const mapStateToProps = ({navigation}: RootState) => ({
    suggestions: navigation.pathEditor.suggestions,
    suggestionsError: navigation.pathEditor.suggestionsError,
    errorMessage: navigation.pathEditor.errorMessage,
});

export default connect(mapStateToProps, {
    loadSuggestionsList,
    removeActiveRequests,
})(PathEditor);
