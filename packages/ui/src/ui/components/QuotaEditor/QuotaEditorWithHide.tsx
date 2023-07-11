import React from 'react';
import cn from 'bem-cn-lite';
import Icon from '../../components/Icon/Icon';

import Link from '../../components/Link/Link';
import Button from '../../components/Button/Button';
import NumberInput, {NumberInputProps} from '../../components/NumberInput/NumberInput';
import {ROOT_ACCOUNT_NAME} from '../../constants/accounts/accounts';

import './QuotaEditorWithHide.scss';
import QuotaEditor, {QuotaEditorProps} from './QuotaEditor';

const block = cn('yt-quota-editor-with-hide');

interface Props {
    className?: string;
    limit?: number;
    format: NumberInputProps['format'];
    currentAccount: string;
    parentOfCurrentAccount?: string;

    onHide: () => void;
    onSave: (limit: number, limitDiff: number, account?: string) => void;

    getInfoByName: (account: string) => {
        limit?: number;
        total?: number;
        totalChildrenLimit?: number;
        allowChildrenOverCommit?: number;
    };

    sourceSuggestTitle?: React.ReactNode;
    renderSourceSuggest?: (props: SuggestProps) => React.ReactNode;

    min?: number;
    max?: number;
}

interface SuggestProps {
    value: string;
    onChange: (value?: string) => void;
}

interface State {
    account?: string;
    accountChanged?: boolean;

    bytesError?: string;
    newLimit?: number;
    isReadyToSave?: boolean;
    showConfirm?: boolean;
}

export default class QuotaEditorWithHide extends React.Component<Props, State> {
    state: State = {};

    render() {
        const {showConfirm} = this.state;
        return showConfirm ? this.renderConfirmation() : this.renderEditor();
    }

    private renderConfirmation() {
        const {className, limit} = this.props;
        return (
            <div className={block('confirm', className)}>
                <div className={block('confirm-notice')}>
                    Do you really want to change the quota limit?
                </div>
                <div className={block('confirm-details')}>
                    The previous value is {this.renderLimit(limit)}, the new value is{' '}
                    {this.renderLimit(this.getLimit())}
                </div>
                <div className={block('confirm-actions')}>
                    <Button
                        className={block('confirm-btn')}
                        view={'action'}
                        onClick={this.onYes}
                        qa="quota-editor-confirmation-yes"
                    >
                        Yes
                    </Button>
                    <Button
                        className={block('confirm-btn')}
                        view="flat-secondary"
                        onClick={this.onCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        );
    }

    private onYes = () => {
        const {limit: oldLimit = 0} = this.calcLimitTotal(this.props.currentAccount);
        const newLimit = this.getLimit() || 0;
        this.props.onSave(newLimit, newLimit - oldLimit, this.getDistributeAccount());
        this.setState({showConfirm: false});
        this.props.onHide();
    };

    private onCancel = () => {
        this.setState({showConfirm: false});
    };

    private renderLimit(value: Props['limit']) {
        const {format} = this.props;
        return <span className={block('confirm-limit')}>{NumberInput.format(value, format)}</span>;
    }

    private renderEditor() {
        const {className, onHide} = this.props;
        const {isReadyToSave} = this.state;

        return (
            <div className={block(null, className)}>
                <div className={block('top')}>
                    Edit Quota limit
                    <Link className={block('hide')} theme={'ghost'} onClick={onHide}>
                        <Icon awesome={'times'} face={'light'} />
                    </Link>
                </div>
                <div className={block('controls')}>
                    {this.renderControl()}
                    <div className={block('controls-item', {save: true})}>
                        <div className={block('control-title')}>&nbsp;</div>
                        <Button
                            size={'m'}
                            view={'action'}
                            disabled={!isReadyToSave}
                            onClick={this.onSave}
                            qa="quota-editor-save"
                        >
                            Save
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    private renderControl() {
        const {
            format,
            limit,
            min,
            max,
            currentAccount,
            getInfoByName,
            sourceSuggestTitle,
            renderSourceSuggest,
        } = this.props;
        return (
            <QuotaEditor
                className={block('grow')}
                currentAccount={currentAccount}
                sourceAccount={this.getDistributeAccount()}
                getInfoByName={getInfoByName}
                sourceSuggestTitle={sourceSuggestTitle}
                renderSourceSuggest={renderSourceSuggest}
                format={format}
                limit={this.getLimit()}
                prevLimit={limit}
                onChange={this.onChange}
                onEnterKeyDown={this.onSave}
                min={min}
                max={max}
            />
        );
    }

    private onChange: QuotaEditorProps['onChange'] = ({limit, source, error}) => {
        const {parentOfCurrentAccount, limit: prevLimit} = this.props;
        this.setState({
            newLimit: limit,
            account: source,
            accountChanged: source !== parentOfCurrentAccount,
            isReadyToSave: !error && limit !== prevLimit && limit !== undefined,
        });
    };

    private onSave = () => {
        this.setState({showConfirm: true});
    };

    private getLimit() {
        const {newLimit} = this.state;
        const {limit} = this.props;
        return newLimit !== undefined ? newLimit : limit;
    }

    private getDistributeAccount() {
        const {account, accountChanged} = this.state;
        const res = accountChanged ? account : this.props.parentOfCurrentAccount;
        return res === ROOT_ACCOUNT_NAME ? '' : res;
    }

    private calcLimitTotal(account = '') {
        return this.props.getInfoByName(account);
    }
}
