import React, { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import Login from "./Login";
import Dashboard from "./Dashboard";

function App() {
  var [session, setSession] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(function() {
    supabase.auth.getSession().then(function(result) {
      setSession(result.data.session);
      setLoading(false);
    });
    var { data: listener } = supabase.auth.onAuthStateChange(function(event, session) {
      setSession(session);
    });
    return function() { listener.subscription.unsubscribe(); };
  }, []);

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
