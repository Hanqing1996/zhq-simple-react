import ReactDOM from './react-dom'
import React from './react'

// 类组件
class Welcome extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            age: 13
        }
    }
    
    // render 返回内容会在 renderComponent 方法中被解析，生成对应真实 DOM节点。
    render() {
        console.log('Welcome zrender')      
        return <h1 onClick={()=>this.clickMe()}>Hello, I am a {this.props.name},and I am {this.state.age} years old</h1>;
    }
    
    clickMe(){
    
        this.setState( { age:14} );
        this.setState( { age:15} );
        this.setState( { age:16} );
        this.setState( { age:17} );
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
