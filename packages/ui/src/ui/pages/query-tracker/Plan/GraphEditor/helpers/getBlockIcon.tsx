import React from 'react';
import {OperationType} from '../enums';
import MoleculeIcon from '@gravity-ui/icons/svgs/molecule.svg';
import EraserIcon from '@gravity-ui/icons/svgs/eraser.svg';
import CodeMergeIcon from '@gravity-ui/icons/svgs/code-merge.svg';
import ShuffleIcon from '@gravity-ui/icons/svgs/shuffle.svg';
import LayoutHeaderCellsLargeIcon from '@gravity-ui/icons/svgs/layout-header-cells-large.svg';
import CodeCommitIcon from '@gravity-ui/icons/svgs/code-commit.svg';
import ListTimelineIcon from '@gravity-ui/icons/svgs/list-timeline.svg';
import MapIcon from '../../../../../assets/img/svg/icons/map.svg';
import MapReduceIcon from '../../../../../assets/img/svg/icons/mapReduce.svg';
import ReduceIcon from '../../../../../assets/img/svg/icons/reduce.svg';

export const getBlockIcon = (type: OperationType) => {
    switch (type) {
        case OperationType.Map:
            return <MapIcon />;
        case OperationType.MapReduce:
            return <MapReduceIcon />;
        case OperationType.Reduce:
            return <ReduceIcon />;
        case OperationType.Merge:
            return <CodeMergeIcon />;
        case OperationType.Sort:
            return <ShuffleIcon />;
        case OperationType.Erase:
            return <EraserIcon />;
        case OperationType.Table:
            return <LayoutHeaderCellsLargeIcon />;
        case OperationType.Read:
            return <ListTimelineIcon />;
        case OperationType.Commit:
            return <CodeCommitIcon />;
        default:
            return <MoleculeIcon />;
    }
};
