import React from "./React";

export default {
    render,
    renderComponent
}

/**
 * 递归生成真实节点
 * @param vnode:virtual DOM 节点
 * @returns {Text|*}
 * @private
 */
function _render( vnode ) {
    
    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') vnode = '';
    
    if (typeof vnode === 'number') vnode = String(vnode);
    
    if (typeof vnode === 'string') {
        let textNode = document.createTextNode(vnode);
        return textNode;
    }
    
    /**
     * 处理组件
     * 对于类组件:
     * 1.拿到组件实例（根据 vnode.tag 构造）
     * 2.由组件实例得到对应真实 DOM 节点
     *
     * 对于类组件
     */

    // 这里的 vnode.tag，实际上就是一个继承自 Component 类的构造函数，比如 Welcome
    if (typeof vnode.tag === 'function') {
        
        /**
         * component 是通过继承 Component 的组件类（比如 Welcome）构造的实例
         * vnode.attrs 为构造函数传入参数（即基类 Component 的props）
         */
        const component = React.createComponent(vnode.tag, vnode.attrs);
        
        /**
         * 这里传递 vnode.attrs 的用意是为了兼容函数组件，因为函数组件对应的 component 不含有 props
         * setComponentProps 会调用 ReactDOM.renderComponent，触发一系列声明周期函数，并构建组件实例对应真实节点，以及组件实例和真实DOM节点间的映射关系
         */
        React.setComponentProps(component, vnode.attrs);
        
        // 返回组件对应真实节点，接下里把真实节点挂载到 root 节点上，组件的 mount 就算全部完成了
        return component.base;
    }
    
    /**
     * 处理 DOM 节点,递归生成 vnode 对应子节点
     */
    const dom = document.createElement(vnode.tag);
    
    if (vnode.attrs) {
    
        console.log(vnode.attrs);
        
        Object.keys(vnode.attrs).forEach(key => {
            
            const value = vnode.attrs[key];
            
            setAttribute(dom, key, value);
            
        });
    }
    
    if (vnode.children) {
        vnode.children.forEach(child => render(child, dom));
    }
    
    return dom;
}

/**
 * @param vnode:virtual Node
 * @param container:挂载 vnode 对应真实节点的 DOM 节点
 * @returns {Text|*|ActiveX.IXMLDOMNode}
 */
function render( vnode, container ) {
    return container.appendChild( _render( vnode ) );
}

/**
 * 递归添加属性
 * @param dom
 * @param name
 * @param value
 */
function setAttribute( dom, name, value ) {
    
    // 如果属性名是className，则改回class
    if ( name === 'className' ) name = 'class';
    
    // 如果属性名是onXXX，则是一个事件监听方法
    if ( /on\w+/.test( name ) ) {
        console.log(name);
        name = name.toLowerCase();
        dom[ name ] = value || '';
        console.log(dom[name]);
        // 如果属性名是style，则更新style对象
    } else if ( name === 'style' ) {
        if ( !value || typeof value === 'string' ) {
            dom.style.cssText = value || '';
        } else if ( value && typeof value === 'object' ) {
            for ( let name in value ) {
                // 可以通过style={ width: 20 }这种形式来设置样式，可以省略掉单位px
                dom.style[ name ] = typeof value[ name ] === 'number' ? value[ name ] + 'px' : value[ name ];
            }
        }
        // 普通属性则直接更新属性
    } else {
        if ( name in dom ) {
            dom[ name ] = value || '';
        }
        if ( value ) {
            dom.setAttribute( name, value );
        } else {
            dom.removeAttribute( name );
        }
    }
}

/**
 * 注意 renderComponent 才开始解析组件的 render 内容
 * base:有说明是刚 mounted,否则说明之前 updated 过
 * @param component:Component 实例
 */
function renderComponent( component ) {
    
    let base;

    /**
     * 这里调用的就是类组件的 render 方法，返回一个 jsx 经过 babel 编译的结果
     * state 更新->触发 renderComponent，也就是说组件类实例的任何一个 state 变化都会导致整个实例重新被生成（其对应 jsx 再次被编译并生成对应DOM节点）
     */
    
    const renderer = component.render();
    
    // state 更新就会走到这一步，有 base 说明这次是更新操作，则触发 componentWillUpdate
    if (component.base && component.componentWillUpdate ) {
        component.componentWillUpdate();
    }
    
    // 将组件转化为真实节点
    base = _render( renderer );
    
    if ( component.base ) {
        if ( component.componentDidUpdate ) component.componentDidUpdate();
    } else if ( component.componentDidMount ) {
        component.componentDidMount();
    }
    
    if ( component.base && component.base.parentNode ) {
        component.base.parentNode.replaceChild( base, component.base );
    }
    
    // 更新 component 的 base
    component.base = base;
    base._component = component;
}
