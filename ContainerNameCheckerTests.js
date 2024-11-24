import { CheckContainerName } from "./ContainerNameChecker.js";

console.log('Test 1 (regular, only letters): "Walmart"')
console.assert(CheckContainerName("Walmart") === true);

console.log('Test 2 (regular, valid chars): "DWw?J5-+AjY6EZg2S6@_GdinA]?.RZ0,te2S#hqj,D![FDqt8/Zd](!_#2]gAnnyf(97[@xZbXK:]?XgdQ*tDkNtigK12[2MzwP%"')
console.assert(CheckContainerName("DWw?J5-+AjY6EZg2S6@_GdinA]?.RZ0,te2S#hqj,D![FDqt8/Zd](!_#2]gAnnyf(97[@xZbXK:]?XgdQ*tDkNtigK12[2MzwP%") === true);

console.log('Test 3 (empty string): ""')
console.assert(CheckContainerName("") === false);

console.log('Test 4 (begins with space): " Walmart"')
console.assert(CheckContainerName(" Walmart") === false);

console.log('Test 5 (invalid chars): "Wa😊lart"')
console.assert(CheckContainerName("Wa😊lart") === false);

console.log('Test 6 (valid chars but too long): "gBPY_S_U8k1J2zp{4-}VCnV;cX9H_qj?49Sig[[0aX&j&xx_@rEg8:ANhL(,#vP?.}FV#A!VqNpK/hxR9UTpb=.h_u{AnrzW2i,x,Xfu#kgm/qxip/h.c&M+ka}cH?Bb54:bU-+!BZamHkx_.P#8b]/vecjaLPGZ]dQ(%WV/,(U2W+5yif;y]Ff9rWa$zfwr.ShVJ]86hn,T9a?7(])R&;c3?Y7E3Kp*B.5daZ7ku318.bUv,U+=1-L4SP(!)pMx"')
console.assert(CheckContainerName("gBPY_S_U8k1J2zp{4-}VCnV;cX9H_qj?49Sig[[0aX&j&xx_@rEg8:ANhL(,#vP?.}FV#A!VqNpK/hxR9UTpb=.h_u{AnrzW2i,x,Xfu#kgm/qxip/h.c&M+ka}cH?Bb54:bU-+!BZamHkx_.P#8b]/vecjaLPGZ]dQ(%WV/,(U2W+5yif;y]Ff9rWa$zfwr.ShVJ]86hn,T9a?7(])R&;c3?Y7E3Kp*B.5daZ7ku318.bUv,U+=1-L4SP(!)pMx") === false);

console.log('Test 7 (not string): 5')
console.assert(CheckContainerName(5) === false);

console.log('Test 8 (named NAN): "NAN"')
console.assert(CheckContainerName("NAN") === false);

console.log('Test 9 (named UNUSED): "UNUSED"')
console.assert(CheckContainerName("UNUSED") === false);