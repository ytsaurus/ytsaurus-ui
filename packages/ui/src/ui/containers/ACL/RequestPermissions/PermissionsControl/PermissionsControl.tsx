import {Alert, Checkbox, Disclosure} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import indexOf_ from 'lodash/indexOf';
import isEmpty_ from 'lodash/isEmpty';
import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';
import React, {Component} from 'react';
import i18nPermissionValues from '../../../../containers/ACL/i18n-permission-values';
import {type YTPermissionTypeUI} from '../../../../utils/acl/acl-api';
import i18n from './i18n';
import './PermissionsControl.scss';
import {YTText} from '@ytsaurus/components';

const block = cn('acl-permissions-control');

const ADDITIONAL_PERMISSIONS = ['full_read'];

interface Props {
    value: Record<string, Array<YTPermissionTypeUI>>;
    onChange: (value: Props['value']) => void;
    disabled?: boolean;
    choices?: Array<Array<YTPermissionTypeUI>>;
    disabledChoices?: Array<number>; // array of indices
    validate?: (value: Props['value']) => string | undefined;

    error?: string;
}

interface State {
    errorMessage?: string;
}

export default class PermissionsControl extends Component<Props, State> {
    static getChoiceName(choice: Array<string>) {
        return choice.join('/');
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    static hasErrorRenderer = true;

    static getDefaultValue = () => ({});
    static isEmpty(value: Props['value']) {
        return isEmpty_(value);
    }

    state: State = {};

    handleCheckboxChange = (
        permissionName: string,
        permissionsToSet: Array<YTPermissionTypeUI>,
    ) => {
        const {value, onChange} = this.props;
        const {[permissionName]: permissions, ...rest} = value || {};

        const updatedValue = permissions ? rest : {...rest, [permissionName]: permissionsToSet};
        onChange(updatedValue);
    };

    renderPermissionCheckbox(
        permissionName: string,
        permissionsToSet: Array<YTPermissionTypeUI>,
        isDisabled: boolean,
    ) {
        const {value} = this.props;

        const content = permissionsToSet
            .map((item) => {
                return i18nPermissionValues(`value_${item}`);
            })
            .join('/');

        return (
            <Checkbox
                checked={Boolean(value?.[permissionName])}
                key={permissionName}
                content={content}
                onChange={() => this.handleCheckboxChange(permissionName, permissionsToSet)}
                disabled={isDisabled}
                className={block('item')}
            />
        );
    }

    render() {
        const {choices, disabled, disabledChoices, error} = this.props;

        const mainChoices: Array<{item: Array<YTPermissionTypeUI>; isDisabled: boolean}> = [];
        const additionalChoices: Array<{item: Array<YTPermissionTypeUI>; isDisabled: boolean}> = [];

        (choices ?? []).forEach((item, index) => {
            const isDisabled = disabled || indexOf_(disabledChoices, index) !== -1;
            if (isEqual_(ADDITIONAL_PERMISSIONS, item)) {
                additionalChoices.push({item, isDisabled});
            } else {
                mainChoices.push({item, isDisabled});
            }
        });

        const hasAdditional = additionalChoices.length > 0;

        return (
            <div className={block()}>
                {map_(mainChoices, ({item, isDisabled}, index) => {
                    const name = PermissionsControl.getChoiceName(item);
                    return (
                        <React.Fragment key={index}>
                            {this.renderPermissionCheckbox(name, item, isDisabled)}
                        </React.Fragment>
                    );
                })}
                {hasAdditional && (
                    <Disclosure
                        className={block('additional')}
                        defaultExpanded={false}
                        arrowPosition="right"
                        summary={i18n('title_additional-permissions')}
                    >
                        <div className={block('additional-content')}>
                            {map_(additionalChoices, ({item, isDisabled}, index) => {
                                const name = PermissionsControl.getChoiceName(item);
                                return (
                                    <React.Fragment key={index}>
                                        {this.renderPermissionCheckbox(name, item, isDisabled)}
                                    </React.Fragment>
                                );
                            })}
                            <Alert
                                theme="info"
                                message={
                                    <YTText color="secondary">
                                        {i18n('context_full-read-note')}
                                    </YTText>
                                }
                            />
                        </div>
                    </Disclosure>
                )}
                {error && <div className={block('error-message')}>{error}</div>}
            </div>
        );
    }
}
