import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import Dashboard from "./Dashboard";

var SESSION_MAX_AGE = 24 * 60 * 60 * 1000;
var INACTIVITY_TIMEOUT = 30 * 60 * 1000;

function App() {
  var [session, setSession] = useState(null);
  var [loading, setLoading] = useState(true);

  var checkSessionAge = useCallback(function(sess) {
    if (!sess) return false;
    var loginTime = localStorage.getItem("borro-login-time");
    if (loginTime) {
      var elapsed = Date.now() - parseInt(loginTime);
      if (elapsed > SESSION_MAX_AGE) {
        supabase.auth.signOut();
        localStorage.removeItem("borro-login-time");
        return false;
      }
    }
    return true;
  }, []);

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      var sess = result.data.session;
      if (sess && checkSessionAge(sess)) {
        setSession(sess);
        if (!localStorage.getItem("borro-login-time")) {
          localStorage.setItem("borro-login-time", String(Date.now()));
        }
      } else {
        setSession(null);
      }
      setLoading(false);
    });
    var { data: listener } = supabase.auth.onAuthStateChange(function(event, sess) {
      if (event === "SIGNED_IN") {
        localStorage.setItem("borro-login-time", String(Date.now()));
        setSession(sess);
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("borro-login-time");
        setSession(null);
      } else {
        setSession(sess);
      }
    });
    return function() { listener.subscription.unsubscribe(); };
  }, [checkSessionAge]);

  useEffect(function() {
    if (!session) return;
    var timer = null;
    function resetTimer() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(function() {
        alert("Sesión cerrada por inactividad (30 min)");
        supabase.auth.signOut();
      }, INACTIVITY_TIMEOUT);
    }
    var events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];
    events.forEach(function(e) { document.addEventListener(e, resetTimer); });
    resetTimer();
    var ageCheck = setInterval(function() {
      var loginTime = localStorage.getItem("borro-login-time");
      if (loginTime && (Date.now() - parseInt(loginTime)) > SESSION_MAX_AGE) {
        alert("Sesión expirada (24 horas). Vuelve a iniciar sesión.");
        supabase.auth.signOut();
      }
    }, 60000);
    return function() {
      if (timer) clearTimeout(timer);
      clearInterval(ageCheck);
      events.forEach(function(e) { document.removeEventListener(e, resetTimer); });
    };
  }, [session]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0e0e1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#7070a0", fontSize: 16, fontFamily: "'DM Sans', sans-serif" }}>Cargando...</p>
      </div>
    );
  }

  if (!session) { return <Login />; }
  return <Dashboard session={session} />;
}

export default App;
