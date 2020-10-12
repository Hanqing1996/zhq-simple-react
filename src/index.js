/**
 * 由内至外，
 * 解析 h1 节点,调用一次 magicRender
 * 解析 div 节点，再调用一次 magicRender
 *
 * @param tag
 * @param attrs
 * @param children
 * @returns {{children: *[], tag: *, attrs: *}}
 */
function magicRender( tag, attrs, ...children ) {
    
    console.log(arguments);
    
    
    return {
        tag,
        attrs,
        children
    }
}

export const element = (
        <div>
            <h1>Hello, world!</h1>
        </div>
    )

// console.log(element);