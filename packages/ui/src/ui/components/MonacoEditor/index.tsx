import React from 'react';

import withLazyLoading from '../../hocs/withLazyLoading';
import Loader from '../../components/Loader/Loader';
export type {MonacoEditorConfig} from './MonacoEditor';

const MonacoEditor = React.lazy(
    () => import(/* webpackChunkName: "yt-monaco-editor" */ './MonacoEditor'),
);

export default withLazyLoading(MonacoEditor, <Loader visible />);
