import React from 'react';

import isEqual_ from 'lodash/isEqual';
import map_ from 'lodash/map';

import QuotaEditor, {QuotaEditorProps} from '../../../components/QuotaEditor/QuotaEditor';
import isEmpty_ from 'lodash/isEmpty';
import {RootState} from '../../../store/reducers';
import {ConnectedProps, connect} from 'react-redux';
import {useSelector} from '../../../store/redux-hooks';
import {getSchedulingPoolsMapByName} from '../../../store/selectors/scheduling/scheduling-pools';
import {
    getSchedulingSourcesOfEditItem,
    getSchedulingSourcesOfEditItemSkipParent,
} from '../../../store/selectors/scheduling/scheduling';
import Select from '../../../components/Select/Select';
import {PoolResourceType, getPoolResourceInfo} from '../../../utils/scheduling/scheduling';

interface Props {
    resourceType: PoolResourceType;
    pool: string;
    format?: QuotaEditorProps['format'];
    decimalPlaces?: number;
    error?: string;

    value: {
        source?: string;
        limit?: number;
        error?: string;
    };
    initialLimit: number | undefined;
    onChange: (value: Props['value']) => void;

    min?: number;
    max?: number;

    sourcesSkipParent?: boolean;

    limitInputTitle?: string;
}

type ReduxProps = ConnectedProps<typeof connector>;

class PoolQuotaEditorControl extends React.Component<Props & ReduxProps> {
    static hasErrorRenderer = true;

    static getDefaultValue() {
        return {};
    }

    static isEmpty(value: Props['value']) {
        return isEmpty_(value);
    }

    static validate({error}: Props['value']) {
        return error;
    }

    static isEqual(left: Props['value'], right: Props['value']) {
        return isEqual_(left, right);
    }

    render() {
        const {
            pool,
            format,
            value: {source, limit} = {},
            error,
            initialLimit,
            decimalPlaces,
            min,
            max,
            sourcesSkipParent,
            limitInputTitle,
        } = this.props;
        return (
            <QuotaEditor
                currentAccount={pool}
                sourceAccount={source}
                limit={limit}
                prevLimit={initialLimit}
                min={min}
                max={max}
                error={error}
                format={format}
                onChange={this.onChange}
                getInfoByName={this.getInfoByName}
                renderSourceSuggest={(props) => {
                    return <PoolSourceSuggest {...props} skipParent={sourcesSkipParent} />;
                }}
                limitInputTitle={limitInputTitle || 'Guaranteed'}
                sourceSuggestTitle={'Pool for distribution'}
                decimalPlaces={decimalPlaces}
            />
        );
    }

    onChange: QuotaEditorProps['onChange'] = ({limit, source, error}) => {
        const {onChange} = this.props;
        onChange({limit, source, error});
    };

    getInfoByName: QuotaEditorProps['getInfoByName'] = (poolName = '') => {
        const {poolsByName, resourceType} = this.props;
        const data = poolsByName[poolName];

        if (isEmpty_(data)) {
            return {
                limit: Infinity,
                total: Infinity,
            };
        }

        const {value, childrenSum} = getPoolResourceInfo(data, resourceType);
        return {totalChildrenLimit: childrenSum, total: 0, limit: value};
    };
}

const mapStateToProps = (state: RootState) => {
    return {
        poolsByName: getSchedulingPoolsMapByName(state),
    };
};

const connector = connect(mapStateToProps);
export default connector(PoolQuotaEditorControl);

function PoolSourceSuggest(props: {
    value?: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    skipParent?: boolean;
}) {
    const {value, onChange, disabled, skipParent} = props;
    const sources = useSelector(getSchedulingSourcesOfEditItem);
    const sourcesNoParent = useSelector(getSchedulingSourcesOfEditItemSkipParent);

    const items = React.useMemo(() => {
        const res = skipParent ? sourcesNoParent : sources;
        return map_(res, (value) => {
            return {
                value,
                text: value,
            };
        });
    }, [skipParent, sources, sourcesNoParent]);

    return (
        <Select
            value={value ? [value] : undefined}
            onUpdate={(vals) => onChange(vals[0])}
            items={items}
            disabled={!sources?.length || disabled}
            placeholder={'Select pool...'}
        />
    );
}
