import { renderComponent } from '../react-dom/diff'

class Component {
    constructor( props = {} ) {
        this.isReactComponent = true;
        
        this.state = {};
        this.props = props;
    }
    
    // stateChange:{age:14}
    setState( stateChange ) {

        // 将修改合并到state。这一句代码执行完毕后，内存部分的组件对应的组件实例就已经更新了
        Object.assign( this.state, stateChange );
        // 然后通过调用更新后的组件实例的 render 方法，去获取组件实例对应的 vnode，将其与组件实例对应的旧DOM节点做Diff
        renderComponent( this );
    }
}

export default Component