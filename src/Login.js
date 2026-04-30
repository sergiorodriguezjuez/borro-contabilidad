import React, { useState } from "react";
import { supabase, ALLOWED_EMAILS } from "./supabaseClient";

function Login() {
  var [email, setEmail] = useState("");
  var [password, setPassword] = useState("");
  var [isRegister, setIsRegister] = useState(false);
  var [error, setError] = useState("");
  var [loading, setLoading] = useState(false);
  var [success, setSuccess] = useState("");

  async function handleSubmit(e) {
    if (e) e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    var emailLower = email.toLowerCase().trim();
    var isAllowed = ALLOWED_EMAILS.some(function(a) { return a.toLowerCase() === emailLower; });
    if (!isAllowed) { setError("Este email no está autorizado."); setLoading(false); return; }

    if (isRegister) {
      var { error: err } = await supabase.auth.signUp({ email: emailLower, password: password });
      if (err) { setError(err.message === "User already registered" ? "Ya registrado. Inicia sesión." : err.message); }
      else { setSuccess("¡Cuenta creada! Inicia sesión."); setIsRegister(false); }
    } else {
      var { error: err2 } = await supabase.auth.signInWithPassword({ email: emailLower, password: password });
      if (err2) { setError(err2.message.includes("Invalid login") ? "Email o contraseña incorrectos." : err2.message); }
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:"#0e0e1a", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@700&display=swap');*{box-sizing:border-box}`}</style>
      <div style={{ width:"100%", maxWidth:400 }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <h1 style={{ margin:0, fontSize:42, fontFamily:"'Space Mono',monospace", background:"linear-gradient(135deg,#6c5ce7,#a66efa,#fd79a8)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>BORRO</h1>
          <p style={{ margin:"8px 0 0", fontSize:14, color:"#7070a0" }}>Contabilidad compartida</p>
        </div>
        <div style={{ background:"linear-gradient(145deg,#1a1a2e,#16213e)", border:"1px solid #2a2a4a", borderRadius:20, padding:"32px 28px" }}>
          <h2 style={{ margin:"0 0 24px", fontSize:20, color:"#e0e0ff", textAlign:"center" }}>{isRegister ? "Crear cuenta" : "Iniciar sesión"}</h2>
          {error && <div style={{ background:"rgba(231,76,60,0.15)", border:"1px solid rgba(231,76,60,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#e74c3c" }}>{error}</div>}
          {success && <div style={{ background:"rgba(0,184,148,0.15)", border:"1px solid rgba(0,184,148,0.3)", borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:"#00b894" }}>{success}</div>}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontSize:12, color:"#9090b0", marginBottom:6 }}>Email</label>
            <input type="email" value={email} onChange={function(e){setEmail(e.target.value);}} placeholder="tu@email.com" style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:"1px solid #2a2a4a", background:"#12122a", color:"#e0e0ff", fontSize:14, boxSizing:"border-box", outline:"none" }} />
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ display:"block", fontSize:12, color:"#9090b0", marginBottom:6 }}>Contraseña</label>
            <input type="password" value={password} onChange={function(e){setPassword(e.target.value);}} placeholder="••••••••" onKeyDown={function(e){if(e.key==="Enter"&&email&&password.length>=6)handleSubmit();}} style={{ width:"100%", padding:"12px 16px", borderRadius:10, border:"1px solid #2a2a4a", background:"#12122a", color:"#e0e0ff", fontSize:14, boxSizing:"border-box", outline:"none" }} />
            {isRegister && <p style={{ margin:"6px 0 0", fontSize:11, color:"#6060a0" }}>Mínimo 6 caracteres</p>}
          </div>
          <button onClick={handleSubmit} disabled={loading||!email||password.length<6} style={{ width:"100%", padding:"14px", borderRadius:12, border:"none", background:loading?"#3a3a5a":"linear-gradient(135deg,#6c5ce7,#a66efa)", color:"#fff", fontSize:15, fontWeight:600, cursor:loading?"default":"pointer", opacity:(!email||password.length<6)?0.5:1 }}>{loading?"Cargando...":isRegister?"Crear cuenta":"Entrar"}</button>
          <div style={{ textAlign:"center", marginTop:20 }}>
            <button onClick={function(){setIsRegister(!isRegister);setError("");setSuccess("");}} style={{ background:"none", border:"none", color:"#a66efa", fontSize:13, cursor:"pointer" }}>{isRegister?"¿Ya tienes cuenta? Inicia sesión":"¿Primera vez? Crear cuenta"}</button>
          </div>
        </div>
        <p style={{ textAlign:"center", fontSize:11, color:"#4040a0", marginTop:20 }}>Solo personal autorizado</p>
      </div>
    </div>
  );
}

export default Login;
