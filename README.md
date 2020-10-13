#### 怎样将 jsx 语法转化为 js
首先要知道 jsx 本身就是为了 react 特意设置的 DSL，在 插件`babel-plugin-transform-react-jsx` 中，二者是耦合的。

我们可以在 .babelrc 中通过修改 pragma 来指定 jsx 表达式替换成 js 时的函数名。详细配置见[这里](https://www.babeljs.cn/docs/babel-plugin-transform-react-jsx)。

比如，以下配置会导致 jsx 片段会被转译成用`magicRender`方法包裹的代码。
```babel
{
  "presets": ["env"],
  "plugins": [
    ["transform-react-jsx", {
      "pragma": "magicRender"
    }]
  ]
}
```
在 react 源码中，这个 pragma 的值就是鼎鼎大名的`React.createElement`。


#### React.createElement
返回记录了一个节点信息的 js 对象。这个记录信息的对象我们称之为**虚拟DOM**。

#### render
用于把虚拟 DOM 挂载到真实节点上。

#### 区分组件和原生DOM
例如在处理<Welcome name="Sara" />时，createElement方法的第一个参数 tag，实际上就是基于 Conmponent 的类 Welcome 的构造函数
```
// vnode.tag 类型为函数，说明遇到一个组件节点
if (typeof vnode.tag === 'function') {
    ...
}
```

#### 类组件的 mount 过程
```
class Welcome extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    // render 返回内容会在 renderComponent 方法中被解析，生成对应真实 DOM节点。
    render() {
        return <h1>Hello, I am a {this.props.name}</h1>;
    }
}
```
1. 得到这个类组件对应的实例-React.createComponent
2. 调用类组件的 render 方法，编译`<h1>Hello, I am a {this.props.name}</h1>`这段 jsx 代码，获取类实例对应的真实 DOM 节点-React.renderComponent
3. 将2中的 DOM 节点挂载到 #root 上，完毕。


#### 函数组件的 mount 过程
```
function WelcomeAsFunction( props ) {
    return <h2>Hello, I am a {props.name}</h2>;
}
```
不同于类组件，函数组件会两次编译`<h2>Hello, I am a {props.name}</h2>`这段 jsx 代码。

第一次是调用 new WelcomeAsFunction(props) 得到一个 jsx 编译而来的 js 对象（其__propto__是 Object，只有 attr,tag,children 三个属性）

在这之后，该 js 对象会将 WelcomeAsFunction 封装成自己的 render 方法。在之后的 renderComponent 方法中，会调用 render 从而再次编译 jsx 代码，并转化为真实节点。

注意函数组件的 mount 过程与类组件所继承的基类 Component 毫无关系。


#### jsx 中的 props 如何编译？
对于实例 component,如果它的 props 为 {name:'class Component'},在调用 render 方法后
```javascript
render(){
    return <h1>Hello, I am a {this.props.name}</h1>;
}
```
得到的 js 对象为
```js
{
    children:['hello,I am a','class Component']
    ...
}
```

注意这个 js 对象是 babel 对 jsx 编译得到的。而把它作为 createElement 参数是我们实现的。


