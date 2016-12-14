init the program

### 一些代码规范(建议,可改)

1. 为了防止过多的文件同步、异步加载，建议着色器写在js标签中，放在相应的html文件内即可，之后直接读取标签内容也会比较方便，例如：

```
<script id="shader-fs" type="x-shader/x-fragment">
        #ifdef GL_FRAGMENT_PRECISION_HIGH
            precision highp float;
            precision highp int;
        #else
            precision mediump float;
            precision mediump int;
        #endif
        uniform samplerCube s_texture;
        varying vec3 v_texCoord;
        uniform int uiShadowMode;

        void main(void)
        {
            if(uiShadowMode == 0) gl_FragColor = textureCube(s_texture, v_texCoord);
            else if(uiShadowMode == 1) gl_FragColor = vec4(0.7, 0.7, 0.7, 1.0);
            else if(uiShadowMode == 2) gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
            else if(uiShadowMode == 3) gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        }
    </script>
```
(聂小涛)

### 走过的一些坑(大家可以继续补充)

* 在做贴图的时候，贴图的高度和宽度如果不是2的幂次，可能会报错`58RENDER WARNING: texture bound to texture unit 0 is not renderable. It maybe non-power-of-2 and have  incompatible texture filtering or is not 'texture complete`，所以没有特殊情况都把像素调整为2的幂次。(聂小涛)
* 由于读取的文件特别是mtl文件可能编码和我们的机器不同，所以有时候我们在字符串判定的时候需要对字符串进行稍加处理，(用replace去掉空格等)，下面是一个例子：(聂小涛)

```
OBJDoc.prototype.findColor = function(name){
    for(var i = 0; i < this.mtls.length; i++){
        for(var j = 0; j < this.mtls[i].materials.length; j++){
            if(this.mtls[i].materials[j].name.replace( /^\s+|\s+$/g, "" ) == name){
                return(this.mtls[i].materials[j].color)
            }
        }
    }
    console.log(this.mtls);
    return(new Color(0.8, 0.8, 0.8, 1));
}
```

* 面可以使用负值索引，有时用负值索引描述面更为简便。

```
v -0.500000 0.000000 0.400000
v -0.500000 0.000000 -0.800000
v -0.500000 1.000000 -0.800000
v -0.500000 1.000000 0.400000
f -4 -3 -2 -1
```

"f -4 -3 -2 -1"这句索引值"-3"表示从"f"这行往上数第3个顶点，就是"v -0.500000 0.000000 -0.800000"，其它的索引值以此类推。 因此与这一行等效的正值索引写法为："f 1 2 3 4"  (聂小涛)

* 花了一天的时间研究有时候WebGL渲染出错的问题(提供一个obj文件，渲染出一团糟的结果)：经过研究，发现目前使用我写的obj读取代码，如果文件稍微大(基本超过5MB就会出错了)就会出错(firefox\chrome)，但是文件在1MB以下或者1-2MB都没有问题，当然，这可能应该是代码的问题，稍微大一点的模型理论上应该还是可以渲染的(虽然点数有点多，大概有几十万个点)。也希望大家可以帮忙看一下我的代码，一起找一下问题.(聂小涛)

### 整体结构设计

自己简单的梳理了一下WebGL这块的整体结构设计，下图绿色代表异步，蓝色代表单独的文件模块，黄色代表控制数据流：(聂小涛)

![](./temp_nxt/images/jiagou.jpeg)

