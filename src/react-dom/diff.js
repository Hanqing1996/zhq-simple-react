import { setAttribute } from './dom'

export function diff( dom, vnode, container ) {

    const ret = diffNode( dom, vnode );

    if ( container && ret.parentNode !== container ) {
        container.appendChild( ret );
    }

    return ret;
}

function diffNode( dom, vnode ) {
    
    let out = dom;
    
    if ( vnode === undefined || vnode === null || typeof vnode === 'boolean' ) vnode = '';
    
    if ( typeof vnode === 'number' ) vnode = String( vnode );
    
    // diff text node
    if ( typeof vnode === 'string' ) {
        
        // 如果当前的DOM就是文本节点，则直接更新内容
        if ( dom && dom.nodeType === 3 ) {    // nodeType: https://developer.mozilla.org/zh-CN/docs/Web/API/Node/nodeType
            if ( dom.textContent !== vnode ) {
                dom.textContent = vnode;
            }
            // 如果DOM不是文本节点，则新建一个文本节点DOM，并移除掉原来的
        } else {
            out = document.createTextNode( vnode );
            if ( dom && dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );
            }
        }
        
        return out;
    }
    
    if ( typeof vnode.tag === 'function' ) {
        return diffComponent( dom, vnode );
    }
    
    //
    if ( !dom || !isSameNodeType( dom, vnode ) ) {
        out = document.createElement( vnode.tag );
        
        if ( dom ) {
            [ ...dom.childNodes ].map( out.appendChild );    // 将原来的子节点移到新节点下
            
            if ( dom.parentNode ) {
                dom.parentNode.replaceChild( out, dom );    // 移除掉原来的DOM对象
            }
        }
    }
    
    if ( vnode.children && vnode.children.length > 0 || ( out.childNodes && out.childNodes.length > 0 ) ) {
        diffChildren( out, vnode.children );
    }
    
    diffAttributes( out, vnode );
    
    return out;
    
}

function diffChildren( dom, vchildren ) {
    
    const domChildren = dom.childNodes;
    const children = [];
    
    const keyed = {};
    
    if ( domChildren.length > 0 ) {
        for ( let i = 0; i < domChildren.length; i++ ) {
            const child = domChildren[ i ];
            const key = child.key;
            if ( key ) {
                keyedLen++;
                keyed[ key ] = child;
            } else {
                children.push( child );
            }
        }
    }
    
    if ( vchildren && vchildren.length > 0 ) {
        
        let min = 0;
        let childrenLen = children.length;
        
        for ( let i = 0; i < vchildren.length; i++ ) {
            
            const vchild = vchildren[ i ];
            const key = vchild.key;
            let child;
            
            if ( key ) {
                
                if ( keyed[ key ] ) {
                    child = keyed[ key ];
                    keyed[ key ] = undefined;
                }
                
            } else if ( min < childrenLen ) {
                
                for ( let j = min; j < childrenLen; j++ ) {
                    
                    let c = children[ j ];
                    
                    if ( c && isSameNodeType( c, vchild ) ) {
                        
                        child = c;
                        children[ j ] = undefined;
                        
                        if ( j === childrenLen - 1 ) childrenLen--;
                        if ( j === min ) min++;
                        break;
                        
                    }
                    
                }
                
            }
            
            child = diffNode( child, vchild );
            
            const f = domChildren[ i ];
            if ( child && child !== dom && child !== f ) {
                if ( !f ) {
                    dom.appendChild(child);
                } else if ( child === f.nextSibling ) {
                    removeNode( f );
                } else {
                    dom.insertBefore( child, f );
                }
            }
            
        }
    }
    
}

function diffComponent( dom, vnode ) {
    
    let c = dom && dom._component;
    let oldDom = dom;
    
    // 如果组件类型没有变化，则重新set props
    if ( c && c.constructor === vnode.tag ) {
        setComponentProps( c, vnode.attrs );
        dom = c.base;
        // 如果组件类型变化，则移除掉原来组件，并渲染新的组件
    } else {
        
        if ( c ) {
            unmountComponent( c );
            oldDom = null;
        }
        
        c = createComponent( vnode.tag, vnode.attrs );
        
        setComponentProps( c, vnode.attrs );
        dom = c.base;
        
        if ( oldDom && dom !== oldDom ) {
            oldDom._component = null;
            removeNode( oldDom );
        }
        
    }
    
    return dom;
    
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
    renderComponent( component );
}


/**
 * 注意 renderComponent 才开始解析组件的 render 内容
 * base:有说明是刚 mounted,否则说明之前 updated 过
 * @param component:Component 实例
 */
export function renderComponent( component ) {
    
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
    
    base = diffNode( component.base, renderer );
    
    component.base = base;
    base._component = component;
    
    if ( component.base ) {
        if ( component.componentDidUpdate ) component.componentDidUpdate();
    } else if ( component.componentDidMount ) {
        component.componentDidMount();
    }
    
    // 更新 component 的 base
    component.base = base;
    base._component = component;
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

function unmountComponent( component ) {
    if ( component.componentWillUnmount ) component.componentWillUnmount();
    removeNode( component.base);
}

function isSameNodeType( dom, vnode ) {
    if ( typeof vnode === 'string' || typeof vnode === 'number' ) {
        return dom.nodeType === 3;
    }
    
    if ( typeof vnode.tag === 'string' ) {
        return dom.nodeName.toLowerCase() === vnode.tag.toLowerCase();
    }
    
    return dom && dom._component && dom._component.constructor === vnode.tag;
}

function diffAttributes( dom, vnode ) {
    
    const old = {};    // 当前DOM的属性
    const attrs = vnode.attrs;     // 虚拟DOM的属性
    
    for ( let i = 0 ; i < dom.attributes.length; i++ ) {
        const attr = dom.attributes[ i ];
        old[ attr.name ] = attr.value;
    }
    
    // 如果原来的属性不在新的属性当中，则将其移除掉（属性值设为undefined）
    for ( let name in old ) {
        
        if ( !( name in attrs ) ) {
            setAttribute( dom, name, undefined );
        }
        
    }
    
    // 更新新的属性值
    for ( let name in attrs ) {
        
        if ( old[ name ] !== attrs[ name ] ) {
            setAttribute( dom, name, attrs[ name ] );
        }
        
    }
    
}

function removeNode( dom ) {
    
    if ( dom && dom.parentNode ) {
        dom.parentNode.removeChild( dom );
    }
    
}
