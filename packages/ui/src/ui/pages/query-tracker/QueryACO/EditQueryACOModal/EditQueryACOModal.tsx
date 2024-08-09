import React, {FC, useState} from 'react';
import {Button, Icon} from '@gravity-ui/uikit';
import {YTDFDialog, makeErrorFields} from '../../../../components/Dialog/Dialog';
import {useQueryACO} from '../useQueryACO';
import {useToggle} from 'react-use';
import PencilIcon from '@gravity-ui/icons/svgs/pencil.svg';
import {useDispatch, useSelector} from 'react-redux';
import {selectIsMultipleAco} from '../../module/query_aco/selectors';
import {requestQueriesList} from '../../module/queries_list/actions';

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
            await dispatch(requestQueriesList());
        } catch (err) {
            setError(err as Error);
            throw err;
        }
    };

    return (
        <>
            <Button view="flat" onClick={toggleVisible}>
                Edit ACO <Icon data={PencilIcon} size={16} />
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
                            required: true,
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
