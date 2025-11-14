import React from 'react';
import cn from 'bem-cn-lite';

import {Progress} from '@gravity-ui/uikit';

import {addProgressStackSpacers} from '../../utils/progress';

import './ChargeLevel.scss';

const block = cn('yt-charge-level');

export function ChargeLevel({className, value = 0}: {value?: number; className?: string}) {
    const {stack, effectiveValue} = React.useMemo(() => {
        const v = Math.max(0, Math.min(100, value));

        const res: Array<{value: number; theme: 'misc'}> = [];
        for (let sum = v; sum > 0; sum -= 10) {
            res.push({value: sum >= 10 ? 10 : sum, theme: 'misc'});
        }

        return {stack: res, effectiveValue: v};
    }, [value]);

    return (
        <Progress
            className={block(null, className)}
            stack={addProgressStackSpacers(stack, {
                spaceSize: 490 / 242,
                startSpace: true,
                endSpace: true,
            })}
            text={`${effectiveValue}%`}
        />
    );
}
