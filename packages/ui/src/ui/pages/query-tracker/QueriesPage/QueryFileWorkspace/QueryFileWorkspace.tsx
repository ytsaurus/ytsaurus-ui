import React, {useState} from 'react';
import cn from 'bem-cn-lite';
import {useSelector} from '../../../../store/redux-hooks';
import {selectFileEditor} from '../../../../store/selectors/query-tracker/queryFilesForm';
import {FileEditor} from '../../FileEditor';
import FlexSplitPane from '../../../../components/FlexSplitPane/FlexSplitPane';

const block = cn('yt-queries-page');
export function QueryFileWorkspace({children}: {children: React.ReactNode}) {
    const file = useSelector(selectFileEditor);
    const [sizes, setSizes] = useState([50, 50]);
    return (
        <FlexSplitPane
            direction={FlexSplitPane.HORIZONTAL}
            className={block('workspace', {
                file: file.isOpen,
                expanded: file.isOpen && file.isFullWidth,
            })}
            getInitialSizes={() => sizes}
            onResizeEnd={setSizes}
            paneClassNames={[block('query-region'), block('file-region')]}
        >
            <div className={block('query-content')}>{children}</div>
            {file.isOpen && <FileEditor useQueriesKit />}
        </FlexSplitPane>
    );
}
