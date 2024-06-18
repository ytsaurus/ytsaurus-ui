import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import cn from 'bem-cn-lite';

import Filter from '../Filter/Filter';
import HelpLink from '../HelpLink/HelpLink';

import {isDocsAllowed} from '../../config';
import UIFactory from '../../UIFactory';
import {ExpandButton} from '../ExpandButton';
import {TreeState} from './types';

const toolbarBlock = cn('elements-toolbar');

const block = cn('job-statistics');

export default function Toolbar(props: {
    treeState: TreeState;
    onFilterChange: (value: string) => void;
    onTreeStateChange: (state: TreeState) => void;
}) {
    const collapseTable = React.useCallback(
        () => props.onTreeStateChange('collapsed'),
        [props.onTreeStateChange],
    );
    const expandTable = React.useCallback(
        () => props.onTreeStateChange('expanded'),
        [props.onTreeStateChange],
    );

    const dispatch = useDispatch();

    const handleFilterChange = useCallback(
        (val: string) => dispatch(props.onFilterChange(val)),
        [dispatch],
    );

    const isExpanded = props.treeState === 'expanded' || props.treeState === 'mixed';

    return (
        <div className={toolbarBlock(null, block('toolbar'))}>
            <div className={toolbarBlock('container')}>
                <div className={toolbarBlock('component', block('filter'))}>
                    <Filter size="m" debounce={500} value={''} onChange={handleFilterChange} />
                </div>
                <div className={toolbarBlock('component', block('expand-collapse'))}>
                    <span className={block('expand-metrics')}>
                        <ExpandButton
                            expanded={isExpanded}
                            toggleExpanded={isExpanded ? collapseTable : expandTable}
                        />
                    </span>
                </div>
                {isDocsAllowed() && (
                    <div className={toolbarBlock('component', block('help'))}>
                        <HelpLink url={UIFactory.docsUrls['problems:jobstatistics']} />
                    </div>
                )}
            </div>
        </div>
    );
}
