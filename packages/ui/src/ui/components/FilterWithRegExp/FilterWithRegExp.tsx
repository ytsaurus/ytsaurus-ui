import React from 'react';
import cn from 'bem-cn-lite';

import Button from '../Button/Button';

import TextInputWithDebounce, {
    TextInputWithDebounceProps,
} from '../TextInputWithDebounce/TextInputWithDebounce';

import './FilterWithRegExp.scss';
const block = cn('filter-with-regexp');

type Props = Omit<TextInputWithDebounceProps, 'onChange' | 'value'> & {
    className?: string;
    value: FilterWithRegExpValue;
    onChange: (value: Props['value']) => void;
    placeholderRegexp?: string;

    hideError?: boolean;
};

export interface FilterWithRegExpValue {
    filter: string;
    useRegexp?: boolean;
    regexpError?: string;
}

interface State {
    error?: Error;
    prevFilter?: string;
}

export class FilterWithRegExp extends React.PureComponent<Props, State> {
    static getDerivedStateFromProps(props: Props, state: State) {
        if (state.prevFilter === props.value.filter) {
            return null;
        }

        try {
            // @ts-ignore
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _re = new RegExp(props.value.filter);
            return {prevFilter: props.value.filter, error: undefined};
        } catch (error) {
            return {
                prevFilter: props.value.filter,
                error,
            };
        }
    }

    input: HTMLInputElement | null = null;
    state: State = {};

    onChange(filter: string, useRegexp?: boolean) {
        const {onChange} = this.props;
        let regexpError;
        if (useRegexp) {
            try {
                // eslint-disable-next-line no-new
                new RegExp(filter);
            } catch (e) {
                regexpError = (e as Error).message;
            }
        }
        onChange({filter, useRegexp, regexpError});
    }

    toggleRegexpMode = () => {
        const {
            value: {useRegexp, filter},
        } = this.props;
        this.onChange(filter, !useRegexp);
        this.input?.focus();
    };

    onFilterChange = (filter: string) => {
        const {
            value: {useRegexp},
        } = this.props;
        this.onChange(filter, useRegexp);
    };

    render() {
        const {
            className,
            size,
            placeholder = 'Enter filter...',
            placeholderRegexp = 'Enter regexp...',
            value,
            pin,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            onChange,
            ...rest
        } = this.props;
        const {useRegexp, filter} = value;
        const {error} = this.state;

        return (
            <div className={block(null, className)}>
                <div className={block('controls')}>
                    <TextInputWithDebounce
                        {...rest}
                        controlRef={(input) => {
                            this.input = input as HTMLInputElement;
                        }}
                        placeholder={useRegexp ? placeholderRegexp || placeholder : placeholder}
                        pin={pin}
                        size={size}
                        value={filter}
                        onUpdate={this.onFilterChange}
                        className={block('filter')}
                        debounce={400}
                    />
                    <Button
                        view={useRegexp ? 'action' : undefined}
                        size={size}
                        pin={'clear-brick'}
                        onClick={() => this.toggleRegexpMode()}
                    >
                        .*
                    </Button>
                </div>
                {useRegexp && error && <span className={block('error')}>{error?.message}</span>}
            </div>
        );
    }
}
