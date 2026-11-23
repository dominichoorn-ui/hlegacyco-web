(function(){
  var C = window.HL_CONTACT || {};
  var f = document.querySelector('form.intake'); if(!f) return;
  var wa = f.querySelector('[data-ch=whatsapp]'), bk = f.querySelector('[data-ch=booking]');
  if (wa && !C.whatsapp) wa.style.display = 'none';
  if (bk && !C.bookingUrl) bk.style.display = 'none';
  function v(n){ var el = f.elements[n]; return el ? el.value.trim() : ''; }
  function compose(){
    return [
      'Service: ' + v('service'),
      'I am enquiring as: ' + v('who'),
      'Name: ' + v('name'),
      'Phone (optional): ' + (v('phone') || '-')
    ].concat(Array.prototype.map.call(f.querySelectorAll('[data-extra]'), function(el){
      return el.getAttribute('data-extra') + ': ' + (el.value.trim() || '-');
    })).concat([
      '', 'WHAT I NEED / MY SITUATION:', v('needs'),
      '', 'WHAT CONCERNS ME:', v('concerns'),
      '', 'MY QUESTIONS:', v('questions') || '-',
      '', 'WHAT I ULTIMATELY WANT:', v('outcome')
    ]).join('\n');
  }
  function ok(){
    var msg = f.querySelector('.err');
    if (!v('name') || !v('needs') || !v('concerns') || !v('outcome')) { msg.textContent = 'Please complete your name, your situation, your concerns and the outcome you want.'; return false; }
    if (!f.elements['agree'].checked) { msg.textContent = 'Please tick the box to confirm you understand how we work.'; return false; }
    msg.textContent = ''; return true;
  }
  f.addEventListener('submit', function(ev){
    ev.preventDefault(); if(!ok()) return;
    if (v('_honey')) return; // bot trap
    var subj = 'Consultation request: ' + v('service');
    var btn = f.querySelector('button[type=submit]'), msg = f.querySelector('.err');
    function viaMail(){ window.location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(subj) + '&body=' + encodeURIComponent(compose()); }
    if (!window.fetch) { viaMail(); return; }
    btn.disabled = true; btn.textContent = 'Sending...';
    fetch('https://formsubmit.co/ajax/' + (C.formKey || C.email), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ _subject: subj, _template: 'box', _captcha: 'false',
        name: v('name'), phone: v('phone') || '-', service: v('service'), enquiring_as: v('who'),
        message: compose() })
    }).then(function(r){ return r.json().then(function(d){ return { ok: r.ok, d: d }; }); })
      .then(function(res){
        if (!res.ok || (res.d && String(res.d.success) === 'false')) throw new Error('send failed');
        f.innerHTML = '<div class="full sent" role="status"><h3>Thank you, your request has been received.</h3>' +
          '<p>It has gone straight to our office and is treated in strict confidence. We reply in writing, usually within one business day.</p></div>';
      })
      .catch(function(){
        btn.disabled = false; btn.textContent = 'Send';
        msg.textContent = 'We could not send this automatically. Your email app will now open with your request ready to send. Alternatively, email ' + C.email + '.';
        setTimeout(viaMail, 1200);
      });
  });
  if (wa) wa.addEventListener('click', function(){ if(!ok()) return;
    window.open('https://wa.me/' + C.whatsapp + '?text=' + encodeURIComponent(compose()), '_blank', 'noopener'); });
  if (bk) bk.addEventListener('click', function(){ if(!ok()) return; window.open(C.bookingUrl, '_blank', 'noopener'); });
})();

(function(){
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var boxes = document.querySelectorAll('.media');
  function on(m){ var v=m.querySelector('video'); if(!v) return; var p=v.play(); if(p&&p.then){p.then(function(){m.classList.add('playing');}).catch(function(){});} else {m.classList.add('playing');} }
  function off(m){ var v=m.querySelector('video'); if(!v) return; v.pause(); m.classList.remove('playing'); }
  var hover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  if (hover) {
    boxes.forEach(function(m){ var host=m.closest('.concern')||m; host.addEventListener('mouseenter',function(){on(m);}); host.addEventListener('mouseleave',function(){off(m);}); });
  } else if ('IntersectionObserver' in window) {
    var io=new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.intersectionRatio>0.6) on(en.target); else off(en.target); }); },{threshold:[0,0.6,1]});
    boxes.forEach(function(m){ io.observe(m); });
  }
})();
