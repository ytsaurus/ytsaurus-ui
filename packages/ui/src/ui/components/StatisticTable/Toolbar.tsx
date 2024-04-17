import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import cn from 'bem-cn-lite';

import Filter from '../Filter/Filter';
import Button from '../Button/Button';
import YTIcon from '../Icon/Icon';
import HelpLink from '../HelpLink/HelpLink';

import {isDocsAllowed} from '../../config';
import UIFactory from '../../UIFactory';

const toolbarBlock = cn('elements-toolbar');

const block = cn('job-statistics');

export default function Toolbar(props: {
    onFilterChange: (value: string) => void;
    onTreeStateChange: (state: 'expanded' | 'mixed' | 'collapsed') => void;
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

    return (
        <div className={toolbarBlock(null, block('toolbar'))}>
            <div className={toolbarBlock('container')}>
                <div className={toolbarBlock('component', block('filter'))}>
                    <Filter size="m" debounce={500} value={''} onChange={handleFilterChange} />
                </div>
                <div className={toolbarBlock('component', block('expand-collapse'))}>
                    <span className={block('expand-metrics')}>
                        <Button size="m" title="Expand All" onClick={expandTable}>
                            <YTIcon awesome="arrow-to-bottom" />
                        </Button>
                    </span>

                    <span className={block('collapse-metrics')}>
                        <Button size="m" title="Collapse All" onClick={collapseTable}>
                            <YTIcon awesome="arrow-to-top" />
                        </Button>
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
