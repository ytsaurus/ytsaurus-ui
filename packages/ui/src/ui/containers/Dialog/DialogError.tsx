import React from 'react';
import cn from 'bem-cn-lite';

import {type FORM_ERROR as FormErrorType} from './index';

import {type FIX_MY_TYPE, type YTError} from '../../types';
import {YTErrorBlock} from '../../containers/Block/Block';

import compact_ from 'lodash/compact';
import map_ from 'lodash/map';

const block = cn('yt-dialog-error');

export function DialogError(props: FIX_MY_TYPE) {
    return <YTErrorBlock {...props} className={block()} />;
}

export function makeErrorFields(errors: Array<YTError | Error | undefined>) {
    return makeMessageFields(errors, 'error');
}

export function makeWarningFields(warnings: Array<YTError | undefined>) {
    return makeMessageFields(warnings, 'alert');
}

function makeMessageFields(errors: Array<YTError | Error | undefined>, type: 'error' | 'alert') {
    return compact_(
        map_(errors, (error, index) => {
            return error
                ? {
                      name: `${type}_${index}`,
                      type: 'block' as const,
                      extras: {
                          children: <DialogError error={error} type={type} />,
                      },
                  }
                : undefined;
        }),
    );
}

const FORM_ERROR: typeof FormErrorType = 'FINAL_FORM/form-error';

export function makeFormSubmitError(error: YTError) {
    return {
        validationErrors: {
            [FORM_ERROR]: <DialogError error={error} />,
        },
    };
}
