import React, {type FC} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectIsQueryNavigationLoading,
    selectNodeListByFilter,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {NodeListRow} from './NodeListRow';
import {
    loadNodeByPath,
    loadTableAttributesByPath,
} from '../../../../store/actions/query-tracker/queryNavigation';
import './NodeList.scss';
import cn from 'bem-cn-lite';
import {isFolderNode} from '../../../../utils/navigation/isFolderNode';
import {isTableNode} from '../../../../utils/navigation/isTableNode';
import {selectQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {useNavigationNodeActions} from '../useNavigationNodeActions';
import {ItemsList} from '../ItemsList';

const b = cn('navigation-node-list');

export const NodeList: FC = () => {
    const dispatch = useDispatch();
    const nodes = useSelector(selectNodeListByFilter);
    const engine = useSelector(selectQueryEngine);
    const loading = useSelector(selectIsQueryNavigationLoading);

    const handleNodeClick = (path: string, type: string | undefined) => {
        if (isFolderNode(type)) {
            dispatch(loadNodeByPath(path));
            return;
        }
        if (isTableNode(type)) {
            dispatch(loadTableAttributesByPath(path));
            return;
        }
    };

    const {handleFavoriteToggle, handleClipboardCopy, handleNewWindowOpen} =
        useNavigationNodeActions();

    return (
        <div className={b()}>
            <ItemsList
                loading={loading}
                data={nodes}
                render={(node) => {
                    return (
                        <NodeListRow
                            key={node.path}
                            node={node}
                            engine={engine}
                            onClick={handleNodeClick}
                            onFavoriteToggle={handleFavoriteToggle}
                            onClipboardCopy={handleClipboardCopy}
                            onNewWindowOpen={handleNewWindowOpen}
                        />
                    );
                }}
            />
        </div>
    );
};

export default NodeList;
