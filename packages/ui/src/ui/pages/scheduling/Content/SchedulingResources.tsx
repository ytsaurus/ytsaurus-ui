import React from 'react';
import {useSelector} from '../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import map_ from 'lodash/map';
import isEmpty_ from 'lodash/isEmpty';

import hammer from '../../../common/hammer';
import {
    selectResources,
    selectSchedulingIsRoot,
} from '../../../store/selectors/scheduling/scheduling';
import {Progress} from '@gravity-ui/uikit';

import './SchedulingResources.scss';

const block = cn('scheduling-resources');
const headingBlock = cn('elements-heading');

function SchedulingResources() {
    const isRoot = useSelector(selectSchedulingIsRoot);
    const resources = useSelector(selectResources) as any;

    return !isRoot || isEmpty_(resources) ? null : (
        <div className={block()}>
            {map_(resources, (resource) => (
                <div className={block('resources-item')} key={resource.type}>
                    <div className={headingBlock({size: 's'})}>
                        {hammer.format['ReadableField'](resource.type)}
                    </div>
                    <Progress {...resource.progress} />
                </div>
            ))}
        </div>
    );
}

export default React.memo(SchedulingResources);
