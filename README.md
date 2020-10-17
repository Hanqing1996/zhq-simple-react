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

> 以下组件的 mount 过程基于未引入 diff 时的代码


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


#### 绑定事件
```
class Welcome extends React.Component {
    
    constructor(props) {
        super(props);
    }
    
    render() {
        return <h1 onClick={()=>this.clickMe()}>Hello, I am a {this.props.name}</h1>;
    }
    
    clickMe(){
        
    }
}
```
编译 jsx 代码`<h1 onClick={this.clickMe}>Hello, I am a {this.props.name}</h1>`得到的结果 vnode 
```
{
    attr:{onClick: ƒ}
}
```
* 注意下面这种写法是错误的
> 由于普通函数的 this 是函数调用时才决定的，所以 onClick 中的 this 将会是 DOM节点 h1 而非组件类实例
```
    render() {
        return <h1 onClick={clickMe}>Hello, I am a {this.props.name}</h1>;
    }
```

#### state 更新
1. 触发实例的 setState 方法
2. 触发 renderComponent 方法，并触发一系列更新操作对应的声明周期函数，比如`componentWillUpdate`, `componentDidUpdate`


#### 对比真实旧 DOM 和虚拟 DOM，最后返回更新后的DOM
> 以下表述中,dom 表示旧的 dom 节点;vnode 表示虚拟 DOM,renderNode=document.createElement( vnode.tag ),注意 renderNode 没有子节点，只是简单使用 vnode.tag 构造出的DOM元素

> 总体思想是由上到下，逐级比对，发现不同之处才替换
* typeof vnode === 'string'
    * dom 不存在:不做操作，返回 renderNode
    * dom 存在
        * dom 类型为文本节点:dom.textContent=vnode，返回 renderNode
        * dom 类型不为文本节点:dom.parentNode.replace(dom,renderNode)，返回 renderNode
* typeof vnode !== 'string'
    * dom 不存在:不做操作，返回 renderNode
    * dom 存在
        * dom.nodeName.toLowerCase() === vnode.tag.toLowerCase(): 再深入比对节点属性、子节点情况
        * dom.nodeName.toLowerCase() !== vnode.tag.toLowerCase(): dom.parentNode.replace(dom,renderNode)，返回 renderNode   




#### 原先的 O(n^3) 的 diffOld，复杂度是咋计算出来的 

原来的 O(n^3) 的 diffOld 流程是：

老树的每一个节点都去遍历新树的节点，直到找到新树对应的节点。那么这个流程就是 O(n^2)，再紧接着找到不同之后，再计算最短修改距离然后修改节点，这里是 O(n^3)


---
> 以下内容参考自[React 源码剖析系列 － 不可思议的 react diffOld](https://zhuanlan.zhihu.com/p/20346379)

#### 为什么节点类型不同时直接替换，不继续往下 diffOld?

如下图，当 component D 改变为 component G 时，即使这两个 component 结构相似，**一旦 React 判断 D 和 G 是不同类型的组件，就不会比较二者的结构，而是直接删除 component D，重新创建 component G 以及其子节点。**虽然当两个 component 是不同类型但结构相似时，React diffOld 会影响性能，但正如 React 官方博客所言：不同类型的 component 是很少存在相似 DOM tree 的机会，因此这种极端因素很难在实现开发过程中造成重大影响的。

![](https://pic1.zhimg.com/80/52654992aba15fc90e2dac8b2387d0c4_720w.png)

#### oldPosition<lastIndex 才移动

lastIndex:记录所有访问过的新集合节点，在旧集合中的最右位置

oldPosition:当前访问的新集合节点，在旧集合中的位置

遍历新集合节点，当 oldPosition>=lastIndex 时，旧集合节点无需移动;否则进行位移，到达其在新集合中位置

比如

![0boBjI.jpg](https://s1.ax1x.com/2020/10/16/0boBjI.jpg)


但是很容易想到，这种做法，不适用于以下情况

![0bT7QA.jpg](https://s1.ax1x.com/2020/10/16/0bT7QA.jpg)

对此，React 给出了建议
> 在开发过程中，尽量减少类似将最后一个节点移动到列表首部的操作，当节点数量过大或更新操作过于频繁时，在一定程度上会影响 React 的渲染性能。

#### 如果新集合中有新加入的节点且老集合存在需要删除的节点，那么 React diffOld 又是如何对比运作的呢？
* 从新集合中取得 B，判断老集合中存在相同节点 B ...

* **从新集合中取得 E，判断老集合中不存在相同节点 E，则创建新节点 E。**

* 从新集合中取得 C，判断老集合中存在相同节点 C...

* 从新集合中取得 A，判断老集合中存在相同节点 A...

**当完成新集合中所有节点 diffOld 时，最后还需要对老集合进行循环遍历，判断是否存在新集合中没有但老集合中仍存在的节点，发现存在这样的节点 D，因此删除节点 D，到此 diffOld 全部完成。**

![](https://pic1.zhimg.com/80/7b9beae0cf0a5bc8c2e82d00c43d1c90_720w.png)











#### 组件 Welcome,WelcomeAsFunction 的 mount 过程

ReactDOM.render 为入口

从上到下逐级分析 ReactDOM.render的 render 结果（形如 {tag:div}），再递归地由底层到顶层地不断做两件事 1.生成对应真实DOM节点; 2.挂载到父结点上

注意 vnode（虚拟DOM）不等于组件实例，这是两个概念。vnode 是 jsx 编译成 js 的结果，是内存中用于刻画 DOM 状态的数据结构。vnode 的 tag 可以是"div/h1/text"(表示普通节点),也可以是"function"(表示组件)

* ReactDOM.render

  * diff(undefiend,vnode{tag:div},div#root)

    * diffNode(undefiend,vnode{tag:div})
      * diffChildren(div(没有子节点，只是按照vnode{tag:div}缔造出了一个类型为div的节点),[{tag:Welcome},{tag:WelcomeAsFunction}])
        * diffNode(undefined,vchild{tag:Welcome})
          * diffComponent(undefiend,vchild{tag:Welcome}) 
            * setComponentProps，调用renderComponent，从而构造vnode对应的DOM节点c.base，再令dom = c.base **,即令dom变成与vchild{tag:Welcome} render内容相对应的 dom 节点（具有子节点）:h1{component:{tag:Welcome}}**
        * **div(domChildren:[]).appendChild(h1{component:{tag:Welcome}})**		
        * diffNode(undefined,vchild{tag:WelcomeAsFunction})
          * diffComponent(undefiend,vchild{tag:WelcomeAsFunction}) 
            * setComponentProps，调用renderComponent，从而构造vnode对应的DOM节点c.base，再令dom = c.base ,**即令dom变成与vchild{tag:WelcomeAsFunction} render内容相对应的 dom 节点（具有子节点）:h2{component{tag:WelcomeAsFunction}}**
        * **div(domChildren:[h1{component{tag:Welcome}}]).appendChild(h2{component:{tag:WelcomeAsFunction}})**	

    * ret=div(domChildren:[h1{component{tag:Welcome}},{h2{component:{tag:WelcomeAsFunction}}}]);

      **div#root.appendChild(ret)**
---

#### 组件 Welcome 的 diff 过程

没有进行除了数据更新节点外，对其它节点的DOM操作

主要思想是:
1.setSate 会触发内存中组件实例的状态改变
2.依据更新后的组件实例 component,去获取更新后的 jsx 对应编译结果 renderer(一个 vnode,形如 {tag:h1})
3.再将 renderer 其与旧的组件对应 DOM 节点 base 做diff:
```js
diffNode( component.base, renderer);
```
4. 一直追踪到发生变化的DOM节点（比如文本节点），才进行DOM操作，以此保证组件状态更新带来的DOM操作代价最小。

注意更新过程没有触发 ReactDOM.render，DOM 的检查比较起点是发生变化的组件对应的 DOM节点

【吐槽】所以 `_render` 函数压根儿没用到吗。。。


* setState，更新 vnode{tag:Welcome}

  * renderComponent(this)

    renderer=状态更新后的组件实例	

    component.base=旧的 vnode{tag:Welcome} 对应DOM节点

    * diffNode( component.base, renderer);接下来从上到下逐级分析，一直定位到发生变化的文本节点textNode，更新节点内容


---
## setState


在React中，如果是由React引发的事件处理（比如通过onClick引发的事件处理），调用setState不会同步更新this.state，除此之外的setState调用会同步执行this.state 。所谓“除此之外”，指的是绕过React通过addEventListener直接添加的事件处理函数，还有通过setTimeout/setInterval产生的异步调用。

原因： 在React的setState函数实现中，会根据一个变量isBatchingUpdates判断是直接更新this.state还是放到队列中回头再说，而isBatchingUpdates默认是false，也就表示setState会同步更新this.state，但是，有一个函数batchedUpdates，这个函数会把isBatchingUpdates修改为true，而当React在调用事件处理函数之前就会调用这个batchedUpdates，造成的后果，就是由React控制的事件处理过程setState不会同步更新this.state。

注意： setState的“异步”并不是说内部由异步代码实现，其实本身执行的过程和代码都是同步的，只是合成事件和钩子函数的调用顺序在更新之前，导致在合成事件和钩子函数中没法立马拿到更新后的值，形式了所谓的“异步”，当然可以通过第二个参数 setState(partialState, callback) 中的callback拿到更新后的结果。

#### React 中,为什么更新 state 是异步的？
 
在 react 中，更新 state 是异步的，渲染也是异步的，为什么要这样设计呢？为什么不设计成每次setState都会立即更新state（但不会立即渲染）呢，preact 就是这么做的。

[这是 Dan 对此的解释](https://github.com/facebook/react/issues/11527#issuecomment-360199710)。

简单来说，这么设计的一个理由是为了维持内部一致性，即有时候某些 props 依赖于 state,当 state 更新时这些 props 也必须更新。而 props 的更新前提是组件的 render。这种情况下，"每次setState都会立即更新state,但不会立即渲染"是做不到的。


#### 连续多个 setState 的作用流程
假如在某个事件中多次执行 setState
```js
clickMe(){
    this.setState( { age:14} );
    this.setState( { age:15} );
    this.setState( { age:16} );
    this.setState( { age:17} );
}
```
那么 enqueueSetState 会执行四次，但是只有第一次在满足 setStateQueue.length === 0 的条件下，会触发 defer，从而将 flush 放入微任务队列。

在所有 stateChange 都放入 setStateQueue 后，同步代码执行结束。开始执行微任务队列中任务，导致 flush 被执行，从而执行所有状态变更，清空 setStateQueue。



