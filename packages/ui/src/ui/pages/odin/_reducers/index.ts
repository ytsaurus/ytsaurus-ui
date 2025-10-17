import {combineReducers} from 'redux';
import details from './odin-details';
import overview from './odin-overview';

const odin = combineReducers({details, overview});

export type OdinRootState = {odin: ReturnType<typeof odin>};

export default odin;
