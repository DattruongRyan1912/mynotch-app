/* Code-drawn MyNotch scenes for the landing page, in place of screen recordings.
   A scene is a <div class="nd" data-scene="…"> and behaves like a muted looping <video> for the page's script:
   play() (returns a promise), pause(), paused, and currentTime = 0 to start over. A scene only runs while played,
   and with reduced motion it shows one still frame. To change what a scene shows, edit its script in SCENES. */
(function () {
  'use strict';
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  function icon(path, filled) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" ' + (filled ? 'fill="currentColor"' :
      'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"') + '>' + path + '</svg>';
  }
  var I = {
    clip: icon('<rect x="8" y="3" width="11" height="15" rx="2"/><path d="M5 7v11a3 3 0 0 0 3 3h8"/>'),
    media: icon('<path d="M9 18V5l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="15" r="2.5"/>'),
    dich: icon('<path d="M3 5h9M7.5 3v2M5 5c0 4 3 7 6 8M10 5c-1 4-4 7-7 8M13 21l4-9 4 9M14.5 18h5"/>'),
    ai: icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M12 15h5"/>'),
    lich: icon('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
    todo: icon('<path d="M4 6l2 2 3-3M4 14l2 2 3-3M12 7h8M12 15h8"/>'),
    more: icon('<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'),
    search: icon('<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>'),
    link: icon('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L12 6.3M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
    prev: icon('<path d="M12 6l-8 6 8 6zM20 6l-8 6 8 6z"/>', true),
    next: icon('<path d="M4 6l8 6-8 6zM12 6l8 6-8 6z"/>', true),
    pause: icon('<rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/>', true),
    play: icon('<path d="M7 5l12 7-12 7z"/>', true)
  };
  var TABS = ['clip', 'media', 'dich', 'ai', 'lich', 'todo', 'more'];
  // Pages that live under "Khác" light up its tab; heights are the open notch's, in cqw.
  var PANES = { media: { tab: 'media', h: 27 }, clip: { tab: 'clip', h: 36 }, timer: { tab: 'more', h: 25.4 }, battery: { tab: 'more', h: 24 }, shelf: { tab: 'more', h: 27.6 } };
  var SONGS = [
    { t: 'Đêm thành phố', a: 'Ban nhạc Mây', c: '#6d4cff', len: 199, at: 148 },
    { t: 'Sáng mai', a: 'Hạ Vy', c: '#2f7d6d', len: 214, at: 0 }
  ];
  var BARS = '<span class="bars"><i></i><i></i><i></i><i></i></span>';

  function html() {
    return '<div class="nn"><div class="lv"><span class="la"></span>' + BARS + '</div><div class="nb">' +
      '<div class="nt">' + TABS.map(function (t) { return '<b data-t="' + t + '">' + I[t] + '</b>'; }).join('') + '</div>' +
      '<div class="np pm" data-p="media"><div class="art"></div><div>' +
        '<div class="mt"><span class="ti"></span><span class="src"><i></i>Music</span></div><div class="ar"></div>' +
        '<div class="pr"><i></i></div><div class="tm"><span class="t0"></span><span class="t1"></span></div>' +
        '<div class="ct"><b class="prev">' + I.prev + '</b><b class="pp">' + I.pause + '</b><b class="nx">' + I.next + '</b>' + BARS + '</div></div></div>' +
      '<div class="np" data-p="clip"><div class="row"><span class="sr">' + I.search + '<span class="q"></span></span>' +
        '<span class="ch on" data-c="all">Tất cả</span><span class="ch">Văn bản</span><span class="ch" data-c="link">Link</span><span class="ch">Ảnh</span><span class="ch">File</span><span class="ch">Màu</span>' +
        '<span class="ch lib">Mở thư viện</span></div>' +
        '<div class="row bd"><span class="ch on">Tất cả</span><span class="ch">+</span></div>' +
        '<div class="cards">' +
          '<div class="cd tx gone">Trưa nay họp lúc 12:30 nhé, nhớ mang bản thiết kế<span class="ag"><i></i>vừa xong</span></div>' +
          '<div class="cd"><div class="sw"></div><span class="hx">#7D5CFF</span><span class="ag"><i style="--app:#ff453a"></i>4 phút trước</span></div>' +
          '<div class="cd lc"><span class="lk">' + I.link + 'example.com</span><span class="ph">/docs/khoi-dong</span><span class="ag"><i style="--app:#ff453a"></i>4 phút trước</span></div>' +
        '</div></div>' +
      '<div class="np pt" data-p="timer"><div class="idle"><div class="big">Hẹn giờ</div><div class="btns">' +
          '<span class="bt">1 phút</span><span class="bt" data-m="5">5 phút</span><span class="bt">10 phút</span><span class="bt">25 phút</span></div></div>' +
        '<div class="run"><div class="big"></div><div class="btns"><span class="bt" data-b="pause">Tạm dừng</span><span class="bt" data-b="plus">+1 phút</span><span class="bt">Huỷ</span></div></div></div>' +
      '<div class="np" data-p="battery"><div class="bb"><div class="bf">80%</div></div><div class="st">' +
        '<div><b class="s0"></b><span class="s0l"></span></div><div><b class="s1"></b><span>Nguồn</span></div><div><b>79%</b><span>Dung lượng tối đa</span></div><div><b>333</b><span>Chu kỳ sạc</span></div></div></div>' +
      '<div class="np" data-p="shelf"><div class="sh"><span class="sn"></span><span>Xoá tất cả</span></div><div class="its"></div></div>' +
      '</div></div><div class="toast"></div>' +
      '<div class="df"><span class="fi">PNG</span>Thiết kế v2.png</div>' +
      '<svg class="cur" viewBox="0 0 16 24" aria-hidden="true"><path d="M1.5 1.5v18.5l4.6-4.6 3.4 7.1 3-1.4-3.3-6.9h6.4z" fill="#fff" stroke="#000" stroke-width="1.3" stroke-linejoin="round"/></svg>';
  }

  function mmss(s) { s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + ('0' + s % 60).slice(-2); }

  function Scene(el) {
    this.el = el; this.name = el.getAttribute('data-scene'); this.steps = SCENES[this.name] || [];
    el.innerHTML = html();
    this.q = function (s) { return el.querySelector(s); };
    this.running = false; this.to = 0; this.iv = 0;
    this.reset();
    if (calm.matches) this.still(); else el.classList.add('hold');
  }
  Scene.prototype = {
    reset: function () {
      var el = this.el;
      clearTimeout(this.to); this.i = 0;
      el.classList.remove('open', 'live');
      this.song = 0; this.pos = SONGS[0].at; this.playing = true;
      this.timer = null; this.timerRun = false;
      this.charge = 'battery';
      this.q('.sr .q').textContent = '';
      [].forEach.call(el.querySelectorAll('.cd'), function (c) { c.classList.remove('sel', 'new', 'gone'); });
      this.q('.cd.tx').classList.add('gone');
      this.chip('all');
      this.q('.its').innerHTML = '<div class="drop">Thả file, link hoặc văn bản vào đây</div>';
      this.q('.sn').textContent = 'Trống';
      this.q('.df').className = 'df gone';
      this.q('.toast').classList.remove('on');
      this.pointAt(60, 78, true);
      this.pane('media');
      this.render();
    },
    still: function () {
      // One representative frame: the scene's own page open, nothing moving.
      this.reset();
      this.el.classList.add('hold');
      var p = this.name === 'hero' ? 'media' : this.name;
      if (p === 'shelf') this.addItem();
      if (p === 'timer') { this.timer = 297; this.timerRun = true; }
      if (p === 'clip') this.q('.cd.tx').classList.remove('gone');
      this.open(p); this.q('.cur').style.display = 'none'; this.render();
    },
    play: function () {
      if (this.running || calm.matches) return Promise.resolve();
      this.running = true; this.el.classList.remove('hold');
      var self = this;
      this.iv = setInterval(function () { self.tick(); }, 1000);
      this.next();
      return Promise.resolve();
    },
    pause: function () {
      this.running = false; clearTimeout(this.to); clearInterval(this.iv);
      this.el.classList.add('hold');
    },
    next: function () {
      if (!this.running) return;
      if (this.i >= this.steps.length) { this.reset(); }
      var step = this.steps[this.i++], self = this;
      this.to = setTimeout(function () { step[1](self); self.next(); }, step[0]);
    },
    tick: function () {
      var s = SONGS[this.song];
      if (this.playing) { this.pos += 1; if (this.pos >= s.len) this.nextSong(); }
      if (this.timerRun && this.timer > 0) this.timer -= 1;
      this.render();
    },
    render: function () {
      var s = SONGS[this.song], el = this.el;
      el.style.setProperty('--art', s.c);
      this.q('.ti').textContent = s.t; this.q('.ar').textContent = s.a;
      this.q('.pr i').style.width = (this.pos / s.len * 100).toFixed(2) + '%';
      this.q('.t0').textContent = mmss(this.pos); this.q('.t1').textContent = '-' + mmss(s.len - this.pos);
      this.q('.pp').innerHTML = this.playing ? I.pause : I.play;
      [].forEach.call(el.querySelectorAll('.bars'), function (b) { b.classList.toggle('still', !this.playing); }, this);
      var idle = this.timer === null;
      this.q('.pt .idle').style.display = idle ? '' : 'none'; this.q('.pt .run').style.display = idle ? 'none' : '';
      if (!idle) this.q('.pt .run .big').textContent = mmss(this.timer);
      this.q('[data-b="pause"]').textContent = this.timerRun ? 'Tạm dừng' : 'Tiếp tục';
      var f = this.q('.bf'), c = this.charge;
      f.className = 'bf' + (c === 'charging' ? ' chg' : c === 'low' ? ' low' : '');
      this.q('.s0').textContent = c === 'charging' ? 'Đầy sau 38 phút' : c === 'low' ? '6:40 còn lại' : '7:15 còn lại';
      this.q('.s0l').textContent = c === 'charging' ? 'Đang sạc' : c === 'low' ? 'Nguồn điện thấp' : 'Đang dùng pin';
      this.q('.s1').textContent = c === 'charging' ? 'Bộ sạc 94 W' : 'Pin';
    },
    // Actions the scene scripts use.
    pane: function (p) {
      var el = this.el, d = PANES[p];
      [].forEach.call(el.querySelectorAll('.np'), function (n) { n.classList.toggle('on', n.getAttribute('data-p') === p); });
      [].forEach.call(el.querySelectorAll('.nt b'), function (b) { b.classList.toggle('on', b.getAttribute('data-t') === d.tab); });
      el.style.setProperty('--h', d.h + 'cqw');
    },
    open: function (p) { this.pane(p); this.el.classList.add('open'); },
    close: function () { this.el.classList.remove('open'); },
    live: function (on) { this.el.classList.toggle('live', on); },
    pointAt: function (x, y, now) {
      var c = this.q('.cur');
      if (now) { c.style.transition = 'none'; c.getBoundingClientRect(); }
      c.style.left = x + '%'; c.style.top = y + '%';
      if (now) { c.getBoundingClientRect(); c.style.transition = ''; }
    },
    point: function (sel, fx, fy) {
      var t = typeof sel === 'string' ? this.q(sel) : sel, e = this.el.getBoundingClientRect(), r = t.getBoundingClientRect();
      if (!e.width || !r.width) return;
      this.pointAt(((r.left + r.width * (fx == null ? .5 : fx) - e.left) / e.width * 100).toFixed(2),
        ((r.top + r.height * (fy == null ? .6 : fy) - e.top) / e.height * 100).toFixed(2));
    },
    click: function (sel) {
      var c = this.q('.cur'), t = sel && this.q(sel);
      c.classList.add('down'); if (t) t.classList.add('press');
      setTimeout(function () { c.classList.remove('down'); if (t) t.classList.remove('press'); }, 160);
    },
    toast: function (text) {
      var t = this.q('.toast'); t.textContent = text; t.classList.add('on');
      setTimeout(function () { t.classList.remove('on'); }, 1600);
    },
    nextSong: function () { this.song = (this.song + 1) % SONGS.length; this.pos = SONGS[this.song].at; this.render(); },
    chip: function (c) {
      [].forEach.call(this.el.querySelectorAll('[data-p="clip"] .row:first-child .ch:not(.lib)'), function (x) {
        x.classList.toggle('on', (x.getAttribute('data-c') || '') === c);
      });
    },
    addItem: function () {
      this.q('.its').innerHTML = '<div class="it"><span class="fi">PNG</span>Thiết kế v2.png</div>';
      this.q('.sn').textContent = '1 mục';
    }
  };

  function type(text) {
    return text.split('').map(function (ch) {
      return [140, function (s) { s.q('.sr .q').textContent += ch; }];
    });
  }

  var SCENES = {
    hero: [
      [700, function (s) { s.live(true); }],
      [1300, function (s) { s.pointAt(50, 3.5); }],
      [800, function (s) { s.open('media'); }],
      [1500, function (s) { s.point('.nx'); }],
      [800, function (s) { s.click(); s.nextSong(); }],
      [1700, function (s) { s.point('.nt [data-t="clip"]'); }],
      [800, function (s) { s.click(); s.q('.cd.tx').classList.remove('gone'); s.open('clip'); }],
      [1100, function (s) { s.point('.cd.tx'); }],
      [800, function (s) { s.click(); s.q('.cd.tx').classList.add('sel'); s.toast('Đã dán vào app đang dùng'); }],
      [1900, function (s) { s.point('.nt [data-t="more"]'); }],
      [800, function (s) { s.click(); s.timer = 298; s.timerRun = true; s.render(); s.open('timer'); }],
      [2400, function (s) { s.click(); s.open('battery'); }],
      [2400, function (s) { s.click(); s.addItem(); s.open('shelf'); }],
      [2200, function (s) { s.pointAt(52, 82); }],
      [500, function (s) { s.close(); }],
      [2600, function () {}]
    ],
    media: [
      [10, function (s) { s.open('media'); }],
      [1600, function (s) { s.point('.nx'); }],
      [900, function (s) { s.click(); s.nextSong(); }],
      [2600, function (s) { s.point('.pp'); }],
      [900, function (s) { s.click(); s.playing = false; s.render(); }],
      [1800, function (s) { s.click(); s.playing = true; s.render(); }],
      [1500, function (s) { s.point('.prev'); }],
      [900, function (s) { s.click(); s.nextSong(); }],
      [3200, function () {}]
    ],
    clip: [
      [10, function (s) { s.open('clip'); }],
      [1200, function (s) { var c = s.q('.cd.tx'); c.classList.remove('gone'); c.classList.add('new'); }],
      [1100, function (s) { s.point('.cd.tx', .5, .55); }],
      [900, function (s) { s.click(); s.q('.cd.tx').classList.add('sel'); s.toast('Đã dán vào app đang dùng'); }],
      [1900, function (s) { s.q('.cd.tx').classList.remove('sel'); s.point('.sr', .35); }],
      [800, function (s) { s.click(); }]
    ].concat(type('@link'), [
      [500, function (s) {
        s.chip('link');
        [].forEach.call(s.el.querySelectorAll('.cd:not(.lc)'), function (c) { c.classList.add('gone'); });
      }],
      [2600, function (s) {
        s.q('.sr .q').textContent = ''; s.chip('all');
        [].forEach.call(s.el.querySelectorAll('.cd'), function (c) { c.classList.remove('gone', 'new'); });
      }],
      [2000, function () {}]
    ]),
    timer: [
      [10, function (s) { s.open('timer'); }],
      [1200, function (s) { s.point('[data-m="5"]'); }],
      [800, function (s) { s.click('[data-m="5"]'); s.timer = 300; s.timerRun = true; s.render(); }],
      [3200, function (s) { s.point('[data-b="plus"]'); }],
      [800, function (s) { s.click('[data-b="plus"]'); s.timer += 60; s.render(); }],
      [2600, function (s) { s.point('[data-b="pause"]'); }],
      [800, function (s) { s.click('[data-b="pause"]'); s.timerRun = false; s.render(); }],
      [2200, function () {}]
    ],
    battery: [
      [10, function (s) { s.open('battery'); }],
      [2400, function (s) { s.charge = 'charging'; s.render(); s.toast('Đã cắm sạc · Bộ sạc 94 W'); }],
      [3600, function (s) { s.charge = 'low'; s.render(); s.toast('Đã bật Nguồn điện thấp'); }],
      [3400, function () {}]
    ],
    shelf: [
      [10, function (s) { var f = s.q('.df'); f.className = 'df'; f.style.transition = 'none'; f.style.left = '24%'; f.style.top = '58%'; f.getBoundingClientRect(); f.style.transition = ''; }],
      [800, function (s) { s.pointAt(24.6, 61); }],
      [1000, function (s) { s.click(); s.q('.df').classList.add('drag'); }],
      [300, function (s) { s.pointAt(50.6, 12); var f = s.q('.df'); f.style.left = '50%'; f.style.top = '9%'; }],
      [500, function (s) { s.open('shelf'); }],
      [1000, function (s) { s.q('.df').classList.add('gone'); s.addItem(); s.click(); }],
      [2400, function (s) { s.pointAt(58, 85); }],
      [700, function (s) { s.close(); }],
      [2000, function () {}]
    ]
  };

  function mount(el) {
    if (el.play && el._scene) return el;
    var sc = new Scene(el);
    el._scene = sc;
    el.play = function () { return sc.play(); };
    el.pause = function () { sc.pause(); };
    Object.defineProperty(el, 'paused', { get: function () { return !sc.running; } });
    Object.defineProperty(el, 'currentTime', { get: function () { return 0; }, set: function () { var r = sc.running; sc.pause(); sc.reset(); if (r) sc.play(); } });
    return el;
  }

  window.NotchDemo = { mount: mount };
  [].forEach.call(document.querySelectorAll('.nd[data-scene]'), mount);
})();
