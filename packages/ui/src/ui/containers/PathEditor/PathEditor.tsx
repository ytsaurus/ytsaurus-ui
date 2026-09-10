import {connect} from 'react-redux';
import {
    loadSuggestionsList,
    removeActiveRequests,
} from '../../store/actions/navigation/path-editor/path-editor';
import {type RootState} from '../../store/reducers';

import './PathEditor.scss';

import {PathEditorBase} from './PathEditorBase';

const mapStateToProps = ({navigation}: RootState) => ({
    suggestions: navigation.pathEditor.suggestions,
    suggestionsError: navigation.pathEditor.suggestionsError,
    errorMessage: navigation.pathEditor.errorMessage,
});

const PathEditor = connect(mapStateToProps, {
    loadSuggestionsList,
    removeActiveRequests,
})(PathEditorBase);

export default PathEditor;

export {
    type EventPayload,
    type LoadSuggestionsParams,
    type PathEditorProps,
    PathEditorBase as PathEditor,
} from './PathEditorBase';
