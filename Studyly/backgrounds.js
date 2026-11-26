(()=>{
const files=[
  "backgrounds/adam-jang-MLKrf51NV8w-unsplash.jpg",
  "backgrounds/andrey-andreyev-dh8ONmfQyQQ-unsplash.jpg",
  "backgrounds/david-edelstein-N4DbvTUDikw-unsplash.jpg",
  "backgrounds/jayesh-patel-zHRlfpTGXx8-unsplash.jpg",
  "backgrounds/jezael-melgoza-alY6_OpdwRQ-unsplash.jpg",
  "backgrounds/johny-goerend-x3WQMj5QkEE-unsplash.jpg",
  "backgrounds/leonard-cotte-R5scocnOOdM-unsplash.jpg",
  "backgrounds/lightscape-LtnPejWDSAY-unsplash.jpg",
  "backgrounds/li-yang-5h_dMuX_7RE-unsplash.jpg",
  "backgrounds/nuno-alberto-MykFFC5zolE-unsplash.jpg",
  "backgrounds/ruben-zimmermann--Nt8OYfdBvg-unsplash.jpg",
  "backgrounds/spenser-sembrat-9H6ZPRr7j6Q-unsplash.jpg",
  "backgrounds/su-san-lee-E_eWwM29wfU-unsplash.jpg",
  "backgrounds/svetlana-gumerova-PMkQ7WVWqr0-unsplash.jpg",
  "backgrounds/syuhei-inoue-kaoHI0iHJPM-unsplash.jpg",
  "backgrounds/tam-minton-0eYHcCrcFNM-unsplash.jpg",
  "backgrounds/tom-podmore-nIbZlqTuzc0-unsplash.jpg",
  "backgrounds/tom-podmore-PNcxIa2HHBk-unsplash.jpg"
];
const themes=[
{cyan:'#b7e2ff',purple:'#83aee8',pink:'#e6c8ef',green:'#a6e6d0',yellow:'#f6e4b0',red:'#f2a7b5',text:'#f7fbff',muted:'#d3e4f5',panel:'rgba(5,20,42,.78)',panel2:'rgba(8,27,53,.9)',line:'rgba(190,220,255,.34)',overlay:'rgba(4,18,42,.42)'},
{cyan:'#73f0ed',purple:'#70b9d8',pink:'#f0b5c8',green:'#9ce8cf',yellow:'#ffe0a2',red:'#ff9b9b',text:'#f3ffff',muted:'#c6e6e9',panel:'rgba(3,31,43,.78)',panel2:'rgba(4,39,52,.9)',line:'rgba(143,232,235,.3)',overlay:'rgba(0,27,39,.46)'},
{cyan:'#b9e1ff',purple:'#9dbde4',pink:'#eac6dc',green:'#aee1d2',yellow:'#f3e0b1',red:'#f1a6b4',text:'#f8fbff',muted:'#d4e0ed',panel:'rgba(11,23,39,.8)',panel2:'rgba(16,31,49,.92)',line:'rgba(207,226,245,.3)',overlay:'rgba(7,17,32,.48)'},
{cyan:'#ffd1a1',purple:'#d8b4a0',pink:'#f3b7a8',green:'#b9d6b0',yellow:'#ffe3a3',red:'#ff9f91',text:'#fff8f1',muted:'#ead9cd',panel:'rgba(37,22,17,.8)',panel2:'rgba(48,28,21,.92)',line:'rgba(255,220,190,.3)',overlay:'rgba(35,18,10,.46)'}];
const a=document.getElementById('sceneA'),b=document.getElementById('sceneB'),root=document.documentElement;if(!a||!b)return;let i=0,front=a,back=b;
function paint(t){for(const k of ['cyan','purple','pink','green','yellow','red','text','muted','panel','panel2','line'])root.style.setProperty('--'+k,t[k]);root.style.setProperty('--scene-overlay',t.overlay)}
function next(){const n=i%files.length,t=themes[i%themes.length];back.onload=()=>{back.classList.add('active');front.classList.remove('active');[front,back]=[back,front];paint(t)};back.onerror=()=>{i++;next()};back.src=files[n];i++}
next();setInterval(next,10000);
})();
