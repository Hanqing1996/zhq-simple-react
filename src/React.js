import ReactDOM from './ReactDOM'

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

// 创建组件实例
/**
 * 注意返回的 inst
 * @param {*} ComponentFunction:类组件-继承自 Component 类构造杉函数，比如 Welcome。函数组件-就是一个返回 js对象（由 jsx 编译得到）的构造函数
 * @param {*} props:vnode 的属性，我们要把它转化成组件实例对应的 props
 */
function createComponent( ComponentFunction, props ) {
    
    let inst;
    // 如果是类定义组件，则直接返回实例
    if (ComponentFunction.prototype && ComponentFunction.prototype.render ) {
        inst = new ComponentFunction( props );
        // 如果是函数定义组件，则将其扩展为类定义组件
    } else {
    
        
        
    
        // inst 是一个 {attrs,children,tag} 的纯 js 对象，它的__proto__是 Object
        inst = new ComponentFunction( props );
    
        
        
    
        /**
         * 这里是硬生生把 constructor 和 render 这两个方法加到了 inst 对象上（注意不是加到原型链上）
         */
         // 这里要为 inst 添加 constructor 方法的唯一原因是下面
        inst.constructor = ComponentFunction;
        // 注意 inst.render 返回的是一个 js(由 jsx 编译得到) 对象
        inst.render = function() {
            return this.constructor( props );
        }
    
        
    }
    
    return inst;
}


// set props
function setComponentProps( component, props ) {
    
    // base 是 component 是否刚 mount 完的依据
    if ( !component.base ) {
        if ( component.componentWillMount ) component.componentWillMount();
    } else if ( component.componentWillReceiveProps ) {
        component.componentWillReceiveProps( props );
    }
    
    /**
     * 这里是专门为函数组件设置的添加 props 操作。因为函数组件本身只是一个返回 js 对象的函数，它用 new 构造出的实例不含有 props 属性。
     * 类组件不需要（在构造实例 component 时就已经添加 props 了）
     */
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

export default  {
    createElement,
    Component,
    createComponent,
    setComponentProps
}
