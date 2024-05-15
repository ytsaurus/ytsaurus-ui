import React, {useEffect, useRef, useState} from 'react';
import cn from 'bem-cn-lite';

import MetaTable from '../../../components/MetaTable/MetaTable';
// @ts-ignore
import format from '../../../common/hammer/format';
import {getStateForHost, loadMasters} from '../../../store/actions/system/masters';
import {useDispatch} from 'react-redux';
import moment from 'moment';
import './SwitchLeaderShortInfo.scss';

const block = cn('switch-leader-short-info');

interface Props {
    newLeaderAddress: string;
}

export function SwitchLeaderShortInfo(props: Props) {
    const startTime = useRef(moment.now());
    const [currentTime, setCurrentTime] = useState<any>(moment());
    const [finishTime, setFinishTime] = useState<any>();
    const dispatch = useDispatch();

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCurrentTime(moment());

            if (finishTime) {
                clearInterval(intervalId);
            }
        }, 1 * 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, []);

    useEffect(() => {
        let stillMounted = true;

        const waitForState = async () => {
            try {
                const hostState = await getStateForHost(props.newLeaderAddress);

                if (hostState === 'leading') {
                    setFinishTime(moment());
                    dispatch(loadMasters());
                }
            } catch {
                if (stillMounted) {
                    waitForState();
                }
            }
        };

        waitForState();

        return () => {
            stillMounted = false;
        };
    }, [props.newLeaderAddress]);

    return (
        <div className={block()}>
            <MetaTable
                items={[
                    {
                        key: 'Duration',
                        value: format.TimeDuration(
                            (finishTime || currentTime).diff(startTime.current),
                        ),
                    },
                    {
                        key: 'Status',
                        value: (
                            <SwitchLeaderShortInfoStatus
                                state={finishTime ? 'complete' : 'in progress'}
                            />
                        ),
                    },
                ]}
            />
        </div>
    );
}

function SwitchLeaderShortInfoStatus({state}: {state: string}) {
    return <span className={block('state', {state})}>{state}</span>;
}
