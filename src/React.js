import ReactDOM from './ReactDOM'

export default  {
    createElement,
    Component,
    createComponent,
    setComponentProps
}

// React.Component
class Component {
    constructor( props = {} ) {
        this.state = {};
        this.props = props;
    }
    
    setState( stateChange ) {
        // 将修改合并到state
        Object.assign( this.state, stateChange );
        ReactDOM.renderComponent( this );
    }
}

// 创建组件
function createComponent( component, props ) {
    
    let inst;
    // 如果是类定义组件，则直接返回实例
    if ( component.prototype && component.prototype.render ) {
        inst = new Component( props );
        // 如果是函数定义组件，则将其扩展为类定义组件
    } else {
        inst = new Component( props );
        inst.constructor = Component;
        inst.render = function() {
            return this.constructor( props );
        }
    }
    
    return inst;
}


// set props
function setComponentProps( component, props ) {
    
    if ( !component.base ) {
        if ( component.componentWillMount ) component.componentWillMount();
    } else if ( component.componentWillReceiveProps ) {
        component.componentWillReceiveProps( props );
    }
    
    component.props = props;
    
    ReactDOM.renderComponent( component );
    
}


/**
 * 由内至外，
 * 解析 h1 节点,调用一次 createElement
 * 解析 div 节点，再调用一次 createElement
 *
 * @param tag
 * @param attrs
 * @param children
 * @returns {{children: *[], tag: *, attrs: *}}
 */
function createElement( tag, attrs, ...children ) {
    return {
        tag,
        attrs,
        children
    }
}

