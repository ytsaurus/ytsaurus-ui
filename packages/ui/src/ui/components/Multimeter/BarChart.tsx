import React from 'react';
import cn from 'bem-cn-lite';

import './BarChart.scss';

const block = cn('multimeter');

interface Props {
    values: number[];
}

const BarChart: React.VFC<Props> = ({values}) => {
    let min = Math.min(0, ...values);
    let max = Math.max(0, ...values);

    if (min === max) {
        min = 0;
        max = 1;
    }

    return (
        <div className={block('barchart')}>
            {values.map((v, i) => {
                const style = {
                    height: `${Math.abs(v * 100) / (max - min)}%`,
                    width: `${(100 * 3) / (4 * values.length - 1)}%`,
                    marginBottom: `${(100 * (Math.min(0, v) - min)) / (max - min)}%`,
                    marginRight:
                        i === values.length - 1 ? 0 : `${(100 * 1) / (4 * values.length - 1)}%`,
                } as any;
                if (!v) {
                    style.height = '100%';
                    // if there is no bar, make full height, but transparent bar so that it height is the same as full
                    // bar's one
                    style.backgroundColor = 'inherit';
                }
                return <div key={i} className={block('barchart-bar')} style={style} />;
            })}
        </div>
    );
};

export default BarChart;
