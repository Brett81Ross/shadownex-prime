import {readdir,readFile} from 'node:fs/promises';import {join,extname} from 'node:path';import {spawnSync} from 'node:child_process';
import {TrailStore} from '../src/core/trails.js';import {correlateContacts} from '../src/core/contactCorrelation.js';import {polygonAreaKm2,polylineKm} from '../src/core/geo.js';
const root=new URL('..',import.meta.url);const rootPath=decodeURIComponent(root.pathname);let pass=0,fail=0;const check=(ok,msg)=>{if(ok){console.log('вњ“',msg);pass++;}else{console.error('вњ—',msg);fail++;}};
const pkg=JSON.parse(await readFile(new URL('../package.json',import.meta.url),'utf8'));check(pkg.version==='2.2.1','version is 2.2.1');check(pkg.engines?.node==='>=22 <23','Node engine targets 22.x');check(Object.keys(pkg.dependencies||{}).length===0&&Object.keys(pkg.devDependencies||{}).length===0,'no npm dependencies');
const files=await walk(rootPath);const textFiles=files.filter(f=>['.js','.mjs','.html','.css','.md','.txt','.json'].includes(extname(f)));let corpus='';for(const f of textFiles)corpus+='\n'+await readFile(f,'utf8');
const retired=[String.fromCharCode(103,111,100,115,32,101,121,101),String.fromCharCode(103,101,116,45),String.fromCharCode(98,105,108,97,119,97,108,32,115,105,100,104,117)];check(retired.every(x=>!corpus.toLowerCase().includes(x)),'no retired brand or author seams');const executable=await Promise.all(files.filter(f=>['.js','.mjs','.html'].includes(extname(f))).map(f=>readFile(f,'utf8')));check(!/navigator\.serviceWorker|serviceWorker\.register|new\s+ServiceWorker/i.test(executable.join('\n')),'no service worker registration code');const oldLicense=String.fromCharCode(77,73,84);check(!corpus.split(/\W+/).includes(oldLicense),'no retired app-level license notice in the clean tree');check(/All Rights Reserved/.test(corpus),'proprietary ownership notice present');check(/THIRD_PARTY_NOTICES/.test(corpus),'third-party notices documented');
const js=files.filter(f=>['.js','.mjs'].includes(extname(f)));let syntax=true;for(const f of js){const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});if(r.status!==0){syntax=false;console.error(r.stderr);break;}}check(syntax,`${js.length} JS/MJS files pass syntax checks`);
check(files.some(f=>f.endsWith('/src/core/qr.js')),'original ShadowNex QR encoder present');check(files.some(f=>f.endsWith('/src/core/orbiљњЙКJK	Ъ[™\[™[ќЬљ][љ\ЭX[›ЬYШ]Ь€™\Щ[ќ	КNШЪXЪКљ[\ЛњЫЫYJЏO™‹™[™ХЪ]
	ЛШ\KШњљYYљ[™ЛљњЙКJK	ЬЩ\ќ™\‹[Ы›H™^ЫЫ[X[™њљYYљ[™И[™Ъ[ќ™\Щ[ќ	КNШЪXЪКљ[\ЛњЫЫYJЏO™‹™[™ХЪ]
	ЛШ\KШ›Э[™\ћKљњЙКJK	ЬЩ\ќ™\‹\ЪYH›Э[™\ћH™\ЫЫ™\€™\Щ[ќ	КNШЪXЪКљ[\ЛњЫЫYJЏO™‹™[™ХЪ]
	ЛШ\KШШЭ‹љњЙКJK	ЬЩ\ќ™\‹\ЪYH][K\ЫЭ\ЩHРХ€›Ь›X[^™\€™\Щ[ќ	КNШЪXЪКљ[\ЛњЫЫYJЏO™‹™[™ХЪ]
	ЛЬЬЛЫ^Y\њЛФЭXњЩXS^Y\‹љњЙКJK	ЩYXШ]YФУHЭXњЩXHШX›H^Y\€™\Щ[ќ	КNШЪXЪКљ[\ЛњЫЫYJЏO™‹™[™ХЪ]
	ЛЬЬЛЩЫШ™KР[››Э][ЫђЫЫќ›Ы\‹љњЙКJK	Ъ[™\[™[ќ™^]ИЫЫќ›Ы\€™\Щ[ќ	КNШЪXЪКљ[\ЛњЫЫYJЏO™‹™[™ХЪ]
	ЛЬЬЛЩЫШ™KФШЩ[™Q\™XЭЬ‹љњЙКJK	Ъ[™\[™[ќШЩ[™Q\™XЭЬ€™\Щ[ќ	КNВЫЫњЭ\ЩS^Y\ЏX]ШZ]™XYљ[J™]ИT“
	Л‹‹ЬЬЛЫ^Y\њЛР\ЩS^Y\‹љњЙЛ[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪК\ЩS^Y\‹љ[ЫY\К	Э\Лњ™Yњ™\Ъ[™ЙКI‰\ЩS^Y\‹љ[ЫY\К	ЩШЭ[Y[ќљY[‰КK	Ы^Y\€™Yњ™\Ъ\И\™H›Ы‹[Э™\›\[™И[™XЪЩЬ›Э[™X]Ш\™IКNШЫЫњЭZ\ЬYќX]ШZ]™XYљ[J™]ИT“
	Л‹‹ЬЬЛЫ^Y\њЛРZ\ЬYќ^Y\‹љњЙЛ[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪКZ\ЬYќљ[ЫY\К	Щ[™›ЬЩPШ\
[Z]ЩY[ЉIКI‰Z\ЬYќљ[ЫY\К	Щ[њЪ]S[Z]
MЌЊ
IКK	ШZ\ЬYќ™[™\љ[™И\ИH\™[Шљ[K\ШY™H[ќ]HШ\	КNШЫЫњЭЫШ™OX]ШZ]™XYљ[J™]ИT“
	Л‹‹ЬЬЛЩЫШ™KСЫШ™PЫЫќ›Ы\‹љњЙЛ[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪКЫШ™Kљ[ЫY\К	Ь™\]Y\Э™[™\“[ЩNќќYIКI‰™ЫШ™Kљ[ЫY\К	Ь™\ЫЫ][Ы”ШШ[OKЌМ‰КK	ЩЫШ™H\Щ\ИЫ‹Y[X[™™[™\љ[™И[™[Шљ[H™\ЫЫ][Ы€ШШ[[™ЙКNВЫЫњЭ[X]ШZ]™XYљ[J™]ИT“
	Л‹‹Ъ[™^љ[	Л[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪКЙЬ›Э]Pќ‰Л	Ш\™XPќ‰Л	ЫYX\Э\™Pќ‰Л	Щљ[љ\Ъ[››Рќ‰Л	ЫЬљ]ШЩ[™Pќ‰Л	ЭЫЬ›ШЩ[™Pќ‰Л	Ь›Э]TШЩ[™Pќ‰Л	ШЫШЪЬ]Э™\›^IЛ	ЭЩ[ЫЫYQX[ЩЙЛ	Ы[Ь™S^Y\“\Э	Л	ЬЭXљ[]P[›™\‰Л	ЬШЫЬPЫЬЩPќ‰ЧK™]™\ћJYOљ[љ[ЫY\КYH‰ЪYH
JK	ШЫЬ™KY[ЩYЫ›Ш\™[™ЛЭXљ[]K[™ЫЫќXЭXЫЬЩHЫЫќ›ЫИ\™H™\Щ[ќ	КNШЪXЪК[љ[ЫY\К	УPTQСS‘	КI‰љ[љ[ЫY\К	СЩ]HЫUЫHЩ^IКI‰љ[љ[ЫY\К	СЩ][€RTФЭ™X[HЩ^IКK	ЫYЩ[™[™TKZЩ^HЭZY[ЩH\™H™\Щ[ќ	КNШЪXЪКЫШ™Kљ[ЫY\К	Щ[ЩHYЉ\ЛњЩ[XЭY
]\ЛЫX\”Щ[XЭ[ЫЉ
IКI‰™ЫШ™Kљ[ЫY\К	Э\Л™\Ь]Ъ›ЫЭК
IКK	Щ[\KYЫШ™HЫXЪИЫX\њИЫЫќXЭЩ[XЭ[Ы€[™›ЫЭИRIКNШЫЫњЭ\^X]ШZ]™XYљ[J™]ИT“
	Л‹‹ЬЬЛШ\љњЙЛ[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪК\^љ[ЫY\К	ТСVH‘TURT‘Q	КI‰\^љ[ЫY\К™љYOOIЭ™\ЬЩ[ЙЙ‰€]\ЛњЩ][™ЬЛZ\ТЩ^HЉK	ЪЩ^KYШ]Y^Y\њИY™\ќ\ЩH™\]Z\™[Y[ќИ™Y›Ь™HXЭ]][Ы‰КNШЫЫњЭ™\ЬЩ[^X]ШZ]™XYљ[J™]ИT“
	Л‹‹ЬЬЛЫ^Y\њЛХ™\ЬЩ[^Y\‹љњЙЛ[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪК™\ЬЩ[^љ[ЫY\К	Э\Л™[X›YY[ЩIКI‰ќ™\ЬЩ[^љ[ЫY\К	РRTФЭ™X[HЩ^H™\]Z\™Y	КK	Э™\ЬЩ[^Y\€Э^\И\ШX›YЪ[€]ИЩ^H\ИZ\ЬЪ[™ЙКNВЫЫњЭZ[П[™]ИZ[ЭЬ™JЫX^Ъ[ќОЊЛX^YЩS\ОЊLZ[“[Э™RЫNЊJNЭZ[Лњ\Ъ
	ШIЛЫ]ЊЫЋЊKJNЭZ[Лњ\Ъ
	ШIЛЫ]ЊЫЋЊ_KЉNЭZ[Лњ\Ъ
	ШIЛЫ]ЊЫЋЊџKКNЭZ[Лњ\Ъ
	ШIЛЫ]ЊЫЋЊЯK
NШЪXЪКZ[Л™Щ]
	ШIЛ
K›[™ЭOOLЙ‰ќZ[Л™Щ]
	ШIЛ
VМK›ЫЏOOLK	ХZ[ЭЬ™H›Э[™И[Эљ[™ЛXЫЫќXЭ\ЭЬћIКNВЫЫњЭ^Y\њПVЮЪY‰ШZ\ЬYќ	Л[X›YќќYK[ќ]Y\О–ЮЬ›Ь\ќY\ОћЬЫћY]NћЭ\N‰РRTђФђQ•	ЛY‰Ш‰Л[YN‰Р‰Л]]YNЊЫ™Ъ]YNЊ___W_KЪY‰Щљ\™\ЙЛ[X›YќќYK[ќ]Y\О–ЮЬ›Ь\ќY\ОћЬЫћY]NћЭ\N‰С’T‘IЛY‰Щ‰Л[YN‰С‰Л]]YNЊЫ™Ъ]YN‹Ќ___W_WNШЫЫњЭ]ПXЫЬњ™[]PЫЫќXЭКЭ\N‰РRTђФђQ•	ЛY‰ШIЛ]]YNЊЫ™Ъ]YNЊK^Y\њЛЬY]\ТЫNЊЊ[Z]Ќ_JNШЪXЪК]Л›[™ЭOOL‰‰љ]ЦМK›Y]Kќ\OOOIС’T‘IЙ‰љ]ЦМK™\Э[ЩRЫO]ЦМWK™\Э[ЩRЫK	Фљ[YPЫЬњ™[]H[љЬИ™X\ћHЬ›ЬЬЛY™YYЫЫќXЭЙКNВЪXЪКX]XњКЫ[[™RЫJЮЫ]ЊЫЋЊKЫ]ЊЫЋЊ_WJKLLLKЊЉOK	У™^]И\Э[ЩHX]\ИШ[™IКNШЪXЪКЫYЫЫђ\™XRЫLЉЮЫ]ЊЫЋЊKЫ]ЊЫЋЊ_KЫ]ЊKЫЋЊ_KЫ]ЊKЫЋЊWJOЊLЊ	У™^]ИЫYЫЫ‹X\™XHX]\ИШ[™IКNВЫЫњЭШЩ[™OX]ШZ]™XYљ[J™]ИT“
	Л‹‹ЬЬЛЩЫШ™KФШЩ[™Q\™XЭЬ‹љњЙЛ[\Ьќ›Y]Kќ\›
K	Э]Ћ	КNШЪXЪКШЩ[™Kљ[ЫY\К	Ф‘PУУ”Х•PХQTХSPUH8 %“ХU‘HSSQU–IКI‰њШЩ[™Kљ[ЫY\К	Ы][Ъ™XЫЫњЭќXЭ[Ы‰КK	Ы][Ъ™XЫЫњЭќXЭ[Ы€\И^XЪ]X›Э]\Э[X]K[Ы›HЭ]\ЙКNВЫЫњЭШЭЏX]ШZ][ШЪРШЭЉ
NШЪXЪКШЭ‹њЭ]\ПOOLЊ	‰ШЭ‹›ЩKњЪ[ќЛ›[™ЭOOLЙ‰›™]ИЩ]
ШЭ‹›ЩKњЪ[ќЛ›X\
OћњЫЭ\ЩJJKњЪ^™OOOLЛ	РРХ€›Ь›X[^™\€Y\™Щ\И™YHX›XЛ\ЫЭ\ЩHЪ\\ЙКNВЫЫњЫЫK›ЩК”PN€	Ь\ЬЯH\ЬЩY	ЩZ[HZ[Y
NЬ›ШЩ\ЬЛ™^]ЫЩOYZ[МNЊВ\Ю[Иќ[Э[Ы€[ШЪРШЭЉ
^ШЫЫњЭЫYЫШ[\Л™™]ЪЩЫШ[\Л™™]ЪX\Ю[И[њ]OћШЫЫњЭOTЭљ[™К[њ]
NЪYЉKљ[ЫY\К	Ш\Kќ›™ЫЭ‹ќZЙКJ\™]\›€ЪКЮЪY‰ЭIЛЫЫ[[Ы“[YN‰УЫ™Ы‰Л]ЌLKЌKЫЋ‹KЊKY][Ы[›Ь\ќY\О–ЮЪЩ^N‰Ш]Z[X›IЛ[YN‰ЭќYIЯW_WJNЪYЉKљ[ЫY\К	ШШ[[њЛYЪ\ЙКJ\™]\›€ЪКЩ™X]\™\О–ЮЩЩ[ЫY]ћNћШЫЫЬ™[]\О–ЛLLЊKНЧ_K›Ь\ќY\ОћУР’‘PХQЌЛШШ][Ы“[YN‰РРHШ[IЛЫ™Ъ]YN‹LLЊK]]YNЊНЛ[”Щ\ќљXЩN‰ЭќYIЯ_W_JNЪYЉKљ[ЫY\К	Ш]\Э[ќ^\ЙКJ\™]\›€ЪКЩ™X]\™\О–ЮЪY‰ШLIЛЩ[ЫY]ћNћШЫЫЬ™[]\О–ЛNMЛЌЛМЊ—_K›Ь\ќY\ОћШШ[Y\WЪY‰РLIЛШШ][Ы—Ы[YN‰Р]\Э[€Ш[IЛШ[Y\WЬЭ]\О‰ХT“‘QУУ‰Я_W_JNЭ›ЭИ™]И\њ›ЬЉ	Э[™^XЭY[ШЪИT“	КЭJ_NЭћ^ШЫЫњЭЩY][љ[™\џOX]ШZ][\Ьќ
	Л‹‹Ш\KШШЭ‹љњПЬXOIКС]K››ЭК
JNЫ]Э]\ПLЊ›ЩO[ќ[ШЫЫњЭ™\П^ЬЭ]\КЉ^ЬЭ]\П[ЋЬ™]\›€\ЯKњЫЫЉК^Ш›ЩO[ОЬ™]\›€Я_NШ]ШZ][™\ЉЫY]Щ‰ССU	Л\›‰ЛШ\KШШЭ‰ЯK™\КNЬ™]\›€ЬЭ]\Л›Щ_NЯYљ[[^ЩЫШ[\Л™™]Ъ[Ы_B™ќ[Э[Ы€ЪК]J^Ь™]\›€ЫЪОќќYKЭ]\ОЊЊњЫЫЋ\Ю[К
OO™]__B\Ю[Иќ[Э[Ы€Ш[К\Љ^ШЫЫњЭЭ]VЧNЩ›ЬЉЫЫњЭHЩ€]ШZ]™XY\Љ\‹ЭЪ]љ[U\\ОќќY_JJ^ЪYЉK›[YOOOIЛ™Ъ]	ЯK›[YOOOIЫ›ЩWЫ[Щ[\ЙКXЫЫќ[ќYNШЫЫњЭZ›Ъ[Љ\‹K›[YJNЪYЉKљ\С\™XЭЬћJ
J[Э]њ\Ъ
‹‹]ШZ]Ш[К
JNЩ[ЩHЭ]њ\Ъ

NЯ\™]\›€Э]ЯB