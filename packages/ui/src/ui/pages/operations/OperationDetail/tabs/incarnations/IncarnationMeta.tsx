import React from 'react';
import {useSelector} from 'react-redux';
import {Flex} from '@gravity-ui/uikit';

import {Page} from '../../../../../../shared/constants/settings';

import {getCluster} from '../../../../../store/selectors/global';
import {getOperation} from '../../../../../store/selectors/operations/operation';
import type {Incarnation} from '../../../../../store/selectors/operations/incarnations';

import MetaTable from '../../../../../components/MetaTable/MetaTable';
import YTLink from '../../../../../components/Link/Link';

type Props = {
    incarnation: Incarnation;
};

export function IncarnationMeta(props: Props) {
    const {incarnation} = props;

    const cluster = useSelector(getCluster);
    const operation = useSelector(getOperation);

    return (
        <Flex gap={1} direction={'column'}>
            <MetaTable
                items={[
                    // ...incarnation.switch_info,
                    {
                        key: 'trigger_job_id',
                        value: (
                            <YTLink
                                routed
                                url={`/${cluster}/${Page.JOB}/${operation.id}/${incarnation.trigger_job_id}`}
                            >
                                {operation.id}
                            </YTLink>
                        ),
                        label: 'Trigger job id',
                    },
                    // {
                    //     key: 'user_stdout',
                    //     label: 'User stdout',
                    //     value: (
                    //         <div>
                    //             <Link
                    //                 href={operation.nirvana_logs_link?.stdout_full || ''}
                    //                 target="_blank"
                    //             >
                    //                 user_stdout.log
                    //             </Link>
                    //             {' : '}
                    //             <Link
                    //                 href={operation.nirvana_logs_link?.stdout_tail || ''}
                    //                 target="_blank"
                    //             >
                    //                 tail
                    //             </Link>
                    //         </div>
                    //     ),
                    //     visible: Boolean(operation?.nirvana_logs_link?.stdout_full),
                    // },
                    // {
                    //     key: 'user_stderr',
                    //     label: 'User stderr',
                    //     value: (
                    //         <div>
                    //             <Link
                    //                 href={operation.nirvana_logs_link?.stderr_full || ''}
                    //                 target="_blank"
                    //             >
                    //                 user_stderr.log
                    //             </Link>
                    //             {' : '}
                    //             <Link
                    //                 href={operation.nirvana_logs_link?.stderr_tail || ''}
                    //                 target="_blank"
                    //             >
                    //                 tail
                    //             </Link>
                    //         </div>
                    //     ),
                    //     visible: Boolean(operation?.nirvana_logs_link?.stdout_full),
                    // },
                ]}
            />
            <YTLink
                routed
                url={`/${cluster}/${Page.OPERATIONS}/${operation.id}/jobs?state=all&incarnation=${incarnation.id}`}
            >
                Show jobs
            </YTLink>
        </Flex>
    );
}
