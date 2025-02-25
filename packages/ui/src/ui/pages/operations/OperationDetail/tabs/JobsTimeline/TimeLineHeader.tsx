import React, {FC} from 'react';
import {Button, Flex, Icon, TextInput} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import './TimeLineHeader.scss';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectFilter,
    selectInterval,
} from '../../../../../store/selectors/operations/jobs-timeline';
import {
    setFilter,
    setInterval,
} from '../../../../../store/reducers/operations/jobs/jobs-timeline-slice';
import {dateTimeParse} from '@gravity-ui/date-utils';
import {RangeDateSelection} from '@gravity-ui/date-components';
import {DateTime} from '@gravity-ui/date-utils/build/typings/dateTime';
import ChevronsExpandToLinesIcon from '@gravity-ui/icons/svgs/chevrons-expand-to-lines.svg';
import {resetInterval} from '../../../../../store/actions/operations/jobs-timeline';

const block = cn('yt-timeline-header');

type Props = {
    className?: string;
};

export const TimeLineHeader: FC<Props> = ({className}) => {
    const dispatch = useDispatch();
    const filter = useSelector(selectFilter);
    const interval = useSelector(selectInterval);

    const handleFilterChange = (val: string) => {
        dispatch(setFilter(val));
    };

    const handleOnUpdate = ({start, end}: {start: DateTime; end: DateTime}) => {
        dispatch(setInterval({from: start.valueOf(), to: end.valueOf()}));
    };

    const handleResetInterval = () => {
        dispatch(resetInterval());
    };

    if (!interval) return null;

    return (
        <div className={block(null, className)}>
            <TextInput
                defaultValue={filter}
                placeholder="Search by job ID"
                onUpdate={handleFilterChange}
                hasClear
            />
            <Flex>
                <Button
                    view="outlined"
                    pin="brick-brick"
                    onClick={handleResetInterval}
                    title="Reset interval"
                >
                    <Icon data={ChevronsExpandToLinesIcon} size={16} />
                </Button>
                <RangeDateSelection
                    className={block('range-selector')}
                    value={{
                        start: dateTimeParse(interval.from)!,
                        end: dateTimeParse(interval.to)!,
                    }}
                    displayNow
                    hasScaleButtons
                    onUpdate={handleOnUpdate}
                />
            </Flex>
        </div>
    );
};
