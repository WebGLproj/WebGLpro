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

* 终于给obj成功贴图...遇到一个大坑：在着色器中如果声明了一个uniform，<u>如果之后没有使用，是取不到的！</u>取到的是null,最终的原因还是因为自己仅仅是声明uniform还没有使用。另外，自己今天又验证了上面的第一点，的确是这样的，这点到底是为什么，自己之后再继续研究。(聂小涛)

* 今天晚上终于解决了困扰这几天的大bug，下午甚至都要悬赏了，没想到晚上有了进展找到了问题所在：  
原问题浮现的场景是这样的：当自己渲染较为复杂的模型的时候，就会出现混乱，且模型越复杂就越混乱，百思不得解，一开始总以为自己的解析函数写错导致的，后来发现真正的原因：    
*数组越界：自己在定义索引这句话`var indices = new Uint16Array(numIndices);`的时候实际上最大只能为65535，所以当自己的模型变大的时候，显然是要多于65535个点的，这个时候就会从0开始进行循环！*    
找到问题后那么试着解决问题，很显然，首先想到把Uint16Array改成Uint32Array，这样能在更广的范围内保证数组不会越界，但是自己又找到：    
>通常 ARRAY_BUFFER 将使用 Float\*Array 而 ELEMENT_ARRAY_BUFFER 必须使用 Uint\*Array。 （请不要直接使用js里面的Array数组， 因为它可能是数据没有对齐的, Array数组中的对象可能有不同的类型） 需要特别注意的是， 就目前来看，WebGL在使用 ELEMENT_ARRAY_BUFFER 时，不得使用精度超过 Uint16Array。笔者之前习惯性地使用了 Uint32Array，导致Chrome (版本：34.0.1847.131 m) 一直对此报错。而改为 Uint16Array 之后运行正常，希望引起您的注意。（猜测原因可能是WebGL暂时还不能支持太大量的ARRAY_BUFFER数据从而限制了索引大小）    

这实际上证明上面简单粗暴的解决方法是不对的，应该寻找更为有效的解决方案。目前我的方案大概是进行动态循环绑定。之后绘制(经过尝试这个方法是可以解决这个问题的)，现在自己也在构建自己代码的更完善的解决方案。     
如果这个问题顺利解决，那么我现在重写的这个obj loader的js函数库将是目前最为健壮和完善的加载库（three.js除外,思路和依赖不一样，难以进行比较，并且笔者目前还没有对其进行仔细研读)(聂小涛)。
(12.17)这个方案目前已经实现，目前已经更新obj读取函数。

### 整体结构设计

自己简单的梳理了一下WebGL这块的整体结构设计，下图绿色代表异步，蓝色代表单独的文件模块，黄色代表控制数据流：(聂小涛)

![](./temp_nxt/images/jiagou.jpeg)

### 优秀参考资料

OpenGL Array buffer详解：http://webgl-lesson.wysaid.org/Lesson7/index.html

