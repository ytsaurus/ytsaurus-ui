import React from 'react';
import cn from 'bem-cn-lite';

import {Button, Icon} from '@gravity-ui/uikit';

import {BundleParam, BundleParamsList} from '../BundleParamsList/BundleParamsList';
import resetIcon from '../../../../../../assets/img/svg/reset-icon.svg';

import {DialogControlProps} from '../../../../../../components/Dialog/Dialog.types';

import './BundleTitle.scss';

const block = cn('bundle-title');

type BundleTitleProps = DialogControlProps<
    boolean,
    {
        params: BundleParam[];
        className?: string;
        onReset: () => void;
    }
>;

export function BundleTitle({className, params, onReset}: BundleTitleProps) {
    return (
        <div className={block(null, className)}>
            <BundleParamsList
                className={block('params')}
                params={params}
                size="m"
            ></BundleParamsList>
            <Button className={block('btn')} onClick={onReset}>
                <Icon className={block('icon')} data={resetIcon} />
                Reset to default
            </Button>
        </div>
    );
}

BundleTitle.isEmpty = (value: string) => {
    return !value;
};

BundleTitle.getDefaultValue = () => {
    return '';
};
