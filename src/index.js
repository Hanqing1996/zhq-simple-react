import ReactDOM from './ReactDOM.js'
import React from './React.js'

// 类组件
class Welcome extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    // render 返回内容会在 renderComponent 方法中被解析，生成对应真实 DOM节点。
    render() {
        return <h1>Hello, I am a {this.props.name}</h1>;
    }
}

// 函数组件
function WelcomeAsFunction( props ) {
    return <h2>Hello, I am a {props.name}</h2>;
}

ReactDOM.render(
    
    <div>
        <Welcome name="class Component" />
        <WelcomeAsFunction name='function Component'/>
    </div>,
    document.getElementById( 'root' )
);
