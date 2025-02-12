import * as React from 'react';
import {DialogWrapper as Dialog} from '../../components/DialogWrapper/DialogWrapper';
import {useDispatch, useSelector} from 'react-redux';
import {isManageTokensModalOpened} from '../../store/selectors/manage-tokens';
import withLazyLoading from '../../hocs/withLazyLoading';
import {importManageTokens} from './index';

const ManageTokensModalContentLazy = withLazyLoading(
    React.lazy(async () => {
        return {
            default: (await importManageTokens()).ManageTokensModalContent,
        };
    }),
);

export const ManageTokensModal = () => {
    const open = useSelector(isManageTokensModalOpened)!;
    const dispatch = useDispatch();

    const handleCloseModal = () => {
        importManageTokens().then((actions) => {
            dispatch(actions.closeManageTokensModal());
        });
    };

    return (
        <Dialog open={open} hasCloseButton={true} onClose={handleCloseModal}>
            <ManageTokensModalContentLazy />
        </Dialog>
    );
};
