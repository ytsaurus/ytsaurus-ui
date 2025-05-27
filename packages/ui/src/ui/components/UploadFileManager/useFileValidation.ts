import {useCallback, useState} from 'react';
import {useSelector} from 'react-redux';
import {getSortedNodesNames} from '../../store/selectors/navigation/content/map-node';
import {RootState} from '../../store/reducers';

export const useFileValidation = () => {
    const [nameAlreadyUsed, setNameAlreadyUsed] = useState(false);
    const existingNodes = useSelector<RootState, string[]>(getSortedNodesNames);

    const checkNameAlreadyExist = useCallback(
        (name: string) => {
            return existingNodes.includes(name);
        },
        [existingNodes],
    );

    const validateName = useCallback(
        (name: string) => {
            const alreadyUsed = checkNameAlreadyExist(name);
            setNameAlreadyUsed(alreadyUsed);
            return alreadyUsed;
        },
        [checkNameAlreadyExist],
    );

    return {
        nameAlreadyUsed,
        checkNameAlreadyExist,
        validateName,
    };
};

export default useFileValidation;
