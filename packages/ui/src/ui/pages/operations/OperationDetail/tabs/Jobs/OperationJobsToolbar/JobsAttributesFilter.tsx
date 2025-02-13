import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Select from '../../../../../../components/Select/Select';

import {getFilteredAttributes} from '../../../../../../pages/operations/selectors';
import {updateFilteredAttributes} from '../../../../../../store/actions/operations/jobs';
import {ATTRIBUTE_ITEMS, ATTRIBUTE_ITEM_NAMES} from '../../../../../../store/selectors/operations';

function JobsAttributesFilter(props: {disabled: boolean}) {
    const attributes = useSelector(getFilteredAttributes(ATTRIBUTE_ITEM_NAMES));
    const dispatch = useDispatch();
    const handleChange = useCallback((value: Array<string>) => {
        dispatch(
            updateFilteredAttributes(ATTRIBUTE_ITEM_NAMES, value as typeof ATTRIBUTE_ITEM_NAMES),
        );
    }, []);

    return (
        <Select
            {...props}
            multiple
            value={attributes}
            label="Attributes:"
            filterable
            items={ATTRIBUTE_ITEMS}
            onUpdate={handleChange}
        />
    );
}

export default JobsAttributesFilter;
