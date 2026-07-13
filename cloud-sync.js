/* טרי לי — סנכרון הגדרות לענן. נטען כסקריפט ראשון בכל מחשבון. */
(function(){
  var SB='https://knqnuvoprtuqyrvzqffj.supabase.co';
  var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucW51dm9wcnR1cXlydnpxZmZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTM5MjEsImV4cCI6MjA5OTA4OTkyMX0.sVyNLQ7JDePgui-ATMOPbqu2Dabnn4fJIjL4ccrLEXw';
  var MAP={'trili_settings':'packing','alumim_set':'order-split','alumim_ledger':'order-split','alumim_fruit':'order-split','drv_set':'drivers','hashSettings':'hashav'};
  function session(){ try{return JSON.parse(localStorage.getItem('trelee_session'))||null;}catch(e){return null;} }
  function hdrs(){ var s=session(); return {'apikey':ANON,'Authorization':'Bearer '+(s?s.access_token:ANON),'Content-Type':'application/json'}; }
  var keys=Object.keys(MAP);

  /* pull on load: cloud wins; reload once if local differed */
  if(session()){
    var list=keys.map(function(k){ return '"'+MAP[k]+':'+k+'"'; }).join(',');
    fetch(SB+'/rest/v1/app_settings?select=key,value&key=in.('+encodeURIComponent(list)+')',{headers:hdrs()})
      .then(function(r){ return r.ok? r.json():[]; })
      .then(function(rows){
        var changed=false;
        rows.forEach(function(row){
          var ls=row.key.split(':').slice(1).join(':');
          var remote=row.value&&row.value.raw;
          if(remote!=null && remote!==localStorage.getItem(ls)){ origSet.call(localStorage, ls, remote); changed=true; }
        });
        var flag='cs_reloaded_'+location.pathname;
        if(changed && !sessionStorage.getItem(flag)){ sessionStorage.setItem(flag,'1'); location.reload(); }
        else if(!changed) sessionStorage.removeItem(flag);
      }).catch(function(){});
  }

  /* אינדיקציה גלויה לכשל סנכרון — כדי שלא יקרה שוב שמשתמש חושב ששמר וההגדרה אבדה */
  function banner(msg){
    var id='cs_sync_banner', el=document.getElementById(id);
    if(!el){ el=document.createElement('div'); el.id=id;
      el.style.cssText='position:fixed;bottom:12px;left:12px;z-index:99999;background:#c0392b;color:#fff;'+
        'padding:9px 14px;border-radius:8px;font:600 13px "Segoe UI",Arial;box-shadow:0 2px 10px rgba(0,0,0,.25);'+
        'max-width:320px;direction:rtl;cursor:pointer';
      el.onclick=function(){ el.remove(); };
      (document.body||document.documentElement).appendChild(el); }
    el.textContent='⚠ '+msg+' (לחץ לסגירה)';
  }
  function clearBanner(){ var el=document.getElementById('cs_sync_banner'); if(el) el.remove(); }

  /* push on change (debounced), with retry + visible failure */
  var origSet=Storage.prototype.setItem;
  var timers={};
  function pushKey(k,v,attempt){
    fetch(SB+'/rest/v1/app_settings?on_conflict=key',{
      method:'POST',
      headers:Object.assign({},hdrs(),{'Prefer':'resolution=merge-duplicates,return=minimal'}),
      body:JSON.stringify({key:MAP[k]+':'+k, value:{raw:v}, updated_by:(session()||{}).email||''})
    }).then(function(r){
      if(r.ok){ clearBanner(); return; }
      if((r.status===401||r.status===403)){ banner('ההגדרות לא נשמרו בענן — יש להתחבר מחדש'); return; }
      if(attempt<2){ setTimeout(function(){ pushKey(k,v,attempt+1); }, 3000); }
      else banner('שמירת ההגדרות לא הסתנכרנה לענן (שגיאה '+r.status+') — בדוק חיבור');
    }).catch(function(){
      if(attempt<2){ setTimeout(function(){ pushKey(k,v,attempt+1); }, 3000); }
      else banner('שמירת ההגדרות לא הסתנכרנה לענן — בדוק חיבור לאינטרנט');
    });
  }
  Storage.prototype.setItem=function(k,v){
    origSet.call(this,k,v);
    if(this===localStorage && MAP[k] && session()){
      clearTimeout(timers[k]);
      timers[k]=setTimeout(function(){ pushKey(k,v,0); },1500);
    }
  };
})();
