import { diff } from './diff'

/**
 * 递归生成真实节点
 * @param vnode:virtual DOM 节点
 * @returns {Text|*}
 * @private
 */
function _render( vnode,container ) {
    
    if (vnode === undefined || vnode === null || typeof vnode === 'boolean') vnode = '';
    
    
    
    if ( vnode.isReactComponent ) {
        const component = vnode;
        
        if ( component._container ) {
            if ( component.componentWillUpdate ) {
                component.componentWillUpdate();
            }
        } else if ( component.componentWillMount ) {
            component.componentWillMount();
        }
        
        component._container = container;   // 保存父容器信息，用于更新
        
        vnode = component.render();
    }
    
    if (typeof vnode === 'number') vnode = String(vnode);
    
    if (typeof vnode === 'string') {
        let textNode = document.createTextNode(vnode)
        return container.appendChild(textNode)
    }
    
    
    /**
     * 处理 DOM 节点,递归生成 vnode 对应子节点
     */
    const dom = document.createElement(vnode.tag);
    
    if (vnode.attrs) {
        Object.keys(vnode.attrs).forEach(key => {
            
            const value = vnode.attrs[key];
    
            if ( key === 'className' ) key = 'class';
    
            // 如果是事件监听函数，则直接附加到dom上
            if ( typeof value === 'function' ) {
                dom[ key.toLowerCase() ] = value;
            } else {
                dom.setAttribute( key, vnode.attrs[ key ] );
            }
        });
    }
    
    if (vnode.children) {
        vnode.children.forEach(child => _render(child, dom));
    }
    
    return container.appendChild( dom );
}

function render( vnode, container, dom ) {
    return diff( dom, vnode, container );
}

export default render;