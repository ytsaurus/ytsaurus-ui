import React, {FC} from 'react';
import {TextInput} from '@gravity-ui/uikit';
import {TimelinePicker} from '../../../../../components/common/Timeline';
import cn from 'bem-cn-lite';
import './TimeLineHeader.scss';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectFilter,
    selectInterval,
    selectShortcut,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {setFilter} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {setTimelineShortcut} from '../../../../../store/actions/operations/jobs-timeline';

type Shortcut = '1h' | '3h' | '6h' | '1d';
const shortcuts: {title: Shortcut; time: Shortcut}[] = [
    {
        title: '1h',
        time: '1h',
    },
    {
        title: '3h',
        time: '3h',
    },
    {
        title: '6h',
        time: '6h',
    },
    {
        title: '1d',
        time: '1d',
    },
];

const block = cn('yt-timeline-header');

export const TimeLineHeader: FC = () => {
    const dispatch = useDispatch();
    const shortcut = useSelector(selectShortcut);
    const filter = useSelector(selectFilter);
    const interval = useSelector(selectInterval);

    const handleFilterChange = (filter: string) => {
        dispatch(setFilter(filter));
    };

    const handleOnShortcut = (newShortcut: string) => {
        dispatch(setTimelineShortcut(newShortcut));
    };

    if (!interval) return null;

    return (
        <div className={block()}>
            <TextInput
                defaultValue={filter}
                placeholder="Search by job cookie name or ID"
                onUpdate={handleFilterChange}
            />
            <TimelinePicker
                {...interval}
                shortcut={shortcut}
                topShortcuts={shortcuts}
                onUpdate={() => {}}
                onShortcut={handleOnShortcut}
            />
        </div>
    );
};
