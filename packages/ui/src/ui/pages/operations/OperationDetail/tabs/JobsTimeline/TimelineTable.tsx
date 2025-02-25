import React, {FC} from 'react';
import {RawJobEvent} from '../../../../../types/operations/job';

type Props = {
    events: Record<string, RawJobEvent[]>;
};

export const TimelineTable: FC<Props> = ({events}) => {
    return (
        <div>
            {Object.keys(events).map((key) => (
                <div key={key}>{key}</div>
            ))}
        </div>
    );
};
