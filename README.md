# confoundjs
An experiment in JavaScript obfuscation.

**confoundjs** is a JavaScript obfuscator inspired largely by [jsfuck](http://www.jsfuck.com/) [[GitHub](https://github.com/aemkei/jsfuck)].
**jsfuck**, whilst delivering on raw confusion/obfuscation, suffers from a catastrophically high encoding overhead.
**confoundjs** attempts to create a similarly confounding output, but with a much more reasonable overhead.

#### In short
`alert('Hello World');`

*becomes*

```
(function(ʃ){ʃ[+[]]=([]+{})[([+!+[]]+[+[]])>>!+[]]+([]+{})[+!+[]]+([][![]]+[])[+!+[]]+(!{
}+{})[+!+[]+!+[]+!+[]]+(!!{}+{})[+[]]+(!!{}+{})[+!+[]]+([][![]]+[])[+[]]+([]+{})[([+!+[]]
+[+[]])>>!+[]]+(!!{}+{})[+[]]+([]+{})[+!+[]]+(!!{}+{})[+!+[]];ʃ[+!+[]+!+[]]=([+!+[]]+[+!+
[]+!+[]+!+[]+!+[]]+[([+!+[]]+[+[]])-!+[]]+[+!+[]]+[+!+[]+!+[]]+[+[]]+[+[]])-(!+[]<<(!+[]+
!+[]+!+[]+!+[]));ʃ[+!+[]+!+[]+!+[]]=function(){ʃ[+!+[]+!+[]+!+[]+!+[]]=(!!{}+{})[+[]]+([]
+{})[+!+[]]+(((+![])+([]+[])[ʃ[+[]]])[(!{}+{})[+!+[]+!+[]+!+[]]+([][![]]+[])[+[]]+([]+{})
[+!+[]+!+[]]+(!{}+{})[+!+[]+!+[]+!+[]]+(!!{}+{})[+[]]+(!!{}+{})[+!+[]]](+([+!+[]]+[+[]]),
(!+[]+!+[]+!+[])<<!+[]));ʃ[([+!+[]]+[+[]])-(!+[]+!+[])]=((!+[]<<(!+[]+!+[]+!+[]+!+[]))+!+
[])[ʃ[+!+[]+!+[]+!+[]+!+[]]]((([+!+[]]+[+[]])-!+[])<<!+[]);ʃ[([+!+[]]+[+[]])-(!+[]+!+[]+!
+[])]=(([+!+[]]+[+!+[]])<<!+[])[ʃ[+!+[]+!+[]+!+[]+!+[]]]((([+!+[]]+[+!+[]])<<!+[])+!+[]);
ʃ[([+!+[]]+[+[]])-!+[]]=(!{}+{})[+!+[]+!+[]]+(!!{}+{})[+!+[]+!+[]+!+[]]+([][![]]+[])[+!+[
]]+(ʃ[+!+[]+!+[]+!+[]+!+[]])[([+!+[]]+[+[]])-(!+[]+!+[]+!+[])]+(!!{}+{})[+[]]+(ʃ[([+!+[]]
+[+[]])-(!+[]+!+[])]);ʃ[+!+[]]=([]+[])[ʃ[+[]]][(!{}+{})[+[]]+(!!{}+{})[+!+[]]+([]+{})[+!+
[]]+(ʃ[([+!+[]]+[+[]])-(!+[]+!+[]+!+[])])+'C'+(ʃ[([+!+[]]+[+[]])-(!+[]+!+[])])+(!{}+{})[+
!+[]]+(!!{}+{})[+!+[]]+'C'+([]+{})[+!+[]]+([][![]]+[])[+!+[]+!+[]]+(!!{}+{})[+!+[]+!+[]+!
+[]]];ʃ[([+!+[]]+[+[]])>>!+[]](ʃ[(!+[]+!+[]+!+[])<<!+[]],ʃ[+!+[]+!+[]])};ʃ[([+!+[]]+[+[]]
)>>!+[]]=function(ᵷ,ʭ,ѥ,Ɣ,ӣ,ͽ,ϟ,Δ,ᴤ){for(ѥ=+!!ᵷ,Δ=[]+[],ᴤ=ᵷ[+![]];ѥ<ᵷ[ʃ[([+!+[]]+[+[]])-!
+[]]];ѥ++){ϟ=ͽ=ᵷ[ѥ];ͽ=ͽ^ʭ;ӣ=(ѥ-ᵷ[ʃ[([+!+[]]+[+[]])-!+[]]]==+!ᵷ)?ᴤ:(+!+[]+!+[]+!+[]);for(Ɣ
=+!ʭ;Ɣ<ӣ;Ɣ++){Δ+=ʃ[+!+[]]((ͽ&(((!+[]+!+[])<<((!+[]+!+[]+!+[])<<!+[]))-!+[]))+(!+[]<<(([+!
+[]]+[+[]])>>!+[])));ͽ=ͽ>>(([+!+[]]+[+[]])-(!+[]+!+[]+!+[]));}ʭ=(ϟ>>(+!+[]+!+[]+!+[]))^ʭ}
([][([]+{})[+!+[]+!+[]+!+[]]+([]+{})[+!+[]]+([][![]]+[])[([+!+[]]+[+[]])>>!+[]]+([][![]]+
[])[+!+[]]][ʃ[+[]]])(ᴤ==ᵷ[+![]]?Δ:ʭ)();ᵷ=![]};ʃ[(!+[]+!+[]+!+[])<<!+[]]=[+[],([+!+[]+!+[]
+!+[]+!+[]]+[+[]]+[+!+[]]+[+!+[]]+[+!+[]+!+[]+!+[]+!+[]]+[+[]]+[+[]])>>(!+[]+!+[]+!+[]),+
([+!+[]]+[+!+[]+!+[]+!+[]]+[+!+[]]+[([+!+[]]+[+[]])-(!+[]+!+[])]+[([+!+[]]+[+[]])>>!+[]]+
[+!+[]]+[(!+[]+!+[]+!+[])<<!+[]]),+([+!+[]+!+[]+!+[]]+[([+!+[]]+[+[]])-(!+[]+!+[])]+[(!+[
]+!+[]+!+[])<<!+[]]+[+[]]+[+!+[]+!+[]+!+[]]+[+!+[]]),+([([+!+[]]+[+[]])>>!+[]]+[+!+[]]+[(
[+!+[]]+[+[]])-!+[]]+[(!+[]+!+[]+!+[])<<!+[]]+[+!+[]+!+[]+!+[]+!+[]]+[+!+[]]),([+!+[]+!+[
]]+[+!+[]+!+[]+!+[]]+[([+!+[]]+[+[]])>>!+[]]+[+!+[]+!+[]]+[+!+[]+!+[]]+[+!+[]+!+[]+!+[]])
<<!+[],([+!+[]+!+[]+!+[]]+[+!+[]+!+[]+!+[]+!+[]]+[+!+[]]+[+!+[]+!+[]+!+[]+!+[]]+[([+!+[]]
+[+[]])>>!+[]]+[+[]])-!+[],+([+!+[]]+[+!+[]+!+[]]+[+[]]+[([+!+[]]+[+[]])-(!+[]+!+[])]+[([
+!+[]]+[+[]])-(!+[]+!+[]+!+[])]+[+!+[]+!+[]+!+[]+!+[]]+[+!+[]])];ʃ[+!+[]+!+[]+!+[]]()})({
});
```

### Side-by-side with jsfuck
+ **Mission Statement**
  + *jsfuck* aims to encode any possible JavaScript program using only 6 characters: `[]()!+`.
  + *confoundjs* loosens these restrictions in order to deliver a more efficient output. 

+ **Encoding Overhead**
  + *jsfuck* requires around **1000** characters to encode an empty payload. Additionally, each character in the payload requires around **1700** characters to encode.
  + *confoundjs* requires around **2100** characters to encode an empty payload. Additionally, each character in the payload requires around **36** characters to encode.
  
+ **Basic Construction**
  + *jsfuck* represents and evaluates the payload in one (very long) expression. The payload is constructed by string concatenation, character-by-character, with each character encoded individually using a *jsfuck* determined sub-expression.
  + *confoundjs* packs and encrypts the payload, and then builds an efficient representation of the packed payload. The output from *confoundjs* is bundled with a runtime unpacker/decrypter, which is responsible for extracting and evaluating the payload.

+ **Evaluation Speed**
  + *jsfuck* is stateless, and will evaluate identical sub-expressions tens, hundreds or thousands of times.
  + *confoundjs* makes good use of state in order to generate outputs which are both efficient in size and in evaluation speed. Re-usable expressions which are expensive to encode are evaluated once and then stored for re-use. The cost to evaluate each packed block in the payload is small and fairly close to being constant.

+ **Encoding Speed**
  + *jsfuck* tends to be a faster encoder for smaller outputs. Larger outputs have a high string manipulation cost and can take quite some time to complete.
  + *confoundjs* is slower for smaller inputs, but scales linearly with payload size. The encoder must also perform a (relatively expensive) initialisation routine. This initialisation does not need to be repeated if multiple encodings are performed in one session.