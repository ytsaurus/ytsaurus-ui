import React from 'react';
import {Icon} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {StrictReactNode} from '../YQLTable/utils';
import infoIcon from '../../../../assets/img/svg/icons/exclamation-circle.svg';

import './DataTypePopup.scss';
import DataType from '../../../../components/SchemaDataType/DataType/DataType';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';
import type {DataType as DataTypeProps} from '../../../../components/SchemaDataType/dataTypes';

const block = cn('data-type-popup');

type Props = {
    className?: string;
    children: StrictReactNode;
    type?: DataTypeProps;
    hideIcon?: boolean;
};
export default function DataTypePopup({children, type, hideIcon, className}: Props) {
    if (!type) {
        return <span className={block(null, className)}>{children}</span>;
    }
    return (
        <Tooltip
            className={block(null, className)}
            content={
                type ? (
                    <div className={block('tooltip-container')}>
                        <DataType {...type} />
                    </div>
                ) : null
            }
        >
            <span className={block('container')}>
                {children}
                {!hideIcon && <Icon className={block('icon')} data={infoIcon} size={12} />}
            </span>
        </Tooltip>
    );
}
