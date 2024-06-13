import React, {FC, ReactNode} from 'react';
import Block from '../../components/Block/Block';

import './Error.scss';
import {YTError} from '../../../@types/types';
import {AxiosError} from 'axios';

type Props = {
    error?: YTError | AxiosError<unknown, any> | string;
    message?: ReactNode;
    helpURL?: string;
    className?: string;
    settings?: Record<string, any>;
    topMargin?: 'none' | 'half';
    bottomMargin?: boolean;
    header?: ReactNode;
    maxCollapsedDepth?: number;
    disableLogger?: boolean;
};

const Error: FC<Props> = ({error, ...props}) => {
    return <Block {...props} error={error} type="error" />;
};

export default Error;
