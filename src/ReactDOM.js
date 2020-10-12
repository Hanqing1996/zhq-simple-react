export const ReactDOM = {
    render
}

/**
 * 递归生成真实节点，最终挂载到指定 html 节点上
 * @param vnode:virtual DOM 节点
 * @param container:真实节点
 */
function render(vnode,container) {

    if(typeof vnode==='string'){
        const newNode=document.createTextNode(vnode)
        container.appendChild(newNode)
        return
    }
    
    const {tag:tagName}=vnode
    let realDom=document.createElement(tagName)
    
    /*将 vnode 的属性递归转移到 realDom 上*/
    if ( vnode.attrs ) {
        Object.keys( vnode.attrs ).forEach( key => {
            const value = vnode.attrs[ key ];
            setAttribute( realDom, key, value );    // 设置属性
        } );
    }
    
    
    vnode.children.map(child=>{
        render(child,realDom)
        container.appendChild(realDom)
        return
    })
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
        name = name.toLowerCase();
        dom[ name ] = value || '';
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