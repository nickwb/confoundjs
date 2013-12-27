# confoundjs
An experiment in JavaScript obfuscation.

**confoundjs** is a JavaScript obfuscator inspired largely by [jsfuck](http://www.jsfuck.com/) [[GitHub](https://github.com/aemkei/jsfuck)].
**jsfuck**, whilst delivering on raw confusion/obfuscation, suffers from a catastrophically high encoding overhead.
**confoundjs** attempts to create a similarly confounding output, but with a much more reasonable overhead.

#### In short
`alert('Hello World');`

*becomes*

```
(function(ʃ){ʃ[+!+[]+!+[]+!+[]+!+[]]=function(ѥ,Չ,ᴤ,ӣ,Ɣ,ϟ,ͽ,Δ,ᵷ){for(ᴤ=+!!ѥ,Δ=[]+[],ᵷ=ѥ[+![]];
ᴤ<ѥ[ʃ[+!+[]+!+[]]];ᴤ++){ͽ=ϟ=ѥ[ᴤ];ϟ=ϟ^Չ;Ɣ=(ᴤ-ѥ[ʃ[+!+[]+!+[]]]==+!ѥ)?ᵷ:(+!+[]+!+[]+!+[]);for(ӣ=+
!Չ;ӣ<Ɣ;ӣ++){Δ+=ʃ[+[]](ϟ&(((!+[]+!+[])<<((!+[]+!+[]+!+[])<<!+[]))-!+[]));ϟ=ϟ>>(([+!+[]]+[+[]])-
(!+[]+!+[]+!+[]));}Չ=(ͽ>>(+!+[]+!+[]+!+[]))^Չ}([][([]+{})[+!+[]+!+[]+!+[]]+([]+{})[+!+[]]+([][
![]]+[])[([+!+[]]+[+[]])>>!+[]]+([][![]]+[])[+!+[]]][ʃ[(!+[]+!+[]+!+[])<<!+[]]])(ᵷ==ѥ[+![]]?Δ:
Չ)();ѥ=![]};ʃ[([+!+[]]+[+[]])>>!+[]]=([+!+[]+!+[]]+[+!+[]+!+[]+!+[]]+[+[]]+[+!+[]]+[+[]]+[([+!
+[]]+[+[]])>>!+[]]+[(!+[]+!+[]+!+[])<<!+[]])>>(!+[]+!+[]);ʃ[(!+[]+!+[]+!+[])<<!+[]]=([]+{})[([
+!+[]]+[+[]])>>!+[]]+([]+{})[+!+[]]+([][![]]+[])[+!+[]]+(!{}+{})[+!+[]+!+[]+!+[]]+(!!{}+{})[+[
]]+(!!{}+{})[+!+[]]+([][![]]+[])[+[]]+([]+{})[([+!+[]]+[+[]])>>!+[]]+(!!{}+{})[+[]]+([]+{})[+!
+[]]+(!!{}+{})[+!+[]];ʃ[([+!+[]]+[+[]])-(!+[]+!+[]+!+[])]=[+[],([+!+[]]+[+!+[]]+[([+!+[]]+[+[]
])>>!+[]]+[([+!+[]]+[+[]])-!+[]]+[([+!+[]]+[+[]])>>!+[]]+[+[]]+[+[]])-(([+!+[]]+[+!+[]])),+([(
[+!+[]]+[+[]])>>!+[]]+[+!+[]+!+[]]+[+[]]+[([+!+[]]+[+[]])-!+[]]+[+[]]),([+!+[]+!+[]]+[+[]]+[+[
]]+[+!+[]]+[([+!+[]]+[+[]])-(!+[]+!+[]+!+[])])<<((!+[]+!+[]+!+[])<<!+[]),([+!+[]]+[+!+[]+!+[]+
!+[]+!+[]]+[+[]]+[+!+[]]+[+!+[]]+[+[]]+[+!+[]+!+[]+!+[]+!+[]]+[+!+[]])/(([+!+[]]+[+!+[]])),([+
!+[]]+[+!+[]]+[+!+[]+!+[]]+[+!+[]+!+[]]+[+!+[]+!+[]]+[+!+[]+!+[]+!+[]+!+[]]+[+[]])-!+[],((!+[]
+!+[]+!+[])<<!+[])*(([+!+[]]+[([+!+[]]+[+[]])-!+[]]+[([+!+[]]+[+[]])>>!+[]]+[+!+[]+!+[]+!+[]]+
[+!+[]]+[+!+[]])),([+!+[]]+[+!+[]+!+[]+!+[]]+[([+!+[]]+[+[]])-!+[]]+[+!+[]]+[([+!+[]]+[+[]])-!
+[]]+[([+!+[]]+[+[]])-(!+[]+!+[])])<<!+[]];ʃ[([+!+[]]+[+[]])-!+[]]=function(){ʃ[+!+[]]=(!!{}+{
})[+[]]+([]+{})[+!+[]]+(((+![])+([]+[])[ʃ[(!+[]+!+[]+!+[])<<!+[]]])[(!{}+{})[+!+[]+!+[]+!+[]]+
([][![]]+[])[+[]]+([]+{})[+!+[]+!+[]]+(!{}+{})[+!+[]+!+[]+!+[]]+(!!{}+{})[+[]]+(!!{}+{})[+!+[]
]](+([+!+[]]+[+[]]),(!+[]+!+[]+!+[])<<!+[]));ʃ[([+!+[]]+[+[]])-(!+[]+!+[])]=((!+[]<<(!+[]+!+[]
+!+[]+!+[]))+!+[])[ʃ[+!+[]]]((([+!+[]]+[+[]])-!+[])<<!+[]);ʃ[+!+[]+!+[]+!+[]]=(([+!+[]]+[+!+[]
])<<!+[])[ʃ[+!+[]]]((([+!+[]]+[+!+[]])<<!+[])+!+[]);ʃ[+!+[]+!+[]]=(!{}+{})[+!+[]+!+[]]+(!!{}+{
})[+!+[]+!+[]+!+[]]+([][![]]+[])[+!+[]]+(ʃ[+!+[]])[([+!+[]]+[+[]])-(!+[]+!+[]+!+[])]+(!!{}+{})
[+[]]+(ʃ[([+!+[]]+[+[]])-(!+[]+!+[])]);ʃ[+[]]=([]+[])[ʃ[(!+[]+!+[]+!+[])<<!+[]]][(!{}+{})[+[]]
+(!!{}+{})[+!+[]]+([]+{})[+!+[]]+(ʃ[+!+[]+!+[]+!+[]])+'C'+(ʃ[([+!+[]]+[+[]])-(!+[]+!+[])])+(!{
}+{})[+!+[]]+(!!{}+{})[+!+[]]+'C'+([]+{})[+!+[]]+([][![]]+[])[+!+[]+!+[]]+(!!{}+{})[+!+[]+!+[]
+!+[]]];ʃ[+!+[]+!+[]+!+[]+!+[]](ʃ[([+!+[]]+[+[]])-(!+[]+!+[]+!+[])],ʃ[([+!+[]]+[+[]])>>!+[]])}
;ʃ[([+!+[]]+[+[]])-!+[]]()})({});
```

### Side-by-side with jsfuck
+ **Mission Statement**
  + *jsfuck* aims to encode any possible JavaScript program using only 6 characters: `[]()!+`.
  + *confoundjs* loosens these restrictions in order to deliver a more efficient output. 

+ **Encoding Overhead**
  + *jsfuck* requires around **800** characters to encode an empty payload. Additionally, each character in the payload requires around **1700** characters to encode, though this varies dramatically depending on the specific characters in your payload.
  + *confoundjs* requires around **1900** characters to encode an empty payload. Additionally, each character in the payload requires around **40** characters to encode.
  
+ **Basic Construction**
  + *jsfuck* represents and evaluates the payload in one (very long) expression. The payload is constructed by string concatenation, character-by-character, with each character encoded individually using a *jsfuck* determined sub-expression.
  + *confoundjs* packs and encrypts the payload, and then builds an efficient representation of the packed payload. The output from *confoundjs* is bundled with a runtime unpacker/decrypter, which is responsible for extracting and evaluating the payload.

+ **Evaluation Speed**
  + *jsfuck* is stateless, and will evaluate identical sub-expressions tens, hundreds or thousands of times.
  + *confoundjs* makes good use of state in order to generate outputs which are both efficient in size and in evaluation speed. Re-usable expressions which are expensive to encode are evaluated once and then stored for re-use. The cost to evaluate each packed block in the payload is small and fairly close to being constant.

+ **Encoding Speed**
  + *jsfuck* tends to be a faster encoder for smaller outputs. Larger outputs have a high string manipulation cost and can take quite some time to complete.
  + *confoundjs* is slower for smaller inputs, but scales linearly with payload size. The encoder must also perform a (relatively expensive) initialisation routine. This initialisation does not need to be repeated if multiple encodings are performed in one session.