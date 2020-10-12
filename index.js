import ReactDOM from './src/ReactDOM.js'
import React from './src/React.js'



class Welcome extends React.Component {
    render() {
        return <h1>Hello, {this.props.name}</h1>;
    }
}

const element = <Welcome name="Sara" />;
ReactDOM.render(
    element,
    document.getElementById( 'root' )
);