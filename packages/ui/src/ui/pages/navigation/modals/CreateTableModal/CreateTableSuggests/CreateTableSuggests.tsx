import React from 'react';
import {connect} from 'react-redux';

import {
    getColumnGroupSuggestions,
    getColumnLockSuggestions,
} from '../../../../../store/selectors/navigation/modals/create-table';
import Suggest, {SuggestItem} from '../../../../../components/Suggest/Suggest';
import {RootState} from '../../../../../store/reducers';

interface Props {
    className?: string;
    value: string | undefined;
    onChange: (value: Props['value']) => void;
    getItems: () => Array<string>;
    suggestions?: Array<string>;

    children?: React.ReactNode;
}

class LockSuggest extends React.Component<Props> {
    static isEmpty = (v: Props['value']) => {
        return v === '' || v === null || v === undefined;
    };

    static getDefaultValue = () => '';

    getItems = (items: Array<SuggestItem>) => {
        return items;
    };

    onChange = (value: SuggestItem) => {
        const {onChange} = this.props;
        onChange('string' === typeof value ? value : value.value);
    };

    render() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {className, value, onChange, children, suggestions, ...rest} = this.props;

        return (
            <Suggest
                {...rest}
                text={value}
                apply={this.onChange}
                items={suggestions}
                filter={this.getItems}
            />
        );
    }
}

const mapLockStateToProps = (state: RootState) => {
    const suggestions = getColumnLockSuggestions(state);

    return {
        suggestions,
    };
};

export const LockSuggestControl = connect(mapLockStateToProps)(LockSuggest);

const mapGroupStateToProps = (state: RootState) => {
    const suggestions = getColumnGroupSuggestions(state);

    return {
        suggestions,
    };
};

export const GroupSuggestControl = connect(mapGroupStateToProps)(LockSuggest);
