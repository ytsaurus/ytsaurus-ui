import React, {FC, useState} from 'react';
import QueryEditor from '../QueryEditor/QueryEditor';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import {FileEditor} from '../FileEditor';

const EDITOR_INITIAL_SIZE = [50, 50];

type Props = {
    fileEditorFullWidth: boolean;
    fileEditorVisible: boolean;
    onStartQuery: (queryId: string) => void;
};

export const QueryEditorSplit: FC<Props> = ({
    fileEditorFullWidth,
    fileEditorVisible,
    onStartQuery,
}) => {
    const [sizes, setSize] = useState(EDITOR_INITIAL_SIZE);
    const hideQueryEditor = !(fileEditorVisible && fileEditorFullWidth);

    return (
        <FlexSplitPane
            direction={FlexSplitPane.HORIZONTAL}
            onResizeEnd={setSize}
            getInitialSizes={sizes}
        >
            {hideQueryEditor && <QueryEditor onStartQuery={onStartQuery} showStatusInTitle />}
            {fileEditorVisible && <FileEditor />}
        </FlexSplitPane>
    );
};
