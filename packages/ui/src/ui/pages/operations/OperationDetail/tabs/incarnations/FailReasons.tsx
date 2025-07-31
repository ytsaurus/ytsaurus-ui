import React from 'react';
import {Button, Disclosure, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import {ChevronDown, ChevronUp} from '@gravity-ui/icons';

import {
    FailReason,
    PyDLOperationInfo,
} from '../../../../_yandex-team/store/api/operations/pydl-telemetry';

import {Markdown} from '../../../../../ytsaurus-ui.ui/components/Markdown/Markdown';
import Yson from '../../../../../ytsaurus-ui.ui/components/Yson/Yson';

import {detailsCn, failReasonsCn} from './constants';
import {YTErrorBlock} from '../../../../../ytsaurus-ui.ui/components/Error/Error';

export function FailReasons({operation}: {operation: PyDLOperationInfo}) {
    return (
        <Flex direction={'column'} gap={2} className={failReasonsCn}>
            <Text variant={'body-3'}>Fail reasons</Text>
            {operation?.fail_reasons && operation.fail_reasons.length > 0 ? (
                <Flex direction={'column'} gap={3}>
                    {operation.fail_reasons.map((failReason: FailReason) => (
                        <FailReasonCard key={failReason.reason} failReason={failReason} />
                    ))}
                </Flex>
            ) : (
                <Text variant={'inherit'}>No fails detected</Text>
            )}
        </Flex>
    );
}

function FailReasonCard({failReason}: {failReason: FailReason}) {
    const {reason, title, description, startrack_id, data, recommendation} = failReason;

    return (
        <Flex direction={'column'}>
            <YTErrorBlock
                header={title}
                message={
                    <Flex direction={'column'} gap={2}>
                        <div>
                            <Text variant={'body-2'}>Code: </Text> {reason}
                        </div>
                        <div>
                            <Text variant={'body-2'}>Description: </Text> {description}
                        </div>
                        {recommendation && (
                            <div>
                                <Text variant={'body-2'}>Recommendation: </Text> {recommendation}
                            </div>
                        )}
                        {startrack_id ? (
                            <Markdown text={startrack_id} />
                        ) : (
                            <Link
                                href={`https://st.yandex-team.ru/createTicket?queue=YIML`}
                                target="_blank"
                            >
                                Create YIML ticket
                            </Link>
                        )}
                        {data && (
                            <Disclosure defaultExpanded={false}>
                                <Disclosure.Summary>
                                    {(props) => (
                                        <Button {...props}>
                                            <Icon data={props.expanded ? ChevronUp : ChevronDown} />
                                            {props.expanded ? 'Hide details' : 'Show details'}
                                        </Button>
                                    )}
                                </Disclosure.Summary>
                                <Yson
                                    className={detailsCn}
                                    settings={{format: 'json'}}
                                    value={data}
                                />
                            </Disclosure>
                        )}
                    </Flex>
                }
            />
        </Flex>
    );
}
