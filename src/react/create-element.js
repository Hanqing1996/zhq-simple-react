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
    
    attrs = attrs || {};
    
    return {
        tag,
        attrs,
        children,
        key: attrs.key || null
    }
}

export default createElement;