import React, {Component} from 'react';
import {connect} from 'react-redux';
import ReactList from 'react-list';
import PropTypes from 'prop-types';
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
import {KeyCode} from '../../constants/index';

import './PathEditor.scss';

const debounceTime = 300;
const b = block('path-editor');

export class PathEditor extends Component {
    static propTypes = {
        // from connect
        suggestions: PropTypes.arrayOf(
            PropTypes.shape({
                path: PropTypes.string.isRequired,
                targetPathBroken: PropTypes.bool,
                type: PropTypes.string,
            }),
        ).isRequired,
        suggestionsError: PropTypes.bool,
        errorMessage: PropTypes.string,

        loadSuggestionsList: PropTypes.func.isRequired,
        removeActiveRequests: PropTypes.func.isRequired,
        // from parent component
        className: PropTypes.string,
        placeholder: PropTypes.string,
        customFilter: PropTypes.func,
        onChange: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onApply: PropTypes.func,
        onCancel: PropTypes.func,
        defaultPath: PropTypes.string,
        disabled: PropTypes.bool,
        autoFocus: PropTypes.bool,
        hasClear: PropTypes.bool,
        showErrors: PropTypes.bool,
    };

    static defaultProps = {
        errorMessage: 'Oops, something went wrong',
        placeholder: 'Enter the path...',
        suggestionsError: false,
        autoFocus: false,
        showErrors: true,
        defaultPath: undefined,
        disabled: false,
        hasClear: false,
    };

    constructor(props) {
        super(props);

        this.suggestionsList = React.createRef();
        this.input = React.createRef();

        this.debounceLoading = debounce_(this.debounceLoading, debounceTime);
        this.prevScope = null;

        this.state = {
            path: props.defaultPath,
            actualSuggestions: [],
            inputFocus: false,
            inputChange: false,
            selectedIndex: -1,
        };
    }

    static getDerivedStateFromProps(props, state) {
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

    componentDidUpdate(prevProps) {
        if (prevProps.disabled && !this.props.disabled && this.input.current) {
            this._setFocus();
        }
    }

    componentWillUnmount() {
        this.props.removeActiveRequests();
    }

    _setFocus() {
        this.input.current.focus();
    }

    get inputWidth() {
        // Is there a way to avoid using private _control property?
        return this.input.current && this.input.current.offsetWidth - 2;
    }

    callCallback(cb, ...params) {
        if (typeof cb === 'function') {
            return cb(...params);
        }
    }

    debounceLoading(path) {
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

    handleInputChange = (path) => {
        this.setState({path, selectedIndex: -1, inputChange: true});
        this.debounceLoading(path);
    };

    handleInputFocus = (e) => {
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

    handleEnterClick(evt) {
        evt.preventDefault();

        const {selectedIndex, actualSuggestions} = this.state;
        const {onApply} = this.props;
        const inputPath = evt.target.value;

        if (selectedIndex === -1) {
            this.setState({path: inputPath, selectedIndex: -1});
            this.callCallback(onApply, inputPath);
        } else {
            const suggestion = find_(actualSuggestions, (item, index) => index === selectedIndex);
            const completedPath = getCompletedPath(suggestion);

            this.handleInputChange(completedPath);
        }
    }

    handleEscClick() {
        const {onCancel} = this.props;

        this.input.current.blur();
        this.callCallback(onCancel);
    }

    handleTabClick(evt) {
        evt.preventDefault();
        const {actualSuggestions} = this.state;

        if (actualSuggestions.length === 1) {
            const completedPath = getCompletedPath(actualSuggestions[0]);

            this.handleInputChange(completedPath);
        } else if (actualSuggestions.length > 1) {
            this.selectNextSuggestion();
        }
    }

    handleKeyDown = (evt) => {
        const key = evt.keyCode;

        switch (key) {
            case KeyCode.ARROW_DOWN:
                this.selectNextSuggestion();
                break;
            case KeyCode.ARROW_UP:
                this.selectPrevSuggestion();
                break;
            case KeyCode.ENTER:
                this.handleEnterClick(evt);
                break;
            case KeyCode.ESCAPE:
                this.handleEscClick();
                break;
            case KeyCode.TAB:
                this.handleTabClick(evt);
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

    renderItem = (index, key) => {
        const {selectedIndex, actualSuggestions} = this.state;

        const item = actualSuggestions[index];
        const {type, dynamic} = item;
        const iconType = type === 'table' && dynamic ? 'table_dynamic' : type;
        const completedPath = getCompletedPath(item);
        const isSelected = index === selectedIndex ? 'yes' : 'no';
        const iconName = getIconNameForType(iconType, item.targetPathBroken);

        const mouseDownHandler = (evt) => {
            this.handleInputChange(completedPath);
            evt.preventDefault();
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

        return <ErrorMessage className={b('item', {error: true})} message={errorMessage} />;
    }

    renderPopup() {
        const {suggestionsError, showErrors} = this.props;
        const {actualSuggestions, inputFocus} = this.state;

        const width = this.inputWidth || 0;
        const isVisible =
            (actualSuggestions.length || (suggestionsError && showErrors)) && inputFocus;
        const content =
            suggestionsError && showErrors ? this.renderError() : this.renderSuggestions();

        return (
            <Popup
                className={b('popup')}
                placement={['bottom-start', 'top-start']}
                onClose={this.hideSuggestions}
                anchorRef={this.input}
                open={isVisible}
                offset={[undefined, 0]}
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

const mapStateToProps = ({navigation}) => ({
    suggestions: navigation.pathEditor.suggestions,
    suggestionsError: navigation.pathEditor.suggestionsError,
    errorMessage: navigation.pathEditor.errorMessage,
});

export default connect(mapStateToProps, {
    loadSuggestionsList,
    removeActiveRequests,
})(PathEditor);
