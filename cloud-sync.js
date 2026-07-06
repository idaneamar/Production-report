/* טרי לי — סנכרון הגדרות לענן. נטען כסקריפט ראשון בכל מחשבון. */
(function(){
  var SB='https://dddczmvjfokcbibeahyn.supabase.co';
  var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkZGN6bXZqZm9rY2JpYmVhaHluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyNjE2NzUsImV4cCI6MjA5ODgzNzY3NX0.tGF5v0FbKMma_FLNMAMBYzOzh6oak-g4HW_Gt0hRmXE';
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

  /* push on change (debounced) */
  var origSet=Storage.prototype.setItem;
  var timers={};
  Storage.prototype.setItem=function(k,v){
    origSet.call(this,k,v);
    if(this===localStorage && MAP[k] && session()){
      clearTimeout(timers[k]);
      timers[k]=setTimeout(function(){
        fetch(SB+'/rest/v1/app_settings?on_conflict=key',{
          method:'POST',
          headers:Object.assign({},hdrs(),{'Prefer':'resolution=merge-duplicates,return=minimal'}),
          body:JSON.stringify({key:MAP[k]+':'+k, value:{raw:v}, updated_by:(session()||{}).email||''})
        }).catch(function(){});
      },1500);
    }
  };
})();
