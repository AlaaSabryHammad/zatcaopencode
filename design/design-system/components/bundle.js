/* @ds-bundle: {"format":4,"namespace":"ZatcaWeb","components":[{"name":"Logo"},{"name":"Icon"},{"name":"Button"},{"name":"Badge"},{"name":"InvoiceStatus"},{"name":"ComplianceStatus"},{"name":"QuoteStatus"},{"name":"Input"},{"name":"Select"},{"name":"Combobox"},{"name":"DatePicker"},{"name":"CurrencyInput"},{"name":"VatInput"},{"name":"PhoneInput"},{"name":"Checkbox"},{"name":"Switch"},{"name":"FileUpload"},{"name":"Card"},{"name":"StatCard"},{"name":"Amount"},{"name":"Table"},{"name":"DataGrid"},{"name":"Chart"},{"name":"Timeline"},{"name":"Avatar"},{"name":"UsageMeter"},{"name":"Alert"},{"name":"Insight"},{"name":"EmptyState"},{"name":"Skeleton"},{"name":"QrPanel"},{"name":"Tabs"},{"name":"SegmentedControl"},{"name":"Breadcrumb"},{"name":"Pagination"},{"name":"Stepper"},{"name":"Accordion"},{"name":"Sidebar"},{"name":"Topbar"},{"name":"OrgSwitcher"},{"name":"AppShell"},{"name":"PageHeader"},{"name":"Dialog"},{"name":"Drawer"},{"name":"DropdownMenu"},{"name":"Tooltip"},{"name":"Toast"},{"name":"CommandMenu"}]} */
/* ZatcaWeb design system bundle. Icons: Lucide (ISC). QR encoder: qrcode-generator by Kazuhiko Arase (MIT). */
(function(){
"use strict";
var QRLIB=(function(){var module,define,exports;var qrcode=function(){var t=function(t,r){var e=t,n=g[r],o=null,i=0,a=null,u=[],f={},c=function(t,r){o=function(t){for(var r=new Array(t),e=0;e<t;e+=1){r[e]=new Array(t);for(var n=0;n<t;n+=1)r[e][n]=null}return r}(i=4*e+17),l(0,0),l(i-7,0),l(0,i-7),s(),h(),d(t,r),e>=7&&v(t),null==a&&(a=p(e,n,u)),w(a,r)},l=function(t,r){for(var e=-1;e<=7;e+=1)if(!(t+e<=-1||i<=t+e))for(var n=-1;n<=7;n+=1)r+n<=-1||i<=r+n||(o[t+e][r+n]=0<=e&&e<=6&&(0==n||6==n)||0<=n&&n<=6&&(0==e||6==e)||2<=e&&e<=4&&2<=n&&n<=4)},h=function(){for(var t=8;t<i-8;t+=1)null==o[t][6]&&(o[t][6]=t%2==0);for(var r=8;r<i-8;r+=1)null==o[6][r]&&(o[6][r]=r%2==0)},s=function(){for(var t=B.getPatternPosition(e),r=0;r<t.length;r+=1)for(var n=0;n<t.length;n+=1){var i=t[r],a=t[n];if(null==o[i][a])for(var u=-2;u<=2;u+=1)for(var f=-2;f<=2;f+=1)o[i+u][a+f]=-2==u||2==u||-2==f||2==f||0==u&&0==f}},v=function(t){for(var r=B.getBCHTypeNumber(e),n=0;n<18;n+=1){var a=!t&&1==(r>>n&1);o[Math.floor(n/3)][n%3+i-8-3]=a}for(n=0;n<18;n+=1){a=!t&&1==(r>>n&1);o[n%3+i-8-3][Math.floor(n/3)]=a}},d=function(t,r){for(var e=n<<3|r,a=B.getBCHTypeInfo(e),u=0;u<15;u+=1){var f=!t&&1==(a>>u&1);u<6?o[u][8]=f:u<8?o[u+1][8]=f:o[i-15+u][8]=f}for(u=0;u<15;u+=1){f=!t&&1==(a>>u&1);u<8?o[8][i-u-1]=f:u<9?o[8][15-u-1+1]=f:o[8][15-u-1]=f}o[i-8][8]=!t},w=function(t,r){for(var e=-1,n=i-1,a=7,u=0,f=B.getMaskFunction(r),c=i-1;c>0;c-=2)for(6==c&&(c-=1);;){for(var g=0;g<2;g+=1)if(null==o[n][c-g]){var l=!1;u<t.length&&(l=1==(t[u]>>>a&1)),f(n,c-g)&&(l=!l),o[n][c-g]=l,-1==(a-=1)&&(u+=1,a=7)}if((n+=e)<0||i<=n){n-=e,e=-e;break}}},p=function(t,r,e){for(var n=A.getRSBlocks(t,r),o=b(),i=0;i<e.length;i+=1){var a=e[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var u=0;for(i=0;i<n.length;i+=1)u+=n[i].dataCount;if(o.getLengthInBits()>8*u)throw"code length overflow. ("+o.getLengthInBits()+">"+8*u+")";for(o.getLengthInBits()+4<=8*u&&o.put(0,4);o.getLengthInBits()%8!=0;)o.putBit(!1);for(;!(o.getLengthInBits()>=8*u||(o.put(236,8),o.getLengthInBits()>=8*u));)o.put(17,8);return function(t,r){for(var e=0,n=0,o=0,i=new Array(r.length),a=new Array(r.length),u=0;u<r.length;u+=1){var f=r[u].dataCount,c=r[u].totalCount-f;n=Math.max(n,f),o=Math.max(o,c),i[u]=new Array(f);for(var g=0;g<i[u].length;g+=1)i[u][g]=255&t.getBuffer()[g+e];e+=f;var l=B.getErrorCorrectPolynomial(c),h=k(i[u],l.getLength()-1).mod(l);for(a[u]=new Array(l.getLength()-1),g=0;g<a[u].length;g+=1){var s=g+h.getLength()-a[u].length;a[u][g]=s>=0?h.getAt(s):0}}var v=0;for(g=0;g<r.length;g+=1)v+=r[g].totalCount;var d=new Array(v),w=0;for(g=0;g<n;g+=1)for(u=0;u<r.length;u+=1)g<i[u].length&&(d[w]=i[u][g],w+=1);for(g=0;g<o;g+=1)for(u=0;u<r.length;u+=1)g<a[u].length&&(d[w]=a[u][g],w+=1);return d}(o,n)};f.addData=function(t,r){var e=null;switch(r=r||"Byte"){case"Numeric":e=M(t);break;case"Alphanumeric":e=x(t);break;case"Byte":e=m(t);break;case"Kanji":e=L(t);break;default:throw"mode:"+r}u.push(e),a=null},f.isDark=function(t,r){if(t<0||i<=t||r<0||i<=r)throw t+","+r;return o[t][r]},f.getModuleCount=function(){return i},f.make=function(){if(e<1){for(var t=1;t<40;t++){for(var r=A.getRSBlocks(t,n),o=b(),i=0;i<u.length;i++){var a=u[i];o.put(a.getMode(),4),o.put(a.getLength(),B.getLengthInBits(a.getMode(),t)),a.write(o)}var g=0;for(i=0;i<r.length;i++)g+=r[i].dataCount;if(o.getLengthInBits()<=8*g)break}e=t}c(!1,function(){for(var t=0,r=0,e=0;e<8;e+=1){c(!0,e);var n=B.getLostPoint(f);(0==e||t>n)&&(t=n,r=e)}return r}())},f.createTableTag=function(t,r){t=t||2;var e="";e+='<table style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: "+(r=void 0===r?4*t:r)+"px;",e+='">',e+="<tbody>";for(var n=0;n<f.getModuleCount();n+=1){e+="<tr>";for(var o=0;o<f.getModuleCount();o+=1)e+='<td style="',e+=" border-width: 0px; border-style: none;",e+=" border-collapse: collapse;",e+=" padding: 0px; margin: 0px;",e+=" width: "+t+"px;",e+=" height: "+t+"px;",e+=" background-color: ",e+=f.isDark(n,o)?"#000000":"#ffffff",e+=";",e+='"/>';e+="</tr>"}return e+="</tbody>",e+="</table>"},f.createSvgTag=function(t,r,e,n){var o={};"object"==typeof arguments[0]&&(t=(o=arguments[0]).cellSize,r=o.margin,e=o.alt,n=o.title),t=t||2,r=void 0===r?4*t:r,(e="string"==typeof e?{text:e}:e||{}).text=e.text||null,e.id=e.text?e.id||"qrcode-description":null,(n="string"==typeof n?{text:n}:n||{}).text=n.text||null,n.id=n.text?n.id||"qrcode-title":null;var i,a,u,c,g=f.getModuleCount()*t+2*r,l="";for(c="l"+t+",0 0,"+t+" -"+t+",0 0,-"+t+"z ",l+='<svg version="1.1" xmlns="http://www.w3.org/2000/svg"',l+=o.scalable?"":' width="'+g+'px" height="'+g+'px"',l+=' viewBox="0 0 '+g+" "+g+'" ',l+=' preserveAspectRatio="xMinYMin meet"',l+=n.text||e.text?' role="img" aria-labelledby="'+y([n.id,e.id].join(" ").trim())+'"':"",l+=">",l+=n.text?'<title id="'+y(n.id)+'">'+y(n.text)+"</title>":"",l+=e.text?'<description id="'+y(e.id)+'">'+y(e.text)+"</description>":"",l+='<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>',l+='<path d="',a=0;a<f.getModuleCount();a+=1)for(u=a*t+r,i=0;i<f.getModuleCount();i+=1)f.isDark(a,i)&&(l+="M"+(i*t+r)+","+u+c);return l+='" stroke="transparent" fill="black"/>',l+="</svg>"},f.createDataURL=function(t,r){t=t||2,r=void 0===r?4*t:r;var e=f.getModuleCount()*t+2*r,n=r,o=e-r;return I(e,e,(function(r,e){if(n<=r&&r<o&&n<=e&&e<o){var i=Math.floor((r-n)/t),a=Math.floor((e-n)/t);return f.isDark(a,i)?0:1}return 1}))},f.createImgTag=function(t,r,e){t=t||2,r=void 0===r?4*t:r;var n=f.getModuleCount()*t+2*r,o="";return o+="<img",o+=' src="',o+=f.createDataURL(t,r),o+='"',o+=' width="',o+=n,o+='"',o+=' height="',o+=n,o+='"',e&&(o+=' alt="',o+=y(e),o+='"'),o+="/>"};var y=function(t){for(var r="",e=0;e<t.length;e+=1){var n=t.charAt(e);switch(n){case"<":r+="&lt;";break;case">":r+="&gt;";break;case"&":r+="&amp;";break;case'"':r+="&quot;";break;default:r+=n}}return r};return f.createASCII=function(t,r){if((t=t||1)<2)return function(t){t=void 0===t?2:t;var r,e,n,o,i,a=1*f.getModuleCount()+2*t,u=t,c=a-t,g={"██":"█","█ ":"▀"," █":"▄","  ":" "},l={"██":"▀","█ ":"▀"," █":" ","  ":" "},h="";for(r=0;r<a;r+=2){for(n=Math.floor((r-u)/1),o=Math.floor((r+1-u)/1),e=0;e<a;e+=1)i="█",u<=e&&e<c&&u<=r&&r<c&&f.isDark(n,Math.floor((e-u)/1))&&(i=" "),u<=e&&e<c&&u<=r+1&&r+1<c&&f.isDark(o,Math.floor((e-u)/1))?i+=" ":i+="█",h+=t<1&&r+1>=c?l[i]:g[i];h+="\n"}return a%2&&t>0?h.substring(0,h.length-a-1)+Array(a+1).join("▀"):h.substring(0,h.length-1)}(r);t-=1,r=void 0===r?2*t:r;var e,n,o,i,a=f.getModuleCount()*t+2*r,u=r,c=a-r,g=Array(t+1).join("██"),l=Array(t+1).join("  "),h="",s="";for(e=0;e<a;e+=1){for(o=Math.floor((e-u)/t),s="",n=0;n<a;n+=1)i=1,u<=n&&n<c&&u<=e&&e<c&&f.isDark(o,Math.floor((n-u)/t))&&(i=0),s+=i?g:l;for(o=0;o<t;o+=1)h+=s+"\n"}return h.substring(0,h.length-1)},f.renderTo2dContext=function(t,r){r=r||2;for(var e=f.getModuleCount(),n=0;n<e;n++)for(var o=0;o<e;o++)t.fillStyle=f.isDark(n,o)?"black":"white",t.fillRect(n*r,o*r,r,r)},f};t.stringToBytes=(t.stringToBytesFuncs={default:function(t){for(var r=[],e=0;e<t.length;e+=1){var n=t.charCodeAt(e);r.push(255&n)}return r}}).default,t.createStringToBytes=function(t,r){var e=function(){for(var e=S(t),n=function(){var t=e.read();if(-1==t)throw"eof";return t},o=0,i={};;){var a=e.read();if(-1==a)break;var u=n(),f=n()<<8|n();i[String.fromCharCode(a<<8|u)]=f,o+=1}if(o!=r)throw o+" != "+r;return i}(),n="?".charCodeAt(0);return function(t){for(var r=[],o=0;o<t.length;o+=1){var i=t.charCodeAt(o);if(i<128)r.push(i);else{var a=e[t.charAt(o)];"number"==typeof a?(255&a)==a?r.push(a):(r.push(a>>>8),r.push(255&a)):r.push(n)}}return r}};var r,e,n,o,i,a=1,u=2,f=4,c=8,g={L:1,M:0,Q:3,H:2},l=0,h=1,s=2,v=3,d=4,w=5,p=6,y=7,B=(r=[[],[6,18],[6,22],[6,26],[6,30],[6,34],[6,22,38],[6,24,42],[6,26,46],[6,28,50],[6,30,54],[6,32,58],[6,34,62],[6,26,46,66],[6,26,48,70],[6,26,50,74],[6,30,54,78],[6,30,56,82],[6,30,58,86],[6,34,62,90],[6,28,50,72,94],[6,26,50,74,98],[6,30,54,78,102],[6,28,54,80,106],[6,32,58,84,110],[6,30,58,86,114],[6,34,62,90,118],[6,26,50,74,98,122],[6,30,54,78,102,126],[6,26,52,78,104,130],[6,30,56,82,108,134],[6,34,60,86,112,138],[6,30,58,86,114,142],[6,34,62,90,118,146],[6,30,54,78,102,126,150],[6,24,50,76,102,128,154],[6,28,54,80,106,132,158],[6,32,58,84,110,136,162],[6,26,54,82,110,138,166],[6,30,58,86,114,142,170]],e=1335,n=7973,i=function(t){for(var r=0;0!=t;)r+=1,t>>>=1;return r},(o={}).getBCHTypeInfo=function(t){for(var r=t<<10;i(r)-i(e)>=0;)r^=e<<i(r)-i(e);return 21522^(t<<10|r)},o.getBCHTypeNumber=function(t){for(var r=t<<12;i(r)-i(n)>=0;)r^=n<<i(r)-i(n);return t<<12|r},o.getPatternPosition=function(t){return r[t-1]},o.getMaskFunction=function(t){switch(t){case l:return function(t,r){return(t+r)%2==0};case h:return function(t,r){return t%2==0};case s:return function(t,r){return r%3==0};case v:return function(t,r){return(t+r)%3==0};case d:return function(t,r){return(Math.floor(t/2)+Math.floor(r/3))%2==0};case w:return function(t,r){return t*r%2+t*r%3==0};case p:return function(t,r){return(t*r%2+t*r%3)%2==0};case y:return function(t,r){return(t*r%3+(t+r)%2)%2==0};default:throw"bad maskPattern:"+t}},o.getErrorCorrectPolynomial=function(t){for(var r=k([1],0),e=0;e<t;e+=1)r=r.multiply(k([1,C.gexp(e)],0));return r},o.getLengthInBits=function(t,r){if(1<=r&&r<10)switch(t){case a:return 10;case u:return 9;case f:case c:return 8;default:throw"mode:"+t}else if(r<27)switch(t){case a:return 12;case u:return 11;case f:return 16;case c:return 10;default:throw"mode:"+t}else{if(!(r<41))throw"type:"+r;switch(t){case a:return 14;case u:return 13;case f:return 16;case c:return 12;default:throw"mode:"+t}}},o.getLostPoint=function(t){for(var r=t.getModuleCount(),e=0,n=0;n<r;n+=1)for(var o=0;o<r;o+=1){for(var i=0,a=t.isDark(n,o),u=-1;u<=1;u+=1)if(!(n+u<0||r<=n+u))for(var f=-1;f<=1;f+=1)o+f<0||r<=o+f||0==u&&0==f||a==t.isDark(n+u,o+f)&&(i+=1);i>5&&(e+=3+i-5)}for(n=0;n<r-1;n+=1)for(o=0;o<r-1;o+=1){var c=0;t.isDark(n,o)&&(c+=1),t.isDark(n+1,o)&&(c+=1),t.isDark(n,o+1)&&(c+=1),t.isDark(n+1,o+1)&&(c+=1),0!=c&&4!=c||(e+=3)}for(n=0;n<r;n+=1)for(o=0;o<r-6;o+=1)t.isDark(n,o)&&!t.isDark(n,o+1)&&t.isDark(n,o+2)&&t.isDark(n,o+3)&&t.isDark(n,o+4)&&!t.isDark(n,o+5)&&t.isDark(n,o+6)&&(e+=40);for(o=0;o<r;o+=1)for(n=0;n<r-6;n+=1)t.isDark(n,o)&&!t.isDark(n+1,o)&&t.isDark(n+2,o)&&t.isDark(n+3,o)&&t.isDark(n+4,o)&&!t.isDark(n+5,o)&&t.isDark(n+6,o)&&(e+=40);var g=0;for(o=0;o<r;o+=1)for(n=0;n<r;n+=1)t.isDark(n,o)&&(g+=1);return e+=Math.abs(100*g/r/r-50)/5*10},o),C=function(){for(var t=new Array(256),r=new Array(256),e=0;e<8;e+=1)t[e]=1<<e;for(e=8;e<256;e+=1)t[e]=t[e-4]^t[e-5]^t[e-6]^t[e-8];for(e=0;e<255;e+=1)r[t[e]]=e;var n={glog:function(t){if(t<1)throw"glog("+t+")";return r[t]},gexp:function(r){for(;r<0;)r+=255;for(;r>=256;)r-=255;return t[r]}};return n}();function k(t,r){if(void 0===t.length)throw t.length+"/"+r;var e=function(){for(var e=0;e<t.length&&0==t[e];)e+=1;for(var n=new Array(t.length-e+r),o=0;o<t.length-e;o+=1)n[o]=t[o+e];return n}(),n={getAt:function(t){return e[t]},getLength:function(){return e.length},multiply:function(t){for(var r=new Array(n.getLength()+t.getLength()-1),e=0;e<n.getLength();e+=1)for(var o=0;o<t.getLength();o+=1)r[e+o]^=C.gexp(C.glog(n.getAt(e))+C.glog(t.getAt(o)));return k(r,0)},mod:function(t){if(n.getLength()-t.getLength()<0)return n;for(var r=C.glog(n.getAt(0))-C.glog(t.getAt(0)),e=new Array(n.getLength()),o=0;o<n.getLength();o+=1)e[o]=n.getAt(o);for(o=0;o<t.getLength();o+=1)e[o]^=C.gexp(C.glog(t.getAt(o))+r);return k(e,0).mod(t)}};return n}var A=function(){var t=[[1,26,19],[1,26,16],[1,26,13],[1,26,9],[1,44,34],[1,44,28],[1,44,22],[1,44,16],[1,70,55],[1,70,44],[2,35,17],[2,35,13],[1,100,80],[2,50,32],[2,50,24],[4,25,9],[1,134,108],[2,67,43],[2,33,15,2,34,16],[2,33,11,2,34,12],[2,86,68],[4,43,27],[4,43,19],[4,43,15],[2,98,78],[4,49,31],[2,32,14,4,33,15],[4,39,13,1,40,14],[2,121,97],[2,60,38,2,61,39],[4,40,18,2,41,19],[4,40,14,2,41,15],[2,146,116],[3,58,36,2,59,37],[4,36,16,4,37,17],[4,36,12,4,37,13],[2,86,68,2,87,69],[4,69,43,1,70,44],[6,43,19,2,44,20],[6,43,15,2,44,16],[4,101,81],[1,80,50,4,81,51],[4,50,22,4,51,23],[3,36,12,8,37,13],[2,116,92,2,117,93],[6,58,36,2,59,37],[4,46,20,6,47,21],[7,42,14,4,43,15],[4,133,107],[8,59,37,1,60,38],[8,44,20,4,45,21],[12,33,11,4,34,12],[3,145,115,1,146,116],[4,64,40,5,65,41],[11,36,16,5,37,17],[11,36,12,5,37,13],[5,109,87,1,110,88],[5,65,41,5,66,42],[5,54,24,7,55,25],[11,36,12,7,37,13],[5,122,98,1,123,99],[7,73,45,3,74,46],[15,43,19,2,44,20],[3,45,15,13,46,16],[1,135,107,5,136,108],[10,74,46,1,75,47],[1,50,22,15,51,23],[2,42,14,17,43,15],[5,150,120,1,151,121],[9,69,43,4,70,44],[17,50,22,1,51,23],[2,42,14,19,43,15],[3,141,113,4,142,114],[3,70,44,11,71,45],[17,47,21,4,48,22],[9,39,13,16,40,14],[3,135,107,5,136,108],[3,67,41,13,68,42],[15,54,24,5,55,25],[15,43,15,10,44,16],[4,144,116,4,145,117],[17,68,42],[17,50,22,6,51,23],[19,46,16,6,47,17],[2,139,111,7,140,112],[17,74,46],[7,54,24,16,55,25],[34,37,13],[4,151,121,5,152,122],[4,75,47,14,76,48],[11,54,24,14,55,25],[16,45,15,14,46,16],[6,147,117,4,148,118],[6,73,45,14,74,46],[11,54,24,16,55,25],[30,46,16,2,47,17],[8,132,106,4,133,107],[8,75,47,13,76,48],[7,54,24,22,55,25],[22,45,15,13,46,16],[10,142,114,2,143,115],[19,74,46,4,75,47],[28,50,22,6,51,23],[33,46,16,4,47,17],[8,152,122,4,153,123],[22,73,45,3,74,46],[8,53,23,26,54,24],[12,45,15,28,46,16],[3,147,117,10,148,118],[3,73,45,23,74,46],[4,54,24,31,55,25],[11,45,15,31,46,16],[7,146,116,7,147,117],[21,73,45,7,74,46],[1,53,23,37,54,24],[19,45,15,26,46,16],[5,145,115,10,146,116],[19,75,47,10,76,48],[15,54,24,25,55,25],[23,45,15,25,46,16],[13,145,115,3,146,116],[2,74,46,29,75,47],[42,54,24,1,55,25],[23,45,15,28,46,16],[17,145,115],[10,74,46,23,75,47],[10,54,24,35,55,25],[19,45,15,35,46,16],[17,145,115,1,146,116],[14,74,46,21,75,47],[29,54,24,19,55,25],[11,45,15,46,46,16],[13,145,115,6,146,116],[14,74,46,23,75,47],[44,54,24,7,55,25],[59,46,16,1,47,17],[12,151,121,7,152,122],[12,75,47,26,76,48],[39,54,24,14,55,25],[22,45,15,41,46,16],[6,151,121,14,152,122],[6,75,47,34,76,48],[46,54,24,10,55,25],[2,45,15,64,46,16],[17,152,122,4,153,123],[29,74,46,14,75,47],[49,54,24,10,55,25],[24,45,15,46,46,16],[4,152,122,18,153,123],[13,74,46,32,75,47],[48,54,24,14,55,25],[42,45,15,32,46,16],[20,147,117,4,148,118],[40,75,47,7,76,48],[43,54,24,22,55,25],[10,45,15,67,46,16],[19,148,118,6,149,119],[18,75,47,31,76,48],[34,54,24,34,55,25],[20,45,15,61,46,16]],r=function(t,r){var e={};return e.totalCount=t,e.dataCount=r,e},e={};return e.getRSBlocks=function(e,n){var o=function(r,e){switch(e){case g.L:return t[4*(r-1)+0];case g.M:return t[4*(r-1)+1];case g.Q:return t[4*(r-1)+2];case g.H:return t[4*(r-1)+3];default:return}}(e,n);if(void 0===o)throw"bad rs block @ typeNumber:"+e+"/errorCorrectionLevel:"+n;for(var i=o.length/3,a=[],u=0;u<i;u+=1)for(var f=o[3*u+0],c=o[3*u+1],l=o[3*u+2],h=0;h<f;h+=1)a.push(r(c,l));return a},e}(),b=function(){var t=[],r=0,e={getBuffer:function(){return t},getAt:function(r){var e=Math.floor(r/8);return 1==(t[e]>>>7-r%8&1)},put:function(t,r){for(var n=0;n<r;n+=1)e.putBit(1==(t>>>r-n-1&1))},getLengthInBits:function(){return r},putBit:function(e){var n=Math.floor(r/8);t.length<=n&&t.push(0),e&&(t[n]|=128>>>r%8),r+=1}};return e},M=function(t){var r=a,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+2<r.length;)t.put(o(r.substring(n,n+3)),10),n+=3;n<r.length&&(r.length-n==1?t.put(o(r.substring(n,n+1)),4):r.length-n==2&&t.put(o(r.substring(n,n+2)),7))}},o=function(t){for(var r=0,e=0;e<t.length;e+=1)r=10*r+i(t.charAt(e));return r},i=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);throw"illegal char :"+t};return n},x=function(t){var r=u,e=t,n={getMode:function(){return r},getLength:function(t){return e.length},write:function(t){for(var r=e,n=0;n+1<r.length;)t.put(45*o(r.charAt(n))+o(r.charAt(n+1)),11),n+=2;n<r.length&&t.put(o(r.charAt(n)),6)}},o=function(t){if("0"<=t&&t<="9")return t.charCodeAt(0)-"0".charCodeAt(0);if("A"<=t&&t<="Z")return t.charCodeAt(0)-"A".charCodeAt(0)+10;switch(t){case" ":return 36;case"$":return 37;case"%":return 38;case"*":return 39;case"+":return 40;case"-":return 41;case".":return 42;case"/":return 43;case":":return 44;default:throw"illegal char :"+t}};return n},m=function(r){var e=f,n=t.stringToBytes(r),o={getMode:function(){return e},getLength:function(t){return n.length},write:function(t){for(var r=0;r<n.length;r+=1)t.put(n[r],8)}};return o},L=function(r){var e=c,n=t.stringToBytesFuncs.SJIS;if(!n)throw"sjis not supported.";!function(t,r){var e=n("友");if(2!=e.length||38726!=(e[0]<<8|e[1]))throw"sjis not supported."}();var o=n(r),i={getMode:function(){return e},getLength:function(t){return~~(o.length/2)},write:function(t){for(var r=o,e=0;e+1<r.length;){var n=(255&r[e])<<8|255&r[e+1];if(33088<=n&&n<=40956)n-=33088;else{if(!(57408<=n&&n<=60351))throw"illegal char at "+(e+1)+"/"+n;n-=49472}n=192*(n>>>8&255)+(255&n),t.put(n,13),e+=2}if(e<r.length)throw"illegal char at "+(e+1)}};return i},D=function(){var t=[],r={writeByte:function(r){t.push(255&r)},writeShort:function(t){r.writeByte(t),r.writeByte(t>>>8)},writeBytes:function(t,e,n){e=e||0,n=n||t.length;for(var o=0;o<n;o+=1)r.writeByte(t[o+e])},writeString:function(t){for(var e=0;e<t.length;e+=1)r.writeByte(t.charCodeAt(e))},toByteArray:function(){return t},toString:function(){var r="";r+="[";for(var e=0;e<t.length;e+=1)e>0&&(r+=","),r+=t[e];return r+="]"}};return r},S=function(t){var r=t,e=0,n=0,o=0,i={read:function(){for(;o<8;){if(e>=r.length){if(0==o)return-1;throw"unexpected end of file./"+o}var t=r.charAt(e);if(e+=1,"="==t)return o=0,-1;t.match(/^\s$/)||(n=n<<6|a(t.charCodeAt(0)),o+=6)}var i=n>>>o-8&255;return o-=8,i}},a=function(t){if(65<=t&&t<=90)return t-65;if(97<=t&&t<=122)return t-97+26;if(48<=t&&t<=57)return t-48+52;if(43==t)return 62;if(47==t)return 63;throw"c:"+t};return i},I=function(t,r,e){for(var n=function(t,r){var e=t,n=r,o=new Array(t*r),i={setPixel:function(t,r,n){o[r*e+t]=n},write:function(t){t.writeString("GIF87a"),t.writeShort(e),t.writeShort(n),t.writeByte(128),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(0),t.writeByte(255),t.writeByte(255),t.writeByte(255),t.writeString(","),t.writeShort(0),t.writeShort(0),t.writeShort(e),t.writeShort(n),t.writeByte(0);var r=a(2);t.writeByte(2);for(var o=0;r.length-o>255;)t.writeByte(255),t.writeBytes(r,o,255),o+=255;t.writeByte(r.length-o),t.writeBytes(r,o,r.length-o),t.writeByte(0),t.writeString(";")}},a=function(t){for(var r=1<<t,e=1+(1<<t),n=t+1,i=u(),a=0;a<r;a+=1)i.add(String.fromCharCode(a));i.add(String.fromCharCode(r)),i.add(String.fromCharCode(e));var f,c,g,l=D(),h=(f=l,c=0,g=0,{write:function(t,r){if(t>>>r!=0)throw"length over";for(;c+r>=8;)f.writeByte(255&(t<<c|g)),r-=8-c,t>>>=8-c,g=0,c=0;g|=t<<c,c+=r},flush:function(){c>0&&f.writeByte(g)}});h.write(r,n);var s=0,v=String.fromCharCode(o[s]);for(s+=1;s<o.length;){var d=String.fromCharCode(o[s]);s+=1,i.contains(v+d)?v+=d:(h.write(i.indexOf(v),n),i.size()<4095&&(i.size()==1<<n&&(n+=1),i.add(v+d)),v=d)}return h.write(i.indexOf(v),n),h.write(e,n),h.flush(),l.toByteArray()},u=function(){var t={},r=0,e={add:function(n){if(e.contains(n))throw"dup key:"+n;t[n]=r,r+=1},size:function(){return r},indexOf:function(r){return t[r]},contains:function(r){return void 0!==t[r]}};return e};return i}(t,r),o=0;o<r;o+=1)for(var i=0;i<t;i+=1)n.setPixel(i,o,e(i,o));var a=D();n.write(a);for(var u=function(){var t=0,r=0,e=0,n="",o={},i=function(t){n+=String.fromCharCode(a(63&t))},a=function(t){if(t<0);else{if(t<26)return 65+t;if(t<52)return t-26+97;if(t<62)return t-52+48;if(62==t)return 43;if(63==t)return 47}throw"n:"+t};return o.writeByte=function(n){for(t=t<<8|255&n,r+=8,e+=1;r>=6;)i(t>>>r-6),r-=6},o.flush=function(){if(r>0&&(i(t<<6-r),t=0,r=0),e%3!=0)for(var o=3-e%3,a=0;a<o;a+=1)n+="="},o.toString=function(){return n},o}(),f=a.toByteArray(),c=0;c<f.length;c+=1)u.writeByte(f[c]);return u.flush(),"data:image/gif;base64,"+u};return t}();qrcode.stringToBytesFuncs["UTF-8"]=function(t){return function(t){for(var r=[],e=0;e<t.length;e++){var n=t.charCodeAt(e);n<128?r.push(n):n<2048?r.push(192|n>>6,128|63&n):n<55296||n>=57344?r.push(224|n>>12,128|n>>6&63,128|63&n):(e++,n=65536+((1023&n)<<10|1023&t.charCodeAt(e)),r.push(240|n>>18,128|n>>12&63,128|n>>6&63,128|63&n))}return r}(t)},function(t){"function"==typeof define&&define.amd?define([],t):"object"==typeof exports&&(module.exports=t())}((function(){return qrcode}));
return qrcode;})();
var ICON_NODES={"layout-dashboard":[["rect",{"width":"7","height":"9","x":"3","y":"3","rx":"1"}],["rect",{"width":"7","height":"5","x":"14","y":"3","rx":"1"}],["rect",{"width":"7","height":"9","x":"14","y":"12","rx":"1"}],["rect",{"width":"7","height":"5","x":"3","y":"16","rx":"1"}]],"receipt":[["path",{"d":"M12 17V7"}],["path",{"d":"M16 8h-6a2 2 0 0 0 0 4h4a2 2 0 0 1 0 4H8"}],["path",{"d":"M4 3a1 1 0 0 1 1-1 1.3 1.3 0 0 1 .7.2l.933.6a1.3 1.3 0 0 0 1.4 0l.934-.6a1.3 1.3 0 0 1 1.4 0l.933.6a1.3 1.3 0 0 0 1.4 0l.933-.6a1.3 1.3 0 0 1 1.4 0l.934.6a1.3 1.3 0 0 0 1.4 0l.933-.6A1.3 1.3 0 0 1 19 2a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1 1.3 1.3 0 0 1-.7-.2l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.934.6a1.3 1.3 0 0 1-1.4 0l-.933-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-1.4 0l-.934-.6a1.3 1.3 0 0 0-1.4 0l-.933.6a1.3 1.3 0 0 1-.7.2 1 1 0 0 1-1-1z"}]],"file-text":[["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{"d":"M10 9H8"}],["path",{"d":"M16 13H8"}],["path",{"d":"M16 17H8"}]],"shopping-cart":[["path",{"d":"m2.05 2.05 1.099-.028a1 1 0 0 1 1.008.815l2.69 14.347A1 1 0 0 0 7.83 18H18"}],["path",{"d":"M4.563 5h16.435a1 1 0 0 1 .981 1.204l-1.026 6.226A2 2 0 0 1 18.962 14H6.25"}],["circle",{"cx":"18","cy":"20","r":"2"}],["circle",{"cx":"8","cy":"20","r":"2"}]],"users":[["path",{"d":"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["path",{"d":"M16 3.128a4 4 0 0 1 0 7.744"}],["path",{"d":"M22 21v-2a4 4 0 0 0-3-3.87"}],["circle",{"cx":"9","cy":"7","r":"4"}]],"truck":[["path",{"d":"M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"}],["path",{"d":"M15 18H9"}],["path",{"d":"M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"}],["circle",{"cx":"17","cy":"18","r":"2"}],["circle",{"cx":"7","cy":"18","r":"2"}]],"package":[["path",{"d":"M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"}],["path",{"d":"M12 22V12"}],["polyline",{"points":"3.29 7 12 12 20.71 7"}],["path",{"d":"m7.5 4.27 9 5.15"}]],"boxes":[["path",{"d":"M2.97 12.92A2 2 0 0 0 2 14.63v3.24a2 2 0 0 0 .97 1.71l3 1.8a2 2 0 0 0 2.06 0L12 19v-5.5l-5-3-4.03 2.42Z"}],["path",{"d":"m7 16.5-4.74-2.85"}],["path",{"d":"m7 16.5 5-3"}],["path",{"d":"M7 16.5v5.17"}],["path",{"d":"M12 13.5V19l3.97 2.38a2 2 0 0 0 2.06 0l3-1.8a2 2 0 0 0 .97-1.71v-3.24a2 2 0 0 0-.97-1.71L17 10.5l-5 3Z"}],["path",{"d":"m17 16.5-5-3"}],["path",{"d":"m17 16.5 4.74-2.85"}],["path",{"d":"M17 16.5v5.17"}],["path",{"d":"M7.97 4.42A2 2 0 0 0 7 6.13v4.37l5 3 5-3V6.13a2 2 0 0 0-.97-1.71l-3-1.8a2 2 0 0 0-2.06 0l-3 1.8Z"}],["path",{"d":"M12 8 7.26 5.15"}],["path",{"d":"m12 8 4.74-2.85"}],["path",{"d":"M12 13.5V8"}]],"wallet":[["path",{"d":"M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"}],["path",{"d":"M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"}]],"credit-card":[["rect",{"width":"20","height":"14","x":"2","y":"5","rx":"2"}],["line",{"x1":"2","x2":"22","y1":"10","y2":"10"}],["path",{"d":"M6 14h2"}]],"landmark":[["path",{"d":"M10 18v-7"}],["path",{"d":"M11.119 2.205a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949z"}],["path",{"d":"M14 18v-7"}],["path",{"d":"M18 18v-7"}],["path",{"d":"M3 22h18"}],["path",{"d":"M6 18v-7"}]],"chart-column":[["path",{"d":"M3 3v16a2 2 0 0 0 2 2h16"}],["path",{"d":"M18 17V9"}],["path",{"d":"M13 17V5"}],["path",{"d":"M8 17v-3"}]],"chart-pie":[["path",{"d":"M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"}],["path",{"d":"M21.21 15.89A10 10 0 1 1 8 2.83"}]],"calculator":[["rect",{"width":"16","height":"20","x":"4","y":"2","rx":"2"}],["line",{"x1":"8","x2":"16","y1":"6","y2":"6"}],["line",{"x1":"16","x2":"16","y1":"14","y2":"18"}],["path",{"d":"M16 10h.01"}],["path",{"d":"M12 10h.01"}],["path",{"d":"M8 10h.01"}],["path",{"d":"M12 14h.01"}],["path",{"d":"M8 14h.01"}],["path",{"d":"M12 18h.01"}],["path",{"d":"M8 18h.01"}]],"shield-check":[["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{"d":"m9 12 2 2 4-4"}]],"building-2":[["path",{"d":"M10 12h4"}],["path",{"d":"M10 8h4"}],["path",{"d":"M14 21v-3a2 2 0 0 0-4 0v3"}],["path",{"d":"M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2"}],["path",{"d":"M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"}]],"user-cog":[["path",{"d":"M10 15H6a4 4 0 0 0-4 4v2"}],["path",{"d":"m14.305 16.53.923-.382"}],["path",{"d":"m15.228 13.852-.923-.383"}],["path",{"d":"m16.852 12.228-.383-.923"}],["path",{"d":"m16.852 17.772-.383.924"}],["path",{"d":"m19.148 12.228.383-.923"}],["path",{"d":"m19.53 18.696-.382-.924"}],["path",{"d":"m20.772 13.852.924-.383"}],["path",{"d":"m20.772 16.148.924.383"}],["circle",{"cx":"18","cy":"15","r":"3"}],["circle",{"cx":"9","cy":"7","r":"4"}]],"plug":[["path",{"d":"M12 22v-5"}],["path",{"d":"M15 8V2"}],["path",{"d":"M17 8a1 1 0 0 1 1 1v4a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1z"}],["path",{"d":"M9 8V2"}]],"bell":[["path",{"d":"M10.268 21a2 2 0 0 0 3.464 0"}],["path",{"d":"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"}]],"settings":[["path",{"d":"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"}],["circle",{"cx":"12","cy":"12","r":"3"}]],"life-buoy":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m4.93 4.93 4.24 4.24"}],["path",{"d":"m14.83 9.17 4.24-4.24"}],["path",{"d":"m14.83 14.83 4.24 4.24"}],["path",{"d":"m9.17 14.83-4.24 4.24"}],["circle",{"cx":"12","cy":"12","r":"4"}]],"search":[["path",{"d":"m21 21-4.34-4.34"}],["circle",{"cx":"11","cy":"11","r":"8"}]],"plus":[["path",{"d":"M5 12h14"}],["path",{"d":"M12 5v14"}]],"minus":[["path",{"d":"M5 12h14"}]],"chevron-down":[["path",{"d":"m6 9 6 6 6-6"}]],"chevron-right":[["path",{"d":"m9 18 6-6-6-6"}]],"chevron-left":[["path",{"d":"m15 18-6-6 6-6"}]],"chevron-up":[["path",{"d":"m18 15-6-6-6 6"}]],"chevrons-up-down":[["path",{"d":"m7 15 5 5 5-5"}],["path",{"d":"m7 9 5-5 5 5"}]],"check":[["path",{"d":"M20 6 9 17l-5-5"}]],"x":[["path",{"d":"M18 6 6 18"}],["path",{"d":"m6 6 12 12"}]],"circle-check":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"m16 9-5.5 5.5L8 12"}]],"circle-alert":[["circle",{"cx":"12","cy":"12","r":"10"}],["line",{"x1":"12","x2":"12","y1":"8","y2":"12"}],["line",{"x1":"12","x2":"12.01","y1":"16","y2":"16"}]],"triangle-alert":[["path",{"d":"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"}],["path",{"d":"M12 9v4"}],["path",{"d":"M12 17h.01"}]],"info":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 16v-4"}],["path",{"d":"M12 8h.01"}]],"clock":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 6v6l4 2"}]],"calendar":[["path",{"d":"M8 2v3"}],["path",{"d":"M16 2v3"}],["rect",{"x":"3","y":"3","width":"18","height":"18","rx":"2"}],["path",{"d":"M3 9h18"}]],"upload":[["path",{"d":"M12 3v12"}],["path",{"d":"m17 8-5-5-5 5"}],["path",{"d":"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}]],"download":[["path",{"d":"M12 15V3"}],["path",{"d":"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"}],["path",{"d":"m7 10 5 5 5-5"}]],"printer":[["path",{"d":"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"}],["path",{"d":"M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6"}],["rect",{"x":"6","y":"14","width":"12","height":"8","rx":"1"}]],"send":[["path",{"d":"M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"}],["path",{"d":"m21.854 2.147-10.94 10.939"}]],"share-2":[["circle",{"cx":"18","cy":"5","r":"3"}],["circle",{"cx":"6","cy":"12","r":"3"}],["circle",{"cx":"18","cy":"19","r":"3"}],["line",{"x1":"8.59","x2":"15.42","y1":"13.51","y2":"17.49"}],["line",{"x1":"15.41","x2":"8.59","y1":"6.51","y2":"10.49"}]],"message-circle":[["path",{"d":"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"}]],"ellipsis":[["circle",{"cx":"12","cy":"12","r":"1"}],["circle",{"cx":"19","cy":"12","r":"1"}],["circle",{"cx":"5","cy":"12","r":"1"}]],"list-filter":[["path",{"d":"M2 5h20"}],["path",{"d":"M6 12h12"}],["path",{"d":"M9 19h6"}]],"arrow-up-right":[["path",{"d":"M7 7h10v10"}],["path",{"d":"M7 17 17 7"}]],"arrow-down-right":[["path",{"d":"m7 7 10 10"}],["path",{"d":"M17 7v10H7"}]],"trending-up":[["path",{"d":"M16 7h6v6"}],["path",{"d":"m22 7-8.5 8.5-5-5L2 17"}]],"trending-down":[["path",{"d":"M16 17h6v-6"}],["path",{"d":"m22 17-8.5-8.5-5 5L2 7"}]],"qr-code":[["rect",{"width":"5","height":"5","x":"3","y":"3","rx":"1"}],["rect",{"width":"5","height":"5","x":"16","y":"3","rx":"1"}],["rect",{"width":"5","height":"5","x":"3","y":"16","rx":"1"}],["path",{"d":"M21 16h-3a2 2 0 0 0-2 2v3"}],["path",{"d":"M21 21v.01"}],["path",{"d":"M12 7v3a2 2 0 0 1-2 2H7"}],["path",{"d":"M3 12h.01"}],["path",{"d":"M12 3h.01"}],["path",{"d":"M12 16v.01"}],["path",{"d":"M16 12h1"}],["path",{"d":"M21 12v.01"}],["path",{"d":"M12 21v-1"}]],"sparkles":[["path",{"d":"M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"}],["path",{"d":"M20 2v4"}],["path",{"d":"M22 4h-4"}],["circle",{"cx":"4","cy":"20","r":"2"}]],"moon":[["path",{"d":"M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"}]],"sun":[["circle",{"cx":"12","cy":"12","r":"4"}],["path",{"d":"M12 2v2"}],["path",{"d":"M12 20v2"}],["path",{"d":"m4.93 4.93 1.41 1.41"}],["path",{"d":"m17.66 17.66 1.41 1.41"}],["path",{"d":"M2 12h2"}],["path",{"d":"M20 12h2"}],["path",{"d":"m6.34 17.66-1.41 1.41"}],["path",{"d":"m19.07 4.93-1.41 1.41"}]],"languages":[["path",{"d":"m5 8 6 6"}],["path",{"d":"m4 14 6-6 2-3"}],["path",{"d":"M2 5h12"}],["path",{"d":"M7 2h1"}],["path",{"d":"m22 22-5-10-5 10"}],["path",{"d":"M14 18h6"}]],"command":[["path",{"d":"M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"}]],"building":[["path",{"d":"M12 10h.01"}],["path",{"d":"M12 14h.01"}],["path",{"d":"M12 6h.01"}],["path",{"d":"M16 10h.01"}],["path",{"d":"M16 14h.01"}],["path",{"d":"M16 6h.01"}],["path",{"d":"M8 10h.01"}],["path",{"d":"M8 14h.01"}],["path",{"d":"M8 6h.01"}],["path",{"d":"M9 22v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"}],["rect",{"x":"4","y":"2","width":"16","height":"20","rx":"2"}]],"file-plus":[["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{"d":"M9 15h6"}],["path",{"d":"M12 18v-6"}]],"file-minus":[["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{"d":"M9 15h6"}]],"copy":[["rect",{"width":"14","height":"14","x":"8","y":"8","rx":"2","ry":"2"}],["path",{"d":"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"}]],"pencil":[["path",{"d":"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"}],["path",{"d":"m15 5 4 4"}]],"trash-2":[["path",{"d":"M10 11v6"}],["path",{"d":"M14 11v6"}],["path",{"d":"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"}],["path",{"d":"M3 6h18"}],["path",{"d":"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"}]],"eye":[["path",{"d":"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"}],["circle",{"cx":"12","cy":"12","r":"3"}]],"lock":[["rect",{"width":"18","height":"11","x":"3","y":"11","rx":"2","ry":"2"}],["path",{"d":"M7 11V7a5 5 0 0 1 10 0v4"}]],"key-round":[["path",{"d":"M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"}],["circle",{"cx":"16.5","cy":"7.5","r":".5","fill":"currentColor"}]],"history":[["path",{"d":"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"}],["path",{"d":"M3 3v5h5"}]],"scan-line":[["path",{"d":"M3 7V5a2 2 0 0 1 2-2h2"}],["path",{"d":"M17 3h2a2 2 0 0 1 2 2v2"}],["path",{"d":"M21 17v2a2 2 0 0 1-2 2h-2"}],["path",{"d":"M7 21H5a2 2 0 0 1-2-2v-2"}],["path",{"d":"M7 12h10"}]],"inbox":[["polyline",{"points":"22 12 16 12 14 15 10 15 8 12 2 12"}],["path",{"d":"M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"}]],"folder":[["path",{"d":"M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"}]],"paperclip":[["path",{"d":"m16 6-8.414 8.586a2 2 0 0 0 2.829 2.829l8.414-8.586a4 4 0 1 0-5.657-5.657l-8.379 8.551a6 6 0 1 0 8.485 8.485l8.379-8.551"}]],"globe":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"}],["path",{"d":"M2 12h20"}]],"mail":[["path",{"d":"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7"}],["rect",{"x":"2","y":"4","width":"20","height":"16","rx":"2"}]],"phone":[["path",{"d":"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"}]],"log-out":[["path",{"d":"m16 17 5-5-5-5"}],["path",{"d":"M21 12H9"}],["path",{"d":"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"}]],"star":[["path",{"d":"M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z"}]],"refresh-cw":[["path",{"d":"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"}],["path",{"d":"M21 3v5h-5"}],["path",{"d":"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"}],["path",{"d":"M8 16H3v5"}]],"hash":[["line",{"x1":"4","x2":"20","y1":"9","y2":"9"}],["line",{"x1":"4","x2":"20","y1":"15","y2":"15"}],["line",{"x1":"10","x2":"8","y1":"3","y2":"21"}],["line",{"x1":"16","x2":"14","y1":"3","y2":"21"}]],"percent":[["line",{"x1":"19","x2":"5","y1":"5","y2":"19"}],["circle",{"cx":"6.5","cy":"6.5","r":"2.5"}],["circle",{"cx":"17.5","cy":"17.5","r":"2.5"}]],"banknote":[["rect",{"width":"20","height":"12","x":"2","y":"6","rx":"2"}],["circle",{"cx":"12","cy":"12","r":"2"}],["path",{"d":"M6 12h.01M18 12h.01"}]],"file-check":[["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{"d":"m9 15 2 2 4-4"}]],"file-x":[["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{"d":"m14.5 12.5-5 5"}],["path",{"d":"m9.5 12.5 5 5"}]],"grip-vertical":[["circle",{"cx":"9","cy":"12","r":"1"}],["circle",{"cx":"9","cy":"5","r":"1"}],["circle",{"cx":"9","cy":"19","r":"1"}],["circle",{"cx":"15","cy":"12","r":"1"}],["circle",{"cx":"15","cy":"5","r":"1"}],["circle",{"cx":"15","cy":"19","r":"1"}]],"arrow-left":[["path",{"d":"m12 19-7-7 7-7"}],["path",{"d":"M19 12H5"}]],"arrow-right":[["path",{"d":"M5 12h14"}],["path",{"d":"m12 5 7 7-7 7"}]],"circle-help":[["circle",{"cx":"12","cy":"12","r":"10"}],["path",{"d":"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"}],["path",{"d":"M12 17h.01"}]],"panel-left":[["rect",{"width":"18","height":"18","x":"3","y":"3","rx":"2"}],["path",{"d":"M9 3v18"}]],"workflow":[["rect",{"width":"8","height":"8","x":"3","y":"3","rx":"2"}],["path",{"d":"M7 11v4a2 2 0 0 0 2 2h4"}],["rect",{"width":"8","height":"8","x":"13","y":"13","rx":"2"}]],"zap":[["path",{"d":"M15.914 4a1.5 1.5 0 00-2.474-1.561l-9 9A1.5 1.5 0 005.5 14h4.002a.5.5 0 01.471.666L8.086 20a1.5 1.5 0 002.475 1.56l9-9A1.5 1.5 0 0018.5 10h-3.997a.5.5 0 01-.472-.667z"}]],"server":[["rect",{"width":"20","height":"8","x":"2","y":"2","rx":"2","ry":"2"}],["rect",{"width":"20","height":"8","x":"2","y":"14","rx":"2","ry":"2"}],["line",{"x1":"6","x2":"6.01","y1":"6","y2":"6"}],["line",{"x1":"6","x2":"6.01","y1":"18","y2":"18"}]],"cloud-upload":[["path",{"d":"M12 13v8"}],["path",{"d":"M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"}],["path",{"d":"m8 17 4-4 4 4"}]],"user-plus":[["path",{"d":"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"}],["circle",{"cx":"9","cy":"7","r":"4"}],["line",{"x1":"19","x2":"19","y1":"8","y2":"14"}],["line",{"x1":"22","x2":"16","y1":"11","y2":"11"}]],"repeat":[["path",{"d":"m17 2 4 4-4 4"}],["path",{"d":"M3 11v-1a4 4 0 0 1 4-4h14"}],["path",{"d":"m7 22-4-4 4-4"}],["path",{"d":"M21 13v1a4 4 0 0 1-4 4H3"}]],"file-spreadsheet":[["path",{"d":"M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"}],["path",{"d":"M14 2v5a1 1 0 0 0 1 1h5"}],["path",{"d":"M8 13h2"}],["path",{"d":"M14 13h2"}],["path",{"d":"M8 17h2"}],["path",{"d":"M14 17h2"}]],"git-branch":[["path",{"d":"M15 6a9 9 0 0 0-9 9V3"}],["circle",{"cx":"18","cy":"6","r":"3"}],["circle",{"cx":"6","cy":"18","r":"3"}]],"shield-alert":[["path",{"d":"M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"}],["path",{"d":"M12 8v4"}],["path",{"d":"M12 16h.01"}]],"fingerprint":[["path",{"d":"M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4"}],["path",{"d":"M14 13.12c0 2.38 0 6.38-1 8.88"}],["path",{"d":"M17.29 21.02c.12-.6.43-2.3.5-3.02"}],["path",{"d":"M2 12a10 10 0 0 1 18-6"}],["path",{"d":"M2 16h.01"}],["path",{"d":"M21.8 16c.2-2 .131-5.354 0-6"}],["path",{"d":"M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2"}],["path",{"d":"M8.65 22c.21-.66.45-1.32.57-2"}],["path",{"d":"M9 6.8a6 6 0 0 1 9 5.2v2"}]],"smartphone":[["rect",{"width":"14","height":"20","x":"5","y":"2","rx":"2","ry":"2"}],["path",{"d":"M12 18h.01"}]],"monitor":[["rect",{"width":"20","height":"14","x":"2","y":"3","rx":"2"}],["line",{"x1":"8","x2":"16","y1":"21","y2":"21"}],["line",{"x1":"12","x2":"12","y1":"17","y2":"21"}]],"store":[["path",{"d":"M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"}],["path",{"d":"M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244"}],["path",{"d":"M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05"}]],"warehouse":[["path",{"d":"M18 21V10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v11"}],["path",{"d":"M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 1.132-1.803l7.95-3.974a2 2 0 0 1 1.837 0l7.948 3.974A2 2 0 0 1 22 8z"}],["path",{"d":"M6 13h12"}],["path",{"d":"M6 17h12"}]],"arrow-up-down":[["path",{"d":"m21 16-4 4-4-4"}],["path",{"d":"M17 20V4"}],["path",{"d":"m3 8 4-4 4 4"}],["path",{"d":"M7 4v16"}]],"sliders-horizontal":[["path",{"d":"M10 5H3"}],["path",{"d":"M12 19H3"}],["path",{"d":"M14 3v4"}],["path",{"d":"M16 17v4"}],["path",{"d":"M21 12h-9"}],["path",{"d":"M21 19h-5"}],["path",{"d":"M21 5h-7"}],["path",{"d":"M8 10v4"}],["path",{"d":"M8 12H3"}]],"book-open":[["path",{"d":"M12 5v16"}],["path",{"d":"M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z"}]]};
var LOGO={"latin":{"zatca":"M53.51611328125 29.0V26.58740234375L61.47900390625 15.341796875Q62.21728515625 14.3134765625 63.1005859375 13.278564453125Q63.98388671875 12.24365234375 64.88037109375 11.228515625L65.18359375 12.53369140625Q63.865234375 12.65234375 62.540283203125 12.672119140625Q61.21533203125 12.69189453125 59.89697265625 12.69189453125H53.4765625V9.3564453125H68.41357421875V11.7822265625L60.595703125 22.830078125Q59.81787109375 23.9111328125 58.901611328125 24.985595703125Q57.9853515625 26.06005859375 57.04931640625 27.1279296875L56.74609375 25.82275390625Q58.13037109375 25.7041015625 59.508056640625 25.684326171875Q60.8857421875 25.66455078125 62.2568359375 25.66455078125H68.453125V29.0Z M75.19046875000001 29.2900390625Q73.79300781250001 29.2900390625 72.67899414062501 28.795654296875Q71.56498046875001 28.30126953125 70.92557617187501 27.319091796875Q70.28617187500001 26.3369140625 70.28617187500001 24.87353515625Q70.28617187500001 23.6474609375 70.74100585937501 22.81689453125Q71.19583984375001 21.986328125 71.98026367187501 21.4853515625Q72.76468750000001 20.984375 73.76004882812501 20.720703125Q74.75541015625001 20.45703125 75.84964843750001 20.3515625Q77.12845703125001 20.2197265625 77.91288085937501 20.107666015625Q78.69730468750001 19.99560546875 79.05985351562501 19.751708984375Q79.42240234375001 19.5078125 79.42240234375001 19.033203125V18.96728515625Q79.42240234375001 18.33447265625 79.15873046875001 17.8994140625Q78.89505859375001 17.46435546875 78.38089843750001 17.233642578125Q77.86673828125001 17.0029296875 77.11527343750001 17.0029296875Q76.35062500000001 17.0029296875 75.78373046875001 17.233642578125Q75.21683593750001 17.46435546875 74.86087890625001 17.8466796875Q74.50492187500001 18.22900390625 74.33353515625001 18.70361328125L70.70804687500001 18.09716796875Q71.09037109375001 16.818359375 71.97367187500001 15.921875Q72.85697265625001 15.025390625 74.16874023437501 14.55078125Q75.48050781250001 14.076171875 77.11527343750001 14.076171875Q78.31498046875001 14.076171875 79.43558593750001 14.359619140625Q80.55619140625001 14.64306640625 81.44608398437501 15.236328125Q82.33597656250001 15.82958984375 82.85672851562501 16.77880859375Q83.37748046875001 17.72802734375 83.37748046875001 19.07275390625V29.0H79.63333984375001V26.95654296875H79.50150390625001Q79.14554687500001 27.64208984375 78.55228515625001 28.162841796875Q77.95902343750001 28.68359375 77.12186523437501 28.98681640625Q76.28470703125001 29.2900390625 75.19046875000001 29.2900390625ZM76.31107421875001 26.50830078125Q77.24710937500001 26.50830078125 77.95243164062501 26.13916015625Q78.65775390625001 25.77001953125 79.05326171875001 25.13720703125Q79.44876953125001 24.50439453125 79.44876953125001 23.7265625V22.13134765625Q79.27738281250001 22.26318359375 78.92142578125001 22.36865234375Q78.56546875000001 22.47412109375 78.13041015625001 22.55322265625Q77.69535156250001 22.63232421875 77.27347656250001 22.6982421875Q76.85160156250001 22.76416015625 76.52201171875001 22.8037109375Q75.79691406250001 22.9091796875 75.24320312500001 23.146484375Q74.68949218750001 23.3837890625 74.38626953125001 23.772705078125Q74.08304687500001 24.16162109375 74.08304687500001 24.76806640625Q74.08304687500001 25.3349609375 74.37308593750001 25.723876953125Q74.66312500000001 26.11279296875 75.15750976562501 26.310546875Q75.65189453125001 26.50830078125 76.31107421875001 26.50830078125Z M93.529375 14.2607421875V17.27978515625H84.78865234375V14.2607421875ZM86.81892578125 10.75390625H90.77400390625V24.68896484375Q90.77400390625 25.3876953125 91.083818359375 25.723876953125Q91.3936328125 26.06005859375 92.11873046875 26.06005859375Q92.3428515625 26.06005859375 92.75154296875 26.000732421875Q93.160234375 25.94140625 93.371171875 25.888671875L93.93806640625 28.85498046875Q93.27888671875 29.052734375 92.626298828125 29.1318359375Q91.9737109375 29.2109375 91.38044921875 29.2109375Q89.16560546875 29.2109375 87.992265625 28.1298828125Q86.81892578125 27.048828125 86.81892578125 25.03173828125Z M101.88830078125 29.2900390625Q99.6602734375 29.2900390625 98.045283203125 28.334228515625Q96.43029296875 27.37841796875 95.553583984375 25.671142578125Q94.676875 23.9638671875 94.676875 21.6962890625Q94.676875 19.40234375 95.553583984375 17.695068359375Q96.43029296875 15.98779296875 98.045283203125 15.031982421875Q99.6602734375 14.076171875 101.88830078125 14.076171875Q103.1934765625 14.076171875 104.3008984375 14.4189453125Q105.4083203125 14.76171875 106.26525390625 15.39453125Q107.1221875 16.02734375 107.6758984375 16.93701171875Q108.229609375 17.8466796875 108.440546875 18.98046875L104.76232421875 19.666015625Q104.643671875 19.0859375 104.39318359375 18.631103515625Q104.1426953125 18.17626953125 103.78673828125 17.853271484375Q103.43078125 17.5302734375 102.962763671875 17.35888671875Q102.49474609375 17.1875 101.9278515625 17.1875Q100.8731640625 17.1875 100.154658203125 17.75439453125Q99.43615234375 18.3212890625 99.073603515625 19.33642578125Q98.7110546875 20.3515625 98.7110546875 21.68310546875Q98.7110546875 23.00146484375 99.073603515625 24.010009765625Q99.43615234375 25.0185546875 100.154658203125 25.5986328125Q100.8731640625 26.1787109375 101.9278515625 26.1787109375Q102.49474609375 26.1787109375 102.96935546875 26.000732421875Q103.44396484375 25.82275390625 103.81310546875 25.486572265625Q104.18224609375 25.150390625 104.432734375 24.67578125Q104.68322265625 24.201171875 104.78869140625 23.60791015625L108.4669140625 24.2802734375Q108.2559765625 25.45361328125 107.702265625 26.369873046875Q107.1485546875 27.2861328125 106.29162109375 27.9453125Q105.4346875 28.6044921875 104.320673828125 28.947265625Q103.20666015625 29.2900390625 101.88830078125 29.2900390625Z M115.0196875 29.2900390625Q113.6222265625 29.2900390625 112.508212890625 28.795654296875Q111.39419921875 28.30126953125 110.754794921875 27.319091796875Q110.115390625 26.3369140625 110.115390625 24.87353515625Q110.115390625 23.6474609375 110.570224609375 22.81689453125Q111.02505859375 21.986328125 111.809482421875 21.4853515625Q112.59390625 20.984375 113.589267578125 20.720703125Q114.58462890625 20.45703125 115.6788671875 20.3515625Q116.95767578125 20.2197265625 117.742099609375 20.107666015625Q118.5265234375 19.99560546875 118.889072265625 19.751708984375Q119.25162109375 19.5078125 119.25162109375 19.033203125V18.96728515625Q119.25162109375 18.33447265625 118.98794921875 17.8994140625Q118.72427734375 17.46435546875 118.2101171875 17.233642578125Q117.69595703125 17.0029296875 116.9444921875 17.0029296875Q116.17984375 17.0029296875 115.61294921875 17.233642578125Q115.0460546875 17.46435546875 114.69009765625 17.8466796875Q114.334140625 18.22900390625 114.16275390625 18.70361328125L110.537265625 18.09716796875Q110.91958984375 16.818359375 111.802890625 15.921875Q112.68619140625 15.025390625 113.997958984375 14.55078125Q115.3097265625 14.076171875 116.9444921875 14.076171875Q118.14419921875 14.076171875 119.2648046875 14.359619140625Q120.38541015625 14.64306640625 121.275302734375 15.236328125Q122.1651953125 15.82958984375 122.685947265625 16.77880859375Q123.20669921875 17.72802734375 123.20669921875 19.07275390625V29.0H119.46255859375V26.95654296875H119.33072265625Q118.974765625 27.64208984375 118.38150390625 28.162841796875Q117.7882421875 28.68359375 116.951083984375 28.98681640625Q116.11392578125 29.2900390625 115.0196875 29.2900390625ZM116.14029296875 26.50830078125Q117.076328125 26.50830078125 117.781650390625 26.13916015625Q118.48697265625 25.77001953125 118.88248046875 25.13720703125Q119.27798828125 24.50439453125 119.27798828125 23.7265625V22.13134765625Q119.1066015625 22.26318359375 118.75064453125 22.36865234375Q118.3946875 22.47412109375 117.95962890625 22.55322265625Q117.5245703125 22.63232421875 117.1026953125 22.6982421875Q116.6808203125 22.76416015625 116.35123046875 22.8037109375Q115.6261328125 22.9091796875 115.072421875 23.146484375Q114.5187109375 23.3837890625 114.21548828125 23.772705078125Q113.912265625 24.16162109375 113.912265625 24.76806640625Q113.912265625 25.3349609375 114.2023046875 25.723876953125Q114.49234375 26.11279296875 114.986728515625 26.310546875Q115.48111328125 26.50830078125 116.14029296875 26.50830078125Z","web":"M132.33955078125 29.0 127.0265625 9.3564453125H130.30927734375L133.091015625 20.44384765625Q133.3546875 21.51171875 133.57880859375 22.665283203125Q133.8029296875 23.81884765625 134.020458984375 24.985595703125Q134.23798828125 26.15234375 134.4357421875 27.3125H133.97431640625Q134.18525390625 26.15234375 134.402783203125 24.985595703125Q134.6203125 23.81884765625 134.864208984375 22.665283203125Q135.10810546875 21.51171875 135.3849609375 20.44384765625L138.24580078125 9.3564453125H141.633984375L144.481640625 20.44384765625Q144.75849609375 21.51171875 144.99580078125 22.665283203125Q145.23310546875 23.81884765625 145.463818359375 24.985595703125Q145.69453125 26.15234375 145.90546875 27.3125H145.4044921875Q145.6154296875 26.15234375 145.832958984375 24.985595703125Q146.05048828125 23.81884765625 146.28779296875 22.665283203125Q146.52509765625 21.51171875 146.7755859375 20.44384765625L149.544140625 9.3564453125H152.85322265625L147.5138671875 29.0H143.9279296875L140.85615234375 17.51708984375Q140.48701171875 16.11962890625 140.190380859375 14.478271484375Q139.89375 12.8369140625 139.56416015625 10.8857421875H140.2892578125Q139.946484375 12.7578125 139.676220703125 14.359619140625Q139.40595703125 15.96142578125 138.997265625 17.51708984375L135.938671875 29.0Z M159.93333984375 29.30322265625Q157.74486328125 29.30322265625 156.16283203125 28.3671875Q154.58080078125 27.43115234375 153.730458984375 25.73046875Q152.8801171875 24.02978515625 152.8801171875 21.73583984375Q152.8801171875 19.455078125 153.717275390625 17.734619140625Q154.55443359375 16.01416015625 156.090322265625 15.045166015625Q157.6262109375 14.076171875 159.69603515625 14.076171875Q160.97484375 14.076171875 162.1613671875 14.491455078125Q163.347890625 14.90673828125 164.28392578125 15.796630859375Q165.2199609375 16.6865234375 165.76048828125 18.09716796875Q166.301015625 19.5078125 166.301015625 21.4853515625V22.52685546875H154.488515625V20.3251953125H164.77171875L163.36107421875 21.037109375Q163.36107421875 19.70556640625 162.9523828125 18.6904296875Q162.54369140625 17.67529296875 161.72630859375 17.101806640625Q160.90892578125 16.5283203125 159.69603515625 16.5283203125Q158.496328125 16.5283203125 157.63939453125 17.114990234375Q156.7824609375 17.70166015625 156.33421875 18.65087890625Q155.8859765625 19.60009765625 155.8859765625 20.73388671875V22.23681640625Q155.8859765625 23.7265625 156.393544921875 24.761474609375Q156.90111328125 25.79638671875 157.82396484375 26.32373046875Q158.74681640625 26.85107421875 159.972890625 26.85107421875Q160.76390625 26.85107421875 161.416494140625 26.620361328125Q162.06908203125 26.3896484375 162.54369140625 25.92822265625Q163.01830078125 25.466796875 163.2687890625 24.79443359375L166.07689453125 25.4404296875Q165.7209375 26.58740234375 164.883779296875 27.45751953125Q164.04662109375 28.32763671875 162.787587890625 28.8154296875Q161.5285546875 29.30322265625 159.93333984375 29.30322265625Z M176.29470703125 29.2900390625Q174.97634765625 29.2900390625 174.126005859375 28.835205078125Q173.2756640625 28.38037109375 172.794462890625 27.77392578125Q172.31326171875 27.16748046875 172.04958984375 26.69287109375H171.81228515625V29.0H168.88552734375V9.3564453125H171.89138671875V16.67333984375H172.04958984375Q172.31326171875 16.19873046875 172.781279296875 15.59228515625Q173.249296875 14.98583984375 174.093046875 14.531005859375Q174.936796875 14.076171875 176.29470703125 14.076171875Q178.06130859375 14.076171875 179.4455859375 14.966064453125Q180.82986328125 15.85595703125 181.6340625 17.556640625Q182.43826171875 19.25732421875 182.43826171875 21.669921875Q182.43826171875 24.05615234375 181.64724609375 25.763427734375Q180.85623046875 27.470703125 179.471953125 28.38037109375Q178.08767578125 29.2900390625 176.29470703125 29.2900390625ZM175.5959765625 26.74560546875Q176.835234375 26.74560546875 177.672392578125 26.0732421875Q178.50955078125 25.40087890625 178.938017578125 24.24072265625Q179.366484375 23.08056640625 179.366484375 21.6435546875Q179.366484375 20.20654296875 178.944609375 19.07275390625Q178.522734375 17.93896484375 177.685576171875 17.27978515625Q176.84841796875 16.62060546875 175.5959765625 16.62060546875Q174.36990234375 16.62060546875 173.532744140625 17.246826171875Q172.6955859375 17.873046875 172.267119140625 19.000244140625Q171.83865234375 20.12744140625 171.83865234375 21.6435546875Q171.83865234375 23.15966796875 172.2737109375 24.306640625Q172.70876953125 25.45361328125 173.55251953125 26.099609375Q174.39626953125 26.74560546875 175.5959765625 26.74560546875Z","width":185},"arabic":{"zatca":"M59.812000000000005 30.0Q57.085 30.0 55.762 28.704Q54.439 27.408 54.439 24.492V10.02H57.679V23.951999999999998Q57.679 25.167 58.165000000000006 25.558500000000002Q58.651 25.95 59.839 25.95H60.649V29.19L59.839 30.0Z M59.839 26.76 60.649 25.95H63.187Q64.159 25.95 64.52350000000001 25.747500000000002Q64.888 25.545 64.888 25.032Q64.888 24.681 64.69900000000001 24.3975Q64.51 24.114 64.051 23.736L60.919000000000004 20.928V13.8L73.879 9.696000000000002V13.260000000000002L62.269 16.905V17.067L69.154 23.358Q70.018 24.168 70.7065 24.6675Q71.395 25.167 71.9755 25.4505Q72.556 25.734 73.06899999999999 25.842Q73.582 25.95 74.149 25.95V29.19L73.339 30.0Q72.421 30.0 71.67850000000001 29.8245Q70.936 29.649 70.20700000000001 29.1765Q69.47800000000001 28.704 68.6815 27.9075Q67.885 27.111 66.886 25.869L66.157 24.978L66.022 25.059Q66.13 25.572 66.13 26.139Q66.13 26.948999999999998 65.887 27.651Q65.644 28.353 65.185 28.8795Q64.726 29.406 64.078 29.703Q63.43 30.0 62.620000000000005 30.0H59.839Z M73.339 26.76 74.149 25.95H74.932Q75.904 25.95 76.5385 25.869Q77.173 25.788 77.56450000000001 25.5855Q77.956 25.383 78.1045 25.072499999999998Q78.253 24.762 78.253 24.303Q78.253 23.898 78.18549999999999 23.2635Q78.118 22.629 77.929 21.603L77.47 19.092L80.413 18.606L80.818 21.117Q80.953 21.846 81.03399999999999 22.737000000000002Q81.115 23.628 81.115 24.303Q81.115 27.246 79.6705 28.622999999999998Q78.226 30.0 74.932 30.0H73.339ZM80.38600000000001 16.445999999999998Q79.684 16.445999999999998 79.2385 16.014Q78.793 15.582 78.793 14.637Q78.793 13.692 79.2385 13.26Q79.684 12.828 80.38600000000001 12.828H80.926Q81.628 12.828 82.0735 13.26Q82.519 13.692 82.519 14.637Q82.519 15.582 82.0735 16.014Q81.628 16.445999999999998 80.926 16.445999999999998ZM76.12 16.445999999999998Q75.418 16.445999999999998 74.9725 16.014Q74.527 15.582 74.527 14.637Q74.527 13.692 74.9725 13.26Q75.418 12.828 76.12 12.828H76.66000000000001Q77.36200000000001 12.828 77.8075 13.26Q78.253 13.692 78.253 14.637Q78.253 15.582 77.8075 16.014Q77.36200000000001 16.445999999999998 76.66000000000001 16.445999999999998Z M83.545 10.02H86.785V30.0H83.545Z M86.785 32.43H87.865Q90.322 32.43 91.46950000000001 31.430999999999997Q92.617 30.432 92.59 28.11Q92.59 27.489 92.509 26.8005Q92.428 26.112000000000002 92.293 25.329L91.726 21.738L94.669 21.279L95.074 23.79Q95.29 25.086 95.4115 26.179499999999997Q95.533 27.273 95.533 27.975Q95.533 29.919 95.047 31.485Q94.561 33.051 93.589 34.1715Q92.617 35.292 91.186 35.885999999999996Q89.755 36.48 87.892 36.48H86.785ZM92.563 19.119Q91.861 19.119 91.41550000000001 18.687Q90.97 18.255000000000003 90.97 17.310000000000002Q90.97 16.365000000000002 91.41550000000001 15.933000000000002Q91.861 15.501000000000001 92.563 15.501000000000001H93.10300000000001Q93.805 15.501000000000001 94.2505 15.933000000000002Q94.696 16.365000000000002 94.696 17.310000000000002Q94.696 18.255000000000003 94.2505 18.687Q93.805 19.119 93.10300000000001 19.119Z","web":"M11.448 30.324Q8.559 30.324 6.587999999999999 30.0135Q4.617 29.703 3.402 29.014499999999998Q2.187 28.326 1.6604999999999999 27.2055Q1.134 26.085 1.134 24.465Q1.134 22.305 2.241 19.631999999999998L4.32 20.253Q3.807 21.333 3.537 22.237499999999997Q3.267 23.142 3.267 23.925Q3.267 25.599 4.7655 26.328Q6.264 27.057 9.666 27.057H13.446Q15.39 27.057 16.631999999999998 26.9625Q17.874 26.868 18.5895 26.6115Q19.305 26.355 19.5885 25.923000000000002Q19.872 25.491 19.872 24.816V20.712H22.221V24.816Q22.221 26.948999999999998 24.462 26.948999999999998H25.352999999999998V29.352L24.705 30.0Q20.844 30.0 20.142 26.868H20.007Q19.818 27.867 19.3185 28.5285Q18.819 29.19 17.8335 29.595Q16.848 30.0 15.2955 30.162Q13.743 30.324 11.448 30.324ZM11.313 35.589000000000006Q10.692 35.589000000000006 10.3275 35.211000000000006Q9.963000000000001 34.833000000000006 9.963000000000001 34.050000000000004Q9.963000000000001 33.24 10.3275 32.8755Q10.692 32.511 11.313 32.511H11.718Q12.339 32.511 12.717 32.8755Q13.095 33.24 13.095 34.050000000000004Q13.095 34.833000000000006 12.717 35.211000000000006Q12.339 35.589000000000006 11.718 35.589000000000006Z M24.705 27.597 25.352999999999998 26.948999999999998H25.919999999999998Q27.755999999999997 26.948999999999998 28.511999999999997 26.5305Q29.267999999999997 26.112000000000002 29.267999999999997 25.005Q29.267999999999997 24.546 29.200499999999998 23.844Q29.133 23.142 28.944 21.981L28.511999999999997 19.631999999999998L30.860999999999997 19.253999999999998L31.211999999999996 21.603Q31.535999999999998 23.762999999999998 31.535999999999998 25.005Q31.535999999999998 27.543 30.159 28.7715Q28.781999999999996 30.0 25.919999999999998 30.0H24.705ZM30.968999999999998 35.589000000000006Q30.348 35.589000000000006 29.9835 35.211000000000006Q29.619 34.833000000000006 29.619 34.050000000000004Q29.619 33.24 29.9835 32.8755Q30.348 32.511 30.968999999999998 32.511H31.374Q31.994999999999997 32.511 32.373 32.8755Q32.751 33.24 32.751 34.050000000000004Q32.751 34.833000000000006 32.373 35.211000000000006Q31.994999999999997 35.589000000000006 31.374 35.589000000000006ZM27.162 35.589000000000006Q26.540999999999997 35.589000000000006 26.176499999999997 35.211000000000006Q25.811999999999998 34.833000000000006 25.811999999999998 34.050000000000004Q25.811999999999998 33.24 26.176499999999997 32.8755Q26.540999999999997 32.511 27.162 32.511H27.567Q28.188 32.511 28.566 32.8755Q28.944 33.24 28.944 34.050000000000004Q28.944 34.833000000000006 28.566 35.211000000000006Q28.188 35.589000000000006 27.567 35.589000000000006Z M34.074 33.429H35.883Q39.258 33.429 40.86450000000001 32.079Q42.471000000000004 30.729 42.471000000000004 28.434V27.786H42.336Q41.499 30.027 38.88 30.027Q36.693 30.027 35.504999999999995 28.825499999999998Q34.317 27.624 34.317 25.437Q34.317 24.141 34.7085 23.006999999999998Q35.1 21.872999999999998 35.7885 21.0495Q36.477000000000004 20.226 37.422000000000004 19.74Q38.367000000000004 19.253999999999998 39.474000000000004 19.253999999999998Q41.931 19.253999999999998 43.3215 21.319499999999998Q44.712 23.384999999999998 44.712 27.084Q44.712 31.512 42.5115 33.995999999999995Q40.311 36.48 35.991 36.48H34.074ZM39.555 26.948999999999998Q40.689 26.948999999999998 41.3775 26.787Q42.066 26.625 42.471000000000004 26.274Q42.417 24.492 41.539500000000004 23.412Q40.662 22.332 39.231 22.332Q37.989000000000004 22.332 37.260000000000005 23.088Q36.531 23.844 36.531 25.059Q36.531 26.058 37.165499999999994 26.5035Q37.8 26.948999999999998 39.015 26.948999999999998Z","width":148,"markX":108.48}};
function __build(){
// ---------- core: React access, locale, utils, Icon, Logo
var R = window.React;
var h = R.createElement;
var useState = R.useState, useEffect = R.useEffect, useRef = R.useRef, useMemo = R.useMemo, useContext = R.useContext, useCallback = R.useCallback, useId = R.useId || function () { var r = useRef(null); if (!r.current) r.current = 'zw' + Math.random().toString(36).slice(2, 8); return r.current; };

function cx() { var out = []; for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; if (a) out.push(a); } return out.join(' '); }
function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

// ---- locale
var STR = {
  en: {
    search: 'Search…', searchAll: 'Search invoices, customers, products…', noResults: 'No results', create: 'Create', createX: 'Create “{x}”',
    cancel: 'Cancel', close: 'Close', confirm: 'Confirm', save: 'Save', loading: 'Loading…', optional: 'Optional', required: 'Required',
    rowsSelected: '{n} selected', clear: 'Clear', of: 'of', prev: 'Previous', next: 'Next', page: 'Page', showing: 'Showing {a}–{b} of {t}',
    today: 'Today', dropFiles: 'Drop files here or', browse: 'browse', upload: 'Upload', filters: 'Filters', export: 'Export',
    vatValid: 'Valid VAT number format', vatInvalid: '15 digits, starting and ending with 3', phoneHint: 'Saudi mobile, starts with 5',
    vsLast: 'vs last period', used: 'used', unlimited: 'Unlimited', switchOrg: 'Switch organization', addOrg: 'Create organization', yourOrgs: 'Your organizations',
    quickCreate: 'Quick create', notifications: 'Notifications', help: 'Help', theme: 'Theme', language: 'العربية', favorites: 'Favorites', recent: 'Recently visited',
    step: 'Step {a} of {b}', complete: 'Complete', currency: 'SAR', table: 'Table view', chart: 'Chart view', total: 'Total', other: 'Other'
  },
  ar: {
    search: 'بحث…', searchAll: 'ابحث في الفواتير والعملاء والمنتجات…', noResults: 'لا توجد نتائج', create: 'إنشاء', createX: 'إنشاء «{x}»',
    cancel: 'إلغاء', close: 'إغلاق', confirm: 'تأكيد', save: 'حفظ', loading: 'جارٍ التحميل…', optional: 'اختياري', required: 'مطلوب',
    rowsSelected: 'تم تحديد {n}', clear: 'مسح', of: 'من', prev: 'السابق', next: 'التالي', page: 'صفحة', showing: 'عرض {a}–{b} من {t}',
    today: 'اليوم', dropFiles: 'أفلت الملفات هنا أو', browse: 'استعرض', upload: 'رفع', filters: 'عوامل التصفية', export: 'تصدير',
    vatValid: 'صيغة رقم ضريبي صحيحة', vatInvalid: '١٥ رقمًا تبدأ وتنتهي بالرقم 3', phoneHint: 'جوال سعودي يبدأ بالرقم 5',
    vsLast: 'مقارنة بالفترة السابقة', used: 'مستخدم', unlimited: 'غير محدود', switchOrg: 'تبديل المنشأة', addOrg: 'إنشاء منشأة', yourOrgs: 'منشآتك',
    quickCreate: 'إنشاء سريع', notifications: 'الإشعارات', help: 'المساعدة', theme: 'المظهر', language: 'English', favorites: 'المفضلة', recent: 'تمت زيارتها مؤخرًا',
    step: 'الخطوة {a} من {b}', complete: 'مكتمل', currency: 'ر.س', table: 'عرض جدولي', chart: 'عرض بياني', total: 'الإجمالي', other: 'أخرى'
  }
};
var LocaleCtx = R.createContext(null);
function detectLang() {
  try { var d = document.documentElement; if ((d.getAttribute('dir') || '').toLowerCase() === 'rtl' || (d.lang || '').slice(0, 2) === 'ar') return 'ar'; } catch (e) {}
  return 'en';
}
function LocaleProvider(p) {
  var lang = p.lang === 'ar' ? 'ar' : 'en';
  return h(LocaleCtx.Provider, { value: lang }, h('div', { dir: lang === 'ar' ? 'rtl' : 'ltr', lang: lang, className: cx('zw-locale', lang === 'ar' && 'zw-ar', p.className), style: p.style }, p.children));
}
function useLang() { var c = useContext(LocaleCtx); return c || detectLang(); }
function useT() {
  var lang = useLang();
  return function (k, vars) { var s = (STR[lang] && STR[lang][k]) || STR.en[k] || k; if (vars) for (var v in vars) s = s.split('{' + v + '}').join(vars[v]); return s; };
}

// ---- number / money formatting (Latin digits in both languages for financial clarity)
function fmtNumber(v, dp) {
  if (v === null || v === undefined || v === '' || isNaN(+v)) return '—';
  var d = dp === undefined ? 2 : dp;
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }).format(+v);
}
function fmtCompact(v) { return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(+v); }
function currencyLabel(lang, display) { if (display === 'both') return 'SAR / ر.س'; return lang === 'ar' ? 'ر.س' : 'SAR'; }

// ---- icons (Lucide, ISC) — injected at build time as ICON_NODES
var MIRROR = { 'chevron-right': 1, 'chevron-left': 1, 'arrow-right': 1, 'arrow-left': 1, 'arrow-up-right': 1, 'arrow-down-right': 1, 'log-out': 1, 'send': 1, 'panel-left': 1, 'list-filter': 1 };
function Icon(p) {
  var size = p.size || 18, nodes = ICON_NODES[p.name];
  if (!nodes) return null;
  var kids = nodes.map(function (n, i) { return h(n[0], Object.assign({ key: i }, n[1])); });
  return h('svg', {
    className: cx('zw-icon', MIRROR[p.name] && p.mirror !== false && 'zw-icon--dir', p.className), width: size, height: size, viewBox: '0 0 24 24',
    fill: 'none', stroke: 'currentColor', strokeWidth: p.strokeWidth || 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
    'aria-hidden': p.label ? undefined : true, role: p.label ? 'img' : undefined, 'aria-label': p.label, style: p.style
  }, kids);
}

// ---- Logo — paths injected at build time as LOGO
function Mark(p) {
  var s = p.size || 32;
  return h('svg', { className: 'zw-logo-mark', width: s, height: s, viewBox: '0 0 40 40', 'aria-hidden': true },
    h('rect', { width: 40, height: 40, rx: 10, className: 'zw-logo-tile' }),
    h('rect', { x: 9, y: 9, width: 14.5, height: 6, rx: 1.25, className: 'zw-logo-glyph' }),
    h('rect', { x: 25, y: 9, width: 6, height: 6, rx: 1.25, className: 'zw-logo-pixel' }),
    h('path', { d: 'M24.4 15H31L15.6 25V26H9V25Z', className: 'zw-logo-glyph' }),
    h('rect', { x: 9, y: 25, width: 22, height: 6, rx: 1.25, className: 'zw-logo-glyph' }));
}
function Logo(p) {
  var v = p.variant || 'full', s = p.size || 32;
  if (v === 'mark') return h('span', { className: cx('zw-logo', p.className), role: 'img', 'aria-label': 'ZatcaWeb' }, h(Mark, { size: s }));
  var L = v === 'arabic' ? LOGO.arabic : LOGO.latin, hgt = v === 'arabic' ? 44 : 40;
  var w = L.width * s / 40;
  return h('span', { className: cx('zw-logo', p.className), role: 'img', 'aria-label': v === 'arabic' ? 'زاتكا ويب' : 'ZatcaWeb' },
    h('svg', { width: w, height: hgt * s / 40, viewBox: '0 0 ' + L.width + ' ' + hgt, 'aria-hidden': true },
      h('g', { transform: v === 'arabic' ? 'translate(0 2)' : undefined },
        h('g', { transform: 'translate(' + (v === 'arabic' ? L.markX : 0) + ' 0)' }, h('svg', { width: 40, height: 40, viewBox: '0 0 40 40', overflow: 'visible' },
          h('rect', { width: 40, height: 40, rx: 10, className: 'zw-logo-tile' }),
          h('rect', { x: 9, y: 9, width: 14.5, height: 6, rx: 1.25, className: 'zw-logo-glyph' }),
          h('rect', { x: 25, y: 9, width: 6, height: 6, rx: 1.25, className: 'zw-logo-pixel' }),
          h('path', { d: 'M24.4 15H31L15.6 25V26H9V25Z', className: 'zw-logo-glyph' }),
          h('rect', { x: 9, y: 25, width: 22, height: 6, rx: 1.25, className: 'zw-logo-glyph' }))),
        h('path', { d: L.zatca, className: 'zw-logo-ink' }),
        h('path', { d: L.web, className: 'zw-logo-web' }))));
}

// ---- Buttons
function Spinner(p) { return h('span', { className: cx('zw-spinner', p && p.className), 'aria-hidden': true }); }
var Button = R.forwardRef(function Button(p, ref) {
  var variant = p.variant || 'primary', size = p.size || 'md';
  var rest = omit(p, ['variant', 'size', 'iconStart', 'iconEnd', 'loading', 'kbd', 'fullWidth', 'className', 'children']);
  var isz = size === 'sm' ? 16 : 18;
  return h('button', Object.assign({ ref: ref, type: 'button' }, rest, {
    className: cx('zw-btn', 'zw-btn--' + variant, 'zw-btn--' + size, p.fullWidth && 'zw-btn--full', p.loading && 'is-loading', p.className),
    disabled: p.disabled || p.loading, 'aria-busy': p.loading || undefined
  }),
    p.loading ? h(Spinner) : (p.iconStart ? h(Icon, { name: p.iconStart, size: isz }) : null),
    p.children != null ? h('span', { className: 'zw-btn-label' }, p.children) : null,
    p.iconEnd ? h(Icon, { name: p.iconEnd, size: isz }) : null,
    p.kbd ? h('kbd', { className: 'zw-kbd zw-btn-kbd' }, p.kbd) : null);
});
var IconButton = R.forwardRef(function IconButton(p, ref) {
  var rest = omit(p, ['icon', 'label', 'variant', 'size', 'className', 'badge']);
  var size = p.size || 'md';
  return h('button', Object.assign({ ref: ref, type: 'button', 'aria-label': p.label, title: p.label }, rest, {
    className: cx('zw-btn', 'zw-btn--' + (p.variant || 'ghost'), 'zw-btn--' + size, 'zw-btn--icon', p.className)
  }), h(Icon, { name: p.icon, size: size === 'sm' ? 16 : 18 }), p.badge ? h('span', { className: 'zw-icon-badge' }, p.badge) : null);
});

// ---- Badge & statuses
function Badge(p) {
  return h('span', { className: cx('zw-badge', 'zw-badge--' + (p.tone || 'neutral'), p.size === 'sm' && 'zw-badge--sm', p.className) },
    p.icon ? h(Icon, { name: p.icon, size: 13, strokeWidth: 2 }) : (p.dot ? h('span', { className: 'zw-badge-dot', 'aria-hidden': true }) : null),
    p.children);
}
var INVOICE_STATUS = {
  draft: { tone: 'neutral', icon: 'pencil', en: 'Draft', ar: 'مسودة' },
  pending: { tone: 'info', icon: 'clock', en: 'Pending', ar: 'قيد الانتظار' },
  issued: { tone: 'brand', icon: 'file-check', en: 'Issued', ar: 'صادرة' },
  sent: { tone: 'info', icon: 'send', en: 'Sent', ar: 'مرسلة' },
  viewed: { tone: 'info', icon: 'eye', en: 'Viewed', ar: 'تمت المشاهدة' },
  partially_paid: { tone: 'warning', icon: 'circle-dot', en: 'Partially paid', ar: 'مدفوعة جزئيًا' },
  paid: { tone: 'success', icon: 'circle-check', en: 'Paid', ar: 'مدفوعة' },
  overdue: { tone: 'danger', icon: 'circle-alert', en: 'Overdue', ar: 'متأخرة' },
  cancelled: { tone: 'neutral', icon: 'x', en: 'Cancelled', ar: 'ملغاة' },
  credited: { tone: 'accent', icon: 'file-minus', en: 'Credited', ar: 'دائن' }
};
var COMPLIANCE_STATUS = {
  not_validated: { tone: 'neutral', icon: 'circle-dot', en: 'Not validated', ar: 'لم يتم التحقق' },
  passed: { tone: 'success', icon: 'circle-check', en: 'Validation passed', ar: 'اجتاز التحقق' },
  warning: { tone: 'warning', icon: 'triangle-alert', en: 'Warning', ar: 'تحذير' },
  submission_pending: { tone: 'info', icon: 'clock', en: 'Submission pending', ar: 'بانتظار الإرسال' },
  accepted: { tone: 'success', icon: 'shield-check', en: 'Accepted', ar: 'مقبولة' },
  rejected: { tone: 'danger', icon: 'x', en: 'Rejected', ar: 'مرفوضة' },
  requires_action: { tone: 'warning', icon: 'circle-alert', en: 'Requires action', ar: 'يتطلب إجراء' }
};
var QUOTE_STATUS = {
  draft: INVOICE_STATUS.draft, sent: INVOICE_STATUS.sent, viewed: INVOICE_STATUS.viewed,
  accepted: { tone: 'success', icon: 'circle-check', en: 'Accepted', ar: 'مقبول' },
  rejected: { tone: 'danger', icon: 'x', en: 'Rejected', ar: 'مرفوض' },
  expired: { tone: 'neutral', icon: 'clock', en: 'Expired', ar: 'منتهي' }
};
function makeStatus(map, name) {
  var C = function (p) {
    var lang = useLang(), s = map[p.status] || map[Object.keys(map)[0]];
    return h(Badge, { tone: s.tone, icon: s.icon, size: p.size, className: p.className }, p.label || s[lang]);
  };
  C.displayName = name; return C;
}
var InvoiceStatus = makeStatus(INVOICE_STATUS, 'InvoiceStatus');
var QuoteStatus = makeStatus(QUOTE_STATUS, 'QuoteStatus');
function ComplianceStatus(p) {
  var lang = useLang(), s = COMPLIANCE_STATUS[p.status] || COMPLIANCE_STATUS.not_validated;
  if (p.variant !== 'detailed') return h(Badge, { tone: s.tone, icon: s.icon, size: p.size, className: p.className }, p.label || s[lang]);
  return h('div', { className: cx('zw-compliance', 'zw-compliance--' + s.tone, p.className), role: 'status' },
    h('span', { className: 'zw-compliance-icon' }, h(Icon, { name: s.icon, size: 18 })),
    h('div', { className: 'zw-compliance-body' },
      h('div', { className: 'zw-compliance-title' }, p.label || s[lang]),
      p.detail ? h('div', { className: 'zw-compliance-detail' }, p.detail) : null),
    p.meta ? h('div', { className: 'zw-compliance-meta' }, p.meta) : null);
}

// ---- Kbd
function Kbd(p) { return h('kbd', { className: 'zw-kbd' }, p.children); }

// ---------- forms
function Field(p) {
  var t = useT();
  return h('div', { className: cx('zw-field', p.error && 'has-error', p.disabled && 'is-disabled', p.className) },
    p.label ? h('label', { className: 'zw-label', htmlFor: p.id },
      h('span', null, p.label),
      p.required ? h('span', { className: 'zw-req', 'aria-hidden': true }, '*') : null,
      p.optional ? h('span', { className: 'zw-opt' }, t('optional')) : null,
      p.labelAside ? h('span', { className: 'zw-label-aside' }, p.labelAside) : null) : null,
    p.children,
    p.error ? h('div', { className: 'zw-field-msg zw-field-msg--error', id: p.id + '-msg', role: 'alert' }, h(Icon, { name: 'circle-alert', size: 14 }), h('span', null, p.error))
      : p.hint ? h('div', { className: 'zw-field-msg', id: p.id + '-msg' }, p.hint) : null);
}
var Input = R.forwardRef(function Input(p, ref) {
  var gen = useId(), id = p.id || gen;
  var rest = omit(p, ['label', 'hint', 'error', 'prefix', 'suffix', 'iconStart', 'iconEnd', 'size', 'className', 'required', 'optional', 'labelAside', 'mono', 'align', 'inputClassName', 'trailing']);
  return h(Field, { id: id, label: p.label, hint: p.hint, error: p.error, required: p.required, optional: p.optional, labelAside: p.labelAside, className: p.className, disabled: p.disabled },
    h('div', { className: cx('zw-control', 'zw-control--' + (p.size || 'md'), p.error && 'is-invalid', p.disabled && 'is-disabled', p.readOnly && 'is-readonly') },
      p.iconStart ? h('span', { className: 'zw-affix zw-affix--icon' }, h(Icon, { name: p.iconStart, size: 16 })) : null,
      p.prefix ? h('span', { className: 'zw-affix' }, p.prefix) : null,
      h('input', Object.assign({ ref: ref, id: id, 'aria-invalid': p.error ? true : undefined, 'aria-describedby': (p.error || p.hint) ? id + '-msg' : undefined, required: p.required }, rest, {
        className: cx('zw-input', p.mono && 'zw-mono', p.align === 'end' && 'zw-input--end', p.inputClassName)
      })),
      p.suffix ? h('span', { className: 'zw-affix' }, p.suffix) : null,
      p.iconEnd ? h('span', { className: 'zw-affix zw-affix--icon' }, h(Icon, { name: p.iconEnd, size: 16 })) : null,
      p.trailing || null));
});
function Textarea(p) {
  var gen = useId(), id = p.id || gen;
  var rest = omit(p, ['label', 'hint', 'error', 'className', 'required', 'optional']);
  return h(Field, { id: id, label: p.label, hint: p.hint, error: p.error, required: p.required, optional: p.optional, className: p.className },
    h('textarea', Object.assign({ id: id, rows: 3 }, rest, { className: cx('zw-textarea', p.error && 'is-invalid') })));
}
function Select(p) {
  var gen = useId(), id = p.id || gen;
  var rest = omit(p, ['label', 'hint', 'error', 'options', 'placeholder', 'size', 'className', 'required', 'optional', 'iconStart']);
  return h(Field, { id: id, label: p.label, hint: p.hint, error: p.error, required: p.required, optional: p.optional, className: p.className },
    h('div', { className: cx('zw-control', 'zw-control--' + (p.size || 'md'), 'zw-control--select', p.error && 'is-invalid', p.disabled && 'is-disabled') },
      p.iconStart ? h('span', { className: 'zw-affix zw-affix--icon' }, h(Icon, { name: p.iconStart, size: 16 })) : null,
      h('select', Object.assign({ id: id, className: 'zw-select' }, rest),
        p.placeholder ? h('option', { value: '', disabled: true }, p.placeholder) : null,
        (p.options || []).map(function (o) { o = typeof o === 'string' ? { value: o, label: o } : o; return h('option', { key: o.value, value: o.value, disabled: o.disabled }, o.label); })),
      h('span', { className: 'zw-affix zw-affix--icon zw-select-caret' }, h(Icon, { name: 'chevron-down', size: 16 }))));
}
function Checkbox(p) {
  var gen = useId(), id = p.id || gen;
  var rest = omit(p, ['label', 'description', 'indeterminate', 'className']);
  var ref = useRef(null);
  useEffect(function () { if (ref.current) ref.current.indeterminate = !!p.indeterminate; }, [p.indeterminate]);
  return h('label', { className: cx('zw-check', p.disabled && 'is-disabled', p.className), htmlFor: id },
    h('input', Object.assign({ ref: ref, id: id, type: 'checkbox', className: 'zw-check-input' }, rest)),
    h('span', { className: 'zw-check-box', 'aria-hidden': true }, h(Icon, { name: p.indeterminate ? 'minus' : 'check', size: 12, strokeWidth: 3 })),
    (p.label || p.description) ? h('span', { className: 'zw-check-text' }, p.label ? h('span', { className: 'zw-check-label' }, p.label) : null, p.description ? h('span', { className: 'zw-check-desc' }, p.description) : null) : null);
}
function Switch(p) {
  var gen = useId(), id = p.id || gen;
  var rest = omit(p, ['label', 'description', 'className']);
  return h('label', { className: cx('zw-switch', p.disabled && 'is-disabled', p.className), htmlFor: id },
    h('input', Object.assign({ id: id, type: 'checkbox', role: 'switch', className: 'zw-switch-input' }, rest)),
    h('span', { className: 'zw-switch-track', 'aria-hidden': true }, h('span', { className: 'zw-switch-thumb' })),
    (p.label || p.description) ? h('span', { className: 'zw-check-text' }, p.label ? h('span', { className: 'zw-check-label' }, p.label) : null, p.description ? h('span', { className: 'zw-check-desc' }, p.description) : null) : null);
}

// Currency input: formats on blur, raw while typing; value is a number
function CurrencyInput(p) {
  var lang = useLang();
  var controlled = p.value !== undefined;
  var st = useState(p.defaultValue != null ? p.defaultValue : null), inner = st[0], setInner = st[1];
  var val = controlled ? p.value : inner;
  var fs = useState(false), focused = fs[0], setFocused = fs[1];
  var ds = useState(''), draft = ds[0], setDraft = ds[1];
  var shown = focused ? draft : (val == null || val === '' ? '' : fmtNumber(val, p.decimals));
  return h(Input, Object.assign(omit(p, ['value', 'defaultValue', 'onChange', 'currency', 'decimals', 'currencyDisplay']), {
    inputMode: 'decimal', align: 'end', value: shown, placeholder: p.placeholder || '0.00',
    suffix: h('span', { className: 'zw-currency-tag' }, currencyLabel(lang, p.currencyDisplay)),
    inputClassName: 'zw-tnum',
    onFocus: function () { setFocused(true); setDraft(val == null ? '' : String(val)); },
    onBlur: function () { setFocused(false); },
    onChange: function (e) {
      var raw = e.target.value.replace(/[^0-9.]/g, ''); var parts = raw.split('.'); if (parts.length > 2) raw = parts[0] + '.' + parts.slice(1).join('');
      setDraft(raw); var n = raw === '' ? null : parseFloat(raw); if (!controlled) setInner(n); if (p.onChange) p.onChange(n);
    }
  }));
}

// VAT number: 15 digits, starts and ends with 3 (format check only — not a registry lookup)
function isVatFormat(v) { return /^3\d{13}3$/.test(v || ''); }
function VatInput(p) {
  var t = useT();
  var controlled = p.value !== undefined;
  var st = useState(p.defaultValue || ''), inner = st[0], setInner = st[1];
  var v = controlled ? p.value : inner;
  var ok = isVatFormat(v), touched = (v || '').length > 0;
  return h(Input, Object.assign(omit(p, ['value', 'defaultValue', 'onChange']), {
    value: v, mono: true, inputMode: 'numeric', maxLength: 15, placeholder: p.placeholder || '3XXXXXXXXXXXXX3', dir: 'ltr',
    error: p.error || (touched && v.length === 15 && !ok ? t('vatInvalid') : undefined),
    hint: p.hint || (ok ? undefined : t('vatInvalid')),
    trailing: ok ? h('span', { className: 'zw-affix zw-affix--ok', title: t('vatValid') }, h(Icon, { name: 'circle-check', size: 16, label: t('vatValid') })) : h('span', { className: 'zw-affix zw-affix--count zw-tnum' }, (v || '').length + '/15'),
    onChange: function (e) { var n = e.target.value.replace(/\D/g, '').slice(0, 15); if (!controlled) setInner(n); if (p.onChange) p.onChange(n); }
  }));
}

// Saudi phone: +966 5X XXX XXXX
function fmtPhone(d) { d = d.replace(/\D/g, '').slice(0, 9); var a = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 9)].filter(Boolean); return a.join(' '); }
function PhoneInput(p) {
  var t = useT();
  var controlled = p.value !== undefined;
  var st = useState(p.defaultValue || ''), inner = st[0], setInner = st[1];
  var v = controlled ? p.value : inner;
  var digits = (v || '').replace(/\D/g, '');
  var bad = digits.length > 0 && digits[0] !== '5';
  return h(Input, Object.assign(omit(p, ['value', 'defaultValue', 'onChange']), {
    value: fmtPhone(v || ''), type: 'tel', inputMode: 'tel', dir: 'ltr', placeholder: '5X XXX XXXX', inputClassName: 'zw-tnum',
    prefix: h('span', { className: 'zw-phone-cc', dir: 'ltr' }, h('span', { className: 'zw-phone-flag', 'aria-hidden': true }, 'SA'), '+966'),
    hint: p.hint || t('phoneHint'), error: p.error || (bad ? t('phoneHint') : undefined),
    onChange: function (e) { var n = e.target.value.replace(/\D/g, '').slice(0, 9); if (!controlled) setInner(n); if (p.onChange) p.onChange(n); }
  }));
}

// ---------- FileUpload
function fmtBytes(b) { if (b < 1024) return b + ' B'; if (b < 1048576) return (b / 1024).toFixed(0) + ' KB'; return (b / 1048576).toFixed(1) + ' MB'; }
function FileUpload(p) {
  var t = useT();
  var ds = useState(false), drag = ds[0], setDrag = ds[1];
  var fs = useState(p.files || []), files = p.files || fs[0];
  var inputRef = useRef(null);
  function add(list) { var arr = Array.prototype.slice.call(list).map(function (f) { return { name: f.name, size: f.size, status: 'done' }; }); fs[1](files.concat(arr)); if (p.onFiles) p.onFiles(list); }
  return h('div', { className: cx('zw-upload', p.className) },
    p.label ? h('div', { className: 'zw-label' }, p.label) : null,
    h('div', {
      className: cx('zw-dropzone', drag && 'is-drag', p.compact && 'zw-dropzone--compact'), tabIndex: 0, role: 'button',
      onClick: function () { inputRef.current && inputRef.current.click(); },
      onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current && inputRef.current.click(); } },
      onDragOver: function (e) { e.preventDefault(); setDrag(true); }, onDragLeave: function () { setDrag(false); },
      onDrop: function (e) { e.preventDefault(); setDrag(false); add(e.dataTransfer.files); }
    },
      h('span', { className: 'zw-dropzone-icon' }, h(Icon, { name: p.icon || 'cloud-upload', size: 22 })),
      h('div', { className: 'zw-dropzone-text' }, t('dropFiles'), ' ', h('span', { className: 'zw-link' }, t('browse'))),
      p.hint ? h('div', { className: 'zw-dropzone-hint' }, p.hint) : null,
      h('input', { ref: inputRef, type: 'file', hidden: true, multiple: p.multiple, accept: p.accept, onChange: function (e) { add(e.target.files); } })),
    files.length ? h('ul', { className: 'zw-filelist' }, files.map(function (f, i) {
      return h('li', { key: i, className: cx('zw-file', f.status === 'error' && 'is-error') },
        h('span', { className: 'zw-file-icon' }, h(Icon, { name: /\.(xlsx?|csv)$/i.test(f.name) ? 'file-spreadsheet' : 'file-text', size: 18 })),
        h('div', { className: 'zw-file-body' },
          h('div', { className: 'zw-file-name' }, f.name),
          h('div', { className: 'zw-file-meta' }, f.status === 'error' ? (f.error || 'Upload failed') : fmtBytes(f.size || 0) + (f.status === 'uploading' ? ' · ' + (f.progress || 0) + '%' : '')),
          f.status === 'uploading' ? h('div', { className: 'zw-progress' }, h('div', { className: 'zw-progress-bar', style: { width: (f.progress || 0) + '%' } })) : null),
        f.status === 'done' ? h('span', { className: 'zw-file-ok' }, h(Icon, { name: 'circle-check', size: 16 })) : null,
        h(IconButton, { icon: 'x', label: t('close'), size: 'sm', onClick: function () { fs[1](files.filter(function (_, j) { return j !== i; })); } }));
    })) : null);
}

// ---------- display
function Card(p) {
  return h(p.as || 'section', { className: cx('zw-card', p.padding === 'none' && 'zw-card--flush', p.padding === 'sm' && 'zw-card--sm', p.interactive && 'zw-card--interactive', p.tone && 'zw-card--' + p.tone, p.className), style: p.style },
    (p.title || p.actions) ? h('header', { className: 'zw-card-head' },
      h('div', { className: 'zw-card-titles' },
        p.title ? h('h3', { className: 'zw-card-title' }, p.title) : null,
        p.description ? h('p', { className: 'zw-card-desc' }, p.description) : null),
      p.actions ? h('div', { className: 'zw-card-actions' }, p.actions) : null) : null,
    h('div', { className: 'zw-card-body' }, p.children),
    p.footer ? h('footer', { className: 'zw-card-foot' }, p.footer) : null);
}

function Amount(p) {
  var lang = useLang();
  var v = +p.value, neg = v < 0;
  var cur = p.currency === false ? null : currencyLabel(lang, p.currencyDisplay);
  return h('span', { className: cx('zw-amount', 'zw-amount--' + (p.size || 'md'), p.tone && 'zw-amount--' + p.tone, p.className), dir: 'ltr' },
    p.showSign && v > 0 ? '+' : null, neg ? '−' : null,
    h('span', { className: 'zw-amount-value' }, p.compact ? fmtCompact(Math.abs(v)) : fmtNumber(Math.abs(v), p.decimals)),
    cur ? h('span', { className: 'zw-amount-cur' }, cur) : null);
}

function Sparkline(p) {
  var d = p.data || [], w = p.width || 96, hh = p.height || 32;
  if (d.length < 2) return null;
  var mn = Math.min.apply(null, d), mx = Math.max.apply(null, d), rg = mx - mn || 1;
  var pts = d.map(function (v, i) { return [(i / (d.length - 1)) * (w - 4) + 2, hh - 3 - ((v - mn) / rg) * (hh - 6)]; });
  var line = pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('');
  var last = pts[pts.length - 1];
  return h('svg', { className: cx('zw-spark', 'zw-spark--' + (p.tone || 'brand')), width: w, height: hh, viewBox: '0 0 ' + w + ' ' + hh, 'aria-hidden': true },
    h('path', { d: line + 'L' + last[0] + ' ' + hh + 'L2 ' + hh + 'Z', className: 'zw-spark-area' }),
    h('path', { d: line, className: 'zw-spark-line' }),
    h('circle', { cx: last[0], cy: last[1], r: 3, className: 'zw-spark-dot' }));
}

function Delta(p) {
  var v = p.value, up = v >= 0, good = p.invert ? !up : up;
  return h('span', { className: cx('zw-delta', good ? 'zw-delta--good' : 'zw-delta--bad') },
    h(Icon, { name: up ? 'trending-up' : 'trending-down', size: 14, mirror: false }),
    h('span', { dir: 'ltr' }, (up ? '+' : '−') + Math.abs(v).toFixed(1) + '%'));
}

function StatCard(p) {
  var t = useT();
  return h('div', { className: cx('zw-stat', p.emphasis && 'zw-stat--emphasis', p.className) },
    h('div', { className: 'zw-stat-head' },
      p.icon ? h('span', { className: cx('zw-stat-icon', 'zw-stat-icon--' + (p.tone || 'brand')) }, h(Icon, { name: p.icon, size: 16 })) : null,
      h('span', { className: 'zw-stat-label' }, p.label),
      p.info ? h(Tooltip, { content: p.info }, h('span', { className: 'zw-stat-info', tabIndex: 0 }, h(Icon, { name: 'info', size: 14 }))) : null),
    h('div', { className: 'zw-stat-row' },
      h('div', { className: 'zw-stat-value' }, p.loading ? h(Skeleton, { width: 140, height: 28 }) : (typeof p.value === 'number' && p.currency !== false ? h(Amount, { value: p.value, size: p.size || 'kpi' }) : h('span', { className: 'num-kpi zw-tnum' }, p.value))),
      p.trend ? h(Sparkline, { data: p.trend, tone: p.trendTone || (p.delta != null && (p.invert ? p.delta > 0 : p.delta < 0) ? 'danger' : 'brand') }) : null),
    (p.delta != null || p.footnote) ? h('div', { className: 'zw-stat-foot' },
      p.delta != null ? h(Delta, { value: p.delta, invert: p.invert }) : null,
      h('span', { className: 'zw-stat-foot-text' }, p.footnote || t('vsLast'))) : null);
}

function Avatar(p) {
  var name = p.name || '', STOP = /^(شركة|مؤسسة|مكتب|مصنع|co\.?|est\.?|llc|ltd\.?|company|the)$/i;
  var parts = name.trim().split(/\s+/).filter(function (w) { return !STOP.test(w); }); if (!parts.length) parts = name.trim().split(/\s+/);
  var arabic = /[\u0600-\u06FF]/.test(name);
  var initials = arabic ? parts[0].replace(/^ال/, '')[0] || '' : (parts[0] ? parts[0][0] : '') + (parts.length > 1 ? parts[parts.length - 1][0] : '');
  var hue = 0; for (var i = 0; i < name.length; i++) hue = (hue + name.charCodeAt(i) * 7) % 5;
  return h('span', { className: cx('zw-avatar', 'zw-avatar--' + (p.size || 'md'), p.square && 'zw-avatar--square', 'zw-avatar--c' + hue, p.className), title: name, 'aria-label': name, role: 'img' },
    p.src ? h('img', { src: p.src, alt: '' }) : h('span', { 'aria-hidden': true }, initials.toUpperCase()),
    p.status ? h('span', { className: 'zw-avatar-status zw-avatar-status--' + p.status }) : null);
}
function AvatarGroup(p) {
  var items = p.names || [], max = p.max || 4;
  return h('span', { className: 'zw-avatar-group' }, items.slice(0, max).map(function (n) { return h(Avatar, { key: n, name: n, size: p.size || 'sm' }); }),
    items.length > max ? h('span', { className: cx('zw-avatar', 'zw-avatar--' + (p.size || 'sm'), 'zw-avatar--more') }, '+' + (items.length - max)) : null);
}

function Tabs(p) {
  var controlled = p.value !== undefined;
  var st = useState(p.defaultValue || (p.tabs[0] && p.tabs[0].id)), inner = st[0];
  var val = controlled ? p.value : inner;
  var refs = useRef({});
  function sel(id) { if (!controlled) st[1](id); if (p.onChange) p.onChange(id); }
  function key(e, i) {
    var rtl = e.currentTarget.closest('[dir=rtl]'), n = p.tabs.length, d = 0;
    if (e.key === 'ArrowRight') d = rtl ? -1 : 1; if (e.key === 'ArrowLeft') d = rtl ? 1 : -1;
    if (d) { var j = (i + d + n) % n; sel(p.tabs[j].id); refs.current[p.tabs[j].id] && refs.current[p.tabs[j].id].focus(); }
  }
  return h('div', { className: cx('zw-tabs', 'zw-tabs--' + (p.variant || 'line'), p.className) },
    h('div', { role: 'tablist', className: 'zw-tablist' }, p.tabs.map(function (tb, i) {
      var on = tb.id === val;
      return h('button', { key: tb.id, ref: function (el) { refs.current[tb.id] = el; }, role: 'tab', type: 'button', 'aria-selected': on, tabIndex: on ? 0 : -1, className: cx('zw-tab', on && 'is-active'), onClick: function () { sel(tb.id); }, onKeyDown: function (e) { key(e, i); } },
        tb.icon ? h(Icon, { name: tb.icon, size: 16 }) : null, h('span', null, tb.label),
        tb.count != null ? h('span', { className: 'zw-tab-count' }, tb.count) : null);
    })),
    p.children ? h('div', { role: 'tabpanel', className: 'zw-tabpanel' }, typeof p.children === 'function' ? p.children(val) : p.children) : null);
}

function Breadcrumb(p) {
  var items = p.items || [];
  return h('nav', { 'aria-label': 'Breadcrumb', className: cx('zw-crumbs', p.className) }, h('ol', null, items.map(function (it, i) {
    var last = i === items.length - 1;
    return h('li', { key: i }, last ? h('span', { 'aria-current': 'page' }, it.label) : h('a', { href: it.href || '#', onClick: it.onClick }, it.icon ? h(Icon, { name: it.icon, size: 14 }) : null, it.label),
      last ? null : h(Icon, { name: 'chevron-right', size: 14, className: 'zw-crumb-sep' }));
  })));
}

function Pagination(p) {
  var t = useT();
  var page = p.page || 1, count = p.pageCount || 1;
  function go(n) { if (n >= 1 && n <= count && p.onChange) p.onChange(n); }
  var nums = []; for (var i = 1; i <= count; i++) { if (i === 1 || i === count || Math.abs(i - page) <= 1) nums.push(i); else if (nums[nums.length - 1] !== '…') nums.push('…'); }
  var from = (page - 1) * (p.pageSize || 10) + 1, to = Math.min(page * (p.pageSize || 10), p.total || 0);
  return h('nav', { className: cx('zw-pagination', p.className), 'aria-label': t('page') },
    p.total != null ? h('span', { className: 'zw-pagination-info' }, t('showing', { a: from, b: to, t: p.total.toLocaleString('en-US') })) : h('span'),
    h('div', { className: 'zw-pagination-pages' },
      h(IconButton, { icon: 'chevron-left', label: t('prev'), size: 'sm', variant: 'secondary', disabled: page <= 1, onClick: function () { go(page - 1); } }),
      nums.map(function (n, i) { return n === '…' ? h('span', { key: 'e' + i, className: 'zw-pagination-gap' }, '…') : h('button', { key: n, type: 'button', className: cx('zw-page', n === page && 'is-active'), 'aria-current': n === page ? 'page' : undefined, onClick: function () { go(n); } }, n); }),
      h(IconButton, { icon: 'chevron-right', label: t('next'), size: 'sm', variant: 'secondary', disabled: page >= count, onClick: function () { go(page + 1); } })));
}

function Accordion(p) {
  var st = useState(p.defaultOpen || []), open = st[0];
  function toggle(id) { var on = open.indexOf(id) >= 0; st[1](on ? open.filter(function (x) { return x !== id; }) : (p.multiple ? open.concat(id) : [id])); }
  return h('div', { className: cx('zw-accordion', p.className) }, (p.items || []).map(function (it) {
    var on = open.indexOf(it.id) >= 0;
    return h('div', { key: it.id, className: cx('zw-acc-item', on && 'is-open') },
      h('h3', { className: 'zw-acc-h' }, h('button', { type: 'button', className: 'zw-acc-trigger', 'aria-expanded': on, onClick: function () { toggle(it.id); } },
        it.icon ? h(Icon, { name: it.icon, size: 18 }) : null,
        h('span', { className: 'zw-acc-title' }, it.title, it.subtitle ? h('span', { className: 'zw-acc-sub' }, it.subtitle) : null),
        h(Icon, { name: 'chevron-down', size: 18, className: 'zw-acc-caret' }))),
      on ? h('div', { className: 'zw-acc-panel' }, it.content) : null);
  }));
}

function Timeline(p) {
  return h('ol', { className: cx('zw-timeline', p.compact && 'zw-timeline--compact', p.className) }, (p.items || []).map(function (it, i) {
    return h('li', { key: it.id || i, className: cx('zw-tl-item', 'zw-tl--' + (it.tone || 'neutral'), it.state && 'is-' + it.state) },
      h('span', { className: 'zw-tl-marker' }, it.icon ? h(Icon, { name: it.icon, size: 14, strokeWidth: 2 }) : h('span', { className: 'zw-tl-dot' })),
      h('div', { className: 'zw-tl-body' },
        h('div', { className: 'zw-tl-head' }, h('span', { className: 'zw-tl-title' }, it.title), it.time ? h('time', { className: 'zw-tl-time' }, it.time) : null),
        it.description ? h('div', { className: 'zw-tl-desc' }, it.description) : null,
        it.meta ? h('div', { className: 'zw-tl-meta' }, it.meta) : null));
  }));
}

function Progress(p) {
  var pct = Math.max(0, Math.min(100, p.value || 0));
  return h('div', { className: cx('zw-progress', p.size === 'lg' && 'zw-progress--lg', p.className), role: 'progressbar', 'aria-valuenow': Math.round(pct), 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': p.label },
    h('div', { className: cx('zw-progress-bar', p.tone && 'zw-progress-bar--' + p.tone), style: { width: pct + '%' } }));
}
function UsageMeter(p) {
  var t = useT();
  var unl = p.limit == null || p.limit === Infinity, pct = unl ? 8 : (p.used / p.limit) * 100;
  var tone = unl ? 'brand' : pct >= 100 ? 'danger' : pct >= 80 ? 'warning' : 'brand';
  return h('div', { className: cx('zw-meter', p.className) },
    h('div', { className: 'zw-meter-head' },
      h('span', { className: 'zw-meter-label' }, p.icon ? h(Icon, { name: p.icon, size: 16 }) : null, p.label),
      h('span', { className: 'zw-meter-val zw-tnum', dir: 'ltr' }, h('strong', null, (p.used || 0).toLocaleString('en-US')), ' / ', unl ? t('unlimited') : p.limit.toLocaleString('en-US'), p.unit ? ' ' + p.unit : '')),
    h(Progress, { value: pct, tone: tone, label: p.label }),
    tone !== 'brand' ? h('div', { className: 'zw-meter-note zw-meter-note--' + tone }, h(Icon, { name: tone === 'danger' ? 'circle-alert' : 'triangle-alert', size: 14 }), p.note || (Math.round(pct) + '% ' + t('used'))) : null);
}

function Alert(p) {
  var tone = p.tone || 'info';
  var icon = p.icon || { info: 'info', success: 'circle-check', warning: 'triangle-alert', danger: 'circle-alert', accent: 'sparkles', neutral: 'info' }[tone];
  return h('div', { className: cx('zw-alert', 'zw-alert--' + tone, p.className), role: tone === 'danger' ? 'alert' : 'status' },
    h('span', { className: 'zw-alert-icon' }, h(Icon, { name: icon, size: 18 })),
    h('div', { className: 'zw-alert-body' }, p.title ? h('div', { className: 'zw-alert-title' }, p.title) : null, p.children ? h('div', { className: 'zw-alert-text' }, p.children) : null),
    p.action ? h('div', { className: 'zw-alert-action' }, p.action) : null,
    p.onClose ? h(IconButton, { icon: 'x', label: 'Dismiss', size: 'sm', onClick: p.onClose }) : null);
}
function Insight(p) {
  return h('div', { className: cx('zw-insight', p.className) },
    h('div', { className: 'zw-insight-kicker' }, h(Icon, { name: 'sparkles', size: 14 }), p.kicker || 'Insight'),
    h('div', { className: 'zw-insight-text' }, p.children),
    p.action ? h('div', { className: 'zw-insight-action' }, p.action) : null);
}

// Empty-state illustration: an invoice sheet, a QR module stack and a soft disc — built from tokens
function EmptyArt(p) {
  var k = p.kind || 'invoice';
  return h('svg', { className: 'zw-empty-art', width: 160, height: 112, viewBox: '0 0 160 112', 'aria-hidden': true },
    h('circle', { cx: 80, cy: 60, r: 48, className: 'ea-disc' }),
    h('rect', { x: 52, y: 18, width: 56, height: 74, rx: 8, className: 'ea-sheet' }),
    h('rect', { x: 61, y: 30, width: 22, height: 5, rx: 2.5, className: 'ea-ink' }),
    h('rect', { x: 61, y: 42, width: 38, height: 4, rx: 2, className: 'ea-line' }),
    h('rect', { x: 61, y: 51, width: 30, height: 4, rx: 2, className: 'ea-line' }),
    h('rect', { x: 61, y: 60, width: 34, height: 4, rx: 2, className: 'ea-line' }),
    k === 'search' ? h('g', null, h('circle', { cx: 112, cy: 76, r: 14, className: 'ea-ring' }), h('path', { d: 'M122 86l10 10', className: 'ea-ring' }))
      : k === 'customers' ? h('g', null, h('circle', { cx: 116, cy: 74, r: 9, className: 'ea-brand' }), h('rect', { x: 102, y: 86, width: 28, height: 12, rx: 6, className: 'ea-brand' }))
      : h('g', null, h('rect', { x: 104, y: 70, width: 10, height: 10, rx: 2, className: 'ea-brand' }), h('rect', { x: 116, y: 70, width: 10, height: 10, rx: 2, className: 'ea-accent' }), h('rect', { x: 104, y: 82, width: 10, height: 10, rx: 2, className: 'ea-brand' }), h('rect', { x: 116, y: 82, width: 10, height: 10, rx: 2, className: 'ea-brand-soft' })),
    h('rect', { x: 61, y: 76, width: 18, height: 6, rx: 3, className: 'ea-brand' }));
}
function EmptyState(p) {
  return h('div', { className: cx('zw-empty', p.compact && 'zw-empty--compact', p.className) },
    p.icon ? h('span', { className: 'zw-empty-icon' }, h(Icon, { name: p.icon, size: 24 })) : h(EmptyArt, { kind: p.art }),
    h('h3', { className: 'zw-empty-title' }, p.title),
    p.description ? h('p', { className: 'zw-empty-desc' }, p.description) : null,
    (p.action || p.secondaryAction) ? h('div', { className: 'zw-empty-actions' }, p.action, p.secondaryAction) : null);
}

function Skeleton(p) {
  if (p.lines) return h('div', { className: 'zw-skel-lines', 'aria-hidden': true }, Array.from({ length: p.lines }).map(function (_, i) { return h('span', { key: i, className: 'zw-skel', style: { width: i === p.lines - 1 ? '60%' : '100%', height: 12 } }); }));
  return h('span', { className: cx('zw-skel', p.circle && 'zw-skel--circle', p.className), 'aria-hidden': true, style: { width: p.width || '100%', height: p.height || 14 } });
}

function Stepper(p) {
  var t = useT(), cur = p.current || 0, steps = p.steps || [];
  return h('ol', { className: cx('zw-stepper', 'zw-stepper--' + (p.orientation || 'horizontal'), p.className), 'aria-label': t('step', { a: cur + 1, b: steps.length }) }, steps.map(function (s, i) {
    var state = i < cur ? 'done' : i === cur ? 'current' : 'todo';
    return h('li', { key: i, className: cx('zw-step', 'is-' + state), 'aria-current': state === 'current' ? 'step' : undefined },
      h('span', { className: 'zw-step-marker' }, state === 'done' ? h(Icon, { name: 'check', size: 14, strokeWidth: 2.5 }) : i + 1),
      h('span', { className: 'zw-step-text' }, h('span', { className: 'zw-step-label' }, s.label), s.description ? h('span', { className: 'zw-step-desc' }, s.description) : null));
  }));
}

// ---------- Table & DataGrid
function Table(p) {
  var t = useT();
  var cols = p.columns || [], rows = p.rows || [], rk = p.rowKey || 'id';
  var ss = useState(p.defaultSort || null), sort = ss[0];
  var sel = p.selected, setSel = p.onSelectedChange;
  var sorted = useMemo(function () {
    if (!sort) return rows;
    var c = cols.filter(function (c) { return c.key === sort.key; })[0]; if (!c) return rows;
    var get = c.sortValue || function (r) { return r[c.key]; };
    return rows.slice().sort(function (a, b) { var x = get(a), y = get(b); var r = typeof x === 'number' ? x - y : String(x).localeCompare(String(y)); return sort.dir === 'asc' ? r : -r; });
  }, [rows, sort]);
  var allOn = sel && rows.length > 0 && sel.length === rows.length, someOn = sel && sel.length > 0 && !allOn;
  function toggleAll() { setSel && setSel(allOn ? [] : rows.map(function (r) { return r[rk]; })); }
  function toggle(id) { setSel && setSel(sel.indexOf(id) >= 0 ? sel.filter(function (x) { return x !== id; }) : sel.concat(id)); }
  return h('div', { className: cx('zw-table-wrap', p.className), style: p.maxHeight ? { maxHeight: p.maxHeight } : undefined },
    h('table', { className: cx('zw-table', p.density === 'compact' && 'zw-table--compact', p.stickyHeader && 'zw-table--sticky') },
      p.caption ? h('caption', { className: 'zw-sr' }, p.caption) : null,
      h('thead', null, h('tr', null,
        sel ? h('th', { className: 'zw-td-check', scope: 'col' }, h(Checkbox, { checked: allOn, indeterminate: someOn, onChange: toggleAll, 'aria-label': 'Select all' })) : null,
        cols.map(function (c) {
          var on = sort && sort.key === c.key;
          return h('th', { key: c.key, scope: 'col', style: { width: c.width }, className: cx(c.align === 'end' && 'is-end', c.align === 'center' && 'is-center'), 'aria-sort': on ? (sort.dir === 'asc' ? 'ascending' : 'descending') : undefined },
            c.sortable ? h('button', { type: 'button', className: cx('zw-th-sort', on && 'is-on'), onClick: function () { ss[1](on && sort.dir === 'desc' ? { key: c.key, dir: 'asc' } : { key: c.key, dir: 'desc' }); } },
              c.header, h(Icon, { name: on ? (sort.dir === 'asc' ? 'chevron-up' : 'chevron-down') : 'chevrons-up-down', size: 14 })) : c.header);
        }))),
      h('tbody', null, p.loading ? Array.from({ length: p.loadingRows || 5 }).map(function (_, i) {
        return h('tr', { key: 'sk' + i }, sel ? h('td', { className: 'zw-td-check' }, h(Skeleton, { width: 16, height: 16 })) : null, cols.map(function (c) { return h('td', { key: c.key }, h(Skeleton, { width: c.align === 'end' ? 72 : '70%' })); }));
      }) : sorted.length === 0 ? h('tr', null, h('td', { colSpan: cols.length + (sel ? 1 : 0), className: 'zw-td-empty' }, p.empty || h(EmptyState, { compact: true, icon: 'inbox', title: t('noResults') })))
        : sorted.map(function (r) {
          var id = r[rk], on = sel && sel.indexOf(id) >= 0;
          return h('tr', { key: id, className: cx(on && 'is-selected', p.onRowClick && 'is-clickable'), onClick: p.onRowClick ? function (e) { if (e.target.closest('input,button,a')) return; p.onRowClick(r); } : undefined },
            sel ? h('td', { className: 'zw-td-check' }, h(Checkbox, { checked: on, onChange: function () { toggle(id); }, 'aria-label': 'Select row' })) : null,
            cols.map(function (c) { return h('td', { key: c.key, className: cx(c.align === 'end' && 'is-end', c.align === 'center' && 'is-center', c.mono && 'zw-mono', c.numeric && 'zw-tnum') }, c.render ? c.render(r) : r[c.key]); }));
        })),
      p.footer ? h('tfoot', null, p.footer) : null));
}

function FilterChip(p) {
  return h('button', { type: 'button', className: cx('zw-chip', p.active && 'is-active'), onClick: p.onClick },
    p.icon ? h(Icon, { name: p.icon, size: 14 }) : null, h('span', null, p.label), p.value ? h('span', { className: 'zw-chip-val' }, p.value) : null,
    p.onRemove ? h('span', { className: 'zw-chip-x', role: 'button', 'aria-label': 'Remove filter', onClick: function (e) { e.stopPropagation(); p.onRemove(); } }, h(Icon, { name: 'x', size: 12 })) : h(Icon, { name: 'chevron-down', size: 14 }));
}

function DataGrid(p) {
  var t = useT();
  var qs = useState(''), q = qs[0];
  var ss = useState([]), sel = ss[0];
  var ps = useState(1), page = ps[0];
  var size = p.pageSize || 8;
  var rows = useMemo(function () {
    if (!q) return p.rows || [];
    var s = q.toLowerCase(), keys = p.searchKeys || (p.columns || []).map(function (c) { return c.key; });
    return (p.rows || []).filter(function (r) { return keys.some(function (k) { return String(r[k] == null ? '' : r[k]).toLowerCase().indexOf(s) >= 0; }); });
  }, [p.rows, q]);
  var count = Math.max(1, Math.ceil(rows.length / size)), pg = Math.min(page, count);
  var pageRows = rows.slice((pg - 1) * size, pg * size);
  return h('div', { className: cx('zw-grid', p.className) },
    h('div', { className: 'zw-grid-toolbar' },
      sel.length ? h('div', { className: 'zw-grid-bulk', role: 'region', 'aria-label': 'Bulk actions' },
        h('span', { className: 'zw-grid-bulk-count' }, t('rowsSelected', { n: sel.length })),
        (p.bulkActions || []).map(function (a, i) { return h(Button, { key: i, size: 'sm', variant: a.danger ? 'danger-ghost' : 'secondary', iconStart: a.icon, onClick: function () { a.onClick && a.onClick(sel); } }, a.label); }),
        h(Button, { size: 'sm', variant: 'ghost', onClick: function () { ss[1]([]); } }, t('clear')))
        : h(R.Fragment, null,
          h('div', { className: 'zw-grid-search' }, h(Input, { size: 'sm', iconStart: 'search', placeholder: p.searchPlaceholder || t('search'), value: q, onChange: function (e) { qs[1](e.target.value); ps[1](1); }, 'aria-label': t('search') })),
          h('div', { className: 'zw-grid-filters' }, p.filters || null),
          h('div', { className: 'zw-grid-actions' }, p.actions || null))),
    h(Table, { columns: p.columns, rows: pageRows, rowKey: p.rowKey, selected: p.selectable === false ? undefined : sel, onSelectedChange: ss[1], onRowClick: p.onRowClick, density: p.density, loading: p.loading, empty: p.empty, defaultSort: p.defaultSort, stickyHeader: true }),
    h('div', { className: 'zw-grid-foot' }, h(Pagination, { page: pg, pageCount: count, total: rows.length, pageSize: size, onChange: ps[1] })));
}

// ---------- overlays
function useOutside(ref, on, cb) {
  useEffect(function () {
    if (!on) return;
    function f(e) { if (ref.current && !ref.current.contains(e.target)) cb(); }
    function k(e) { if (e.key === 'Escape') cb(); }
    document.addEventListener('mousedown', f); document.addEventListener('keydown', k);
    return function () { document.removeEventListener('mousedown', f); document.removeEventListener('keydown', k); };
  }, [on]);
}

function Tooltip(p) {
  var st = useState(!!p.defaultOpen), open = st[0], set = st[1];
  var id = useId();
  return h('span', { className: 'zw-tip-wrap', onMouseEnter: function () { set(true); }, onMouseLeave: function () { set(!!p.defaultOpen); }, onFocus: function () { set(true); }, onBlur: function () { set(!!p.defaultOpen); }, 'aria-describedby': open ? id : undefined },
    p.children,
    open ? h('span', { role: 'tooltip', id: id, className: cx('zw-tip', 'zw-tip--' + (p.side || 'top')) }, p.content, p.shortcut ? h('kbd', { className: 'zw-kbd zw-kbd--inverse' }, p.shortcut) : null) : null);
}

function DropdownMenu(p) {
  var st = useState(!!p.defaultOpen), open = st[0], set = st[1];
  var ref = useRef(null), listRef = useRef(null);
  useOutside(ref, open && !p.defaultOpen, function () { set(false); });
  function onKey(e) {
    var items = listRef.current ? Array.prototype.slice.call(listRef.current.querySelectorAll('[role=menuitem]:not([disabled])')) : [];
    var i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
  }
  var trigger = R.cloneElement(p.trigger, { onClick: function () { set(!open); }, 'aria-haspopup': 'menu', 'aria-expanded': open });
  return h('div', { ref: ref, className: 'zw-pop-wrap', onKeyDown: onKey },
    trigger,
    open ? h('div', { ref: listRef, role: 'menu', className: cx('zw-menu', 'zw-pop', 'zw-pop--' + (p.align || 'start'), p.width && 'zw-menu--w'), style: p.width ? { width: p.width } : undefined },
      p.header ? h('div', { className: 'zw-menu-header' }, p.header) : null,
      (p.items || []).map(function (it, i) {
        if (it.divider) return h('div', { key: i, className: 'zw-menu-sep', role: 'separator' });
        if (it.heading) return h('div', { key: i, className: 'zw-menu-heading' }, it.heading);
        return h('button', { key: i, type: 'button', role: 'menuitem', disabled: it.disabled, className: cx('zw-menu-item', it.danger && 'is-danger'), onClick: function () { set(false); it.onSelect && it.onSelect(); } },
          it.icon ? h(Icon, { name: it.icon, size: 16 }) : null,
          h('span', { className: 'zw-menu-label' }, it.label, it.description ? h('span', { className: 'zw-menu-desc' }, it.description) : null),
          it.shortcut ? h('kbd', { className: 'zw-kbd' }, it.shortcut) : null);
      })) : null);
}

function useLockFocus(open, ref, onClose) {
  useEffect(function () {
    if (!open) return;
    var prev = document.activeElement;
    var el = ref.current; if (el) { var f = el.querySelector('[data-autofocus]') || el.querySelector('input:not([type=hidden]),select,textarea') || el; if (f === el) el.setAttribute('tabindex', '-1'); f.focus({ preventScroll: true }); }
    function k(e) {
      if (e.key === 'Escape' && onClose) onClose();
      if (e.key === 'Tab' && el) {
        var fs = el.querySelectorAll('button:not([disabled]),input,select,textarea,a[href],[tabindex]:not([tabindex="-1"])');
        if (!fs.length) return; var a = fs[0], z = fs[fs.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    }
    document.addEventListener('keydown', k);
    return function () { document.removeEventListener('keydown', k); prev && prev.focus && prev.focus({ preventScroll: true }); };
  }, [open]);
}

function Dialog(p) {
  var t = useT(), ref = useRef(null), id = useId();
  useLockFocus(p.open, ref, p.onClose);
  if (!p.open) return null;
  return h('div', { className: cx('zw-overlay', p.contained && 'is-contained') },
    h('div', { className: 'zw-scrim', onClick: p.dismissable === false ? undefined : p.onClose }),
    h('div', { ref: ref, role: p.tone === 'danger' ? 'alertdialog' : 'dialog', 'aria-modal': true, 'aria-labelledby': id + 't', className: cx('zw-dialog', 'zw-dialog--' + (p.size || 'md'), p.className) },
      h('div', { className: 'zw-dialog-head' },
        p.tone ? h('span', { className: 'zw-dialog-icon zw-dialog-icon--' + p.tone }, h(Icon, { name: p.icon || (p.tone === 'danger' ? 'triangle-alert' : 'info'), size: 20 })) : null,
        h('div', { className: 'zw-dialog-titles' }, h('h2', { id: id + 't', className: 'zw-dialog-title' }, p.title), p.description ? h('p', { className: 'zw-dialog-desc' }, p.description) : null),
        h(IconButton, { icon: 'x', label: t('close'), size: 'sm', onClick: p.onClose, className: 'zw-dialog-x' })),
      p.children ? h('div', { className: 'zw-dialog-body' }, p.children) : null,
      p.footer ? h('div', { className: 'zw-dialog-foot' }, p.footer) : null));
}

function Drawer(p) {
  var t = useT(), ref = useRef(null), id = useId();
  useLockFocus(p.open, ref, p.onClose);
  if (!p.open) return null;
  return h('div', { className: cx('zw-overlay', 'zw-overlay--drawer', p.contained && 'is-contained') },
    h('div', { className: 'zw-scrim', onClick: p.onClose }),
    h('aside', { ref: ref, role: 'dialog', 'aria-modal': true, 'aria-labelledby': id + 't', className: cx('zw-drawer', 'zw-drawer--' + (p.side || 'end')), style: { width: p.width || 480 } },
      h('div', { className: 'zw-drawer-head' },
        h('div', { className: 'zw-dialog-titles' }, h('h2', { id: id + 't', className: 'zw-dialog-title' }, p.title), p.description ? h('p', { className: 'zw-dialog-desc' }, p.description) : null),
        h(IconButton, { icon: 'x', label: t('close'), size: 'sm', onClick: p.onClose })),
      h('div', { className: 'zw-drawer-body' }, p.children),
      p.footer ? h('div', { className: 'zw-drawer-foot' }, p.footer) : null));
}

function Toast(p) {
  var tone = p.tone || 'neutral';
  var icon = { success: 'circle-check', danger: 'circle-alert', warning: 'triangle-alert', info: 'info', neutral: 'info', loading: null }[tone];
  return h('div', { className: cx('zw-toast', 'zw-toast--' + tone, p.className), role: tone === 'danger' ? 'alert' : 'status', 'aria-live': 'polite' },
    h('span', { className: 'zw-toast-icon' }, tone === 'loading' ? h(Spinner) : h(Icon, { name: icon, size: 18 })),
    h('div', { className: 'zw-toast-body' }, h('div', { className: 'zw-toast-title' }, p.title), p.description ? h('div', { className: 'zw-toast-desc' }, p.description) : null),
    p.action ? h('button', { type: 'button', className: 'zw-toast-action', onClick: p.action.onClick }, p.action.label) : null,
    p.onClose ? h('button', { type: 'button', className: 'zw-toast-x', 'aria-label': 'Dismiss', onClick: p.onClose }, h(Icon, { name: 'x', size: 14 })) : null);
}
function ToastStack(p) { return h('div', { className: cx('zw-toasts', p.contained && 'is-contained'), 'aria-live': 'polite' }, (p.toasts || []).map(function (x, i) { return h(Toast, Object.assign({ key: x.id || i }, x)); })); }

// ---- Combobox: searchable select with optional "create" row
function Combobox(p) {
  var t = useT(), gen = useId(), id = p.id || gen;
  var os = useState(!!p.defaultOpen), open = os[0], setOpen = os[1];
  var qs = useState(''), q = qs[0], setQ = qs[1];
  var vs = useState(p.defaultValue || null), inner = vs[0];
  var val = p.value !== undefined ? p.value : inner;
  var as = useState(0), active = as[0], setActive = as[1];
  var ref = useRef(null);
  useOutside(ref, open && !p.defaultOpen, function () { setOpen(false); });
  var opts = (p.options || []).filter(function (o) { if (!q) return true; var s = q.toLowerCase(); return (o.label + ' ' + (o.description || '') + ' ' + (o.keywords || '')).toLowerCase().indexOf(s) >= 0; });
  var current = (p.options || []).filter(function (o) { return o.value === val; })[0];
  var showCreate = p.onCreate && q && !opts.some(function (o) { return o.label.toLowerCase() === q.toLowerCase(); });
  function pick(o) { if (p.value === undefined) vs[1](o.value); p.onChange && p.onChange(o.value, o); setOpen(false); setQ(''); }
  function key(e) {
    var n = opts.length + (showCreate ? 1 : 0);
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setActive((active + 1) % Math.max(n, 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + n) % Math.max(n, 1)); }
    if (e.key === 'Enter' && open) { e.preventDefault(); if (active < opts.length) pick(opts[active]); else if (showCreate) { p.onCreate(q); setOpen(false); } }
    if (e.key === 'Escape') setOpen(false);
  }
  return h(Field, { id: id, label: p.label, hint: p.hint, error: p.error, required: p.required, className: p.className },
    h('div', { ref: ref, className: 'zw-pop-wrap zw-combo' },
      h('div', { className: cx('zw-control', 'zw-control--' + (p.size || 'md'), open && 'is-open', p.error && 'is-invalid') },
        current && current.avatar && !open ? h('span', { className: 'zw-affix' }, h(Avatar, { name: current.label, size: 'xs', square: current.square })) : h('span', { className: 'zw-affix zw-affix--icon' }, h(Icon, { name: p.icon || 'search', size: 16 })),
        h('input', { id: id, className: 'zw-input', role: 'combobox', 'aria-expanded': open, 'aria-controls': id + '-list', 'aria-autocomplete': 'list', autoComplete: 'off',
          placeholder: current ? current.label : (p.placeholder || t('search')), value: open ? q : (current ? current.label : ''),
          onFocus: function () { setOpen(true); }, onChange: function (e) { setQ(e.target.value); setOpen(true); setActive(0); }, onKeyDown: key }),
        h('span', { className: 'zw-affix zw-affix--icon' }, h(Icon, { name: 'chevrons-up-down', size: 16 }))),
      open ? h('div', { id: id + '-list', role: 'listbox', className: 'zw-pop zw-pop--start zw-listbox' },
        opts.length === 0 && !showCreate ? h('div', { className: 'zw-listbox-empty' }, t('noResults')) : null,
        opts.map(function (o, i) {
          return h('div', { key: o.value, role: 'option', 'aria-selected': o.value === val, className: cx('zw-option', i === active && 'is-active'), onMouseEnter: function () { setActive(i); }, onMouseDown: function (e) { e.preventDefault(); pick(o); } },
            o.avatar ? h(Avatar, { name: o.label, size: 'sm', square: o.square }) : o.icon ? h(Icon, { name: o.icon, size: 16 }) : null,
            h('span', { className: 'zw-option-text' }, h('span', { className: 'zw-option-label' }, o.label), o.description ? h('span', { className: 'zw-option-desc' }, o.description) : null),
            o.meta ? h('span', { className: 'zw-option-meta' }, o.meta) : null,
            o.value === val ? h(Icon, { name: 'check', size: 16, className: 'zw-option-check' }) : null);
        }),
        showCreate ? h('div', { role: 'option', 'aria-selected': false, className: cx('zw-option', 'zw-option--create', active === opts.length && 'is-active'), onMouseDown: function (e) { e.preventDefault(); p.onCreate(q); setOpen(false); } },
          h(Icon, { name: 'plus', size: 16 }), h('span', { className: 'zw-option-label' }, t('createX', { x: q }))) : null) : null));
}

// ---- DatePicker (Gregorian, ISO yyyy-mm-dd; optional Hijri hint via Intl islamic-umalqura)
var MONTHS = { en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'], ar: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] };
var DOW = { en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'], ar: ['أحد', 'إثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'] };
function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function parseIso(s) { if (!s) return null; var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
function hijri(d, lang) { try { return new Intl.DateTimeFormat((lang === 'ar' ? 'ar-SA' : 'en-US') + '-u-ca-islamic-umalqura-nu-latn', { day: 'numeric', month: 'long', year: 'numeric' }).format(d); } catch (e) { return ''; } }
function fmtDate(s, lang) { var d = parseIso(s); if (!d) return ''; return d.getDate() + ' ' + MONTHS[lang][d.getMonth()] + ' ' + d.getFullYear(); }
function DatePicker(p) {
  var lang = useLang(), t = useT(), gen = useId(), id = p.id || gen;
  var vs = useState(p.defaultValue || null), inner = vs[0];
  var val = p.value !== undefined ? p.value : inner;
  var os = useState(!!p.defaultOpen), open = os[0], setOpen = os[1];
  var base = parseIso(val) || parseIso(p.today) || new Date();
  var ms = useState(new Date(base.getFullYear(), base.getMonth(), 1)), month = ms[0], setMonth = ms[1];
  var ref = useRef(null);
  useOutside(ref, open && !p.defaultOpen, function () { setOpen(false); });
  var todayIso = p.today || iso(new Date());
  var first = month.getDay(), days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  var cells = []; for (var i = 0; i < first; i++) cells.push(null); for (var d = 1; d <= days; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  function pick(dt) { var s = iso(dt); if (p.value === undefined) vs[1](s); p.onChange && p.onChange(s); if (!p.defaultOpen) setOpen(false); }
  return h(Field, { id: id, label: p.label, hint: p.showHijri && val ? hijri(parseIso(val), lang) : p.hint, error: p.error, required: p.required, className: p.className },
    h('div', { ref: ref, className: 'zw-pop-wrap' },
      h('button', { id: id, type: 'button', className: cx('zw-control', 'zw-control--' + (p.size || 'md'), 'zw-control--button', open && 'is-open'), 'aria-haspopup': 'dialog', 'aria-expanded': open, onClick: function () { setOpen(!open); } },
        h('span', { className: 'zw-affix zw-affix--icon' }, h(Icon, { name: 'calendar', size: 16 })),
        h('span', { className: cx('zw-input', !val && 'is-placeholder') }, val ? fmtDate(val, lang) : (p.placeholder || 'Select date'))),
      open ? h('div', { className: 'zw-pop zw-pop--start zw-cal', role: 'dialog', 'aria-label': p.label || 'Calendar' },
        h('div', { className: 'zw-cal-head' },
          h(IconButton, { icon: 'chevron-left', label: t('prev'), size: 'sm', onClick: function () { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); } }),
          h('div', { className: 'zw-cal-title' }, MONTHS[lang][month.getMonth()] + ' ' + month.getFullYear(), p.showHijri ? h('span', { className: 'zw-cal-hijri' }, hijri(new Date(month.getFullYear(), month.getMonth(), 15), lang)) : null),
          h(IconButton, { icon: 'chevron-right', label: t('next'), size: 'sm', onClick: function () { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); } })),
        h('div', { className: 'zw-cal-grid', role: 'grid' },
          DOW[lang].map(function (w) { return h('span', { key: w, className: 'zw-cal-dow', role: 'columnheader' }, w); }),
          cells.map(function (c, i) {
            if (!c) return h('span', { key: 'b' + i });
            var s = iso(c);
            return h('button', { key: s, type: 'button', role: 'gridcell', className: cx('zw-cal-day', s === val && 'is-selected', s === todayIso && 'is-today'), 'aria-selected': s === val, onClick: function () { pick(c); } }, c.getDate());
          })),
        h('div', { className: 'zw-cal-foot' },
          h(Button, { size: 'sm', variant: 'ghost', onClick: function () { pick(parseIso(todayIso)); } }, t('today')),
          (p.presets || []).map(function (pr) { return h(Button, { key: pr.label, size: 'sm', variant: 'ghost', onClick: function () { pick(parseIso(pr.value)); } }, pr.label); }))) : null));
}

// ---- Command menu (Ctrl/Cmd + K)
function CommandMenu(p) {
  var t = useT();
  var qs = useState(p.defaultQuery || ''), q = qs[0];
  var as = useState(0), active = as[0], setActive = as[1];
  var ref = useRef(null);
  useLockFocus(p.open, ref, p.onClose);
  if (!p.open) return null;
  var flat = [];
  var groups = (p.groups || []).map(function (g) {
    var items = g.items.filter(function (it) { if (!q) return true; return (it.label + ' ' + (it.description || '') + ' ' + (it.keywords || '')).toLowerCase().indexOf(q.toLowerCase()) >= 0; });
    items.forEach(function (it) { flat.push(it); });
    return { heading: g.heading, items: items };
  }).filter(function (g) { return g.items.length; });
  function key(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((active + 1) % Math.max(flat.length, 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActive((active - 1 + flat.length) % Math.max(flat.length, 1)); }
    if (e.key === 'Enter' && flat[active]) { flat[active].onSelect && flat[active].onSelect(); p.onClose && p.onClose(); }
  }
  var n = -1;
  return h('div', { className: cx('zw-overlay', 'zw-overlay--top', p.contained && 'is-contained') },
    h('div', { className: 'zw-scrim', onClick: p.onClose }),
    h('div', { ref: ref, role: 'dialog', 'aria-modal': true, 'aria-label': 'Command menu', className: 'zw-cmd', onKeyDown: key },
      h('div', { className: 'zw-cmd-search' }, h(Icon, { name: 'search', size: 18 }),
        h('input', { 'data-autofocus': true, className: 'zw-cmd-input', placeholder: p.placeholder || t('searchAll'), value: q, onChange: function (e) { qs[1](e.target.value); setActive(0); }, role: 'combobox', 'aria-expanded': true }),
        h('kbd', { className: 'zw-kbd' }, 'Esc')),
      h('div', { className: 'zw-cmd-list', role: 'listbox' },
        groups.length === 0 ? h(EmptyState, { compact: true, icon: 'search', title: t('noResults'), description: q }) : null,
        groups.map(function (g, gi) {
          return h('div', { key: gi, className: 'zw-cmd-group', role: 'group', 'aria-label': g.heading },
            h('div', { className: 'zw-cmd-heading' }, g.heading),
            g.items.map(function (it) {
              n++; var idx = n;
              return h('div', { key: it.id || it.label, role: 'option', 'aria-selected': idx === active, className: cx('zw-cmd-item', idx === active && 'is-active'), onMouseEnter: function () { setActive(idx); }, onClick: function () { it.onSelect && it.onSelect(); p.onClose && p.onClose(); } },
                h('span', { className: 'zw-cmd-icon' }, h(Icon, { name: it.icon || 'arrow-right', size: 16 })),
                h('span', { className: 'zw-cmd-label' }, it.label, it.description ? h('span', { className: 'zw-cmd-desc' }, it.description) : null),
                it.badge || null,
                it.shortcut ? h('kbd', { className: 'zw-kbd' }, it.shortcut) : null);
            }));
        })),
      h('div', { className: 'zw-cmd-foot' },
        h('span', null, h('kbd', { className: 'zw-kbd' }, '↑'), h('kbd', { className: 'zw-kbd' }, '↓'), ' Navigate'),
        h('span', null, h('kbd', { className: 'zw-kbd' }, '↵'), ' Open'),
        h('span', { className: 'zw-cmd-foot-end' }, h(Icon, { name: 'sparkles', size: 14 }), p.aiHint || 'Ask Zatca AI with ?'))));
}

// ---------- Chart (dependency-free SVG): bar | stacked | line | area | donut
function useWidth(ref, fallback) {
  var ws = useState(fallback), w = ws[0];
  useEffect(function () {
    if (!ref.current) return;
    var el = ref.current; ws[1](el.clientWidth || fallback);
    if (!window.ResizeObserver) return;
    var ro = new ResizeObserver(function () { ws[1](el.clientWidth || fallback); }); ro.observe(el);
    return function () { ro.disconnect(); };
  }, []);
  return w;
}
function niceStep(v) { if (v <= 0) return 1; var e = Math.pow(10, Math.floor(Math.log10(v))), m = v / e; var n = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10; return n * e; }
function seriesColor(s, i) { return 'var(--' + (s.color || 'chart-' + (i + 1)) + ')'; }
function fmtVal(v, f, lang) { if (f === 'percent') return v.toFixed(1) + '%'; if (f === 'currency') return fmtNumber(v, 2) + ' ' + currencyLabel(lang); return v.toLocaleString('en-US'); }

function Legend(p) {
  return h('ul', { className: 'zw-legend' }, p.series.map(function (s, i) {
    return h('li', { key: s.key }, h('span', { className: cx('zw-legend-swatch', p.line && 'is-line'), style: { background: seriesColor(s, i) } }), h('span', null, s.label), p.values ? h('span', { className: 'zw-legend-val zw-tnum' }, p.values[i]) : null);
  }));
}

function Chart(p) {
  var lang = useLang(), t = useT();
  var wrap = useRef(null), W = useWidth(wrap, p.width || 560), H = p.height || 240;
  var hs = useState(null), hover = hs[0], setHover = hs[1];
  var vs = useState('chart'), view = vs[0];
  var type = p.type || 'bar', data = p.data || [], series = p.series || [], xKey = p.xKey || 'label';
  var rtl = lang === 'ar' && p.mirror !== false;
  var head = (p.title || p.tableToggle) ? h('div', { className: 'zw-chart-head' },
    p.title ? h('div', { className: 'zw-chart-title' }, p.title, p.subtitle ? h('span', { className: 'zw-chart-sub' }, p.subtitle) : null) : h('span'),
    p.tableToggle ? h('div', { className: 'zw-seg', role: 'group' }, ['chart', 'table'].map(function (k) { return h('button', { key: k, type: 'button', 'aria-pressed': view === k, className: cx('zw-seg-btn', view === k && 'is-on'), onClick: function () { vs[1](k); } }, h(Icon, { name: k === 'chart' ? 'chart-column' : 'file-spreadsheet', size: 14 }), h('span', { className: 'zw-sr' }, t(k))); })) : null) : null;

  if (view === 'table') {
    return h('div', { className: cx('zw-chart', p.className) }, head,
      h(Table, { density: 'compact', rowKey: xKey, columns: [{ key: xKey, header: p.xLabel || '' }].concat(series.map(function (s) { return { key: s.key, header: s.label, align: 'end', numeric: true, render: function (r) { return fmtVal(r[s.key] || 0, p.format, lang); } }; })), rows: data }));
  }

  if (type === 'donut') {
    var tot = data.reduce(function (a, d) { return a + (d.value || 0); }, 0) || 1;
    var R0 = Math.min(H, 220) / 2 - 4, r1 = R0 * 0.64, cxp = R0 + 4, cyp = R0 + 4, ang = -Math.PI / 2;
    var segs = data.map(function (d, i) {
      var a0 = ang, a1 = ang + (d.value / tot) * Math.PI * 2; ang = a1;
      var large = a1 - a0 > Math.PI ? 1 : 0;
      function pt(r, a) { return (cxp + r * Math.cos(a)).toFixed(2) + ' ' + (cyp + r * Math.sin(a)).toFixed(2); }
      var dd = 'M' + pt(R0, a0) + 'A' + R0 + ' ' + R0 + ' 0 ' + large + ' 1 ' + pt(R0, a1) + 'L' + pt(r1, a1) + 'A' + r1 + ' ' + r1 + ' 0 ' + large + ' 0 ' + pt(r1, a0) + 'Z';
      return h('path', { key: i, d: dd, fill: seriesColor(d, i), className: cx('zw-donut-seg', hover === i && 'is-hover', hover != null && hover !== i && 'is-dim'), onMouseEnter: function () { setHover(i); }, onMouseLeave: function () { setHover(null); }, tabIndex: 0, onFocus: function () { setHover(i); }, onBlur: function () { setHover(null); }, 'aria-label': d.label + ': ' + fmtVal(d.value, p.format, lang) });
    });
    var hv = hover != null ? data[hover] : null;
    return h('div', { className: cx('zw-chart', p.className), ref: wrap }, head,
      h('div', { className: 'zw-donut' },
        h('div', { className: 'zw-donut-fig', style: { width: R0 * 2 + 8, height: R0 * 2 + 8 } },
          h('svg', { width: R0 * 2 + 8, height: R0 * 2 + 8, role: 'img', 'aria-label': p.title || 'Chart' }, segs),
          h('div', { className: 'zw-donut-center' },
            h('span', { className: 'zw-donut-label' }, hv ? hv.label : (p.centerLabel || t('total'))),
            h('span', { className: 'zw-donut-value zw-tnum', dir: 'ltr' }, hv ? (p.format === 'currency' ? fmtCompact(hv.value) : (hv.value / tot * 100).toFixed(0) + '%') : (p.centerValue != null ? p.centerValue : fmtCompact(tot))))),
        h('ul', { className: 'zw-legend zw-legend--stack' }, data.map(function (d, i) {
          return h('li', { key: i, className: cx(hover === i && 'is-hover'), onMouseEnter: function () { setHover(i); }, onMouseLeave: function () { setHover(null); } },
            h('span', { className: 'zw-legend-swatch', style: { background: seriesColor(d, i) } }), h('span', { className: 'zw-legend-name' }, d.label),
            h('span', { className: 'zw-legend-val zw-tnum', dir: 'ltr' }, p.format === 'currency' ? fmtNumber(d.value, 0) : d.value.toLocaleString('en-US')),
            h('span', { className: 'zw-legend-pct zw-tnum', dir: 'ltr' }, (d.value / tot * 100).toFixed(0) + '%'));
        }))));
  }

  var padL = 48, padR = 8, padT = 8, padB = 28;
  var iw = Math.max(40, W - padL - padR), ih = H - padT - padB;
  var stacked = type === 'stacked';
  var raw = Math.max.apply(null, data.map(function (d) { return stacked ? series.reduce(function (a, s) { return a + (d[s.key] || 0); }, 0) : Math.max.apply(null, series.map(function (s) { return d[s.key] || 0; })); }).concat([0]));
  var step = niceStep(raw / 5), max = step * Math.max(1, Math.ceil(raw / step));
  var ticks = []; for (var tv = 0; tv <= max + step / 2; tv += step) ticks.push(tv);
  function X(x) { return rtl ? padR + (iw - x) + (W - padL - padR - iw) : padL + x; }
  function Y(v) { return padT + ih - (v / max) * ih; }
  var n = data.length, band = iw / Math.max(n, 1);
  var marks = [];
  if (type === 'bar' || stacked) {
    var groupW = Math.min(band * 0.64, stacked ? 36 : 18 * series.length + 2 * (series.length - 1));
    var bw = stacked ? groupW : (groupW - 2 * (series.length - 1)) / series.length;
    data.forEach(function (d, i) {
      var acc = 0;
      series.forEach(function (s, j) {
        var v = d[s.key] || 0; if (!v) return;
        var x0 = band * i + (band - groupW) / 2 + (stacked ? 0 : j * (bw + 2));
        var y1 = stacked ? Y(acc + v) : Y(v), y0 = stacked ? Y(acc) : Y(0);
        var hh = Math.max(0, y0 - y1 - (stacked && acc > 0 ? 2 : 0));
        var top = stacked ? (j === series.length - 1 || series.slice(j + 1).every(function (q) { return !d[q.key]; })) : true;
        var r = top ? Math.min(4, bw / 2, hh) : 0, xl = rtl ? X(x0 + bw) : X(x0);
        var dd = 'M' + xl + ' ' + (y1 + hh) + 'V' + (y1 + r) + (r ? 'Q' + xl + ' ' + y1 + ' ' + (xl + r) + ' ' + y1 : '') + 'H' + (xl + bw - r) + (r ? 'Q' + (xl + bw) + ' ' + y1 + ' ' + (xl + bw) + ' ' + (y1 + r) : '') + 'V' + (y1 + hh) + 'Z';
        marks.push(h('path', { key: i + '-' + j, d: dd, fill: seriesColor(s, j), className: cx('zw-bar', hover != null && hover !== i && 'is-dim') }));
        acc += v;
      });
    });
  } else {
    series.forEach(function (s, j) {
      var pts = data.map(function (d, i) { return [X(band * i + band / 2), Y(d[s.key] || 0)]; });
      var line = pts.map(function (q, i) { return (i ? 'L' : 'M') + q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('');
      if (type === 'area' && j === 0) marks.push(h('path', { key: 'a' + j, d: line + 'L' + pts[pts.length - 1][0] + ' ' + Y(0) + 'L' + pts[0][0] + ' ' + Y(0) + 'Z', fill: seriesColor(s, j), className: 'zw-area' }));
      marks.push(h('path', { key: 'l' + j, d: line, stroke: seriesColor(s, j), className: cx('zw-line', s.dashed && 'is-dashed') }));
      if (hover != null && pts[hover]) marks.push(h('circle', { key: 'p' + j, cx: pts[hover][0], cy: pts[hover][1], r: 4.5, fill: seriesColor(s, j), className: 'zw-point' }));
    });
  }
  var hoverX = hover != null ? X(band * hover + band / 2) : null;
  var hitW = band;
  return h('div', { className: cx('zw-chart', p.className) }, head,
    p.legend !== false && series.length > 1 ? h(Legend, { series: series, line: type === 'line' }) : null,
    h('div', { className: 'zw-chart-plot', ref: wrap, style: { height: H } },
      h('svg', { width: W, height: H, role: 'img', 'aria-label': p.title || 'Chart', className: 'zw-chart-svg' },
        ticks.map(function (tk, i) {
          return h('g', { key: i }, h('line', { x1: rtl ? 0 : padL, x2: rtl ? W - padL : W - padR, y1: Y(tk), y2: Y(tk), className: cx('zw-grid-line', i === 0 && 'is-base') }),
            h('text', { x: rtl ? W - 4 : padL - 8, y: Y(tk) + 4, textAnchor: rtl ? 'end' : 'end', className: 'zw-axis-text', transform: rtl ? 'translate(0 0)' : undefined }, fmtCompact(tk)));
        }),
        hoverX != null && type !== 'bar' && !stacked ? h('line', { x1: hoverX, x2: hoverX, y1: padT, y2: padT + ih, className: 'zw-crosshair' }) : null,
        hover != null && (type === 'bar' || stacked) ? h('rect', { x: (rtl ? X(band * (hover + 1)) : X(band * hover)) + 2, y: padT, width: band - 4, height: ih, rx: 6, className: 'zw-band-hover' }) : null,
        marks,
        data.map(function (d, i) {
          var every = Math.ceil(n / Math.max(1, Math.floor(iw / 56)));
          return i % every === 0 ? h('text', { key: 'x' + i, x: X(band * i + band / 2), y: H - 8, textAnchor: 'middle', className: 'zw-axis-text' }, d[xKey]) : null;
        }),
        data.map(function (d, i) {
          return h('rect', { key: 'h' + i, x: rtl ? X(band * (i + 1)) : X(band * i), y: padT, width: hitW, height: ih, fill: 'transparent', onMouseEnter: function () { setHover(i); }, onMouseLeave: function () { setHover(null); } });
        })),
      hover != null ? h('div', { className: 'zw-chart-tip', style: { insetInlineStart: Math.min(Math.max(8, rtl ? W - hoverX : hoverX), W - 180) + 12, top: 8 } },
        h('div', { className: 'zw-chart-tip-title' }, data[hover][xKey]),
        series.map(function (s, j) { return h('div', { key: s.key, className: 'zw-chart-tip-row' }, h('span', { className: 'zw-legend-swatch', style: { background: seriesColor(s, j) } }), h('span', null, s.label), h('span', { className: 'zw-chart-tip-val zw-tnum', dir: 'ltr' }, fmtVal(data[hover][s.key] || 0, p.format, lang))); })) : null));
}

// ---------- QR (encoder: qrcode-generator, MIT, injected as QRLIB)
function utf8Bytes(s) { return Array.prototype.slice.call(new TextEncoder().encode(String(s))); }
// Builds the base64 TLV used by Saudi simplified-invoice QR codes (tags 1–5). For demos/sample data:
// production payloads (incl. signature tags) must come from the backend's signing step.
function tlvBase64(f) {
  var vals = [f.seller, f.vat, f.timestamp, f.total, f.vatTotal], out = [];
  vals.forEach(function (v, i) { var b = utf8Bytes(v == null ? '' : v); out.push(i + 1, b.length); out = out.concat(b); });
  var bin = ''; out.forEach(function (c) { bin += String.fromCharCode(c); }); return btoa(bin);
}
function QrCode(p) {
  var cells = useMemo(function () {
    try { var q = QRLIB(0, p.level || 'M'); q.addData(p.value || ''); q.make(); var n = q.getModuleCount(), m = []; for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) m.push([c, r]); return { n: n, m: m }; } catch (e) { return null; }
  }, [p.value]);
  var s = p.size || 128;
  if (!cells) return h('div', { className: 'zw-qr zw-qr--empty', style: { width: s, height: s } }, h(Icon, { name: 'qr-code', size: 24 }));
  var q = 2, n = cells.n + q * 2;
  return h('svg', { className: 'zw-qr', width: s, height: s, viewBox: '0 0 ' + n + ' ' + n, role: 'img', 'aria-label': p.label || 'Invoice QR code', shapeRendering: 'crispEdges' },
    h('rect', { width: n, height: n, className: 'zw-qr-bg' }),
    h('path', { className: 'zw-qr-fg', d: cells.m.map(function (c) { return 'M' + (c[0] + q) + ' ' + (c[1] + q) + 'h1v1h-1z'; }).join('') }));
}
var QR_STEPS = [
  { key: 'generated', en: 'QR generated', ar: 'تم إنشاء رمز QR' },
  { key: 'validated', en: 'Invoice validated', ar: 'تم التحقق من الفاتورة' },
  { key: 'compliance', en: 'Compliance status', ar: 'حالة الامتثال' },
  { key: 'reporting', en: 'Reporting / clearance', ar: 'الإبلاغ / الاعتماد' }
];
function QrPanel(p) {
  var lang = useLang();
  var st = p.steps || {};
  return h('div', { className: cx('zw-qrpanel', p.className) },
    h('div', { className: 'zw-qrpanel-code' }, p.payload ? h(QrCode, { value: p.payload, size: p.size || 120 }) : h('div', { className: 'zw-qr zw-qr--empty', style: { width: p.size || 120, height: p.size || 120 } }, h(Icon, { name: 'qr-code', size: 24 }), h('span', null, lang === 'ar' ? 'يُنشأ عند الإصدار' : 'Generated on issue'))),
    h('ul', { className: 'zw-qrpanel-steps' }, QR_STEPS.map(function (s) {
      var v = st[s.key] || 'not_validated', c = COMPLIANCE_STATUS[v] || COMPLIANCE_STATUS.not_validated;
      return h('li', { key: s.key, className: 'zw-qrpanel-step zw-qrpanel-step--' + c.tone },
        h('span', { className: 'zw-qrpanel-ico' }, h(Icon, { name: c.icon, size: 14, strokeWidth: 2 })),
        h('span', { className: 'zw-qrpanel-name' }, s[lang]),
        h('span', { className: 'zw-qrpanel-val' }, c[lang]));
    })),
    p.footnote ? h('div', { className: 'zw-qrpanel-foot' }, p.footnote) : null);
}

// ---------- Org switcher
function OrgSwitcher(p) {
  var t = useT();
  var cur = (p.orgs || []).filter(function (o) { return o.id === p.current; })[0] || (p.orgs || [])[0] || {};
  var st = useState(!!p.defaultOpen), open = st[0], set = st[1];
  var ref = useRef(null);
  useOutside(ref, open && !p.defaultOpen, function () { set(false); });
  return h('div', { ref: ref, className: cx('zw-pop-wrap', 'zw-org', p.collapsed && 'is-collapsed', p.className) },
    h('button', { type: 'button', className: 'zw-org-trigger', 'aria-haspopup': 'listbox', 'aria-expanded': open, onClick: function () { set(!open); } },
      h(Avatar, { name: cur.name, size: 'md', square: true }),
      p.collapsed ? null : h('span', { className: 'zw-org-text' }, h('span', { className: 'zw-org-name' }, cur.name), h('span', { className: 'zw-org-meta' }, cur.role, cur.plan ? ' · ' + cur.plan : '')),
      p.collapsed ? null : h(Icon, { name: 'chevrons-up-down', size: 16, className: 'zw-org-caret' })),
    open ? h('div', { className: cx('zw-pop', 'zw-org-pop', 'zw-pop--' + (p.placement || 'up')), role: 'listbox', 'aria-label': t('switchOrg') },
      h('div', { className: 'zw-menu-heading' }, t('yourOrgs')),
      (p.orgs || []).map(function (o) {
        var on = o.id === cur.id;
        return h('button', { key: o.id, type: 'button', role: 'option', 'aria-selected': on, className: cx('zw-org-item', on && 'is-current'), onClick: function () { set(false); p.onSwitch && p.onSwitch(o.id); } },
          h(Avatar, { name: o.name, size: 'sm', square: true }),
          h('span', { className: 'zw-org-text' }, h('span', { className: 'zw-org-name' }, o.name), h('span', { className: 'zw-org-meta zw-mono', dir: 'ltr' }, o.vat || o.role)),
          on ? h(Icon, { name: 'check', size: 16, className: 'zw-option-check' }) : null);
      }),
      h('div', { className: 'zw-menu-sep' }),
      h('button', { type: 'button', className: 'zw-menu-item', onClick: p.onCreate }, h(Icon, { name: 'plus', size: 16 }), h('span', { className: 'zw-menu-label' }, t('addOrg')))) : null);
}

// ---------- Sidebar
function NavItem(p) {
  var it = p.item, on = p.active === it.id;
  var hasKids = it.children && it.children.length;
  var childOn = hasKids && it.children.some(function (c) { return c.id === p.active; });
  var st = useState(!!(childOn || it.defaultOpen)), open = st[0];
  var inner = [h(Icon, { key: 'i', name: it.icon || 'circle-dot', size: 18 }),
    p.collapsed ? null : h('span', { key: 'l', className: 'zw-nav-label' }, it.label),
    !p.collapsed && it.badge != null ? h('span', { key: 'b', className: cx('zw-nav-badge', it.badgeTone && 'zw-nav-badge--' + it.badgeTone) }, it.badge) : null,
    !p.collapsed && hasKids ? h(Icon, { key: 'c', name: 'chevron-down', size: 16, className: cx('zw-nav-caret', open && 'is-open') }) : null];
  return h('li', { className: 'zw-nav-li' },
    h('a', { href: it.href || '#', className: cx('zw-nav-item', (on || (childOn && p.collapsed)) && 'is-active', childOn && 'has-active'), 'aria-current': on ? 'page' : undefined, title: p.collapsed ? it.label : undefined, 'aria-expanded': hasKids ? open : undefined,
      onClick: function (e) { if (hasKids) { e.preventDefault(); st[1](!open); } else if (p.onNavigate) { e.preventDefault(); p.onNavigate(it.id); } } }, inner),
    hasKids && open && !p.collapsed ? h('ul', { className: 'zw-nav-sub' }, it.children.map(function (c) {
      return h('li', { key: c.id }, h('a', { href: c.href || '#', className: cx('zw-nav-subitem', p.active === c.id && 'is-active'), 'aria-current': p.active === c.id ? 'page' : undefined, onClick: function (e) { if (p.onNavigate) { e.preventDefault(); p.onNavigate(c.id); } } }, c.label, c.badge != null ? h('span', { className: 'zw-nav-badge' }, c.badge) : null));
    })) : null);
}
function Sidebar(p) {
  var t = useT(), lang = useLang();
  return h('aside', { className: cx('zw-sidebar', p.collapsed && 'is-collapsed', p.className), 'aria-label': 'Main navigation' },
    h('div', { className: 'zw-sidebar-brand' }, h(Logo, { variant: p.collapsed ? 'mark' : (lang === 'ar' ? 'arabic' : 'full'), size: 28 }),
      p.onToggle ? h(IconButton, { icon: 'panel-left', label: 'Collapse sidebar', size: 'sm', onClick: p.onToggle, className: 'zw-sidebar-toggle' }) : null),
    h('nav', { className: 'zw-sidebar-nav' },
      (p.favorites && p.favorites.length && !p.collapsed) ? h('div', { className: 'zw-nav-section' }, h('div', { className: 'zw-nav-heading' }, h(Icon, { name: 'star', size: 12 }), t('favorites')),
        h('ul', { className: 'zw-nav-favs' }, p.favorites.map(function (f) { return h('li', { key: f.id }, h('a', { href: '#', className: 'zw-nav-fav' }, h('span', { className: 'zw-nav-fav-dot' }), f.label)); }))) : null,
      (p.sections || []).map(function (s, i) {
        return h('div', { key: i, className: 'zw-nav-section' },
          s.heading && !p.collapsed ? h('div', { className: 'zw-nav-heading' }, s.heading) : (s.heading ? h('div', { className: 'zw-nav-rule' }) : null),
          h('ul', null, s.items.map(function (it) { return h(NavItem, { key: it.id, item: it, active: p.active, collapsed: p.collapsed, onNavigate: p.onNavigate }); })));
      })),
    h('div', { className: 'zw-sidebar-foot' },
      p.plan && !p.collapsed ? h('div', { className: 'zw-plan' },
        h('div', { className: 'zw-plan-row' }, h('span', { className: 'zw-plan-name' }, p.plan.name), p.plan.badge ? h(Badge, { tone: p.plan.tone || 'accent', size: 'sm' }, p.plan.badge) : null),
        p.plan.used != null ? h(Progress, { value: p.plan.used / p.plan.limit * 100, tone: p.plan.used / p.plan.limit >= 0.8 ? 'warning' : undefined, label: p.plan.meter }) : null,
        p.plan.meter ? h('div', { className: 'zw-plan-meta zw-tnum' }, p.plan.meter) : null) : null,
      p.orgs ? h(OrgSwitcher, { orgs: p.orgs, current: p.currentOrg, collapsed: p.collapsed, onSwitch: p.onSwitchOrg }) : null));
}

// ---------- Topbar
function Topbar(p) {
  var t = useT(), lang = useLang();
  return h('header', { className: cx('zw-topbar', p.className) },
    p.onMenu ? h(IconButton, { icon: 'panel-left', label: 'Menu', className: 'zw-topbar-menu', onClick: p.onMenu }) : null,
    h('div', { className: 'zw-topbar-start' }, p.breadcrumbs ? h(Breadcrumb, { items: p.breadcrumbs }) : p.title ? h('div', { className: 'zw-topbar-title' }, p.title) : null),
    h('button', { type: 'button', className: 'zw-search-trigger', onClick: p.onSearch, 'aria-label': t('searchAll') },
      h(Icon, { name: 'search', size: 16 }), h('span', { className: 'zw-search-trigger-text' }, t('searchAll')), h('span', { className: 'zw-search-kbd' }, h('kbd', { className: 'zw-kbd' }, '⌘'), h('kbd', { className: 'zw-kbd' }, 'K'))),
    h('div', { className: 'zw-topbar-end' },
      p.quickCreate ? h(DropdownMenu, { align: 'end', width: 240, trigger: h(Button, { size: 'sm', iconStart: 'plus', kbd: 'N' }, t('create')), items: p.quickCreate }) : null,
      h(Tooltip, { content: t('notifications'), side: 'bottom' }, h(IconButton, { icon: 'bell', label: t('notifications'), badge: p.notifications || null, onClick: p.onNotifications })),
      h('button', { type: 'button', className: 'zw-lang-toggle', onClick: p.onToggleLang, 'aria-label': 'Language' }, h(Icon, { name: 'languages', size: 16 }), h('span', null, lang === 'ar' ? 'EN' : 'ع')),
      h(Tooltip, { content: t('theme'), side: 'bottom' }, h(IconButton, { icon: p.theme === 'dark' ? 'sun' : 'moon', label: t('theme'), onClick: p.onToggleTheme })),
      h(Tooltip, { content: t('help'), side: 'bottom' }, h(IconButton, { icon: 'circle-help', label: t('help') })),
      p.user ? h('span', { className: 'zw-topbar-user' }, h(Avatar, { name: p.user.name, size: 'sm', status: 'online' })) : null));
}

// ---------- AppShell
function AppShell(p) {
  var lang = useLang();
  return h('div', { className: cx('zw-shell', p.collapsed && 'is-collapsed', p.className), style: p.height ? { height: p.height } : undefined },
    p.sidebar, h('div', { className: 'zw-shell-main' }, p.topbar, h('main', { className: 'zw-shell-content' }, p.children)),
    p.assistant !== false ? h('button', { type: 'button', className: 'zw-ai-fab', onClick: p.onAssistant }, h(Icon, { name: 'sparkles', size: 18 }), h('span', null, lang === 'ar' ? 'اسأل زاتكا AI' : 'Ask Zatca AI')) : null);
}

// ---------- Page header
function PageHeader(p) {
  return h('div', { className: cx('zw-pagehead', p.className) },
    h('div', { className: 'zw-pagehead-text' },
      p.kicker ? h('div', { className: 'zw-pagehead-kicker' }, p.kicker) : null,
      h('h1', { className: 'zw-pagehead-title' }, p.title),
      p.description ? h('p', { className: 'zw-pagehead-desc' }, p.description) : null),
    p.actions ? h('div', { className: 'zw-pagehead-actions' }, p.actions) : null);
}

// ---------- Segmented control
function SegmentedControl(p) {
  var st = useState(p.defaultValue || (p.options[0] && p.options[0].value)), inner = st[0];
  var val = p.value !== undefined ? p.value : inner;
  return h('div', { className: cx('zw-seg', p.size === 'sm' && 'zw-seg--sm', p.className), role: 'radiogroup', 'aria-label': p.label },
    p.options.map(function (o) { var on = o.value === val; return h('button', { key: o.value, type: 'button', role: 'radio', 'aria-checked': on, className: cx('zw-seg-btn', on && 'is-on'), onClick: function () { if (p.value === undefined) st[1](o.value); p.onChange && p.onChange(o.value); } }, o.icon ? h(Icon, { name: o.icon, size: 14 }) : null, o.label); }));
}

return {Logo:Logo,Icon:Icon,Button:Button,Badge:Badge,InvoiceStatus:InvoiceStatus,ComplianceStatus:ComplianceStatus,QuoteStatus:QuoteStatus,Input:Input,Select:Select,Combobox:Combobox,DatePicker:DatePicker,CurrencyInput:CurrencyInput,VatInput:VatInput,PhoneInput:PhoneInput,Checkbox:Checkbox,Switch:Switch,FileUpload:FileUpload,Card:Card,StatCard:StatCard,Amount:Amount,Table:Table,DataGrid:DataGrid,Chart:Chart,Timeline:Timeline,Avatar:Avatar,UsageMeter:UsageMeter,Alert:Alert,Insight:Insight,EmptyState:EmptyState,Skeleton:Skeleton,QrPanel:QrPanel,Tabs:Tabs,SegmentedControl:SegmentedControl,Breadcrumb:Breadcrumb,Pagination:Pagination,Stepper:Stepper,Accordion:Accordion,Sidebar:Sidebar,Topbar:Topbar,OrgSwitcher:OrgSwitcher,AppShell:AppShell,PageHeader:PageHeader,Dialog:Dialog,Drawer:Drawer,DropdownMenu:DropdownMenu,Tooltip:Tooltip,Toast:Toast,CommandMenu:CommandMenu,IconButton:IconButton,Mark:Mark,Kbd:Kbd,Textarea:Textarea,Field:Field,Spinner:Spinner,Sparkline:Sparkline,Delta:Delta,AvatarGroup:AvatarGroup,Progress:Progress,FilterChip:FilterChip,ToastStack:ToastStack,QrCode:QrCode,LocaleProvider:LocaleProvider,Legend:Legend,tlvBase64:tlvBase64,fmtNumber:fmtNumber,fmtCompact:fmtCompact,isVatFormat:isVatFormat,useLang:useLang,useT:useT,INVOICE_STATUS:INVOICE_STATUS,COMPLIANCE_STATUS:COMPLIANCE_STATUS,QUOTE_STATUS:QUOTE_STATUS,ICON_NAMES:Object.keys(ICON_NODES)};
}
var NS=window.ZatcaWeb=window.ZatcaWeb||{};
var NAMES=["Logo", "Icon", "Button", "Badge", "InvoiceStatus", "ComplianceStatus", "QuoteStatus", "Input", "Select", "Combobox", "DatePicker", "CurrencyInput", "VatInput", "PhoneInput", "Checkbox", "Switch", "FileUpload", "Card", "StatCard", "Amount", "Table", "DataGrid", "Chart", "Timeline", "Avatar", "UsageMeter", "Alert", "Insight", "EmptyState", "Skeleton", "QrPanel", "Tabs", "SegmentedControl", "Breadcrumb", "Pagination", "Stepper", "Accordion", "Sidebar", "Topbar", "OrgSwitcher", "AppShell", "PageHeader", "Dialog", "Drawer", "DropdownMenu", "Tooltip", "Toast", "CommandMenu", "IconButton", "Mark", "Kbd", "Textarea", "Field", "Spinner", "Sparkline", "Delta", "AvatarGroup", "Progress", "FilterChip", "ToastStack", "QrCode", "LocaleProvider", "Legend", "tlvBase64", "fmtNumber", "fmtCompact", "isVatFormat", "useLang", "useT", "INVOICE_STATUS", "COMPLIANCE_STATUS", "QUOTE_STATUS", "ICON_NAMES"];
var real=null;function get(){if(real)return real;if(!window.React||!window.ReactDOM&&!window.React.createElement)return null;real=__build();return real;}
if(window.React){var a=get();NAMES.forEach(function(n){NS[n]=a[n];});}
else{NAMES.forEach(function(n){Object.defineProperty(NS,n,{configurable:true,enumerable:true,get:function(){var a=get();if(!a)return undefined;Object.defineProperty(NS,n,{value:a[n],enumerable:true,configurable:true,writable:true});return a[n];}});});}
})();
