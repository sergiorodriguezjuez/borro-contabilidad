import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import * as db from "./db";

var SOCIOS=[{id:"sergio",nombre:"Sergio Rodríguez Juez"},{id:"alvaro",nombre:"Álvaro Rodríguez Abreu"}];
var MESES=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
var ESTADOS=["Preparando","Enviado","Entregado","Devuelto","Cancelado"];
var uid=function(){return Date.now().toString(36)+Math.random().toString(36).slice(2,7);};
var eur=function(n){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(n);};
var hoy=function(){var d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");};
var inicioAnio=function(){return new Date().getFullYear()+"-01-01";};
var fmtF=function(s){if(!s)return"—";var p=s.split("-");return p[2]+"/"+p[1]+"/"+p[0];};
var getM=function(f){return parseInt(f.split("-")[1])-1;};

var TH={
  dark:{bg:"#0e0e1a",hBg:"linear-gradient(135deg,#1a1a2e,#16213e,#1a1a2e)",cBg:"linear-gradient(145deg,#1a1a2e,#16213e)",cB:"#2a2a4a",iB:"#12122a",iC:"#2a2a4a",tx:"#e0e0ff",tm:"#9090b0",td:"#6060a0",tf:"#7070a0",nB:"#1a1a3a",bB:"#2a2a4a",sT:"#3a3a5a"},
  light:{bg:"#f5f5f8",hBg:"linear-gradient(135deg,#fff,#e8eaf6,#fff)",cBg:"linear-gradient(145deg,#fff,#f0f0f5)",cB:"#d8d8e8",iB:"#fff",iC:"#ccc",tx:"#1a1a2e",tm:"#555",td:"#888",tf:"#999",nB:"#ddd",bB:"#e0e0e8",sT:"#bbb"}
};
var C={ing:"#00b894",gas:"#e74c3c",bP:"#00b894",bN:"#e74c3c",ped:"#fdcb6e",biz:"#6c5ce7",efe:"#00b894",tar:"#4a9eff",tra:"#e17055",acc:"#a66efa",dev:"#fdcb6e"};

function Md(p){if(!p.open)return null;var t=p.t;return(<div onClick={p.onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,backdropFilter:"blur(4px)"}}><div onClick={function(e){e.stopPropagation();}} style={{background:t.iB,border:"1px solid "+t.cB,borderRadius:16,padding:"24px 28px",width:"92%",maxWidth:p.wide?640:460,boxShadow:"0 24px 80px rgba(0,0,0,.3)",maxHeight:"90vh",overflowY:"auto"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}><h3 style={{margin:0,fontSize:17,color:t.tx}}>{p.title}</h3><button onClick={p.onClose} style={{background:"none",border:"none",color:t.td,fontSize:22,cursor:"pointer"}}>✕</button></div>{p.children}</div></div>);}
function Bt(p){var bv={primary:{background:"linear-gradient(135deg,#6c5ce7,#a66efa)",color:"#fff"},danger:{background:"linear-gradient(135deg,#e74c3c,#c0392b)",color:"#fff"},gd:{background:"transparent",border:"1px solid #3a3a5a",color:"#c0c0e0"},gl:{background:"transparent",border:"1px solid #ccc",color:"#555"},success:{background:"linear-gradient(135deg,#00b894,#55efc4)",color:"#1a1a2e"},warn:{background:"linear-gradient(135deg,#fdcb6e,#e17055)",color:"#1a1a2e"}};var v=p.variant==="ghost"?(p.theme==="light"?"gl":"gd"):(p.variant||"primary");return<button onClick={p.onClick} disabled={p.disabled} style={{padding:"10px 18px",borderRadius:10,border:"none",cursor:p.disabled?"default":"pointer",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600,opacity:p.disabled?.5:1,...bv[v],...(p.style||{})}}>{p.children}</button>;}
function In(p){var t=p.t,l=p.label,r=Object.assign({},p);delete r.t;delete r.label;return(<div style={{marginBottom:12}}>{l&&<label style={{display:"block",fontSize:11,color:t.tm,marginBottom:4}}>{l}</label>}<input {...r} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.iC,background:t.iB,color:t.tx,fontSize:13,fontFamily:"'DM Sans',sans-serif",boxSizing:"border-box",outline:"none",...(r.style||{})}}/></div>);}
function Sl(p){var t=p.t,l=p.label,o=p.options,r=Object.assign({},p);delete r.t;delete r.label;delete r.options;return(<div style={{marginBottom:12}}>{l&&<label style={{display:"block",fontSize:11,color:t.tm,marginBottom:4}}>{l}</label>}<select {...r} style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.iC,background:t.iB,color:t.tx,fontSize:13,boxSizing:"border-box",outline:"none"}}>{o.map(function(x){return<option key={x.value} value={x.value}>{x.label}</option>;})}</select></div>);}

function PgI(p){var t=p.t;return(<div><div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,color:t.tm,marginBottom:6}}>Método de cobro</label><div style={{display:"flex",gap:6}}>{[{id:"efectivo",l:"💶 Efectivo"},{id:"bizum",l:"📲 Bizum"}].map(function(m){return<button key={m.id} onClick={function(){p.onChange(m.id);}} style={{flex:1,padding:"10px 14px",borderRadius:9,border:p.value===m.id?"2px solid #6c5ce7":"1px solid "+t.iC,background:p.value===m.id?"rgba(108,92,231,.15)":t.iB,color:p.value===m.id?"#a66efa":t.td,cursor:"pointer",fontSize:13,fontWeight:600}}>{m.l}</button>;})}</div></div>{p.value==="bizum"&&<div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,color:t.tm,marginBottom:4}}>Teléfono</label><input type="tel" value={p.tel} onChange={function(e){p.onTel(e.target.value.replace(/[^\d+\s]/g,"").slice(0,15));}} placeholder="+34 600 000 000" style={{width:"100%",padding:"9px 12px",borderRadius:9,border:"1px solid "+t.iC,background:t.iB,color:t.tx,fontSize:14,fontFamily:"'Space Mono',monospace",boxSizing:"border-box",outline:"none"}}/></div>}</div>);}

function PgG(p){var t=p.t;var ms=[{id:"efectivo",l:"💶 Efectivo",bc:"#4a9eff",bg:"rgba(74,158,255,.12)"},{id:"tarjeta",l:"💳 Tarjeta",bc:"#4a9eff",bg:"rgba(74,158,255,.12)"},{id:"transferencia",l:"🏦 Transfer.",bc:"#e17055",bg:"rgba(225,112,85,.12)"}];var nd=p.value==="tarjeta"||p.value==="transferencia";return(<div><div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,color:t.tm,marginBottom:6}}>Método de pago</label><div style={{display:"flex",gap:5}}>{ms.map(function(m){var a=p.value===m.id;return<button key={m.id} onClick={function(){p.onChange(m.id);}} style={{flex:1,padding:"10px 8px",borderRadius:9,border:a?"2px solid "+m.bc:"1px solid "+t.iC,background:a?m.bg:t.iB,color:a?m.bc:t.td,cursor:"pointer",fontSize:11,fontWeight:600}}>{m.l}</button>;})}</div></div>{nd&&<div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,color:t.tm,marginBottom:4}}>{p.value==="tarjeta"?"Últimos 4 dígitos tarjeta":"Últimos 4 dígitos cuenta"}</label><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:t.td,fontFamily:"'Space Mono',monospace",fontSize:13}}>{p.value==="tarjeta"?"•••• ••••":"•••• •••• ••"}</span><input type="text" maxLength={4} value={p.d4} onChange={function(e){p.onD4(e.target.value.replace(/\D/g,"").slice(0,4));}} placeholder="0000" style={{width:72,padding:"8px 12px",borderRadius:9,border:"1px solid "+t.iC,background:t.iB,color:t.tx,fontSize:16,fontFamily:"'Space Mono',monospace",boxSizing:"border-box",outline:"none",letterSpacing:4,textAlign:"center"}}/></div></div>}</div>);}

function BI(p){if(p.m==="bizum")return<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(108,92,231,.15)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.biz,fontFamily:"'Space Mono',monospace"}}>📲 {p.tel||"Bizum"}</span>;return<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(0,184,148,.1)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.efe}}>💶 Efectivo</span>;}
function BG(p){if(p.m==="tarjeta")return<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(74,158,255,.12)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.tar,fontFamily:"'Space Mono',monospace"}}>💳 {p.d4?"••"+p.d4:"Tarjeta"}</span>;if(p.m==="transferencia")return<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(225,112,85,.15)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.tra,fontFamily:"'Space Mono',monospace"}}>🏦 {p.d4?"••"+p.d4:"Transfer."}</span>;return<span style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(0,184,148,.1)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.efe}}>💶 Efectivo</span>;}
function EB(p){var c={Preparando:"#fdcb6e",Enviado:"#74b9ff",Entregado:"#00b894",Devuelto:"#e74c3c",Cancelado:"#636e72"};var cl=c[p.e]||"#636e72";return<span style={{padding:"2px 10px",borderRadius:6,fontSize:10,fontWeight:600,background:cl+"22",color:cl}}>{p.e}</span>;}
function Cd(p){return<div style={{background:p.t.cBg,border:"1px solid "+p.t.cB,borderRadius:14,padding:"18px 20px",...(p.style||{})}}>{p.children}</div>;}
function DB(p){var t=p.t;var ps=[{l:"Este mes",fn:function(){var d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0");p.sD(y+"-"+m+"-01");p.sH(hoy());}},{l:"Mes pasado",fn:function(){var d=new Date();d.setMonth(d.getMonth()-1);var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),l=new Date(y,d.getMonth()+1,0).getDate();p.sD(y+"-"+m+"-01");p.sH(y+"-"+m+"-"+String(l).padStart(2,"0"));}},{l:"Este año",fn:function(){p.sD(new Date().getFullYear()+"-01-01");p.sH(hoy());}},{l:"Todo",fn:function(){p.sD("2020-01-01");p.sH("2099-12-31");}}];return(<div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:6,padding:"10px 0"}}><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:t.td}}>Desde</span><input type="date" value={p.d} onChange={function(e){p.sD(e.target.value);}} style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:7,color:t.tx,padding:"4px 8px",fontSize:11,outline:"none"}}/></div><div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:10,color:t.td}}>Hasta</span><input type="date" value={p.h} onChange={function(e){p.sH(e.target.value);}} style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:7,color:t.tx,padding:"4px 8px",fontSize:11,outline:"none"}}/></div><div style={{display:"flex",gap:3,flexWrap:"wrap"}}>{ps.map(function(x){return<button key={x.l} onClick={x.fn} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+t.iC,background:t.iB,color:t.tm,fontSize:10,cursor:"pointer"}}>{x.l}</button>;})}</div></div>);}

function Dashboard(props) {
  var [ings,setIngs]=useState([]);
  var [gasts,setGasts]=useState([]);
  var [peds,setPeds]=useState([]);
  var [cats,setCats]=useState({general:[],coste:[]});
  var [ld,setLd]=useState(true);
  var [sv,setSv]=useState(false);
  var [vista,setVista]=useState("dashboard");
  var [fD,setFD]=useState(inicioAnio());
  var [fH,setFH]=useState(hoy());
  var [fC,setFC2]=useState("todo");
  var [tm,setTm]=useState(function(){return localStorage.getItem("borro-theme")||"dark";});

  var [mI,setMI]=useState(false);
  var [mG,setMG]=useState(false);
  var [mP,setMP]=useState(false);
  var [mInf,setMInf]=useState(false);
  var [mCat,setMCat]=useState(false);
  var [mDP,setMDP]=useState(null);
  var [mDel,setMDel]=useState(null);
  var [mAC,setMAC]=useState(null);
  var [mEC,setMEC]=useState(null);
  var [mDev,setMDev]=useState(null); // devolucion modal

  var dI={socio:"sergio",fecha:hoy(),monto:"50",metodo:"bizum",tel:""};
  var dG={desc:"",monto:"",cat:"Marketing",fecha:hoy(),metodo:"tarjeta",d4:"",doc:null};
  var dP={cliente:"",prod:"",pv:"",fecha:hoy(),metodo:"bizum",tel:"",estado:"Preparando"};
  var dC={concepto:"",monto:"",cat:"Impresión"};
  var dDev={monto:"",fecha:hoy(),doc:null};

  var [fI,setFI]=useState(dI);
  var [fG,setFG]=useState(dG);
  var [fP,setFP]=useState(dP);
  var [fCo,setFCo]=useState(dC);
  var [fDv,setFDv]=useState(dDev);
  var [nCat,setNCat]=useState("");
  var [iCat,setICat]=useState("todo");
  var [iDesde,setIDesde]=useState(inicioAnio());
  var [iHasta,setIHasta]=useState(hoy());
  var [iSeccion,setISeccion]=useState("todo");

  var t=TH[tm];
  var ue=props.session&&props.session.user?props.session.user.email:"";

  async function load(){setLd(true);var r=await Promise.all([db.fetchIngresos(),db.fetchGastos(),db.fetchPedidos(),db.fetchCategorias()]);setIngs(r[0]);setGasts(r[1]);setPeds(r[2]);setCats(r[3]);setLd(false);}
  useEffect(function(){load();},[]);
  function togTh(){var n=tm==="dark"?"light":"dark";setTm(n);localStorage.setItem("borro-theme",n);}
  async function logout(){await supabase.auth.signOut();}

  async function addI(){setSv(true);await db.insertIngreso({id:uid(),socio:fI.socio,fecha:fI.fecha,monto:parseFloat(fI.monto)||0,metodo:fI.metodo,telefono:fI.metodo==="bizum"?fI.tel:""});setIngs(await db.fetchIngresos());setMI(false);setFI(dI);setSv(false);}
  async function addG(){
    setSv(true);var gid=uid();var dn="",du="";
    if(fG.doc){var r=await db.uploadDocumento(fG.doc,gid);if(r){dn=r.nombre;du=r.url;}}
    await db.insertGasto({id:gid,descripcion:fG.desc,fecha:fG.fecha,monto:parseFloat(fG.monto)||0,categoria:fG.cat,metodo:fG.metodo,tarjeta4:(fG.metodo==="tarjeta"||fG.metodo==="transferencia")?fG.d4:"",documento_nombre:dn,documento_url:du});
    setGasts(await db.fetchGastos());setMG(false);setFG(dG);setSv(false);
  }
  async function addP(){setSv(true);await db.insertPedido({id:uid(),cliente:fP.cliente,producto:fP.prod,fecha:fP.fecha,precioVenta:parseFloat(fP.pv)||0,estado:fP.estado,metodo:fP.metodo,telefono:fP.metodo==="bizum"?fP.tel:""});setPeds(await db.fetchPedidos());setMP(false);setFP(dP);setSv(false);}
  async function del(tipo,id){setSv(true);if(tipo==="ingreso"){await db.deleteIngreso(id);setIngs(await db.fetchIngresos());}else if(tipo==="gasto"){await db.deleteGasto(id);setGasts(await db.fetchGastos());}else{await db.deletePedido(id);setPeds(await db.fetchPedidos());}setMDel(null);setMDP(null);setSv(false);}
  async function addCo(pid){setSv(true);await db.insertCostePedido(pid,{id:uid(),concepto:fCo.concepto,monto:parseFloat(fCo.monto)||0,categoria:fCo.cat});var ps=await db.fetchPedidos();setPeds(ps);setMAC(null);setFCo(dC);setMDP(ps.find(function(p){return p.id===pid;}));setSv(false);}
  async function delCo(pid,cid){setSv(true);await db.deleteCostePedido(cid);var ps=await db.fetchPedidos();setPeds(ps);setMDP(ps.find(function(p){return p.id===pid;}));setSv(false);}
  async function updE(pid,e){await db.updatePedidoEstado(pid,e);var ps=await db.fetchPedidos();setPeds(ps);setMDP(ps.find(function(p){return p.id===pid;}));}
  async function edCo(pid,cid){setSv(true);await db.updateCostePedido(cid,{concepto:fCo.concepto,monto:parseFloat(fCo.monto)||0,categoria:fCo.cat});var ps=await db.fetchPedidos();setPeds(ps);setMEC(null);setFCo(dC);setMDP(ps.find(function(p){return p.id===pid;}));setSv(false);}
  async function aCat(tipo){if(!nCat.trim())return;await db.insertCategoria(tipo,nCat.trim());setCats(await db.fetchCategorias());setNCat("");}
  async function dCat(tipo,n){await db.deleteCategoria(tipo,n);setCats(await db.fetchCategorias());}

  // Devolucion
  async function confirmDev(){
    if(!mDev)return;
    setSv(true);
    var dn="",du="";
    if(fDv.doc){var r=await db.uploadDocumento(fDv.doc,"dev-"+mDev.id);if(r){dn=r.nombre;du=r.url;}}
    await db.marcarDevolucion(mDev.id,parseFloat(fDv.monto)||mDev.monto,fDv.fecha,dn,du);
    setGasts(await db.fetchGastos());setMDev(null);setFDv(dDev);setSv(false);
  }

  if(ld)return<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",background:t.bg,color:t.tx,fontFamily:"'DM Sans',sans-serif"}}><div style={{textAlign:"center"}}><p style={{fontSize:32}}>📊</p><p style={{opacity:.7}}>Conectando...</p></div></div>;

  var inR=function(f){return f>=fD&&f<=fH;};
  var iR=ings.filter(function(i){return inR(i.fecha);});
  var gR=gasts.filter(function(g){return inR(g.fecha);});
  var pR=peds.filter(function(p){return inR(p.fecha);});
  var fi=fC==="todo"?iR:fC==="Aportación socios"?iR:[];
  var fg=fC==="todo"?gR:gR.filter(function(g){return g.categoria===fC;});
  var fp=(fC==="todo"||fC==="Pedidos clientes")?pR:[];

  var tI=fi.reduce(function(s,i){return s+i.monto;},0);
  var tG=fg.reduce(function(s,g){return s+g.monto;},0);
  // Devoluciones suman al balance (recuperas dinero)
  var tDev=fg.reduce(function(s,g){return s+(g.devuelto?g.devolucion_monto:0);},0);
  var tV=fp.reduce(function(s,p){return s+p.precioVenta;},0);
  var tCo=fp.reduce(function(s,p){return s+(p.costes||[]).reduce(function(a,c){return a+c.monto;},0);},0);
  var bal=tI+tV-tG+tDev-tCo;

  var ss=SOCIOS.map(function(s){return{...s,tot:iR.filter(function(i){return i.socio===s.id;}).reduce(function(a,i){return a+i.monto;},0),cnt:iR.filter(function(i){return i.socio===s.id;}).length};});
  var mD=MESES.map(function(_,idx){var mi=iR.filter(function(i){return getM(i.fecha)===idx;}).reduce(function(s,i){return s+i.monto;},0)+pR.filter(function(p){return getM(p.fecha)===idx;}).reduce(function(s,p){return s+p.precioVenta;},0);var mg=gR.filter(function(g){return getM(g.fecha)===idx;}).reduce(function(s,g){return s+g.monto;},0)+pR.filter(function(p){return getM(p.fecha)===idx;}).reduce(function(s,p){return s+(p.costes||[]).reduce(function(a,c){return a+c.monto;},0);},0);return{m:MESES[idx].slice(0,3),i:mi,g:mg};});
  var mx=Math.max.apply(null,mD.map(function(d){return Math.max(d.i,d.g);}).concat([100]));
  var cG=cats.general.length>0?cats.general:["Aportación socios","Pedidos clientes","Otros"];
  var cCo=cats.coste.length>0?cats.coste:["Impresión","Marco","Envío","Otros"];
  var cO=[{value:"todo",label:"📊 Todo"}].concat(cG.map(function(c){return{value:c,label:c};}));

  return(
    <div style={{minHeight:"100vh",background:t.bg,color:t.tx,fontFamily:"'DM Sans',sans-serif",padding:"0 0 40px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap');*{box-sizing:border-box}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-thumb{background:${t.sT};border-radius:3px}input[type="date"]::-webkit-calendar-picker-indicator{filter:${tm==="dark"?"invert(.7)":"none"};cursor:pointer}`}</style>

      <div style={{background:t.hBg,borderBottom:"1px solid "+t.cB,padding:"16px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div><h1 style={{margin:0,fontSize:26,fontFamily:"'Space Mono',monospace",background:"linear-gradient(135deg,#6c5ce7,#a66efa,#fd79a8)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>BORRO</h1><p style={{margin:"2px 0 0",fontSize:11,color:t.tf}}>☁️ {ue}</p></div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
            <button onClick={togTh} style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:10,padding:"7px 12px",cursor:"pointer",fontSize:16,color:t.tx}}>{tm==="dark"?"☀️":"🌙"}</button>
            <Bt onClick={function(){setFP(dP);setMP(true);}} variant="warn" style={{fontSize:12,padding:"7px 14px"}}>+ Pedido</Bt>
            <Bt onClick={function(){setFI(dI);setMI(true);}} style={{fontSize:12,padding:"7px 14px"}}>+ Ingreso</Bt>
            <Bt onClick={function(){setFG({...dG,cat:cG.filter(function(c){return c!=="Aportación socios"&&c!=="Pedidos clientes";})[0]||"Otros"});setMG(true);}} variant="ghost" theme={tm} style={{fontSize:12,padding:"7px 14px"}}>+ Gasto</Bt>
            <Bt onClick={function(){setICat("todo");setMInf(true);}} variant="success" style={{fontSize:12,padding:"7px 14px"}}>📄</Bt>
            <button onClick={logout} style={{background:"none",border:"1px solid #e74c3c44",borderRadius:10,padding:"7px 12px",cursor:"pointer",fontSize:12,color:"#e74c3c"}}>Salir</button>
          </div>
        </div>
      </div>

      <div style={{padding:"0 24px",borderBottom:"1px solid "+t.nB}}>
        <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",gap:4}}>
          {["dashboard","pedidos","ingresos","gastos"].map(function(v){return<button key={v} onClick={function(){setVista(v);}} style={{padding:"12px 16px",background:"none",border:"none",color:vista===v?C.acc:t.td,fontSize:12,fontWeight:600,cursor:"pointer",borderBottom:vista===v?"2px solid "+C.acc:"2px solid transparent",textTransform:"capitalize"}}>{v}</button>;})}
          <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6}}>
            <select value={fC} onChange={function(e){setFC2(e.target.value);}} style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:8,color:t.tx,padding:"5px 8px",fontSize:11,outline:"none",maxWidth:150}}>{cO.map(function(o){return<option key={o.value} value={o.value}>{o.label}</option>;})}</select>
            <button onClick={function(){setMCat(true);}} style={{background:"none",border:"1px solid "+(tm==="dark"?"#3a3a5a":"#ccc"),borderRadius:8,color:t.tm,padding:"5px 10px",fontSize:11,cursor:"pointer"}}>⚙️</button>
          </div>
        </div>
        <DB d={fD} h={fH} sD={setFD} sH={setFH} t={t}/>
      </div>

      <div style={{padding:"20px 24px"}}>
        {/* DASHBOARD */}
        {vista==="dashboard"&&(<div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:24}}>
            {[{l:"Ingresos",v:tI+tV,c:C.ing},{l:"Gastos",v:tG,c:C.gas},{l:"Devoluciones",v:tDev,c:C.dev},{l:"Balance",v:bal,c:bal>=0?C.bP:C.bN},{l:"Pedidos",v:fp.length,c:C.ped,raw:true}].map(function(c){return<Cd key={c.l} t={t}><div style={{fontSize:10,color:t.tf,marginBottom:4}}>{c.l}</div><div style={{fontSize:c.raw?28:20,fontWeight:700,color:c.c,fontFamily:"'Space Mono',monospace"}}>{c.raw?c.v:eur(c.v)}</div></Cd>;})}
          </div>
          {(fC==="todo"||fC==="Aportación socios")&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:24}}>{ss.map(function(s){return<Cd key={s.id} t={t}><div style={{fontSize:10,color:t.tf}}>Aportación</div><div style={{fontSize:14,fontWeight:600,color:t.tx,margin:"6px 0"}}>{s.nombre.split(" ")[0]}</div><div style={{fontSize:20,fontWeight:700,color:C.ing,fontFamily:"'Space Mono',monospace"}}>{eur(s.tot)}</div><div style={{fontSize:10,color:t.td,marginTop:3}}>{s.cnt} aportaciones</div></Cd>;})}</div>}
          <Cd t={t}><h3 style={{margin:"0 0 14px",fontSize:13,color:t.tm}}>Mensual</h3><div style={{display:"flex",alignItems:"flex-end",gap:5,height:130}}>{mD.map(function(d,i){return(<div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{display:"flex",gap:2,alignItems:"flex-end",height:105}}><div style={{width:9,borderRadius:"3px 3px 0 0",height:Math.max(2,(d.i/mx)*95),background:"linear-gradient(to top,"+C.ing+",#55efc4)"}}/><div style={{width:9,borderRadius:"3px 3px 0 0",height:Math.max(2,(d.g/mx)*95),background:"linear-gradient(to top,#e74c3c,#fd79a8)"}}/></div><span style={{fontSize:9,color:t.td}}>{d.m}</span></div>);})}</div><div style={{display:"flex",gap:14,marginTop:12,justifyContent:"center"}}><span style={{fontSize:10,color:C.ing}}>● Ingresos</span><span style={{fontSize:10,color:C.gas}}>● Gastos</span></div></Cd>
        </div>)}

        {/* INGRESOS */}
        {vista==="ingresos"&&(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{margin:0,fontSize:17,color:t.tx}}>Ingresos</h2><Bt onClick={function(){setFI(dI);setMI(true);}} style={{fontSize:12,padding:"7px 14px"}}>+ Nuevo</Bt></div>
          {fi.length===0?<p style={{textAlign:"center",color:t.td,padding:36}}>No hay ingresos</p>:
          <div style={{display:"flex",flexDirection:"column",gap:7}}>{[...fi].sort(function(a,b){return b.fecha.localeCompare(a.fecha);}).map(function(i){var s=SOCIOS.find(function(x){return x.id===i.socio;});return(<div key={i.id} style={{background:t.cBg,border:"1px solid "+t.cB,borderRadius:11,padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontSize:13,fontWeight:600,color:t.tx}}>{s?s.nombre:i.socio}</div><div style={{fontSize:11,color:t.td,marginTop:3,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span>📅 {fmtF(i.fecha)}</span><BI m={i.metodo} tel={i.telefono}/></div></div><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:16,fontWeight:700,color:C.ing,fontFamily:"'Space Mono',monospace"}}>+{eur(i.monto)}</span><button onClick={function(){setMDel({t:"ingreso",id:i.id});}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,opacity:.5}}>✕</button></div></div>);})}</div>}
        </div>)}

        {/* GASTOS */}
        {vista==="gastos"&&(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{margin:0,fontSize:17,color:t.tx}}>Gastos</h2><Bt onClick={function(){setFG({...dG,cat:cG.filter(function(c){return c!=="Aportación socios"&&c!=="Pedidos clientes";})[0]||"Otros"});setMG(true);}} variant="ghost" theme={tm} style={{fontSize:12,padding:"7px 14px"}}>+ Nuevo</Bt></div>
          {fg.length===0?<p style={{textAlign:"center",color:t.td,padding:36}}>No hay gastos</p>:
          <div style={{display:"flex",flexDirection:"column",gap:7}}>{[...fg].sort(function(a,b){return b.fecha.localeCompare(a.fecha);}).map(function(g){return(<div key={g.id} style={{background:t.cBg,border:"1px solid "+(g.devuelto?"#fdcb6e44":t.cB),borderRadius:11,padding:"12px 16px"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:13,fontWeight:600,color:t.tx}}>{g.descripcion||"Sin descripción"}{g.devuelto&&<span style={{marginLeft:8,padding:"2px 8px",borderRadius:6,fontSize:10,fontWeight:600,background:"rgba(253,203,110,.15)",color:C.dev}}>↩ Devuelto</span>}</div>
                <div style={{fontSize:11,color:t.td,marginTop:3,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  <span>📅 {fmtF(g.fecha)}</span>
                  <span style={{background:t.bB,padding:"1px 6px",borderRadius:5,fontSize:10}}>{g.categoria}</span>
                  <BG m={g.metodo} d4={g.tarjeta4}/>
                  {g.documento_url&&<a href={g.documento_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(108,92,231,.1)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.acc,textDecoration:"none"}}>📎 Doc</a>}
                  {g.devuelto&&g.devolucion_doc_url&&<a href={g.devolucion_doc_url} target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:3,background:"rgba(253,203,110,.1)",padding:"2px 8px",borderRadius:6,fontSize:10,color:C.dev,textDecoration:"none"}}>📎 Dev</a>}
                </div>
                {g.devuelto&&<div style={{fontSize:11,color:C.dev,marginTop:4}}>↩ Devuelto {fmtF(g.devolucion_fecha)} · Reembolso: <strong>{eur(g.devolucion_monto)}</strong></div>}
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                <span style={{fontSize:16,fontWeight:700,color:C.gas,fontFamily:"'Space Mono',monospace"}}>-{eur(g.monto)}</span>
                {g.devuelto&&<span style={{fontSize:13,fontWeight:700,color:C.dev,fontFamily:"'Space Mono',monospace"}}>+{eur(g.devolucion_monto)}</span>}
                <div style={{display:"flex",gap:4}}>
                  {!g.devuelto&&<button onClick={function(){setFDv({monto:String(g.monto),fecha:hoy(),doc:null});setMDev(g);}} style={{background:"none",border:"1px solid #fdcb6e44",borderRadius:6,padding:"3px 8px",color:C.dev,cursor:"pointer",fontSize:10}}>↩ Devolver</button>}
                  <button onClick={function(){setMDel({t:"gasto",id:g.id});}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,opacity:.5}}>✕</button>
                </div>
              </div>
            </div>
          </div>);})}</div>}
        </div>)}

        {/* PEDIDOS */}
        {vista==="pedidos"&&(<div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><h2 style={{margin:0,fontSize:17,color:t.tx}}>Pedidos</h2><Bt onClick={function(){setFP(dP);setMP(true);}} variant="warn" style={{fontSize:12,padding:"7px 14px"}}>+ Nuevo</Bt></div>
          {fp.length===0?<p style={{textAlign:"center",color:t.td,padding:36}}>No hay pedidos</p>:
          <div style={{display:"flex",flexDirection:"column",gap:8}}>{[...fp].sort(function(a,b){return b.fecha.localeCompare(a.fecha);}).map(function(p){var cs=(p.costes||[]).reduce(function(s,c){return s+c.monto;},0);var bn=p.precioVenta-cs;return(<div key={p.id} onClick={function(){setMDP(p);}} style={{background:t.cBg,border:"1px solid "+t.cB,borderRadius:12,padding:"14px 16px",cursor:"pointer"}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}><div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4}}><span style={{fontSize:14,fontWeight:600,color:t.tx}}>{p.cliente}</span><EB e={p.estado}/></div><div style={{fontSize:12,color:t.tm,marginBottom:4}}>{p.producto}</div><div style={{fontSize:11,color:t.td,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}><span>📅 {fmtF(p.fecha)}</span><BI m={p.metodo} tel={p.telefono}/></div></div><div style={{textAlign:"right"}}><div style={{fontSize:16,fontWeight:700,color:C.ing,fontFamily:"'Space Mono',monospace"}}>{eur(p.precioVenta)}</div>{cs>0&&<div style={{fontSize:11,color:C.gas}}>-{eur(cs)}</div>}<div style={{fontSize:13,fontWeight:700,color:bn>=0?C.bP:C.bN,fontFamily:"'Space Mono',monospace"}}>{eur(bn)}</div></div></div></div>);})}</div>}
        </div>)}
      </div>

      {/* MODALS */}
      <Md open={mI} onClose={function(){setMI(false);}} title="Registrar ingreso" t={t}>
        <Sl label="Socio" value={fI.socio} onChange={function(e){setFI({...fI,socio:e.target.value});}} options={SOCIOS.map(function(s){return{value:s.id,label:s.nombre};})} t={t}/>
        <In label="Fecha" type="date" value={fI.fecha} onChange={function(e){setFI({...fI,fecha:e.target.value});}} t={t}/>
        <In label="Monto (€)" type="number" step="0.01" value={fI.monto} onChange={function(e){setFI({...fI,monto:e.target.value});}} t={t}/>
        <PgI value={fI.metodo} onChange={function(m){setFI({...fI,metodo:m,tel:m==="efectivo"?"":fI.tel});}} tel={fI.tel} onTel={function(v){setFI({...fI,tel:v});}} t={t}/>
        <div style={{display:"flex",gap:8,marginTop:6}}><Bt onClick={addI} disabled={!fI.monto||!fI.fecha||sv} style={{flex:1}}>{sv?"Guardando...":"Registrar"}</Bt><Bt onClick={function(){setMI(false);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>

      <Md open={mG} onClose={function(){setMG(false);}} title="Registrar gasto" t={t}>
        <In label="Descripción" value={fG.desc} onChange={function(e){setFG({...fG,desc:e.target.value});}} placeholder="Ej: Marcos 50x70" t={t}/>
        <In label="Fecha" type="date" value={fG.fecha} onChange={function(e){setFG({...fG,fecha:e.target.value});}} t={t}/>
        <In label="Monto (€)" type="number" step="0.01" value={fG.monto} onChange={function(e){setFG({...fG,monto:e.target.value});}} t={t}/>
        <Sl label="Categoría" value={fG.cat} onChange={function(e){setFG({...fG,cat:e.target.value});}} options={cG.filter(function(c){return c!=="Aportación socios"&&c!=="Pedidos clientes";}).map(function(c){return{value:c,label:c};})} t={t}/>
        <PgG value={fG.metodo} onChange={function(m){setFG({...fG,metodo:m,d4:m==="efectivo"?"":fG.d4});}} d4={fG.d4} onD4={function(v){setFG({...fG,d4:v});}} t={t}/>
        <div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,color:t.tm,marginBottom:6}}>📎 Adjuntar documento</label><label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:"1px dashed "+t.iC,background:t.iB,color:t.tm,cursor:"pointer",fontSize:12}}>📎 {fG.doc?fG.doc.name:"Seleccionar archivo"}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={function(e){var f=e.target.files&&e.target.files[0];if(f)setFG({...fG,doc:f});}} style={{display:"none"}}/></label>{fG.doc&&<button onClick={function(){setFG({...fG,doc:null});}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,marginLeft:8}}>✕</button>}</div>
        <div style={{display:"flex",gap:8,marginTop:6}}><Bt onClick={addG} disabled={!fG.monto||!fG.fecha||sv} style={{flex:1}}>{sv?"Subiendo...":"Registrar"}</Bt><Bt onClick={function(){setMG(false);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>

      <Md open={mP} onClose={function(){setMP(false);}} title="📦 Nuevo pedido" t={t}>
        <In label="Cliente" value={fP.cliente} onChange={function(e){setFP({...fP,cliente:e.target.value});}} placeholder="Ej: María García" t={t}/>
        <In label="Producto" value={fP.prod} onChange={function(e){setFP({...fP,prod:e.target.value});}} placeholder="Ej: Lámina A3" t={t}/>
        <In label="Fecha" type="date" value={fP.fecha} onChange={function(e){setFP({...fP,fecha:e.target.value});}} t={t}/>
        <In label="Precio venta (€)" type="number" step="0.01" value={fP.pv} onChange={function(e){setFP({...fP,pv:e.target.value});}} t={t}/>
        <Sl label="Estado" value={fP.estado} onChange={function(e){setFP({...fP,estado:e.target.value});}} options={ESTADOS.map(function(e){return{value:e,label:e};})} t={t}/>
        <PgI value={fP.metodo} onChange={function(m){setFP({...fP,metodo:m,tel:m==="efectivo"?"":fP.tel});}} tel={fP.tel} onTel={function(v){setFP({...fP,tel:v});}} t={t}/>
        <div style={{display:"flex",gap:8,marginTop:6}}><Bt onClick={addP} disabled={!fP.cliente||!fP.pv||!fP.fecha||sv} variant="warn" style={{flex:1}}>{sv?"...":"Crear"}</Bt><Bt onClick={function(){setMP(false);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>

      {/* DEVOLUCION */}
      <Md open={!!mDev} onClose={function(){setMDev(null);}} title="↩ Marcar devolución" t={t}>
        {mDev&&(<div>
          <div style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:10,padding:"12px 16px",marginBottom:16}}><div style={{fontSize:12,color:t.tx,fontWeight:600}}>{mDev.descripcion}</div><div style={{fontSize:11,color:t.td,marginTop:4}}>Gasto original: <strong style={{color:C.gas}}>{eur(mDev.monto)}</strong></div></div>
          <In label="Monto reembolsado (€)" type="number" step="0.01" value={fDv.monto} onChange={function(e){setFDv({...fDv,monto:e.target.value});}} t={t}/>
          <In label="Fecha devolución" type="date" value={fDv.fecha} onChange={function(e){setFDv({...fDv,fecha:e.target.value});}} t={t}/>
          <div style={{marginBottom:12}}><label style={{display:"block",fontSize:11,color:t.tm,marginBottom:6}}>📎 Documento de devolución</label><label style={{display:"inline-flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:9,border:"1px dashed "+t.iC,background:t.iB,color:t.tm,cursor:"pointer",fontSize:12}}>📎 {fDv.doc?fDv.doc.name:"Seleccionar"}<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={function(e){var f=e.target.files&&e.target.files[0];if(f)setFDv({...fDv,doc:f});}} style={{display:"none"}}/></label>{fDv.doc&&<button onClick={function(){setFDv({...fDv,doc:null});}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:14,marginLeft:8}}>✕</button>}</div>
          <div style={{display:"flex",gap:8,marginTop:6}}><Bt onClick={confirmDev} disabled={!fDv.monto||sv} variant="warn" style={{flex:1}}>{sv?"...":"Confirmar devolución"}</Bt><Bt onClick={function(){setMDev(null);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
        </div>)}
      </Md>

      {/* DETALLE PEDIDO */}
      <Md open={!!mDP} onClose={function(){setMDP(null);}} title="📦 Detalle" wide={true} t={t}>
        {mDP&&(function(){var p=peds.find(function(x){return x.id===mDP.id;})||mDP;var cs=(p.costes||[]).reduce(function(s,c){return s+c.monto;},0);var bn=p.precioVenta-cs;return(<div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}><div><div style={{fontSize:10,color:t.tf}}>Cliente</div><div style={{fontSize:14,fontWeight:600,color:t.tx}}>{p.cliente}</div></div><div><div style={{fontSize:10,color:t.tf}}>Producto</div><div style={{fontSize:14,color:t.tx}}>{p.producto}</div></div><div><div style={{fontSize:10,color:t.tf}}>Fecha</div><div>{fmtF(p.fecha)}</div></div><div><div style={{fontSize:10,color:t.tf}}>Pago</div><BI m={p.metodo} tel={p.telefono}/></div></div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:16,flexWrap:"wrap"}}><span style={{fontSize:11,color:t.tm}}>Estado:</span>{ESTADOS.map(function(e){return<button key={e} onClick={function(){updE(p.id,e);}} style={{padding:"4px 10px",borderRadius:6,border:p.estado===e?"2px solid #6c5ce7":"1px solid "+t.iC,background:p.estado===e?"rgba(108,92,231,.15)":t.iB,color:p.estado===e?"#a66efa":t.td,cursor:"pointer",fontSize:10,fontWeight:600}}>{e}</button>;})}</div>
          <div style={{display:"flex",gap:12,marginBottom:16,flexWrap:"wrap"}}><Cd t={t} style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:t.tf}}>Venta</div><div style={{fontSize:18,fontWeight:700,color:C.ing,fontFamily:"'Space Mono',monospace"}}>{eur(p.precioVenta)}</div></Cd><Cd t={t} style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:t.tf}}>Costes</div><div style={{fontSize:18,fontWeight:700,color:C.gas,fontFamily:"'Space Mono',monospace"}}>{eur(cs)}</div></Cd><Cd t={t} style={{flex:1,minWidth:90}}><div style={{fontSize:10,color:t.tf}}>Beneficio</div><div style={{fontSize:18,fontWeight:700,color:bn>=0?C.bP:C.bN,fontFamily:"'Space Mono',monospace"}}>{eur(bn)}</div></Cd></div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}><h4 style={{margin:0,fontSize:13,color:t.tm}}>Costes</h4><Bt onClick={function(){setFCo(dC);setMAC(p.id);}} variant="ghost" theme={tm} style={{fontSize:11,padding:"5px 12px"}}>+ Añadir</Bt></div>
          {(p.costes||[]).length===0?<p style={{color:t.td,fontSize:12,padding:12}}>Sin costes</p>:<div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>{(p.costes||[]).map(function(c){return(<div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:t.iB,borderRadius:8,border:"1px solid "+t.iC}}><div><div style={{fontSize:12,color:t.tx}}>{c.concepto}</div><div style={{fontSize:10,color:t.td}}>{c.categoria}</div></div><div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14,fontWeight:700,color:C.gas,fontFamily:"'Space Mono',monospace"}}>{eur(c.monto)}</span><button onClick={function(){setFCo({concepto:c.concepto,monto:String(c.monto),cat:c.categoria});setMEC({pid:p.id,cid:c.id});}} style={{background:"none",border:"none",color:C.acc,cursor:"pointer",fontSize:12}}>✏️</button><button onClick={function(){delCo(p.id,c.id);}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:12,opacity:.6}}>✕</button></div></div>);})}</div>}
          <Bt onClick={function(){setMDel({t:"pedido",id:p.id});}} variant="danger" style={{fontSize:11,padding:"6px 14px"}}>Eliminar</Bt>
        </div>);})()}
      </Md>

      <Md open={!!mAC} onClose={function(){setMAC(null);}} title="Añadir coste" t={t}>
        <In label="Concepto" value={fCo.concepto} onChange={function(e){setFCo({...fCo,concepto:e.target.value});}} t={t}/>
        <In label="Monto (€)" type="number" step="0.01" value={fCo.monto} onChange={function(e){setFCo({...fCo,monto:e.target.value});}} t={t}/>
        <Sl label="Categoría" value={fCo.cat} onChange={function(e){setFCo({...fCo,cat:e.target.value});}} options={cCo.map(function(c){return{value:c,label:c};})} t={t}/>
        <div style={{display:"flex",gap:8,marginTop:6}}><Bt onClick={function(){addCo(mAC);}} disabled={!fCo.concepto||!fCo.monto||sv} style={{flex:1}}>Añadir</Bt><Bt onClick={function(){setMAC(null);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>
      <Md open={!!mEC} onClose={function(){setMEC(null);}} title="Editar coste" t={t}>
        <In label="Concepto" value={fCo.concepto} onChange={function(e){setFCo({...fCo,concepto:e.target.value});}} t={t}/>
        <In label="Monto (€)" type="number" step="0.01" value={fCo.monto} onChange={function(e){setFCo({...fCo,monto:e.target.value});}} t={t}/>
        <Sl label="Categoría" value={fCo.cat} onChange={function(e){setFCo({...fCo,cat:e.target.value});}} options={cCo.map(function(c){return{value:c,label:c};})} t={t}/>
        <div style={{display:"flex",gap:8,marginTop:6}}><Bt onClick={function(){edCo(mEC.pid,mEC.cid);}} disabled={!fCo.concepto||!fCo.monto||sv} style={{flex:1}}>Guardar</Bt><Bt onClick={function(){setMEC(null);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>

      <Md open={mCat} onClose={function(){setMCat(false);}} title="⚙️ Categorías" wide={true} t={t}>
        <div style={{marginBottom:20}}><h4 style={{margin:"0 0 10px",fontSize:13,color:t.tm}}>Generales</h4><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{cG.map(function(c){return<span key={c} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",background:t.iB,border:"1px solid "+t.iC,borderRadius:8,fontSize:11,color:t.tm}}>{c}{["Aportación socios","Pedidos clientes","Otros"].indexOf(c)===-1&&<button onClick={function(){dCat("general",c);}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:12,marginLeft:4}}>✕</button>}</span>;})}</div><div style={{display:"flex",gap:6}}><input value={nCat} onChange={function(e){setNCat(e.target.value);}} placeholder="Nueva..." style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid "+t.iC,background:t.iB,color:t.tx,fontSize:12,outline:"none"}} onKeyDown={function(e){if(e.key==="Enter")aCat("general");}}/><Bt onClick={function(){aCat("general");}} style={{fontSize:11,padding:"6px 14px"}}>Añadir</Bt></div></div>
        <div><h4 style={{margin:"0 0 10px",fontSize:13,color:t.tm}}>Costes pedidos</h4><div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>{cCo.map(function(c){return<span key={c} style={{display:"inline-flex",alignItems:"center",gap:4,padding:"5px 12px",background:t.iB,border:"1px solid "+t.iC,borderRadius:8,fontSize:11,color:t.tm}}>{c}{c!=="Otros"&&<button onClick={function(){dCat("coste",c);}} style={{background:"none",border:"none",color:"#e74c3c",cursor:"pointer",fontSize:12,marginLeft:4}}>✕</button>}</span>;})}</div><div style={{display:"flex",gap:6}}><input value={nCat} onChange={function(e){setNCat(e.target.value);}} placeholder="Nueva..." style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid "+t.iC,background:t.iB,color:t.tx,fontSize:12,outline:"none"}} onKeyDown={function(e){if(e.key==="Enter")aCat("coste");}}/><Bt onClick={function(){aCat("coste");}} style={{fontSize:11,padding:"6px 14px"}}>Añadir</Bt></div></div>
      </Md>

      <Md open={mInf} onClose={function(){setMInf(false);}} title="📄 Generar informe" wide={true} t={t}>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:t.tm,marginBottom:6}}>Rango de fechas del informe</label>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:t.td}}>Desde</span><input type="date" value={iDesde} onChange={function(e){setIDesde(e.target.value);}} style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:7,color:t.tx,padding:"6px 10px",fontSize:12,outline:"none"}}/></div>
            <div style={{display:"flex",alignItems:"center",gap:4}}><span style={{fontSize:11,color:t.td}}>Hasta</span><input type="date" value={iHasta} onChange={function(e){setIHasta(e.target.value);}} style={{background:t.iB,border:"1px solid "+t.iC,borderRadius:7,color:t.tx,padding:"6px 10px",fontSize:12,outline:"none"}}/></div>
          </div>
          <div style={{display:"flex",gap:4,marginTop:8,flexWrap:"wrap"}}>
            {[{l:"Este mes",fn:function(){var d=new Date(),y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0");setIDesde(y+"-"+m+"-01");setIHasta(hoy());}},{l:"Mes pasado",fn:function(){var d=new Date();d.setMonth(d.getMonth()-1);var y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,"0"),l=new Date(y,d.getMonth()+1,0).getDate();setIDesde(y+"-"+m+"-01");setIHasta(y+"-"+m+"-"+String(l).padStart(2,"0"));}},{l:"Este año",fn:function(){setIDesde(new Date().getFullYear()+"-01-01");setIHasta(hoy());}},{l:"Año pasado",fn:function(){var y=new Date().getFullYear()-1;setIDesde(y+"-01-01");setIHasta(y+"-12-31");}},{l:"Todo",fn:function(){setIDesde("2020-01-01");setIHasta("2099-12-31");}}].map(function(p){return<button key={p.l} onClick={p.fn} style={{padding:"4px 10px",borderRadius:6,border:"1px solid "+t.iC,background:t.iB,color:t.tm,fontSize:10,cursor:"pointer"}}>{p.l}</button>;})}
          </div>
        </div>
        <div style={{marginBottom:14}}>
          <label style={{display:"block",fontSize:11,color:t.tm,marginBottom:6}}>¿Qué incluir?</label>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {[{v:"todo",l:"📊 Todo"},{v:"ingresos",l:"↗ Solo ingresos"},{v:"gastos",l:"↘ Solo gastos"},{v:"pedidos",l:"📦 Solo pedidos"},{v:"devoluciones",l:"↩ Solo devoluciones"}].map(function(s){return<button key={s.v} onClick={function(){setISeccion(s.v);}} style={{padding:"8px 14px",borderRadius:9,border:iSeccion===s.v?"2px solid #6c5ce7":"1px solid "+t.iC,background:iSeccion===s.v?"rgba(108,92,231,.15)":t.iB,color:iSeccion===s.v?"#a66efa":t.td,cursor:"pointer",fontSize:11,fontWeight:600}}>{s.l}</button>;})}
          </div>
        </div>
        {(iSeccion==="todo"||iSeccion==="gastos")&&<Sl label="Filtrar gastos por categoría" value={iCat} onChange={function(e){setICat(e.target.value);}} options={[{value:"todo",label:"Todas las categorías"}].concat(cG.map(function(c){return{value:c,label:c};}))} t={t}/>}
        <div style={{display:"flex",gap:8,marginTop:10}}><Bt onClick={function(){
          var ri=ings.filter(function(i){return i.fecha>=iDesde&&i.fecha<=iHasta;});
          var rg=gasts.filter(function(g){return g.fecha>=iDesde&&g.fecha<=iHasta;});
          var rp=peds.filter(function(p){return p.fecha>=iDesde&&p.fecha<=iHasta;});
          if(iCat!=="todo"){rg=rg.filter(function(g){return g.categoria===iCat;});}
          ri.sort(function(a,b){return a.fecha.localeCompare(b.fecha);});
          rg.sort(function(a,b){return a.fecha.localeCompare(b.fecha);});
          rp.sort(function(a,b){return a.fecha.localeCompare(b.fecha);});
          var rgDev=rg.filter(function(g){return g.devuelto;});
          var tiI=ri.reduce(function(s,i){return s+i.monto;},0);
          var tiG=rg.reduce(function(s,g){return s+g.monto;},0);
          var tiD=rgDev.reduce(function(s,g){return s+g.devolucion_monto;},0);
          var tiV=rp.reduce(function(s,p){return s+p.precioVenta;},0);
          var tiC=rp.reduce(function(s,p){return s+(p.costes||[]).reduce(function(a,c){return a+c.monto;},0);},0);
          var tiB=tiI+tiV-tiG+tiD-tiC;
          var showI=iSeccion==="todo"||iSeccion==="ingresos";
          var showG=iSeccion==="todo"||iSeccion==="gastos";
          var showP=iSeccion==="todo"||iSeccion==="pedidos";
          var showD=iSeccion==="todo"||iSeccion==="devoluciones";
          var secLabel=iSeccion==="todo"?"Completo":iSeccion==="ingresos"?"Solo ingresos":iSeccion==="gastos"?"Solo gastos":iSeccion==="pedidos"?"Solo pedidos":"Solo devoluciones";
          var h='<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:Helvetica,sans-serif;font-size:11px;color:#1a1a2e;padding:20px;line-height:1.5}.hdr{background:linear-gradient(135deg,#1a1a2e,#16213e);color:white;padding:28px 32px;margin:-20px -20px 24px}.hdr h1{font-size:26px;letter-spacing:3px;margin-bottom:4px}.hdr p{font-size:12px;opacity:.8}h2{font-size:14px;border-bottom:2px solid #6c5ce7;padding-bottom:5px;margin:20px 0 12px;text-transform:uppercase;letter-spacing:1px}.res{display:flex;gap:16px;margin-bottom:20px;flex-wrap:wrap}.rc{flex:1;min-width:120px;border:1px solid #e0e0e0;border-radius:8px;padding:14px 16px;text-align:center}.rc .lb{font-size:10px;color:#888;text-transform:uppercase}.rc .vl{font-size:20px;font-weight:700;margin-top:4px}table{width:100%;border-collapse:collapse;margin-bottom:16px}th{background:#f4f4f8;padding:8px 10px;text-align:left;font-weight:600;border-bottom:2px solid #ddd;font-size:10px;text-transform:uppercase}td{padding:7px 10px;border-bottom:1px solid #eee}tr:nth-child(even){background:#fafafa}.g{color:#00b894;font-weight:700}.r{color:#e74c3c;font-weight:700}.y{color:#e17055;font-weight:700}.tr td{font-weight:700;border-top:2px solid #1a1a2e;background:#f4f4f8;font-size:11.5px}.dev{background:#fffde7}.ft{margin-top:30px;padding-top:12px;border-top:1px solid #ddd;text-align:center;font-size:9px;color:#aaa}</style></head><body>';
          h+='<div class="hdr"><h1>BORRO</h1><p>Informe de contabilidad — '+secLabel+'</p><p>'+fmtF(iDesde)+' — '+fmtF(iHasta)+'</p>'+(iCat!=="todo"?'<p>Categoría: '+iCat+'</p>':'')+'</div>';
          if(iSeccion==="todo"){h+='<h2>Resumen general</h2><div class="res"><div class="rc"><div class="lb">Ingresos+Ventas</div><div class="vl" style="color:#00b894">'+eur(tiI+tiV)+'</div></div><div class="rc"><div class="lb">Gastos</div><div class="vl" style="color:#e74c3c">'+eur(tiG)+'</div></div><div class="rc"><div class="lb">Devoluciones</div><div class="vl" style="color:#e17055">'+eur(tiD)+'</div></div><div class="rc"><div class="lb">Balance</div><div class="vl" style="color:'+(tiB>=0?"#00b894":"#e74c3c")+'">'+eur(tiB)+'</div></div></div>';}
          if(showI&&ri.length>0){h+='<h2>Ingresos ('+ri.length+')</h2><table><thead><tr><th>Fecha</th><th>Socio</th><th>Método</th><th>Teléfono</th><th style="text-align:right">Monto</th></tr></thead><tbody>';ri.forEach(function(i){var s=SOCIOS.find(function(x){return x.id===i.socio;});h+='<tr><td>'+fmtF(i.fecha)+'</td><td>'+(s?s.nombre:i.socio)+'</td><td>'+(i.metodo==="bizum"?"Bizum":"Efectivo")+'</td><td>'+(i.telefono||"—")+'</td><td style="text-align:right" class="g">+'+eur(i.monto)+'</td></tr>';});h+='<tr class="tr"><td colspan="4">TOTAL INGRESOS</td><td style="text-align:right" class="g">'+eur(tiI)+'</td></tr></tbody></table>';}
          if(showG&&rg.length>0){h+='<h2>Gastos ('+rg.length+')</h2><table><thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th>Método</th><th>Ref.</th><th style="text-align:right">Monto</th><th>Estado</th></tr></thead><tbody>';rg.forEach(function(g){var met=g.metodo==="tarjeta"?"Tarjeta":g.metodo==="transferencia"?"Transfer.":"Efectivo";h+='<tr'+(g.devuelto?' class="dev"':'')+'><td>'+fmtF(g.fecha)+'</td><td>'+(g.descripcion||"—")+'</td><td>'+g.categoria+'</td><td>'+met+'</td><td>'+(g.tarjeta4?"••"+g.tarjeta4:"—")+'</td><td style="text-align:right" class="r">-'+eur(g.monto)+'</td><td>'+(g.devuelto?"↩ Devuelto ("+eur(g.devolucion_monto)+")":"—")+'</td></tr>';});h+='<tr class="tr"><td colspan="5">TOTAL GASTOS</td><td style="text-align:right" class="r">'+eur(tiG)+'</td><td></td></tr></tbody></table>';}
          if(showD&&rgDev.length>0){h+='<h2>Devoluciones ('+rgDev.length+')</h2><table><thead><tr><th>Fecha devolución</th><th>Gasto original</th><th>Monto original</th><th style="text-align:right">Reembolso</th></tr></thead><tbody>';rgDev.forEach(function(g){h+='<tr><td>'+fmtF(g.devolucion_fecha)+'</td><td>'+(g.descripcion||"—")+'</td><td class="r">'+eur(g.monto)+'</td><td style="text-align:right" class="y">+'+eur(g.devolucion_monto)+'</td></tr>';});h+='<tr class="tr"><td colspan="3">TOTAL RECUPERADO</td><td style="text-align:right" class="y">'+eur(tiD)+'</td></tr></tbody></table>';}
          if(showP&&rp.length>0){h+='<h2>Pedidos ('+rp.length+')</h2><table><thead><tr><th>Fecha</th><th>Cliente</th><th>Producto</th><th>Estado</th><th>Método</th><th style="text-align:right">Venta</th><th style="text-align:right">Costes</th><th style="text-align:right">Beneficio</th></tr></thead><tbody>';rp.forEach(function(p){var pc=(p.costes||[]).reduce(function(s,c){return s+c.monto;},0);var pb=p.precioVenta-pc;h+='<tr><td>'+fmtF(p.fecha)+'</td><td>'+p.cliente+'</td><td>'+p.producto+'</td><td>'+p.estado+'</td><td>'+(p.metodo==="bizum"?"Bizum":"Efectivo")+'</td><td style="text-align:right" class="g">'+eur(p.precioVenta)+'</td><td style="text-align:right" class="r">'+eur(pc)+'</td><td style="text-align:right;color:'+(pb>=0?"#00b894":"#e74c3c")+';font-weight:700">'+eur(pb)+'</td></tr>';if(p.costes&&p.costes.length>0){p.costes.forEach(function(c){h+='<tr style="background:#fafafa"><td></td><td colspan="5" style="padding-left:24px;color:#888;font-size:10px">↳ '+c.concepto+' ('+c.categoria+')</td><td style="text-align:right;color:#e74c3c;font-size:10px">'+eur(c.monto)+'</td><td></td></tr>';});}});h+='<tr class="tr"><td colspan="5">TOTALES</td><td style="text-align:right" class="g">'+eur(tiV)+'</td><td style="text-align:right" class="r">'+eur(tiC)+'</td><td style="text-align:right;color:'+(tiV-tiC>=0?"#00b894":"#e74c3c")+'">'+eur(tiV-tiC)+'</td></tr></tbody></table>';}
          h+='<div class="ft">BORRO — Sergio Rodríguez Juez & Álvaro Rodríguez Abreu · Generado el '+fmtF(hoy())+'</div></body></html>';
          var blob=new Blob([h],{type:"text/html"});var url=URL.createObjectURL(blob);var a=document.createElement("a");a.href=url;a.download="BORRO_Informe_"+iSeccion+"_"+iDesde+"_"+iHasta+".html";document.body.appendChild(a);a.click();document.body.removeChild(a);setMInf(false);
        }} variant="success" style={{flex:1}}>⬇️ Descargar informe</Bt><Bt onClick={function(){setMInf(false);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>

      <Md open={!!mDel} onClose={function(){setMDel(null);}} title="¿Eliminar?" t={t}>
        <p style={{color:t.tm,fontSize:13,margin:"0 0 16px"}}>No se puede deshacer.</p>
        <div style={{display:"flex",gap:8}}><Bt onClick={function(){del(mDel.t,mDel.id);}} variant="danger" disabled={sv} style={{flex:1}}>{sv?"...":"Eliminar"}</Bt><Bt onClick={function(){setMDel(null);}} variant="ghost" theme={tm}>Cancelar</Bt></div>
      </Md>
    </div>
  );
}

export default Dashboard;
