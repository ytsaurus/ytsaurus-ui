import React from 'react';
import cn from 'bem-cn-lite';

import './BarChart.scss';

const block = cn('multimeter');

interface Props {
    values: number[];
    size?: number;
}

const BarChart: React.VFC<Props> = ({values, size = 20}) => {
    let min = Math.min(0, ...values);
    let max = Math.max(0, ...values);

    if (min === max) {
        min = 0;
        max = 1;
    }

    const width = Math.floor((size * 3) / (4 * values.length - 1));

    return (
        <div className={block('barchart')} style={{width: size, height: size}}>
            {values.map((v, i) => {
                const marginRight = Math.floor(
                    i === values.length - 1 ? 0 : size / (4 * values.length - 1),
                );
                const style = {
                    height: `${Math.abs(v * 100) / (max - min)}%`,
                    width: `${width}px`,
                    marginBottom: `${(100 * (Math.min(0, v) - min)) / (max - min)}%`,
                    marginRight: `max(1px,${marginRight}px)`,
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
