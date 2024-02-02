import React, {Component} from 'react';
import PropTypes from 'prop-types';
import hammer from '../../../common/hammer';
import cn from 'bem-cn-lite';

import Icon from '../../../components/Icon/Icon';
import {Button} from '@gravity-ui/uikit';

import './OperationWeight.scss';

const block = cn('operation-weight');

export default class OperationWeight extends Component {
    static propTypes = {
        onEdit: PropTypes.func.isRequired,
        weight: PropTypes.number,
        operation: PropTypes.object.isRequired,
    };

    renderButton() {
        const {onEdit} = this.props;
        return (
            <Button
                view="flat-secondary"
                size="s"
                className={block('weight-edit')}
                title="Edit operation weight"
                onClick={() => onEdit()}
            >
                <Icon awesome="pencil" />
            </Button>
        );
    }
    render() {
        const {
            weight,
            operation: {state},
        } = this.props;
        const weightless = typeof weight === 'undefined';
        const isCorrectState = state !== 'completed' && state !== 'failed' && state !== 'aborted';

        return (
            <div className={block()}>
                <span className={block('value')}>
                    {weightless ? hammer.format.NO_VALUE : weight}
                </span>
                {isCorrectState && !weightless && this.renderButton()}
            </div>
        );
    }
}
