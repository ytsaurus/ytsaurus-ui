import 'jsdom-global/register';

import React from 'react';
import Enzyme, {mount, shallow} from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import toJson from 'enzyme-to-json';
import _ from 'lodash';

import {PathEditor} from './PathEditor';

import {
    filterByCurrentPath,
    getCompletedPath,
    getNextSelectedIndex,
    getPrevSelectedIndex,
} from '../../utils/navigation/path-editor';
import {KeyCode} from '../../constants/index';

Enzyme.configure({adapter: new Adapter()});

jest.mock('../../utils/navigation/path-editor', () => ({
    filterByCurrentPath: jest.fn(),
    getNextSelectedIndex: jest.fn(),
    getPrevSelectedIndex: jest.fn(),
    getCompletedPath: jest.fn(),
    getIconNameForType: jest.fn(),
}));

jest.mock('../../store/actions/navigation/path-editor/path-editor', () => ({
    loadSuggestionsList: jest.fn(),
    removeActiveRequests: jest.fn(),
}));
jest.mock('../../common/hammer');

const INPUT_WIDTH = 200;

const props = {
    suggestions: [],
    defaultPath: '//path/to/object',
    placeholder: 'placeholder',
    disabled: false,
    loadSuggestionsList: jest.fn(),
    removeActiveRequests: jest.fn(),
    onChange: jest.fn(),
    onFocus: jest.fn(),
    onBlur: jest.fn(),
    onApply: jest.fn(),
    onCancel: jest.fn(),
    autoFocus: true,
};
const suggestions = [
    {type: 'map_node', path: 'path/to/node1'},
    {type: 'map_node', path: 'path/to/node2'},
    {type: 'map_node', path: 'path/to/node3'},
];

describe('<PathEditor />', () => {
    let wrapper;

    beforeEach(() => {
        jest.spyOn(PathEditor.prototype, 'inputWidth', 'get').mockImplementation(() => INPUT_WIDTH);
        jest.spyOn(PathEditor.prototype, '_setFocus').mockImplementation();

        jest.spyOn(PathEditor.prototype, 'selectNextSuggestion');
        jest.spyOn(PathEditor.prototype, 'selectPrevSuggestion');

        jest.spyOn(PathEditor.prototype, 'renderSuggestions');
        jest.spyOn(PathEditor.prototype, 'handleEnterClick');
        jest.spyOn(PathEditor.prototype, 'handleEscClick');
        jest.spyOn(PathEditor.prototype, 'handleTabClick');
        jest.spyOn(PathEditor.prototype, 'callCallback');
        jest.spyOn(PathEditor.prototype, 'renderError');
        jest.spyOn(PathEditor.prototype, 'renderInput');

        jest.spyOn(PathEditor, 'getDerivedStateFromProps');

        jest.spyOn(_, 'debounce').mockImplementation((fn) => fn);

        wrapper = shallow(<PathEditor {...props} />);

        wrapper.instance().input.current = {
            focus: jest.fn(),
            blur: jest.fn(),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render PathEditor container', () => {
        expect(wrapper.find('.path-editor').exists()).toBeTrue();
        expect(wrapper.find('.path-editor').children().length).toBe(2);
    });

    it('should put the path into the state from the props', () => {
        const pathFromState = wrapper.state().path;
        const pathFromProps = wrapper.instance().props.defaultPath;

        expect(pathFromState).toBe(pathFromProps);
    });

    it('should not call renderError() method if there are no errors', () => {
        expect(wrapper.instance().props.showErrors).toBeTrue();
        expect(wrapper.instance().props.suggestionsError).toBeFalse();
        expect(PathEditor.prototype.renderError).not.toHaveBeenCalled();
    });

    it('should call renderError() method once errors are present', () => {
        wrapper.setProps({...props, suggestionsError: true});
        expect(PathEditor.prototype.renderError).toHaveBeenCalledTimes(1);
    });

    describe('getDerivedStateFromProps', () => {
        it('should return null from getDerivedStateFromProps() if input has not been changed or focused', () => {
            expect(PathEditor.getDerivedStateFromProps).toHaveReturnedWith(null);
        });

        it('should return object from getDerivedStateFromProps() method if input has been changed and focused', () => {
            filterByCurrentPath.mockImplementation((path, suggestions) =>
                suggestions.filter((item, index) => index % 2 !== 0),
            );

            wrapper.setState({inputFocus: true, inputChange: true});

            expect(PathEditor.getDerivedStateFromProps).toHaveBeenCalledTimes(2);
            expect(filterByCurrentPath).not.toHaveBeenCalled();
            expect(PathEditor.getDerivedStateFromProps).toHaveReturnedWith({
                actualSuggestions: [],
            });

            wrapper.setProps({suggestions});

            expect(PathEditor.getDerivedStateFromProps).toHaveBeenCalledTimes(3);
            expect(filterByCurrentPath).toHaveBeenCalledTimes(1);
            expect(filterByCurrentPath).toHaveBeenCalledWith(wrapper.state().path, suggestions);

            expect(PathEditor.getDerivedStateFromProps).toHaveReturnedWith({
                actualSuggestions: [
                    {
                        type: 'map_node',
                        path: 'path/to/node2',
                    },
                ],
            });
        });
    });

    describe('componentDidMount', () => {
        it('should call loadSuggestionsList() action-creator after render', () => {
            const path = wrapper.state().path;
            const customFilter = wrapper.instance().props.customFilter;

            expect(props.loadSuggestionsList).toHaveBeenCalledTimes(1);
            expect(props.loadSuggestionsList).toHaveBeenCalledWith(path, customFilter);
        });

        it('should call _setFocus() method after render', () => {
            expect(PathEditor.prototype._setFocus).toHaveBeenCalledTimes(1);
        });
    });

    describe('componentDidUpdate', () => {
        it('should call _setFocus() method after update', () => {
            wrapper.setProps({disabled: true});

            expect(PathEditor.prototype._setFocus).toHaveBeenCalledTimes(1); // after componentDidMount

            wrapper.setProps({disabled: false});

            expect(PathEditor.prototype._setFocus).toHaveBeenCalledTimes(2);
        });
    });

    describe('componentWillUnmount', () => {
        it('should abort the request', () => {
            wrapper.unmount();

            expect(props.removeActiveRequests).toHaveBeenCalled();
        });
    });

    describe('Input', () => {
        it('should call renderInput() method once', () => {
            expect(PathEditor.prototype.renderInput).toHaveBeenCalledTimes(1);
        });

        it('should update state after the input has been changed', () => {
            const newPath = props.defaultPath + '1';

            wrapper.instance().handleInputChange(newPath);

            const {selectedIndex, path, inputChange} = wrapper.state();

            expect(selectedIndex).toBe(-1);
            expect(path).toBe(newPath);
            expect(inputChange).toBeTrue();
        });

        it('should call debounceLoading() method after input has been changed', () => {
            jest.spyOn(wrapper.instance(), 'debounceLoading');
            const newPath = props.defaultPath + '1';
            const debounceLoading = wrapper.instance().debounceLoading;

            expect(debounceLoading).not.toHaveBeenCalled();

            wrapper.instance().handleInputChange(newPath);

            expect(debounceLoading).toHaveBeenCalledTimes(1);
            expect(debounceLoading).toHaveBeenCalledWith(newPath);
        });

        it('should call loadSuggestionsList() and callCallback() methods after input has been changed', () => {
            const newPath = props.defaultPath + '1';
            const loadSuggestionsList = props.loadSuggestionsList;
            const callCallback = PathEditor.prototype.callCallback;

            expect(loadSuggestionsList).toHaveBeenCalledTimes(1); // after componentDidMount
            expect(loadSuggestionsList).toHaveBeenCalledWith(props.defaultPath, props.customFilter);
            expect(callCallback).not.toHaveBeenCalled();

            wrapper.instance().handleInputChange(newPath);

            expect(loadSuggestionsList).toHaveBeenCalledTimes(2);
            expect(loadSuggestionsList).toHaveBeenCalledWith(newPath, props.customFilter);

            expect(callCallback).toHaveBeenCalledTimes(1);
            expect(callCallback).toHaveBeenCalledWith(props.onChange, newPath);
        });

        it('should update the state after the input has been focused', () => {
            expect(wrapper.state().inputFocus).toBeFalse();

            wrapper.instance().handleInputFocus();

            expect(wrapper.state().inputFocus).toBeTrue();
        });

        it('should call callCallback() method after the input has been focused', () => {
            const callCallback = PathEditor.prototype.callCallback;

            expect(callCallback).not.toHaveBeenCalled();

            wrapper.instance().handleInputFocus();

            expect(callCallback).toHaveBeenCalledWith(props.onFocus, wrapper.state().path);
        });

        it('should update the state after the input has been blurred', () => {
            jest.spyOn(wrapper.instance(), 'hideSuggestions');
            expect(wrapper.state().inputFocus).toBeFalse();

            wrapper.instance().handleInputFocus();
            wrapper.instance().handleInputBlur();

            expect(wrapper.state().inputFocus).toBeFalse();
        });

        it('should call callCallback() method after the input has been blurred', () => {
            const callCallback = PathEditor.prototype.callCallback;

            expect(callCallback).not.toHaveBeenCalled();

            wrapper.instance().handleInputBlur();

            expect(callCallback).toHaveBeenCalledWith(props.onBlur, wrapper.state().path);
        });

        it('should pass the correct props into the Input component', () => {
            let input = wrapper.find('.path-editor').children().get(0);
            const newPath = props.defaultPath + '1';
            const {path} = wrapper.state();

            expect(input.props.value).toBe(path);
            expect(input.props.placeholder).toBe(props.placeholder);
            expect(input.props.disabled).toBe(props.disabled);
            expect(input.props.onUpdate).toBe(wrapper.instance().handleInputChange);
            expect(input.props.onFocus).toBe(wrapper.instance().handleInputFocus);
            expect(input.props.onBlur).toBe(wrapper.instance().handleInputBlur);

            wrapper.instance().handleInputChange(newPath);
            input = wrapper.find('.path-editor').children().get(0);

            expect(input.props.value).toBe(newPath);

            wrapper.setProps({
                disabled: true,
                placeholder: 'new placeholder',
            });
            input = wrapper.find('.path-editor').children().get(0);

            expect(input.props.placeholder).toBe('new placeholder');
            expect(input.props.disabled).toBeTrue();
        });
    });

    describe('events handling', () => {
        const getEvent = (keyCode) => ({
            keyCode,
            target: {value: '//path/to/another/folder'},
            preventDefault() {},
        });

        it('should handle the arrowDown event', () => {
            const selectNextSuggestion = PathEditor.prototype.selectNextSuggestion;
            const arrowDownEvt = getEvent(KeyCode.ARROW_DOWN);

            expect(selectNextSuggestion).not.toHaveBeenCalled();

            wrapper.instance().handleKeyDown(arrowDownEvt);

            expect(selectNextSuggestion).toHaveBeenCalledTimes(1);
        });

        it('should handle the arrowUp event', () => {
            const selectPrevSuggestion = PathEditor.prototype.selectPrevSuggestion;
            const arrowUpEvt = getEvent(KeyCode.ARROW_UP);

            expect(selectPrevSuggestion).not.toHaveBeenCalled();

            wrapper.instance().handleKeyDown(arrowUpEvt);

            expect(selectPrevSuggestion).toHaveBeenCalledTimes(1);
        });

        it('should update state after selectPrevSuggestion() method has been called', () => {
            const prevSelectedIndex = 2;
            const arrowUpEvt = getEvent(KeyCode.ARROW_UP);
            const {actualSuggestions, selectedIndex} = wrapper.state();

            expect(getPrevSelectedIndex).not.toHaveBeenCalled();

            getPrevSelectedIndex.mockImplementation(() => prevSelectedIndex);
            wrapper.instance().handleKeyDown(arrowUpEvt);

            expect(getPrevSelectedIndex).toHaveBeenCalledTimes(1);
            expect(getPrevSelectedIndex).toHaveBeenCalledWith(actualSuggestions, selectedIndex);
            expect(wrapper.state().selectedIndex).toBe(prevSelectedIndex);
        });

        it('should handle the enter event', () => {
            const handleEnterClick = PathEditor.prototype.handleEnterClick;
            const enterEvt = getEvent(KeyCode.ENTER);

            expect(handleEnterClick).not.toHaveBeenCalled();

            wrapper.instance().handleKeyDown(enterEvt);

            expect(handleEnterClick).toHaveBeenCalledTimes(1);
            expect(handleEnterClick).toHaveBeenCalledWith(enterEvt);
        });

        it('should update the state and call callCallback() method after enter key has been clicked', () => {
            const enterEvt = getEvent(KeyCode.ENTER);
            const newPath = enterEvt.target.value;

            wrapper.instance().handleKeyDown(enterEvt);

            expect(wrapper.state().selectedIndex).toBe(-1);
            expect(wrapper.state().path).toBe(newPath);
            expect(PathEditor.prototype.callCallback).toBeCalledWith(props.onApply, newPath);
        });

        it('should call handleInputChange() method after enter key has been clicked', () => {
            jest.spyOn(wrapper.instance(), 'handleInputChange');

            const enterEvt = getEvent(KeyCode.ENTER);
            const newPath = '//completed/path/to/folder/';
            const selectedIndex = 5;

            wrapper.setState({selectedIndex});
            getCompletedPath.mockImplementation(() => newPath);
            wrapper.instance().handleKeyDown(enterEvt);

            expect(wrapper.instance().handleInputChange).toHaveBeenCalledTimes(1);
            expect(wrapper.instance().handleInputChange).toHaveBeenCalledWith(newPath);
        });

        it('should handle the esc event', () => {
            const handleEscClick = PathEditor.prototype.handleEscClick;
            const escEvt = getEvent(KeyCode.ESCAPE);

            expect(handleEscClick).not.toHaveBeenCalled();

            wrapper.instance().handleKeyDown(escEvt);

            expect(handleEscClick).toHaveBeenCalledTimes(1);
        });

        it('should call callCallback() method after Esc key has been clicked', () => {
            const escEvt = getEvent(KeyCode.ESCAPE);

            wrapper.instance().handleKeyDown(escEvt);

            expect(PathEditor.prototype.callCallback).toBeCalledWith(props.onCancel);
        });

        it('should handle the tab event', () => {
            const handleTabClick = PathEditor.prototype.handleTabClick;
            const tabEvt = getEvent(KeyCode.TAB);

            expect(handleTabClick).not.toHaveBeenCalled();

            wrapper.instance().handleKeyDown(tabEvt);

            expect(handleTabClick).toHaveBeenCalledTimes(1);
            expect(handleTabClick).toHaveBeenCalledWith(tabEvt);
        });

        it('should call handleInputChange() method after tab key has been clicked', () => {
            jest.spyOn(wrapper.instance(), 'handleInputChange');

            const tabEvt = getEvent(KeyCode.TAB);
            const path = '//path/to/folder';
            const suggestion = {type: 'map_node', path};
            const actualSuggestions = [suggestion];

            wrapper.setState({actualSuggestions});
            getCompletedPath.mockImplementation((suggestion) => suggestion.path);
            wrapper.instance().handleKeyDown(tabEvt);

            expect(wrapper.instance().handleInputChange).toHaveBeenCalledTimes(1);
            expect(wrapper.instance().handleInputChange).toHaveBeenCalledWith(path);
        });

        it('should call selectNextSuggestion() method after tab key has been clicked', () => {
            const selectNextSuggestion = PathEditor.prototype.selectNextSuggestion;
            const tabEvt = getEvent(KeyCode.TAB);
            const actualSuggestions = [
                {type: 'map_node', path: '//path/to/folder1'},
                {type: 'map_node', path: '//path/to/folder2'},
            ];

            wrapper.setState({actualSuggestions});
            wrapper.instance().handleKeyDown(tabEvt);

            expect(selectNextSuggestion).toHaveBeenCalledTimes(1);
        });

        it('should update state after selectNextSuggestion() method has been called', () => {
            const nextSelectedIndex = 1;
            const arrowDownEvt = getEvent(KeyCode.ARROW_DOWN);
            const {actualSuggestions, selectedIndex} = wrapper.state();

            expect(getNextSelectedIndex).not.toHaveBeenCalled();

            getNextSelectedIndex.mockImplementation(() => nextSelectedIndex);
            wrapper.instance().handleKeyDown(arrowDownEvt);

            expect(getNextSelectedIndex).toHaveBeenCalledTimes(1);
            expect(getNextSelectedIndex).toHaveBeenCalledWith(actualSuggestions, selectedIndex);
            expect(wrapper.state().selectedIndex).toBe(nextSelectedIndex);
        });
    });

    describe('snapshots', () => {
        it('should match snapshot from shallow rendering', () => {
            const wrapper = shallow(<PathEditor {...props} />);

            expect(toJson(wrapper)).toMatchSnapshot();
        });

        it('should match snapshot from mount rendering without suggestions', () => {
            const wrapper = mount(<PathEditor {...props} />);

            expect(toJson(wrapper)).toMatchSnapshot();

            wrapper.unmount();
        });

        // FIXME: it is don't work.. why?
        // it('should match snapshot from mount rendering with suggestions', () => {
        //     const wrapper = mount(<PathEditor {...props} suggestions={suggestions}/>);
        //     const actualSuggestions = [{type: 'map_node', path: '//path/to/folder/'}];
        //
        //     wrapper.setState({ actualSuggestions })
        //     expect(toJson(wrapper)).toMatchSnapshot();
        //     console.log(wrapper.debug());
        //
        //     wrapper.unmount();
        // });
    });
});
