import {useCallback} from 'react';
import {useDispatch} from '../../../store/redux-hooks';
import {setPoolsAndWeights} from '../../../store/actions/operations';
import {type FormValues, submitTreesWithToaster} from './utils';
import {type FormApi} from '../../../containers/Dialog';
import {type OperationPool} from '../selectors';

type OperationLike = {
    pools?: OperationPool[];
    $value?: string;
};

export function useSubmitHandler(operation: OperationLike, pools: OperationPool[]) {
    const dispatch = useDispatch();

    return useCallback(
        async (form: FormApi<FormValues>) => {
            const {values} = form.getState();
            const formValues: FormValues = {};

            for (const pool of pools) {
                const tree = pool.tree;
                const treeValues = values[tree];

                if (treeValues) {
                    formValues[tree] = {
                        pool: treeValues.pool ?? pool.pool,
                        tree,
                        weight: treeValues.weight,
                        cpu: treeValues.cpu,
                        gpu: treeValues.gpu,
                        memory: treeValues.memory,
                        user_slots: treeValues.user_slots,
                    };
                }
            }

            await submitTreesWithToaster(formValues, operation, dispatch, setPoolsAndWeights);
        },
        [operation, dispatch, pools],
    );
}
