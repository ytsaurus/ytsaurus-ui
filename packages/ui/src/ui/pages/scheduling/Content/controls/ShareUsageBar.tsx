import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../../../common/hammer/format';
import {calcProgressProps} from '../../../../utils/utils';
import {Progress, ProgressProps} from '@gravity-ui/uikit';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

import './ShareUsageBar.scss';

const block = cn('share-usage-bar');

interface Props {
    className?: string;
    shareValue?: number;
    shareTitle?: string;
    usageValue?: number;
    usageTitle?: string;
    forceTheme?: ProgressProps['theme'];
    title?: React.ReactNode;
}

function ShareUsageBar(props: Props) {
    const {className, shareValue, usageValue, shareTitle, usageTitle, forceTheme, title} = props;

    const x = Number(usageValue) / Number(shareValue);

    if (isNaN(shareValue!) || isNaN(usageValue!) || isNaN(x)) {
        return (
            <Tooltip
                content={
                    <React.Fragment>
                        <div>
                            {shareTitle}: {shareValue}
                        </div>
                        <div>
                            {usageTitle}: {usageValue}
                        </div>
                    </React.Fragment>
                }
            >
                {format.NO_VALUE}
            </Tooltip>
        );
    }

    const {value, theme} = calcProgressProps(usageValue, Number(shareValue) * 2);

    return (
        <Tooltip
            className={block(null, className)}
            content={
                <React.Fragment>
                    {title}
                    <div>
                        {usageTitle} / {shareTitle} = {format.Number(x, {digits: 3})}
                    </div>
                </React.Fragment>
            }
        >
            <Progress
                className={block('progress')}
                size={'s'}
                value={Number(value)}
                theme={forceTheme || theme}
            />
            <div className={block('tick')} />
        </Tooltip>
    );
}

export default React.memo(ShareUsageBar);
