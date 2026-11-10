// 3D scene: a website builds itself from floating layers as you scroll; more objects join per section; background colour shifts.
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v)), ease=t=>t*t*(3-2*t);
const renderer=new THREE.WebGLRenderer({canvas:document.getElementById('bg'),alpha:true,antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(55,1,.1,100); camera.position.z=14;
scene.add(new THREE.AmbientLight(0xffffff,.7));
const dl=new THREE.DirectionalLight(0xffffff,.9); dl.position.set(4,6,8); scene.add(dl);
const p1=new THREE.PointLight(0xffb547,1.4,40); p1.position.set(-6,-2,6); scene.add(p1);
const p2=new THREE.PointLight(0x3dd6c6,1.4,40); p2.position.set(6,3,5); scene.add(p2);
const site=new THREE.Group(); scene.add(site);
const mat=c=>new THREE.MeshStandardMaterial({color:c,roughness:.35,metalness:.25});
const edge=(m,g)=>m.add(new THREE.LineSegments(new THREE.EdgesGeometry(g),new THREE.LineBasicMaterial({color:0xffffff,transparent:true,opacity:.28})));

// Layers of a web page: [w,h,d, x,y,z, colour]
const spec=[[4.2,3,.25,0,0,0,0x141a3a],[3.8,2.6,.06,0,0,.16,0x0b1230],[3.8,.3,.1,0,1.1,.24,0xffb547],
[2.2,1,.14,-.8,.35,.26,0x3dd6c6],[.9,.26,.16,.9,.15,.3,0xffb547],[1.3,.09,.1,.85,.6,.28,0xeef0fa],[1,.09,.1,.7,.4,.28,0xb5bad6],
[1.1,.8,.14,-1.25,-.8,.26,0x7d5bff],[1.1,.8,.14,0,-.8,.26,0xffb547],[1.1,.8,.14,1.25,-.8,.26,0x3dd6c6],[.14,.14,.12,-1.75,1.1,.32,0xff5f57],[.14,.14,.12,-1.5,1.1,.32,0xffbd2e],[.14,.14,.12,-1.25,1.1,.32,0x28c840]];
const parts=spec.map(([w,h,d,x,y,z,c])=>{
  const g=new THREE.BoxGeometry(w,h,d), m=new THREE.Mesh(g,mat(c)); edge(m,g); site.add(m);
  const dir=new THREE.Vector3(Math.random()-.5,Math.random()-.5,Math.random()*.8).normalize().multiplyScalar(9+Math.random()*4);
  return {m,t:new THREE.Vector3(x,y,z),s:dir,r:new THREE.Vector3(Math.random()*6,Math.random()*6,Math.random()*6)};
});
// Developer objects that join as you scroll: </> code, React-style atom, database, gear, cursor, pixels
const M=(g,c)=>new THREE.Mesh(g,mat(c));
const bar=(c,rz,x)=>{const m=M(new THREE.BoxGeometry(.8,.16,.16),c);m.rotation.z=rz;m.position.set(x,0,0);return m};
const grp=(...k)=>{const g=new THREE.Group();k.forEach(o=>g.add(o));return g};
const code=()=>{const a=bar(0xffb547,.75,-1.32),b=bar(0xffb547,-.75,-1.32),c=bar(0x3dd6c6,-.75,1.32),d=bar(0x3dd6c6,.75,1.32),s=bar(0xffffff,1.2,0);
  a.position.y=.28;b.position.y=-.28;c.position.y=.28;d.position.y=-.28;s.scale.x=1.5;return grp(a,b,c,d,s)};
const atom=()=>{const g=grp(M(new THREE.SphereGeometry(.22,24,24),0x61dafb));
  for(let i=0;i<3;i++){const r=M(new THREE.TorusGeometry(1.1,.035,10,70),0x61dafb);r.rotation.set(1.2,0,i*1.047);g.add(r)}return g};
const db=()=>grp(...[-.34,0,.34].map((y,i)=>{const m=M(new THREE.CylinderGeometry(.8,.8,.28,32),[0x7d5bff,0x6a4be0,0x7d5bff][i]);m.position.y=y;return m}));
const gear=()=>{const g=grp(M(new THREE.CylinderGeometry(.6,.6,.25,16),0xffb547));g.children[0].rotation.x=1.5708;
  for(let i=0;i<8;i++){const t=M(new THREE.BoxGeometry(.24,.3,.25),0xffb547),a=i*.785;t.position.set(Math.cos(a)*.72,Math.sin(a)*.72,0);t.rotation.z=a+1.5708;g.add(t)}return g};
const cursor=()=>{const m=M(new THREE.ConeGeometry(.35,.95,3),0xffffff);m.rotation.z=.45;return m};
const px=(c)=>M(new THREE.BoxGeometry(.3,.3,.3),c);
const extraSpec=[[code(),.9,0,0,2.7,1],[atom(),1.8,3.7,.5,.6],[db(),2.6,3.9,-.4,-.7],[gear(),3.3,4.3,.35,1.1],[cursor(),4,3.2,-.5,-1.1],
 ...[0xff6b9a,0x3dd6c6,0xffb547,0x7d5bff].map((c,i)=>[px(c),4.4+i*.1,3.1+i*.3,(i%2?-1:1)*.4,(i-1.5)*.6])];
const extras=extraSpec.map(([m,at,r,sp,y,flat],i)=>{m.scale.setScalar(0);site.add(m);return {m,at:at+1,r,sp,y,flat,a:i*1.3};});
// "Full stack" tower: four layers (Data, Server, Security/API, Interface) that stack up while the sticky section scrolls
const tower=new THREE.Group(); scene.add(tower);
const TL=[0x7d5bff,0x3dd6c6,0xffb547,0xff6b9a].map((c,i)=>{const g=new THREE.Group();
  const d=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,.55,64),new THREE.MeshStandardMaterial({color:c,roughness:.3,metalness:.3,emissive:c,emissiveIntensity:.05}));
  const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,.05,12,80),new THREE.MeshBasicMaterial({color:0xffffff}));ring.rotation.x=1.5708;ring.position.y=.28;
  g.add(d,ring);g.userData.y=-1.9+i*1.25;tower.add(g);return g});
const stackEl=document.getElementById('stack'), caps=[...document.querySelectorAll('.cap')];
const N=600,pos=new Float32Array(N*3).map(()=>(Math.random()-.5)*44), pg=new THREE.BufferGeometry();
pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
const pts=new THREE.Points(pg,new THREE.PointsMaterial({size:.06,color:0xcdd3ff,transparent:true,opacity:.6})); scene.add(pts);

// Per-section keyframes: hero, about, experience, projects, skills, contact
const KX=[6,6,-5.6,5.6,-5.6,5.6,0], KY=[.2,.2,0,0,0,0,.2], KZ=[0,0,0,0,0,0,-5], KR=[-.5,-.5,.55,-.55,.85,-.85,0], KS=[1.15,1.15,1,1,1,1,1.25];
const BG=['#0a0e1f','#2a0f4a','#1d0f3d','#05352f','#3d1609','#0c2650','#2e0c33'].map(c=>new THREE.Color(c));
const kf=(a,f)=>{const i=Math.min(6,Math.floor(f)),j=Math.min(6,i+1);return a[i]+(a[j]-a[i])*ease(f-i)};
const secs=['.hero','#stack','#about','#experience','#projects','#skills','#contact'].map(s=>document.querySelector(s));
let mx=0,my=0,intro=reduce?1:0,t=0;
addEventListener('mousemove',e=>{mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5});
function resize(){renderer.setSize(innerWidth,innerHeight,false);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
function section(){const y=scrollY+innerHeight*.4,tops=secs.map(s=>s.offsetTop);let i=0;
  while(i<6&&y>=tops[i+1])i++; return i>=6?6:i+(y-tops[i])/(tops[i+1]-tops[i]);}
(function loop(){
  t+=.012; const f=clamp(section(),0,6), narrow=camera.aspect<1, xs=narrow?.1:Math.min(1,camera.aspect/1.78);
  intro=Math.min(.5,intro+.006);
  const a=Math.max(intro,clamp(scrollY/(innerHeight*.8)));
  parts.forEach((p,i)=>{const k=ease(clamp(a*1.6-i*.08));p.m.position.lerpVectors(p.s,p.t,k);p.m.rotation.set(p.r.x*(1-k),p.r.y*(1-k),p.r.z*(1-k));});
  extras.forEach(e=>{const k=ease(clamp((f-e.at)/.7));e.m.scale.setScalar(k);
    if(e.r){e.a+=e.sp*.02;e.m.position.set(Math.cos(e.a)*e.r,e.y+Math.sin(t*2+e.a)*.2,Math.sin(e.a)*e.r);}else e.m.position.set(0,e.y+Math.sin(t+e.at)*.15,.5);
    if(e.flat)e.m.rotation.set(0,Math.sin(t*1.3)*.5,0);else{e.m.rotation.x+=.01;e.m.rotation.y+=.014}});
  const rc=stackEl.getBoundingClientRect(), sp=clamp(-rc.top/Math.max(1,rc.height-innerHeight)), v=ease(clamp((innerHeight-rc.top)/(innerHeight*.5)))*ease(clamp(rc.bottom/(innerHeight*.6))), cur=Math.min(3,Math.floor(sp*4));
  TL.forEach((g,i)=>{const k=ease(clamp(sp*4.4-i));g.position.y=g.userData.y+(1-k)*7;g.rotation.y=(1-k)*3+t*(i%2?-.4:.4);g.scale.setScalar(.2+.8*k);g.children[0].material.emissiveIntensity=i===cur?.55:.05;});
  caps.forEach((c,i)=>c.classList.toggle('on',i===cur));
  tower.position.set(narrow?0:5.4*xs,0,narrow?-3:0);tower.scale.setScalar(Math.max(.001,v*(narrow?.6:1)));tower.rotation.set(.3-my*.2,mx*.5,0);
  const sc=(narrow?.65:1)*kf(KS,f);
  site.position.x+=(kf(KX,f)*xs-site.position.x)*.07;
  site.position.y+=(kf(KY,f)+Math.sin(t)*.15-site.position.y)*.07;
  site.position.z+=(kf(KZ,f)-(narrow?3:0)-site.position.z)*.07;
  site.scale.setScalar(Math.max(.001,sc*(1-v)));
  site.rotation.y+=(kf(KR,f)+mx*.5+Math.sin(t*.7)*.1-site.rotation.y)*.06;
  site.rotation.x+=(-my*.3-site.rotation.x)*.06;
    pts.rotation.y=t*.05+mx*.2; pts.position.y=scrollY*.002;
  // background colour follows the section
  const i=Math.min(5,Math.floor(f)),c=new THREE.Color().lerpColors(BG[i],BG[i+1],ease(clamp(f-i)));
  const r=document.documentElement.style; r.setProperty('--b1','#'+c.getHexString()); r.setProperty('--b2','#'+c.clone().offsetHSL(0,.05,.09).getHexString());
  document.getElementById('bar').style.width=(scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)*100)+'%';
  renderer.render(scene,camera); requestAnimationFrame(loop);
})();

document.querySelectorAll('.tilt').forEach(el=>{
  el.addEventListener('mousemove',e=>{if(reduce)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    el.style.setProperty('--gx',(x+.5)*100+'%');el.style.setProperty('--gy',(y+.5)*100+'%');el.style.transform=`perspective(900px) rotateY(${x*10}deg) rotateX(${-y*10}deg)`;});
  el.addEventListener('mouseleave',()=>el.style.transform='');
});
const io=new IntersectionObserver(es=>es.forEach(e=>{if(!e.isIntersecting)return;io.unobserve(e.target);
  const n=+e.target.dataset.n,s=e.target.dataset.s;let v=0;
  (function step(){v+=Math.max(1,n/40);if(v>=n){e.target.textContent=n+s;return}e.target.textContent=Math.floor(v)+s;requestAnimationFrame(step)})();}),{threshold:.6});
document.querySelectorAll('[data-n]').forEach(b=>io.observe(b));
document.querySelectorAll('[data-todo]').forEach(a=>a.addEventListener('click',e=>{if(a.getAttribute('href')==='#')e.preventDefault()}));

document.querySelectorAll('.lg img').forEach(i=>{const f=()=>i.replaceWith(Object.assign(document.createElement('b'),{textContent:i.alt[0]}));i.complete&&!i.naturalWidth?f():i.addEventListener('error',f)});
