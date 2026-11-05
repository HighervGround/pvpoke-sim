// UI logic for the 3v3 Team Grader. Engine work lives in sim.js.
(function () {
  var S = function (id, moves, ivs) { return { id: id, moves: moves, ivs: ivs }; };

  // Named teams (exact copies and IVs from the sim runs).
  var AZU = ['BUBBLE', 'PLAY_ROUGH', 'ICE_BEAM'];
  var NAMED = [
    ['Morpeko / Tinkaton / Gastrodon', [
      S('morpeko_full_belly', ['THUNDER_SHOCK', 'AURA_WHEEL_ELECTRIC', 'PSYCHIC_FANGS'], [11, 15, 14]),
      S('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE'], [10, 14, 15]),
      S('gastrodon', ['MUD_SLAP', 'EARTH_POWER', 'BODY_SLAM'], [0, 10, 15])]],
    ['Tinkaton / Clodsire / Gastrodon', [
      S('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE'], [10, 14, 15]),
      S('clodsire', ['POISON_STING', 'STONE_EDGE', 'EARTHQUAKE'], [0, 14, 13]),
      S('gastrodon', ['MUD_SLAP', 'EARTH_POWER', 'BODY_SLAM'], [0, 10, 15])]],
    ['Morpeko / Mimikyu / Clodsire', [
      S('morpeko_full_belly', ['THUNDER_SHOCK', 'AURA_WHEEL_ELECTRIC', 'PSYCHIC_FANGS'], [11, 15, 14]),
      S('mimikyu', ['SHADOW_CLAW', 'SHADOW_SNEAK', 'PLAY_ROUGH'], [15, 12, 15]),
      S('clodsire', ['POISON_STING', 'STONE_EDGE', 'EARTHQUAKE'], [0, 14, 13])]],
    ['Shadow Dragonair / Tinkaton / Mimikyu', [
      S('dragonair_shadow', ['DRAGON_BREATH', 'BODY_SLAM', 'AQUA_TAIL'], [12, 9, 15]),
      S('tinkaton', ['FAIRY_WIND', 'GIGATON_HAMMER', 'BULLDOZE'], [10, 14, 15]),
      S('mimikyu', ['SHADOW_CLAW', 'SHADOW_SNEAK', 'PLAY_ROUGH'], [15, 12, 15])]],
    ['Meowscarada / Mimikyu / Azumarill', [
      S('meowscarada', ['LEAFAGE', 'FLOWER_TRICK', 'NIGHT_SLASH'], [15, 15, 15]),
      S('mimikyu', ['SHADOW_CLAW', 'SHADOW_SNEAK', 'PLAY_ROUGH'], [15, 12, 15]),
      S('azumarill', AZU, [0, 15, 15])]],
    ['Jellicent / Azumarill / Serperior', [
      S('jellicent', ['HEX', 'SURF', 'SHADOW_BALL'], [11, 12, 15]),
      S('azumarill', AZU, [0, 15, 15]),
      S('serperior', ['VINE_WHIP', 'AERIAL_ACE', 'GRASS_KNOT'], [9, 15, 13])]],
    ['Alt: Jellicent / Azumarill / Clodsire', [
      S('jellicent', ['HEX', 'SURF', 'SHADOW_BALL'], [11, 15, 12]),
      S('azumarill', AZU, [0, 15, 15]),
      S('clodsire', ['POISON_STING', 'EARTHQUAKE', 'STONE_EDGE'], [14, 12, 15])]],
    ['Alt project: Morpeko / Azumarill / Jellicent', [
      S('morpeko_full_belly', ['THUNDER_SHOCK', 'AURA_WHEEL_ELECTRIC', 'PSYCHIC_FANGS'], [13, 10, 13]),
      S('azumarill', AZU, [0, 15, 15]),
      S('jellicent', ['HEX', 'SURF', 'SHADOW_BALL'], [11, 15, 12])]]
  ];

  var gm = null;
  var byId = {};      // speciesId -> pokemon entry
  var byLabel = {};   // picker label -> speciesId
  var moveName = {};  // moveId -> display name

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function buildSlot(container, posLabel) {
    var slot = el('div', 'slot');
    slot.appendChild(el('div', 'pos', posLabel));
    var r1 = el('div', 'row');
    var sp = document.createElement('input');
    sp.type = 'text'; sp.setAttribute('list', 'speciesList'); sp.placeholder = 'Species'; sp.className = 'sp';
    r1.appendChild(sp);
    ['Atk', 'Def', 'HP'].forEach(function (lab, i) {
      var inp = document.createElement('input');
      inp.type = 'number'; inp.min = 0; inp.max = 15; inp.value = [4, 15, 15][i];
      inp.className = 'iv iv' + i; inp.title = lab;
      r1.appendChild(inp);
    });
    var cp = el('span', 'cp', '');
    r1.appendChild(cp);
    slot.appendChild(r1);
    var r2 = el('div', 'row');
    ['fast', 'ch1', 'ch2'].forEach(function (k) {
      var sel = document.createElement('select');
      sel.className = 'mv ' + k;
      r2.appendChild(sel);
    });
    slot.appendChild(r2);
    container.appendChild(slot);
    return slot;
  }

  function fillMoves(slot, speciesId, wanted) {
    var p = byId[speciesId];
    if (!p) return;
    var fast = slot.querySelector('.fast'), c1 = slot.querySelector('.ch1'), c2 = slot.querySelector('.ch2');
    function fill(sel, ids, allowNone) {
      sel.innerHTML = '';
      if (allowNone) {
        var o = document.createElement('option'); o.value = ''; o.textContent = '(none)'; sel.appendChild(o);
      }
      ids.forEach(function (id) {
        var o = document.createElement('option');
        o.value = id; o.textContent = moveName[id] || id;
        sel.appendChild(o);
      });
    }
    fill(fast, p.fastMoves, false);
    fill(c1, p.chargedMoves, false);
    fill(c2, p.chargedMoves, true);
    if (wanted) {
      if (wanted[0]) fast.value = wanted[0];
      if (wanted[1]) c1.value = wanted[1];
      if (wanted[2]) c2.value = wanted[2]; else c2.value = '';
    } else {
      if (p.chargedMoves[1]) c2.value = p.chargedMoves[1];
    }
  }

  function slotSpeciesId(slot) {
    var v = slot.querySelector('.sp').value.trim();
    return byLabel[v] || null;
  }

  function updateCP(slot) {
    var cpEl = slot.querySelector('.cp');
    try {
      var spec = readSlot(slot);
      cpEl.textContent = 'CP ' + SIM.cpOf(spec);
    } catch (e) { cpEl.textContent = ''; }
  }

  function readSlot(slot) {
    var id = slotSpeciesId(slot);
    if (!id) throw new Error('Pick a species for every slot.');
    var fast = slot.querySelector('.fast').value;
    var c1 = slot.querySelector('.ch1').value;
    var c2 = slot.querySelector('.ch2').value;
    if (!fast || !c1) throw new Error('Pick a fast and a charged move for every slot.');
    var ivs = [0, 1, 2].map(function (i) {
      var v = parseInt(slot.querySelector('.iv' + i).value, 10);
      return isNaN(v) ? 0 : Math.max(0, Math.min(15, v));
    });
    var moves = c2 ? [fast, c1, c2] : [fast, c1];
    return S(id, moves, ivs);
  }

  function readTeam(panel) {
    return Array.prototype.map.call(panel.querySelectorAll('.slot'), readSlot);
  }

  function applySpec(slot, spec) {
    var p = byId[spec.id];
    if (!p) return;
    var label = Object.keys(byLabel).find(function (k) { return byLabel[k] === spec.id; });
    slot.querySelector('.sp').value = label || p.speciesName;
    [0, 1, 2].forEach(function (i) { slot.querySelector('.iv' + i).value = spec.ivs[i]; });
    fillMoves(slot, spec.id, spec.moves);
    updateCP(slot);
  }

  function applyTeam(panel, team) {
    var slots = panel.querySelectorAll('.slot');
    team.forEach(function (spec, i) { if (slots[i]) applySpec(slots[i], spec); });
  }

  function setBusy(busy, label) {
    document.getElementById('btnGrade').disabled = busy;
    document.getElementById('btnH2H').disabled = busy;
    var bar = document.getElementById('bar');
    bar.style.display = busy ? 'block' : 'none';
    if (busy) bar.firstElementChild.style.width = '0%';
    if (label) document.getElementById('status').textContent = label;
  }
  function progress(f) {
    document.getElementById('bar').firstElementChild.style.width = Math.round(f * 100) + '%';
  }
  function status(msg) { document.getElementById('status').textContent = msg; }

  function speciesLabel(p) {
    return p.speciesName;
  }

  async function doGrade() {
    var panel = document.getElementById('teamA');
    var team;
    try { team = readTeam(panel); } catch (e) { status(e.message); return; }
    var meta = document.getElementById('metaSel').value === 'v3'
      ? window.META3
      : window.META2.map(function (e) { return [1, e[0], e[1]]; });
    var reps = parseInt(document.getElementById('repSel').value, 10);
    setBusy(true, 'Grading…');
    try {
      var res = await SIM.gradeTeam(team, meta, reps, progress);
      var out = document.getElementById('results');
      out.innerHTML = '';
      var head = el('div', 'big');
      head.innerHTML = res.weighted.toFixed(1) + '% weighted <small>· ' + res.unweighted.toFixed(1) + '% unweighted · vs ' + meta.length + ' meta teams</small>';
      out.appendChild(head);
      var rows = res.rows.slice().sort(function (a, b) { return a.wins - b.wins; });
      var table = el('table');
      table.innerHTML = '<tr><th>Meta team</th><th>W</th><th>Score</th><th></th></tr>';
      rows.forEach(function (r) {
        var pct = 100 * r.wins / r.total;
        var tr = el('tr', pct <= 20 ? 'hole' : '');
        var nm = r.name + (r.weight > 1 ? ' ×' + r.weight : '');
        tr.appendChild(el('td', null, nm));
        tr.appendChild(el('td', null, r.weight > 1 ? '×' + r.weight : ''));
        tr.appendChild(el('td', null, r.wins + '/' + r.total));
        var bar = el('td');
        var b = el('span', 'wbar'); b.style.width = Math.max(2, pct) + 'px'; b.style.maxWidth = '120px';
        bar.appendChild(b); bar.appendChild(document.createTextNode(pct.toFixed(0) + '%'));
        tr.appendChild(bar);
        table.appendChild(tr);
      });
      out.appendChild(table);
      status('Done. Worst matchups on top.');
    } catch (e) {
      status('Error: ' + e.message);
    }
    setBusy(false);
  }

  async function doH2H() {
    var teamA, teamB;
    try {
      teamA = readTeam(document.getElementById('teamA'));
      teamB = readTeam(document.getElementById('teamB'));
    } catch (e) { status(e.message); return; }
    setBusy(true, 'Running head-to-head…');
    try {
      var res = await SIM.headToHead(teamA, teamB, 33, progress);
      var out = document.getElementById('results');
      out.innerHTML = '';
      var head = el('div', 'big');
      head.innerHTML = 'Team A wins ' + res.wins + '/' + res.total + ' <small>(' + (100 * res.wins / res.total).toFixed(0) + '%)</small>';
      out.appendChild(head);
      var table = el('table', 'grid');
      var hdr = el('tr');
      hdr.appendChild(el('th', null, 'A \\ B'));
      teamB.forEach(function (s) { hdr.appendChild(el('th', null, byId[s.id].speciesName)); });
      table.appendChild(hdr);
      res.grid.forEach(function (row, i) {
        var tr = el('tr');
        tr.appendChild(el('th', null, byId[teamA[i].id].speciesName));
        row.forEach(function (cell) { tr.appendChild(el('td', null, cell)); });
        table.appendChild(tr);
      });
      out.appendChild(table);
      var note = el('div', 'note', 'Grid cells: your mon vs theirs at 0 / 1 / 2 shields, W = your mon wins the 1v1.');
      out.appendChild(note);
      status('Done.');
    } catch (e) {
      status('Error: ' + e.message);
    }
    setBusy(false);
  }

  function init() {
    var posNames = ['Lead', 'Second', 'Third'];
    ['teamA', 'teamB'].forEach(function (pid) {
      var panel = document.getElementById(pid);
      var wrap = panel.querySelector('.slots');
      posNames.forEach(function (p) { buildSlot(wrap, p); });
      wrap.addEventListener('change', function (e) {
        var slot = e.target.closest('.slot');
        if (!slot) return;
        if (e.target.classList.contains('sp')) {
          var id = slotSpeciesId(slot);
          if (id) { fillMoves(slot, id, null); }
        }
        updateCP(slot);
      });
      // Live CP readout while IVs are being typed, not just on blur.
      wrap.addEventListener('input', function (e) {
        var slot = e.target.closest('.slot');
        if (!slot) return;
        if (e.target.classList.contains('iv') || e.target.classList.contains('sp')) updateCP(slot);
      });
    });

    // Presets
    var pa = document.getElementById('presetA');
    NAMED.forEach(function (n, i) {
      var o = document.createElement('option'); o.value = i; o.textContent = n[0]; pa.appendChild(o);
    });
    pa.addEventListener('change', function () {
      applyTeam(document.getElementById('teamA'), NAMED[parseInt(pa.value, 10)][1]);
    });
    var pb = document.getElementById('presetB');
    NAMED.forEach(function (n, i) {
      var o = document.createElement('option'); o.value = 'n' + i; o.textContent = n[0]; pb.appendChild(o);
    });
    window.META3.forEach(function (m, i) {
      var o = document.createElement('option'); o.value = 'm' + i; o.textContent = 'Meta: ' + m[1]; pb.appendChild(o);
    });
    pb.addEventListener('change', function () {
      var v = pb.value;
      var team = v[0] === 'n' ? NAMED[parseInt(v.slice(1), 10)][1] : window.META3[parseInt(v.slice(1), 10)][2];
      applyTeam(document.getElementById('teamB'), team);
    });

    document.getElementById('btnGrade').addEventListener('click', doGrade);
    document.getElementById('btnH2H').addEventListener('click', doH2H);

    SIM.ready.then(function (g) {
      gm = g;
      gm.data.moves.forEach(function (m) { moveName[m.moveId] = m.name; });
      var dl = document.getElementById('speciesList');
      var seen = {};
      gm.data.pokemon.forEach(function (p) {
        byId[p.speciesId] = p;
        var label = speciesLabel(p);
        if (seen[label]) label = label + ' · ' + p.speciesId;
        seen[label] = true;
        byLabel[label] = p.speciesId;
        var o = document.createElement('option'); o.value = label; dl.appendChild(o);
      });
      applyTeam(document.getElementById('teamA'), NAMED[0][1]);
      applyTeam(document.getElementById('teamB'), window.META3[0][2]);
      document.getElementById('btnGrade').disabled = false;
      document.getElementById('btnH2H').disabled = false;
      status('Engine ready. Pick a team and grade it.');
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
