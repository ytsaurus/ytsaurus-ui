import React from 'react';
import cn from 'bem-cn-lite';

import hammer from '../../common/hammer';
import NumberInput, {
    NumberInputProps,
    NumberInputWithError,
    NumberInputWithErrorProps,
} from '../../components/NumberInput/NumberInput';

import './QuotaEditor.scss';

const block = cn('yt-quota-editor');

export interface QuotaEditorProps {
    className?: string;
    limit: number | undefined;

    min?: number;
    max?: number;

    error?: string;
    prevLimit?: number;
    format: NumberInputProps['format'];
    decimalPlaces?: number;
    currentAccount: string;
    sourceAccount?: string;

    showHint?: boolean;

    onChange: (value: {limit?: number; source?: string; error?: string}) => void;
    onEnterKeyDown?: () => void;

    getInfoByName: (account: string) => {
        limit?: number;
        total?: number;
        totalChildrenLimit?: number;
        allowChildrenOverCommit?: number;
    };

    limitInputTitle?: React.ReactNode;
    sourceSuggestTitle?: React.ReactNode;
    renderSourceSuggest?: (props: SuggestProps) => React.ReactNode;
    sourceSuggestDisabled?: boolean;
}

interface SuggestProps {
    value: string;
    onChange: (value?: string) => void;
    disabled?: boolean;
}

export default class QuotaEditor extends React.Component<QuotaEditorProps> {
    render() {
        const {
            className,
            format,
            sourceSuggestTitle,
            renderSourceSuggest,
            sourceAccount,
            limitInputTitle,
            showHint,
            error,
            decimalPlaces,
            sourceSuggestDisabled,
        } = this.props;

        return (
            <div className={block(null, className)}>
                {renderSourceSuggest && (
                    <div className={block('item')}>
                        <div className={block('item-title')}>
                            {sourceSuggestTitle || 'Account to distribution'}
                        </div>
                        {renderSourceSuggest({
                            value: sourceAccount || '',
                            onChange: this.onAccountChange,
                            disabled: sourceSuggestDisabled,
                        })}
                        <div className={block('free')}>
                            <React.Fragment>
                                Free to distribute
                                <span className={block('free-value')}>
                                    {' '}
                                    {this.getFreeFormatted()}
                                </span>
                            </React.Fragment>
                        </div>
                    </div>
                )}
                <div className={block('item')}>
                    <div className={block('item-title')}>
                        {limitInputTitle || 'New quota limit'}
                    </div>
                    <NumberInputWithError
                        onChange={this.onBytesChange}
                        value={{value: this.getLimit(), error}}
                        format={format}
                        showHint={showHint}
                        min={this.getMinLimit()}
                        max={this.getMaxLimit()}
                        onEnterKeyDown={this.onEnterKeyDown}
                        decimalPlaces={decimalPlaces}
                    />
                </div>
            </div>
        );
    }

    private onEnterKeyDown = () => {
        const {onEnterKeyDown = () => {}} = this.props;
        onEnterKeyDown();
    };

    private onBytesChange: NumberInputWithErrorProps['onChange'] = (value) => {
        const {onChange, sourceAccount} = this.props;
        onChange({
            limit: value.value,
            source: sourceAccount,
            error: value.error || this.checkForError(value.value, sourceAccount),
        });
    };

    private onAccountChange = (source?: string) => {
        const {onChange, limit, error} = this.props;
        onChange({
            limit,
            source,
            error: error || this.checkForError(limit, source),
        });
    };

    private getLimit() {
        const {limit, prevLimit} = this.props;
        return limit !== undefined ? limit : prevLimit;
    }

    private getFreeImpl() {
        const {sourceAccount} = this.props;
        const info = this.calcLimitTotal(sourceAccount);
        const {limit, total, allowChildrenOverCommit, totalChildrenLimit = 0} = info;
        if (limit === undefined || total === undefined) {
            return {};
        }

        if (allowChildrenOverCommit) {
            const free = Math.max(0, limit);
            return {
                free,
                maxValue: free,
            };
        } else {
            const {prevLimit: itemLimit = 0} = this.props;
            const {limit: itemNewLimit = itemLimit} = this.props;
            const free = Math.max(0, limit - totalChildrenLimit);
            return {
                free: free + itemLimit - itemNewLimit,
                maxValue: free + itemLimit,
            };
        }
    }

    private getFree() {
        return this.getFreeImpl().free!;
    }

    private calcLimitTotal(account = '') {
        return this.props.getInfoByName(account);
    }

    private getMinLimit() {
        const {min} = this.props;
        if (min !== undefined) {
            return min;
        }

        const {currentAccount, getInfoByName} = this.props;
        const {totalChildrenLimit, total} = getInfoByName(currentAccount);
        const res = (total || 0) + (totalChildrenLimit || 0);

        return res;
    }

    private getMaxLimit() {
        const {max} = this.props;
        if (max !== undefined) {
            return max;
        }
        return this.getFreeImpl().maxValue!;
    }

    private getFreeFormatted() {
        const {sourceAccount} = this.props;
        if (!sourceAccount) {
            return hammer.format.NO_VALUE;
        }
        return NumberInput.format(Number(this.getFree()), this.props.format);
    }

    private checkForError(newLimit?: number, srcAccount?: string) {
        if (newLimit === undefined) {
            return undefined;
        }

        if (isNaN(newLimit!)) {
            return 'wrong format!';
        }

        const {currentAccount} = this.props;
        if (currentAccount === srcAccount) {
            return 'The same source account';
        }

        const maxLimit = this.getMaxLimit();

        if (srcAccount && (maxLimit === undefined || newLimit > maxLimit)) {
            return 'New value is too big';
        }

        return undefined;
    }
}
