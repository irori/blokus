var i=class{constructor(t,s){this.id=t;this.size=s.length,this.coords=[];for(let n=0;n<s.length;n++)this.coords[n]={x:s[n][0],y:s[n][1]}}},S=class{constructor(t){[this.offsetX,this.offsetY,this.piece]=t,this.size=this.piece.size,this.coords=[];for(let s=0;s<this.piece.size;s++)this.coords[s]={x:this.piece.coords[s].x+this.offsetX,y:this.piece.coords[s].y+this.offsetY}}},d=class{constructor(t,s,n){this.id=t;this.size=s;this.rotations=[];for(let o=0;o<8;o++)this.rotations[o]=new S(n[o])}},e={u0:new i(0,[[0,0],[1,0],[0,1],[-1,0],[0,-1]]),t0:new i(8,[[-1,-1],[-1,0],[0,0],[1,0],[0,1]]),t1:new i(9,[[1,-1],[1,0],[0,0],[-1,0],[0,1]]),t2:new i(10,[[1,-1],[0,-1],[0,0],[0,1],[-1,0]]),t3:new i(11,[[-1,-1],[0,-1],[0,0],[0,1],[1,0]]),t4:new i(12,[[1,1],[1,0],[0,0],[-1,0],[0,-1]]),t5:new i(13,[[-1,1],[-1,0],[0,0],[1,0],[0,-1]]),t6:new i(14,[[-1,1],[0,1],[0,0],[0,-1],[1,0]]),t7:new i(15,[[1,1],[0,1],[0,0],[0,-1],[-1,0]]),s0:new i(16,[[0,0],[1,0],[1,1],[-1,0],[-1,-1]]),s1:new i(17,[[0,0],[-1,0],[-1,1],[1,0],[1,-1]]),s2:new i(18,[[0,0],[0,1],[-1,1],[0,-1],[1,-1]]),s3:new i(19,[[0,0],[0,1],[1,1],[0,-1],[-1,-1]]),r0:new i(24,[[0,0],[1,0],[1,1],[0,-1],[-1,-1]]),r1:new i(25,[[0,0],[-1,0],[-1,1],[0,-1],[1,-1]]),r2:new i(26,[[0,0],[0,1],[-1,1],[1,0],[1,-1]]),r3:new i(27,[[0,0],[0,1],[1,1],[-1,0],[-1,-1]]),q0:new i(32,[[0,0],[1,0],[2,0],[0,-1],[0,-2]]),q1:new i(33,[[0,0],[-1,0],[-2,0],[0,-1],[0,-2]]),q2:new i(34,[[0,0],[0,1],[0,2],[1,0],[2,0]]),q3:new i(35,[[0,0],[0,1],[0,2],[-1,0],[-2,0]]),p0:new i(40,[[0,0],[0,-1],[0,1],[-1,1],[1,1]]),p2:new i(42,[[0,0],[1,0],[-1,0],[-1,-1],[-1,1]]),p3:new i(43,[[0,0],[-1,0],[1,0],[1,-1],[1,1]]),p4:new i(44,[[0,0],[0,1],[0,-1],[1,-1],[-1,-1]]),o0:new i(48,[[0,-1],[0,0],[1,0],[0,1],[0,2]]),o1:new i(49,[[0,-1],[0,0],[-1,0],[0,1],[0,2]]),o2:new i(50,[[1,0],[0,0],[0,1],[-1,0],[-2,0]]),o3:new i(51,[[-1,0],[0,0],[0,1],[1,0],[2,0]]),o4:new i(52,[[0,1],[0,0],[-1,0],[0,-1],[0,-2]]),o5:new i(53,[[0,1],[0,0],[1,0],[0,-1],[0,-2]]),o6:new i(54,[[-1,0],[0,0],[0,-1],[1,0],[2,0]]),o7:new i(55,[[1,0],[0,0],[0,-1],[-1,0],[-2,0]]),n0:new i(56,[[0,0],[0,1],[-1,1],[0,-1],[-1,-1]]),n1:new i(57,[[0,0],[0,1],[1,1],[0,-1],[1,-1]]),n2:new i(58,[[0,0],[-1,0],[-1,-1],[1,0],[1,-1]]),n6:new i(62,[[0,0],[1,0],[1,1],[-1,0],[-1,1]]),m0:new i(64,[[0,-1],[-1,0],[0,0],[-1,1],[0,1]]),m1:new i(65,[[0,-1],[1,0],[0,0],[1,1],[0,1]]),m2:new i(66,[[1,0],[0,-1],[0,0],[-1,-1],[-1,0]]),m3:new i(67,[[-1,0],[0,-1],[0,0],[1,-1],[1,0]]),m4:new i(68,[[0,1],[1,0],[0,0],[1,-1],[0,-1]]),m5:new i(69,[[0,1],[-1,0],[0,0],[-1,-1],[0,-1]]),m6:new i(70,[[-1,0],[0,1],[0,0],[1,1],[1,0]]),m7:new i(71,[[1,0],[0,1],[0,0],[-1,1],[-1,0]]),l0:new i(72,[[0,-2],[0,-1],[0,0],[-1,0],[-1,1]]),l1:new i(73,[[0,-2],[0,-1],[0,0],[1,0],[1,1]]),l2:new i(74,[[2,0],[1,0],[0,0],[0,-1],[-1,-1]]),l3:new i(75,[[-2,0],[-1,0],[0,0],[0,-1],[1,-1]]),l4:new i(76,[[0,2],[0,1],[0,0],[1,0],[1,-1]]),l5:new i(77,[[0,2],[0,1],[0,0],[-1,0],[-1,-1]]),l6:new i(78,[[-2,0],[-1,0],[0,0],[0,1],[1,1]]),l7:new i(79,[[2,0],[1,0],[0,0],[0,1],[-1,1]]),k0:new i(80,[[0,0],[0,1],[0,-2],[0,-1],[-1,1]]),k1:new i(81,[[0,0],[0,1],[0,-2],[0,-1],[1,1]]),k2:new i(82,[[0,0],[-1,0],[2,0],[1,0],[-1,-1]]),k3:new i(83,[[0,0],[1,0],[-2,0],[-1,0],[1,-1]]),k4:new i(84,[[0,0],[0,-1],[0,2],[0,1],[1,-1]]),k5:new i(85,[[0,0],[0,-1],[0,2],[0,1],[-1,-1]]),k6:new i(86,[[0,0],[1,0],[-2,0],[-1,0],[1,1]]),k7:new i(87,[[0,0],[-1,0],[2,0],[1,0],[-1,1]]),j0:new i(88,[[0,0],[0,1],[0,2],[0,-1],[0,-2]]),j2:new i(90,[[0,0],[-1,0],[-2,0],[1,0],[2,0]]),i0:new i(96,[[-1,0],[0,0],[0,1],[1,1]]),i1:new i(97,[[1,0],[0,0],[0,1],[-1,1]]),i2:new i(98,[[0,-1],[0,0],[-1,0],[-1,1]]),i3:new i(99,[[0,-1],[0,0],[1,0],[1,1]]),h0:new i(104,[[0,0],[1,0],[0,1],[1,1]]),g0:new i(112,[[0,0],[1,0],[0,1],[0,-1]]),g1:new i(113,[[0,0],[-1,0],[0,1],[0,-1]]),g2:new i(114,[[0,0],[0,1],[-1,0],[1,0]]),g6:new i(118,[[0,0],[0,-1],[1,0],[-1,0]]),f0:new i(120,[[0,0],[0,-1],[0,1],[-1,1]]),f1:new i(121,[[0,0],[0,-1],[0,1],[1,1]]),f2:new i(122,[[0,0],[1,0],[-1,0],[-1,-1]]),f3:new i(123,[[0,0],[-1,0],[1,0],[1,-1]]),f4:new i(124,[[0,0],[0,1],[0,-1],[1,-1]]),f5:new i(125,[[0,0],[0,1],[0,-1],[-1,-1]]),f6:new i(126,[[0,0],[-1,0],[1,0],[1,1]]),f7:new i(127,[[0,0],[1,0],[-1,0],[-1,1]]),e0:new i(128,[[0,0],[0,1],[0,2],[0,-1]]),e2:new i(130,[[0,0],[-1,0],[-2,0],[1,0]]),d0:new i(136,[[0,0],[1,0],[0,-1]]),d1:new i(137,[[0,0],[-1,0],[0,-1]]),d2:new i(138,[[0,0],[0,1],[1,0]]),d3:new i(139,[[0,0],[0,1],[-1,0]]),c0:new i(144,[[0,0],[0,1],[0,-1]]),c2:new i(146,[[0,0],[-1,0],[1,0]]),b0:new i(152,[[0,0],[0,1]]),b2:new i(154,[[0,0],[-1,0]]),a0:new i(160,[[0,0]])},v=[new d(0,5,[[0,0,e.u0],[0,0,e.u0],[0,0,e.u0],[0,0,e.u0],[0,0,e.u0],[0,0,e.u0],[0,0,e.u0],[0,0,e.u0]]),new d(8,5,[[0,0,e.t0],[0,0,e.t1],[0,0,e.t2],[0,0,e.t3],[0,0,e.t4],[0,0,e.t5],[0,0,e.t6],[0,0,e.t7]]),new d(16,5,[[0,0,e.s0],[0,0,e.s1],[0,0,e.s2],[0,0,e.s3],[0,0,e.s0],[0,0,e.s1],[0,0,e.s2],[0,0,e.s3]]),new d(24,5,[[0,0,e.r0],[0,0,e.r1],[0,0,e.r2],[0,0,e.r3],[0,0,e.r3],[0,0,e.r2],[0,0,e.r1],[0,0,e.r0]]),new d(32,5,[[0,0,e.q0],[0,0,e.q1],[0,0,e.q2],[0,0,e.q3],[0,0,e.q3],[0,0,e.q2],[0,0,e.q1],[0,0,e.q0]]),new d(40,5,[[0,0,e.p0],[0,0,e.p0],[0,0,e.p2],[0,0,e.p3],[0,0,e.p4],[0,0,e.p4],[0,0,e.p3],[0,0,e.p2]]),new d(48,5,[[0,0,e.o0],[0,0,e.o1],[0,0,e.o2],[0,0,e.o3],[0,0,e.o4],[0,0,e.o5],[0,0,e.o6],[0,0,e.o7]]),new d(56,5,[[0,0,e.n0],[0,0,e.n1],[0,0,e.n2],[0,0,e.n2],[0,0,e.n1],[0,0,e.n0],[0,0,e.n6],[0,0,e.n6]]),new d(64,5,[[0,0,e.m0],[0,0,e.m1],[0,0,e.m2],[0,0,e.m3],[0,0,e.m4],[0,0,e.m5],[0,0,e.m6],[0,0,e.m7]]),new d(72,5,[[0,0,e.l0],[0,0,e.l1],[0,0,e.l2],[0,0,e.l3],[0,0,e.l4],[0,0,e.l5],[0,0,e.l6],[0,0,e.l7]]),new d(80,5,[[0,0,e.k0],[0,0,e.k1],[0,0,e.k2],[0,0,e.k3],[0,0,e.k4],[0,0,e.k5],[0,0,e.k6],[0,0,e.k7]]),new d(88,5,[[0,0,e.j0],[0,0,e.j0],[0,0,e.j2],[0,0,e.j2],[0,0,e.j0],[0,0,e.j0],[0,0,e.j2],[0,0,e.j2]]),new d(96,4,[[0,0,e.i0],[0,0,e.i1],[0,0,e.i2],[0,0,e.i3],[0,-1,e.i0],[0,-1,e.i1],[1,0,e.i2],[-1,0,e.i3]]),new d(104,4,[[0,0,e.h0],[-1,0,e.h0],[-1,0,e.h0],[0,0,e.h0],[-1,-1,e.h0],[0,-1,e.h0],[0,-1,e.h0],[-1,-1,e.h0]]),new d(112,4,[[0,0,e.g0],[0,0,e.g1],[0,0,e.g2],[0,0,e.g2],[0,0,e.g1],[0,0,e.g0],[0,0,e.g6],[0,0,e.g6]]),new d(120,4,[[0,0,e.f0],[0,0,e.f1],[0,0,e.f2],[0,0,e.f3],[0,0,e.f4],[0,0,e.f5],[0,0,e.f6],[0,0,e.f7]]),new d(128,4,[[0,0,e.e0],[0,0,e.e0],[0,0,e.e2],[1,0,e.e2],[0,-1,e.e0],[0,-1,e.e0],[1,0,e.e2],[0,0,e.e2]]),new d(136,3,[[0,0,e.d0],[0,0,e.d1],[0,0,e.d2],[0,0,e.d3],[0,0,e.d3],[0,0,e.d2],[0,0,e.d1],[0,0,e.d0]]),new d(144,3,[[0,0,e.c0],[0,0,e.c0],[0,0,e.c2],[0,0,e.c2],[0,0,e.c0],[0,0,e.c0],[0,0,e.c2],[0,0,e.c2]]),new d(152,2,[[0,0,e.b0],[0,0,e.b0],[0,0,e.b2],[1,0,e.b2],[0,-1,e.b0],[0,-1,e.b0],[1,0,e.b2],[0,0,e.b2]]),new d(160,1,[[0,0,e.a0],[0,0,e.a0],[0,0,e.a0],[0,0,e.a0],[0,0,e.a0],[0,0,e.a0],[0,0,e.a0],[0,0,e.a0]])];var f=class{constructor(t,s,n){if(typeof t=="number")arguments.length==3?this.m=t<<4|s|n<<8:this.m=t;else if(t=="----")this.m=65535;else{let o=parseInt(t.substring(0,2),16),r=117-t.charCodeAt(2),h=parseInt(t.substring(3));this.m=o-17|r<<11|h<<8}}x(){return this.m>>4&15}y(){return this.m&15}pieceId(){return this.m>>8}blockId(){return this.m>>11}direction(){return this.m>>8&7}isPass(){return this.m==65535}fourcc(){return this.isPass()?"----":((this.m&255)+17).toString(16)+String.fromCharCode(117-this.blockId())+this.direction()}toString(){return this.fourcc()}coords(){if(this.isPass())return[];let t=v[this.blockId()].rotations[this.direction()],s=[];for(let n=0;n<t.size;n++)s[n]={x:this.x()+t.coords[n].x,y:this.y()+t.coords[n].y};return s}},N=new f(65535);var C=1,A=16,V=2,K=32,O=4,H=64,L=class{constructor(t){this.square=[];for(let s=0;s<14;s++){this.square[s]=[];for(let n=0;n<14;n++)this.square[s][n]=0}if(this.square[4][4]=C,this.square[9][9]=A,this.history=[],this.used=new Array(21*2),t){let s=t.split("/");for(let n=0;n<s.length;n++){if(!s[n])continue;let o=new f(s[n]);if(this.isValidMove(o))this.doMove(o);else throw new Error("invalid move: "+s[n])}}}inBounds(t,s){return t>=0&&s>=0&&t<14&&s<14}turn(){return this.history.length}player(){return this.turn()%2}colorAt(t,s){return this.square[s][t]&O?"violet":this.square[s][t]&H?"orange":null}isValidMove(t){if(t.isPass())return!0;if(this.used[t.blockId()+this.player()*21])return!1;let s=t.coords();if(!this._isMovable(s))return!1;for(let n=0;n<s.length;n++)if(this.square[s[n].y][s[n].x]&[C,A][this.player()])return!0;return!1}doMove(t){if(t.isPass()){this.history.push(t);return}let s=t.coords(),n=[O,H][this.player()],o=[V,K][this.player()],r=[C,A][this.player()];for(let h=0;h<s.length;h++){let{x:l,y:a}=s[h];this.square[a][l]|=n,this.inBounds(l-1,a)&&(this.square[a][l-1]|=o),this.inBounds(l,a-1)&&(this.square[a-1][l]|=o),this.inBounds(l+1,a)&&(this.square[a][l+1]|=o),this.inBounds(l,a+1)&&(this.square[a+1][l]|=o),this.inBounds(l-1,a-1)&&(this.square[a-1][l-1]|=r),this.inBounds(l+1,a-1)&&(this.square[a-1][l+1]|=r),this.inBounds(l-1,a+1)&&(this.square[a+1][l-1]|=r),this.inBounds(l+1,a+1)&&(this.square[a+1][l+1]|=r)}this.used[t.blockId()+this.player()*21]=!0,this.history.push(t)}doPass(){this.history.push(N)}score(t){let s=0;for(let n=0;n<21;n++)this.used[n+t*21]&&(s+=v[n].size);return s}_isMovable(t){let s=O|H|[V,K][this.player()];for(let n=0;n<t.length;n++){let{x:o,y:r}=t[n];if(o<0||o>=14||r<0||r>=14||this.square[r][o]&s)return!1}return!0}isUsed(t,s){return this.used[s+t*21]}canMove(){for(let t in e){let s=e[t].id;if(!this.used[(s>>3)+this.player()*21]){for(let n=0;n<14;n++)for(let o=0;o<14;o++)if(this.isValidMove(new f(o,n,s)))return!0}}return!1}getPath(){return this.history.join("/")}};var c=20,I=[[1,1,0],[5,1,0],[9,1,0],[13,1,0],[16,2,0],[21,1,0],[24,1,0],[1,5,0],[4,5,0],[7,5,2],[12,5,2],[18,5,2],[23,5,0],[0,8,0],[4,8,2],[8,9,2],[13,8,2],[16,9,0],[20,9,2],[23,8,0],[25,9,0]],P=class{constructor(t,s){this.board=t;this.player=s;this.elapsed=[0,0];this.timer=0}startGame(){let t=["You","Computer"];document.getElementById("violet-name").innerHTML=t[this.player],document.getElementById("orange-name").innerHTML=t[this.player^1],this.createOpponentsPieces(),this.update(),this.setActiveArea(),this.timer=setInterval(this.timerHandler.bind(this),1e3)}gameEnd(t){this.showGameEndMessage(t),clearInterval(this.timer)}onPlayerMove(){this.update()}startOpponentMove(){this.setActiveArea(),this.showOpponentsPlaying(!0)}onOpponentMove(t){this.hideOpponentsPiece(t),this.showOpponentsPlaying(!1),this.update(t),this.setActiveArea()}timerHandler(){function t(s){let n=Math.floor(s/60),o=s%60;return(n<10?"0"+n:n)+":"+(o<10?"0"+o:o)}this.elapsed[this.board.player()]++,document.getElementById("violet-time").innerHTML=t(this.elapsed[0]),document.getElementById("orange-time").innerHTML=t(this.elapsed[1])}createOpponentsPieces(){let t=document.getElementById("opponents-pieces");for(let s=0;s<I.length;s++){let n=I[s];if(this.board.isUsed(1-this.player,s))continue;let o=9-n[1],r=n[0],h=n[2]+2&7,l=c>>1,a=v[s].rotations[h],b=document.createElement("div");b.id="o"+s,b.setAttribute("style","left:"+o*l+"px;top:"+r*l+"px;position:absolute;");for(let m=0;m<a.size;m++){let k=document.createElement("div");k.setAttribute("style","position:absolute;left:"+a.coords[m].x*l+"px;top:"+a.coords[m].y*l+"px;width:"+l+"px;height:"+l+"px;"),k.className="block"+(1-this.player),b.appendChild(k)}t.appendChild(b)}}hideOpponentsPiece(t){t.isPass()||(document.getElementById("o"+t.blockId()).style.visibility="hidden")}updateBoard(t){let s=document.getElementById("board"),n=t?t.coords():[];for(let o=0;o<14;o++)for(let r=0;r<14;r++){let h=this.board.colorAt(r,o);if(!h)continue;let l="board_"+r.toString(16)+o.toString(16),a=document.getElementById(l);a||(a=document.createElement("div"),a.id=l,a.setAttribute("style","position:absolute;left:"+r*c+"px;top:"+o*c+"px;width:"+c+"px;height:"+c+"px;"),s.appendChild(a));let b=h==="violet"?"block0":"block1";for(let m=0;m<n.length;m++)if(n[m].x==r&&n[m].y==o){b+="highlight";break}a.className=b}}updateScore(){document.getElementById("violet-score").innerHTML=this.board.score(0)+" points",document.getElementById("orange-score").innerHTML=this.board.score(1)+" points"}update(t){this.updateBoard(t),this.updateScore()}setActiveArea(){let t=this.board.player()^this.player,s=["active-area","inactive-area"];document.getElementById("piece-area").className=s[t],document.getElementById("opponents-piece-area").className=s[1-t],document.getElementById("pieces").className=t==0?"active":""}showOpponentsPlaying(t){t?this.showMessage(["Orange","Violet"][this.player]+" plays"):this.hideMessage()}showGameEndMessage(t){let s="";t&&(s='<span style="color:#63d">'+this.board.score(0)+'</span> - <span style="color:#f72">'+this.board.score(1)+"</span> ");let n=this.board.score(this.player),o=this.board.score(this.player^1);n>o?s+="You win!":n<o?s+="You lose...":s+="Draw",this.showMessage(s)}showMessage(t){let s=document.getElementById("message");s.innerHTML=t,s.style.visibility="visible"}hideMessage(){document.getElementById("message").style.visibility="hidden"}};var g=window.matchMedia("(min-width: 580px)"),T=class{constructor(t,s,n){this.board=t;this.player=s;this.onPlayerMove=n;this.wheel_lock=!1;this.selected=null;this.touchDragHandler=this.touchDrag.bind(this)}rotate(t,s,n,o){function r(l){t.classList.add(l),setTimeout(()=>t.classList.remove(l),16)}switch(s){case"left":s=t.direction+[6,2][t.direction&1]&7,r("rotate-left");break;case"right":s=t.direction+[2,6][t.direction&1]&7,r("rotate-right");break;case"flip":s=t.direction^1,r("rotate-flip");break;case"cyclic":t.direction==1||t.direction==6?(s=t.direction^1,r("rotate-flip")):(s=t.direction+(t.direction&1?-2:2),r("rotate-right"));break}t.direction=s;let h=v[t.blockId].rotations[s];for(let l=0;l<h.size;l++){let a=t.childNodes[l];a.style.left=h.coords[l].x*c+"px",a.style.top=h.coords[l].y*c+"px"}n!==void 0&&o!==void 0&&(t.style.left=n-c/2+"px",t.style.top=o-c/2+"px")}toBoardPosition(t,s){let n=window.getComputedStyle(document.getElementById("board"));return t-=parseInt(n.left)+parseInt(n.borderLeftWidth),s-=parseInt(n.top)+parseInt(n.borderTopWidth),t=Math.round(t/c),s=Math.round(s/c),this.board.inBounds(t,s)?{x:t,y:s}:null}fromBoardPosition(t){let s=window.getComputedStyle(document.getElementById("board"));return{x:t.x*c+parseInt(s.left)+parseInt(s.borderLeftWidth),y:t.y*c+parseInt(s.top)+parseInt(s.borderTopWidth)}}createPiece(t,s,n,o){let r=document.getElementById("b"+n);if(r){r.style.left=t+"px",r.style.top=s+"px",this.rotate(r,o);return}r=document.createElement("div"),r.id="b"+n,r.blockId=n,r.direction=o,r.classList.add("piece"),r.setAttribute("style","left:"+t+"px;top:"+s+"px;position:absolute;");let h=v[n].rotations[o].piece;for(let l=0;l<h.size;l++){let a=document.createElement("div");a.setAttribute("style","position:absolute;left:"+h.coords[l].x*c+"px;top:"+h.coords[l].y*c+"px;width:"+c+"px;height:"+c+"px;"),a.className="block"+this.player,r.appendChild(a)}g.matches?(r.onmousedown=this.mouseDrag.bind(this),r.addEventListener&&r.addEventListener("touchstart",this.touchDrag.bind(this),!1),r.onclick=this.click.bind(this),r.ondblclick=this.dblclick.bind(this),r.onwheel=this.wheel.bind(this)):(r.classList.add("unselected"),r.onclick=this.select.bind(this)),document.getElementById("pieces").appendChild(r)}createPieces(){let t=window.getComputedStyle(document.getElementById("piece-area")),s=parseInt(t.left)+parseInt(t.paddingLeft),n=parseInt(t.top)+parseInt(t.paddingTop);for(let o=0;o<I.length;o++){let r=I[o];this.board.isUsed(this.player,o)||(g.matches?this.createPiece(s+r[0]*c,n+r[1]*c,o,r[2]):this.createPiece(s+r[0]*c/2-c/4,n+r[1]*c/2-c/4,o,r[2]))}}wheel(t){if(t.stopPropagation(),t.preventDefault(),this.wheel_lock||(this.wheel_lock=!0,setTimeout(()=>{this.wheel_lock=!1},50),this.board.player()!=this.player))return;let{x:s,y:n}=Y(t);t.deltaY<0?this.rotate(t.currentTarget,"left",s,n):this.rotate(t.currentTarget,"right",s,n)}select(t){if(this.board.player()!=this.player)return;let s=t.currentTarget;this.selected&&this.selected!==s&&this.unselect(),this.selected=s,s.classList.remove("unselected"),s.classList.add("selected"),s.style.left="155px",s.style.top="305px",s.onclick=this.click.bind(this),s.addEventListener("touchstart",this.touchDragHandler,!1)}unselect(){this.selected&&(this.selected.classList.remove("selected"),this.selected.classList.add("unselected"),this.selected.onclick=this.select.bind(this),this.selected.removeEventListener("touchstart",this.touchDragHandler,!1),this.selected=null,this.createPieces())}click(t){if(g.matches&&!t.shiftKey||this.board.player()!=this.player)return;let{x:s,y:n}=Y(t);this.rotate(t.currentTarget,g.matches?"right":"cyclic",s,n)}dblclick(t){if(t.shiftKey||this.board.player()!=this.player)return;let{x:s,y:n}=Y(t);this.rotate(t.currentTarget,"flip",s,n)}mouseDrag(t){this.board.player()==this.player&&this.dragCommon(t,t.clientX,t.clientY)}touchDrag(t){if(this.board.player()!=this.player||t.targetTouches.length!=1)return;let s=t.targetTouches[0].clientX,n=t.targetTouches[0].clientY;this.dragCommon(t,s,n)}dragCommon(t,s,n){let o=t.currentTarget,r=s-o.offsetLeft,h=n-o.offsetTop,l=!0;if(!g.matches){var a=new Date().getTime();o.lastClientX=o.lastClientY=null}o.classList.add("dragging"),t.stopPropagation(),t.preventDefault();let b=(u,x,w)=>{u.stopPropagation();let E=x-r,y=w-h,M=this.toBoardPosition(E,y),U=o.blockId<<3|o.direction;if(M&&this.board.isValidMove(new f(M.x,M.y,U))){let G=this.fromBoardPosition(M);o.style.left=G.x+"px",o.style.top=G.y+"px"}else o.style.left=E+"px",o.style.top=y+"px"},m=u=>{b(u,u.clientX,u.clientY)},k=u=>{if(u.targetTouches.length!=1)return;let x=u.targetTouches[0].clientX,w=u.targetTouches[0].clientY;o.lastClientX=x,o.lastClientY=w,l=!1,b(u,x,w)},X=(u,x,w)=>{document.removeEventListener("mouseup",z,!0),document.removeEventListener("mousemove",m,!0),o.removeEventListener("touchend",j,!1),o.removeEventListener("touchmove",k,!1),u.stopPropagation(),g.matches||o.classList.remove("dragging");let E=this.toBoardPosition(x-r,w-h);if(E){let y=new f(E.x,E.y,o.blockId<<3|o.direction);this.board.isValidMove(y)&&(o.style.visibility="hidden",this.onPlayerMove(y))}else if(!g.matches&&x&&w){let y=x-r,M=w-h;(y<20||y>280||M<10||M>340)&&this.unselect()}},z=u=>{X(u,u.clientX,u.clientY)},j=u=>{if(u.targetTouches.length>0)return;let x=o.lastClientX,w=o.lastClientY;l?this.rotate(o,"cyclic"):g.matches||new Date().getTime()-a<100&&this.rotate(o,"cyclic"),X(u,x,w)};document.addEventListener("mousemove",m,!0),document.addEventListener("mouseup",z,!0),o.addEventListener("touchmove",k,!1),o.addEventListener("touchend",j,!1)}};function Y(p){let t=p.currentTarget.offsetParent,s=p.pageX-t.offsetLeft,n=p.pageY-t.offsetTop;return{x:s,y:n}}var B=class{constructor(t){this.handler=t;this.worker=new Worker("hm5move.js"),this.worker.addEventListener("message",s=>{let n=new f(s.data.move);console.log(s.data.nps+" nps"),this.handler(n)})}request(t,s){this.worker.postMessage({path:t,level:s})}};var D;function F(){document.getElementById("toolbar").classList.remove("closed"),D=setTimeout(W,5e3)}function W(){document.getElementById("toolbar").classList.add("closed"),clearTimeout(D),D=null}function J(){document.getElementById("help").classList.remove("closed"),document.getElementById("toolbar").classList.add("closed")}function Q(){window.location.reload()}function Z(){document.getElementById("help").classList.add("closed")}var $=document.getElementById("handler");$.addEventListener("click",F);document.getElementById("reloadButton").addEventListener("click",Q);document.getElementById("helpButton").addEventListener("click",J);document.getElementById("closeButton").addEventListener("click",W);document.getElementById("closeHelp").addEventListener("click",Z);var _=class{constructor(t,s){this.level=s;this.board=new L,this.view=new P(this.board,t),this.input=new T(this.board,t,this.onPlayerMove.bind(this)),this.backend=new B(this.onOpponentMove.bind(this)),this.startGame(),t==1&&this.opponentMove()}onPlayerMove(t){this.board.doMove(t),this.opponentMove(),this.view.onPlayerMove()}opponentMove(){this.view.startOpponentMove(),this.backend.request(this.board.getPath(),this.level)}onOpponentMove(t){this.board.doMove(t),this.view.onOpponentMove(t),this.input.createPieces(),this.board.canMove()||(t.isPass()?this.gameEnd():(this.board.doPass(),this.opponentMove()))}gameEnd(){this.view.gameEnd(!g.matches),gtag("event","gameend")}startGame(){document.getElementById("start-game").style.visibility="hidden",this.input.createPieces(),this.view.startGame(),gtag("event","gamestart")}},q=1;function R(p){let t=new _(p,q)}document.getElementById("start-violet").addEventListener("click",()=>R(0));document.getElementById("start-orange").addEventListener("click",()=>R(1));document.getElementById("level1").addEventListener("click",()=>q=1);document.getElementById("level2").addEventListener("click",()=>q=2);document.getElementById("level3").addEventListener("click",()=>q=3);
//# sourceMappingURL=blokus.js.map