import React, {FC} from 'react';
import cn from 'bem-cn-lite';

import './BundleParamsList.scss';

const block = cn('bundle-params-list');

export interface BundleParam {
    title: string;
    value: string | number;
    type?: 'positive' | 'negative';
    postfix?: string;
}

interface BundleParamsListProps {
    className?: string;
    params: BundleParam[];
    size?: 's' | 'm';
}

export const BundleParamsList: FC<BundleParamsListProps> = ({className, params, size = 's'}) => {
    return (
        <div className={block({size}, className)}>
            {params.map((param) => (
                <span key={param.title}>
                    {param.title}{' '}
                    <span className={block('value', {type: param.type})}>
                        {param.value} {param.postfix}
                    </span>
                </span>
            ))}
        </div>
    );
};
