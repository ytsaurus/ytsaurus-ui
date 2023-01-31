import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';

import Select from '../../../../../../components/Select/Select';

import {getFilteredAttributes} from '../../../../../../pages/operations/selectors';
import {updateFilteredAttributes} from '../../../../../../store/actions/operations/jobs';
import {getAttributeItems, getAttributesNames} from '../../../../../../store/selectors/operations';

function JobsAttributesFilter(props: {disabled: boolean}) {
    const attributeItems = useSelector(getAttributeItems);
    const attributeNames = useSelector(getAttributesNames);
    const attributes = useSelector(getFilteredAttributes(attributeNames));
    const dispatch = useDispatch();
    const handleChange = useCallback((value: Array<string>) => {
        dispatch(updateFilteredAttributes(attributeNames, value));
    }, []);

    return (
        <Select
            {...props}
            multiple
            value={attributes}
            label="Attributes:"
            filterable
            items={attributeItems}
            onUpdate={handleChange}
        />
    );
}

export default JobsAttributesFilter;
