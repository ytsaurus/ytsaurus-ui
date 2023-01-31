import React from 'react';
import cn from 'bem-cn-lite';

import {Button, Icon} from '@gravity-ui/uikit';

import {BundleParamsList, BundleParam} from '../BundleParamsList/BundleParamsList';
import resetIcon from '../../../../../../../../img/svg/reset-icon.svg';

import {DialogControlProps} from '../../../../../../components/Dialog/Dialog.types';

import './BundleTitle.scss';

const block = cn('bundle-title');

type BundleTitleProps = DialogControlProps<
    boolean,
    {
        title: string;
        params: BundleParam[];
        className?: string;
        onReset: () => void;
    }
>;

export function BundleTitle({className, title, params, onReset}: BundleTitleProps) {
    return (
        <div className={block(null, className)}>
            <span className={block('title')}>{title}</span>
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
