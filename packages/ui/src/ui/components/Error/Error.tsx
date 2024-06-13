import React, {FC, ReactNode, useMemo} from 'react';
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

const makeNodeKey = (error: YTError) => {
    let levelKey = error.code + error.message;
    if (error.inner_errors) {
        levelKey += error.inner_errors.reduce((acc, err) => {
            acc += makeNodeKey(err);
            return acc;
        }, '');
    }
    return levelKey;
};

const Error: FC<Props> = ({error, ...props}) => {
    const filteredErrors = useMemo(() => {
        if (
            !error ||
            typeof error === 'string' ||
            error instanceof AxiosError ||
            error instanceof Error
        )
            return error;

        const uniqueObjects = new Set();
        const result: YTError[] = [];
        const errors = error.inner_errors || [];

        errors.forEach((innerError) => {
            const key = makeNodeKey(innerError);
            if (!uniqueObjects.has(key)) {
                uniqueObjects.add(key);
                result.push(innerError);
            }
        });

        return {...error, inner_errors: result};
    }, [error]);

    return <Block {...props} error={filteredErrors} type="error" />;
};

export default Error;
