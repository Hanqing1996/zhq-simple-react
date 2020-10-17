import { renderComponent } from '../react-dom/diff'

const setStateQueue = []; // 待执行的 stateChange 队列
const renderQueue = []; // 待 render 组件队列

function defer( fn ) {
    // fn 方法会被放入微任务队列
    return Promise.resolve().then( fn );
}

/**
 * stateChange 入队操作
 * @param stateChange
 * @param component
 */
export function enqueueSetState( stateChange, component ) {
    
    if ( setStateQueue.length === 0 ) {
        defer( flush );
    }
    setStateQueue.push( {
        stateChange,
        component
    } );

    if ( !renderQueue.some( item => item === component ) ) {
        renderQueue.push( component );
    }
}

/**
 *
 */
function flush() {
    let item, component;

    // 先更新状态
    while ( item = setStateQueue.shift() ) {
        
        const { stateChange, component } = item;
        
        // 如果没有prevState，则将当前的state作为初始的prevState
        if ( !component.prevState ) {
            component.prevState = Object.assign( {}, component.state );
        }
        
        // 如果stateChange是一个方法，也就是setState的第二种形式
        if ( typeof stateChange === 'function' ) {
            Object.assign( component.state, stateChange( component.prevState, component.props ) );
        } else {
            // 如果stateChange是一个对象，则直接合并到setState中
            Object.assign( component.state, stateChange );
        }
        
        component.prevState = component.state;
    }
    
    // 再 render 组件
    while ( component = renderQueue.shift() ) {
        renderComponent( component );
    }
    
}