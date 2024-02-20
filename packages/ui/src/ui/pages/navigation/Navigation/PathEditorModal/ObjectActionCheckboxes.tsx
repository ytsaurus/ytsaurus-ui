import {CircleQuestion} from '@gravity-ui/icons';
import {Checkbox, Flex} from '@gravity-ui/uikit';
import React from 'react';
import {Tooltip} from '../../../../components/Tooltip/Tooltip';

type Checkboxes = {
    preserveAccount: boolean;
    force: boolean;
};

type Props = {
    state: [Checkboxes, React.Dispatch<React.SetStateAction<Checkboxes>>];
};

export const ObjectActionCheckboxes = ({state}: Props) => {
    const [checkboxes, setCheckboxes] = state;
    const onChangeCheckbox = (field: keyof Checkboxes) => {
        return () => {
            setCheckboxes({...checkboxes, [field]: !checkboxes[field]});
        };
    };
    return (
        <Flex direction="column" gap={3}>
            <Checkbox
                title={'Preserve account'}
                checked={checkboxes.preserveAccount}
                onUpdate={onChangeCheckbox('preserveAccount')}
            >
                Preserve account
            </Checkbox>
            <Flex gap={2}>
                <Checkbox
                    title={'Override'}
                    checked={checkboxes.force}
                    onUpdate={onChangeCheckbox('force')}
                    content="Override"
                >
                    Override
                </Checkbox>
                <Tooltip content="Will replace file if it exists">
                    <CircleQuestion style={{color: 'grey'}} />
                </Tooltip>
            </Flex>
        </Flex>
    );
};
