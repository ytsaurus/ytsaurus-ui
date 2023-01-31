import React, {Component} from 'react';
import cn from 'bem-cn-lite';

import NumberInput, {
    NumberInputProps,
    NumberInputWithError,
    NumberInputWithErrorProps,
} from '../../NumberInput/NumberInput';

import './BytesControl.scss';
const block = cn('ic-bytes-control');

/**
 * @deprecated Use NumberControl instead of it
 */
export default class BytesControl extends Component<Omit<NumberInputProps, 'format'>> {
    static hasErrorRenderer = true;

    static getDefaultValue() {
        return undefined;
    }

    static isEmpty(value: number | undefined) {
        return value === undefined || value === ('' as any);
    }

    render() {
        const {value} = this.props;
        return (
            <NumberInput
                className={block()}
                {...this.props}
                value={value === ('' as any) ? undefined : value}
                format={'Bytes'}
            />
        );
    }
}

export class NumberControl extends Component<Omit<NumberInputWithErrorProps, 'format'>> {
    static hasErrorRenderer = true;

    static getDefaultValue() {
        return {value: undefined};
    }

    static isEmpty(value: NumberInputWithErrorProps['value']) {
        return value === undefined || value === ('' as any);
    }

    static validate({error}: NumberInputWithErrorProps['value']) {
        return error ? error : undefined;
    }

    render() {
        const {value} = this.props;
        return (
            <NumberInputWithError
                className={block()}
                {...this.props}
                value={value.value === ('' as any) ? {...value, value: undefined} : value}
                format={'Number'}
            />
        );
    }
}
