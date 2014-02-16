# confoundjs
An experiment in JavaScript obfuscation.

**confoundjs** is a JavaScript obfuscator inspired largely by [jsfuck](http://www.jsfuck.com/) [[GitHub](https://github.com/aemkei/jsfuck)].
**jsfuck**, whilst delivering on raw confusion/obfuscation, suffers from a catastrophically high encoding overhead.
**confoundjs** attempts to create a similarly confounding output, but with a much more reasonable overhead.

### A simple example
**confoundjs** is an obfuscator with a lot of options. These options allow the user to choose the balance between the strength of the obfuscation and the size of the output. It will generate wildly different output based on the options you select, so consequently it's somewhat misleading to convey **confoundjs** in just a single example. The author encourages you to explore the options available.

*Input*

`alert('Hello World');`

*Output*

```
var a=this,b=[(!{}+{})[+!+[]]+(!{}+{})[+!+[]+!+[]]+(!!{}+{})[+!+[]+!+[]+!+[]]+(
!!{}+{})[+!+[]]+(!!{}+{})[+[]],'H'+(!!{}+{})[+!+[]+!+[]+!+[]]+(!{}+{})[+!+[]+!+
[]]+(!{}+{})[+!+[]+!+[]]+([]+{})[+!+[]]+([]+{})[([+!+[]]+[+[]])-(!+[]+!+[]+!+[]
)]+'W'+([]+{})[+!+[]]+(!!{}+{})[+!+[]]+(!{}+{})[+!+[]+!+[]]+([][![]]+[])[+!+[]+!
+[]]];a[b[+[]]](b[+!+[]]);
```

### A note of caution

**confoundjs is a toy.** Please evaluate it carefully before using it in a real, production system.
As with all JavaScript obfuscation, **confoundjs** will not prevent skilled reverse-engineers from obtaining your code.

  
### How does it work?
**confoundjs** is an obfuscator with two main phases. The **source transformer** and the **runtime decoder**.

The *source transformer* will parse the input code and modify it using a series of transformations. These transformations will obscure and re-arrange portions of your code, but without changing its behaviour.

The *runtime decoder* packs and encodes its input, then combines it with the logic necessary to unpack and execute it at runtime. This phase will hide all of the control flow and logic of your program. Be aware that this phase is lossless - if the source transformer has been disabled then your complete/unmodified program can be extracted after it is unpacked.

### Acknowledgements
**confoundjs** is built using the following excellent libraries:
+ [UglifyJS2](https://github.com/mishoo/UglifyJS2) by the wonderful [@mishoo](https://github.com/mishoo)
+ [promise](https://github.com/then/promise) by the wonderful [@ForbesLindesay](https://github.com/ForbesLindesay)