import {Flex, Progress, ProgressTheme, ProgressValue, Text} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import React from 'react';
import Link from '../../../components/Link/Link';
import './StatsInfo.scss';

const block = cn('stats-info');

interface Stack {
    value: ProgressValue;
    color?: string;
    title?: string;
    theme?: ProgressTheme;
    loading?: boolean;
    className?: string;
    content?: React.ReactNode;
}

type Props = {
    stack?: Stack[];
    count: number;
    status: string;
    total: number;
    alertNumber?: number;
    decNumber?: number;
    theme: ProgressTheme;
    url?: string;
    alertsUrl?: string;
    decUrl?: string;
};

export const StatsInfo = ({
    stack,
    total,
    count,
    status,
    theme,
    alertNumber,
    decNumber,
    url,
    alertsUrl,
    decUrl,
}: Props) => {
    return (
        <div className={block()}>
            <Flex alignItems="center" gap={2}>
                {url && count !== 0 ? (
                    <Link theme="primary" className={block('link')} url={url}>
                        {count}
                    </Link>
                ) : (
                    <Text variant="body-2">{count}</Text>
                )}
                <Text className={block('subtext')} color="dark-secondary">
                    {status}
                </Text>
            </Flex>
            <Progress
                stack={stack ?? []}
                value={stack ? undefined : (count / total) * 100}
                theme={theme}
                size="xs"
            />
            <Flex direction="column" gap={1}>
                {alertNumber !== undefined && (
                    <div className={block('info')}>
                        <Text
                            color={alertNumber !== 0 ? 'warning' : 'hint'}
                            className={block('subtext')}
                            variant="body-1"
                        >
                            alert
                        </Text>{' '}
                        {decUrl && alertNumber !== 0 ? (
                            <Link theme="primary" className={block('link')} url={alertsUrl}>
                                {alertNumber}
                            </Link>
                        ) : (
                            <Text variant="body-1" color="hint">
                                {alertNumber}
                            </Text>
                        )}
                    </div>
                )}
                {decNumber !== undefined && (
                    <div className={block('info')}>
                        <Text
                            color={decNumber !== 0 ? 'primary' : 'hint'}
                            className={block('subtext')}
                            variant="body-1"
                        >
                            dec
                        </Text>{' '}
                        {decUrl && decNumber !== 0 ? (
                            <Link theme="primary" className={block('link')} url={decUrl}>
                                {decNumber}
                            </Link>
                        ) : (
                            <Text variant="body-1" color="hint">
                                {decNumber}
                            </Text>
                        )}
                    </div>
                )}
            </Flex>
        </div>
    );
};
