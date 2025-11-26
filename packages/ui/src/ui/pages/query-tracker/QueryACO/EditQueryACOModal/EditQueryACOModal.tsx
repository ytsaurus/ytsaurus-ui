import React, {FC, useState} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import {YTDFDialog, makeErrorFields} from '../../../../components/Dialog';
import {useQueryACO} from '../useQueryACO';
import {useToggle} from 'react-use';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectIsMultipleAco} from '../../../../store/selectors/query-tracker/queryAco';
import {resetQueryList} from '../../../../store/actions/query-tracker/queriesList';

type Props = {
    query_id: string;
};

interface FormValues {
    aco: string[];
}

export const EditQueryACOModal: FC<Props> = ({query_id}) => {
    const dispatch = useDispatch();
    const isMultipleAco = useSelector(selectIsMultipleAco);
    const {selectACOOptions, changeCurrentQueryACO, currentQueryACO} = useQueryACO();
    const [error, setError] = useState<Error | undefined>(undefined);
    const [visible, toggleVisible] = useToggle(false);

    const handleSubmit = async (values: FormValues) => {
        try {
            await changeCurrentQueryACO({aco: values.aco, query_id});
            await dispatch(resetQueryList());
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    return (
        <>
            <Button view="flat" onClick={toggleVisible}>
                <Icon data={PencilIcon} size={16} /> Edit ACO
            </Button>
            {visible && (
                <YTDFDialog<FormValues>
                    pristineSubmittable
                    visible={visible}
                    modal={true}
                    headerProps={{title: 'Edit query ACO'}}
                    footerProps={{textApply: 'Update'}}
                    onClose={() => {
                        setError(undefined);
                        toggleVisible();
                    }}
                    onAdd={(form) => {
                        return handleSubmit(form.getState().values);
                    }}
                    initialValues={{
                        aco: currentQueryACO,
                    }}
                    fields={[
                        {
                            name: 'aco',
                            type: 'select',
                            extras: {
                                options: selectACOOptions,
                                placeholder: 'ACO',
                                width: 'max',
                                filterable: true,
                                multiple: isMultipleAco,
                            },
                        },
                        ...makeErrorFields([error]),
                    ]}
                />
            )}
        </>
    );
};
