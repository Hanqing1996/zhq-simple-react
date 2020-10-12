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
    let currentContainer=document.createElement(tagName)
    
    vnode.children.map(child=>{
        render(child,currentContainer)
        container.appendChild(currentContainer)
        return
    })
}


