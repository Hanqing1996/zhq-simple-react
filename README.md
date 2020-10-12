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