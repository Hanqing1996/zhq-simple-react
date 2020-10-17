import { renderComponent } from '../react-dom/diff'
import {enqueueSetState} from "./set-state-queue";

class Component {
    constructor( props = {} ) {
        this.isReactComponent = true;
        
        this.state = {};
        this.props = props;
    }
    
    // stateChange:{age:14}
    setState( stateChange ) {
        enqueueSetState(stateChange,this)
    }
}

export default Component