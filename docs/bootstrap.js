// Browser shims for the PvPoke engine, mirroring pvpoke_harness.js.
// The engine expects jQuery-style ajax for its data files; we feed it the
// JSON fetched by sim.js instead. Everything else is a chainable no-op.
window.__GM = null;
window.__AI = null;
(function () {
  var chain = new Proxy(function () {}, {
    get: function (t, p) { return function () { return chain; }; },
    apply: function () { return chain; }
  });
  window.$ = new Proxy(function () {}, {
    get: function (t, p) {
      if (p === 'ajax') {
        return function (opts) {
          setTimeout(function () { if (opts.success) opts.success(window.__GM); }, 0);
        };
      }
      if (p === 'getJSON') {
        return function (url, cb) { cb(window.__AI); return chain; };
      }
      return function () { return chain; };
    },
    apply: function () { return chain; }
  });
  window.host = 'http://localhost/';
  window.webRoot = '/';
  window.siteVersion = '1';
  window.settings = { gamemaster: 'gamemaster', matrixDirection: 'row' };
  window.getDefaultMultiBattleSettings = function () {
    return {
      shields: 1, ivs: 'original', bait: 1, levelCap: 50,
      startHp: 1, startEnergy: 0, startCooldown: 0,
      optimizeMoveTiming: true, startStatBuffs: [0, 0]
    };
  };
})();
