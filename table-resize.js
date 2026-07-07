/* טרי לי — שינוי רוחב עמודות בגרירה (כמו באקסל), לכל הטבלאות */
(function(){
  function makeWrapScrollable(table){
    var p=table.parentElement;
    if(p && p!==document.body && getComputedStyle(p).overflowX==='visible') p.style.overflowX='auto';
  }
  function enhance(th){
    if(th.dataset.rz) return; th.dataset.rz='1';
    if(getComputedStyle(th).position==='static') th.style.position='relative';
    var h=document.createElement('span');
    h.style.cssText='position:absolute;top:0;left:-4px;width:9px;height:100%;cursor:col-resize;user-select:none;z-index:9;touch-action:none';
    th.appendChild(h);
    h.addEventListener('pointerdown',function(e){
      e.preventDefault(); e.stopPropagation();
      var table=th.closest('table'); if(!table) return;
      makeWrapScrollable(table);
      if(!table.dataset.rzFixed){
        var first=table.rows[0];
        if(first){ for(var i=0;i<first.cells.length;i++){ var c=first.cells[i]; c.style.width=c.offsetWidth+'px'; } }
        table.style.width=table.offsetWidth+'px';
        table.style.tableLayout='fixed';
        table.dataset.rzFixed='1';
      }
      var startX=e.clientX, startW=th.offsetWidth, startT=table.offsetWidth;
      function mv(ev){
        var d=startX-ev.clientX; /* RTL: גרירה שמאלה מרחיבה */
        var w=Math.max(34,startW+d);
        th.style.width=w+'px';
        table.style.width=(startT+(w-startW))+'px';
      }
      function up(){ document.removeEventListener('pointermove',mv); document.removeEventListener('pointerup',up); }
      document.addEventListener('pointermove',mv);
      document.addEventListener('pointerup',up);
    });
  }
  function scan(){
    var l=document.querySelectorAll('table th:not([data-rz])');
    for(var i=0;i<l.length;i++) enhance(l[i]);
  }
  var pend=false;
  function schedule(){ if(pend)return; pend=true; requestAnimationFrame(function(){ pend=false; scan(); }); }
  function init(){ scan(); new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true}); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
