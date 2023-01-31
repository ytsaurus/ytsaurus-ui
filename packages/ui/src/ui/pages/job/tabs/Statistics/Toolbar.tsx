import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';

import Filter from '../../../../components/Filter/Filter';
import Button from '../../../../components/Button/Button';
import YTIcon from '../../../../components/Icon/Icon';
import HelpLink from '../../../../components/HelpLink/HelpLink';

import {RootState} from '../../../../store/reducers';
import {changeFilter, collapseTable, expandTable} from '../../../../store/actions/job/statistics';
import {isDocsAllowed} from '../../../../config';
import UIFactory from '../../../../UIFactory';

const toolbarBlock = cn('elements-toolbar');
const Icon: any = YTIcon;

const block = cn('job-statistics');

export default function Toolbar() {
    interface StoreParams {
        filter: string;
    }

    const dispatch = useDispatch();
    const {filter}: StoreParams = useSelector((state: RootState) => state.job.statistics);

    const handleExpand = useCallback(() => dispatch(expandTable()), [dispatch]);
    const handleCollapse = useCallback(() => dispatch(collapseTable()), [dispatch]);
    const handleFilterChange = useCallback(
        (val: string) => dispatch(changeFilter(val)),
        [dispatch],
    );

    return (
        <div className={toolbarBlock(null, block('toolbar'))}>
            <div className={toolbarBlock('container')}>
                <div className={toolbarBlock('component', block('filter'))}>
                    <Filter size="m" debounce={500} value={filter} onChange={handleFilterChange} />
                </div>

                <div className={toolbarBlock('component', block('expand-collapse'))}>
                    <span className={block('expand-metrics')}>
                        <Button size="m" title="Expand All" onClick={handleExpand}>
                            <Icon awesome="arrow-to-bottom" />
                        </Button>
                    </span>

                    <span className={block('collapse-metrics')}>
                        <Button size="m" title="Collapse All" onClick={handleCollapse}>
                            <Icon awesome="arrow-to-top" />
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
