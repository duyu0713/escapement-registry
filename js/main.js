(function () {
  'use strict';
  const { config, data, random } = globalThis.Escapement;
  const $ = id => document.getElementById(id);
  let profile = null;
  let phase = 'welcome';
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  function loadArt(img, fallback, path, alt) {
    img.hidden = true;
    if (fallback) fallback.hidden = false;
    img.parentElement.classList.remove('art-loaded');
    img.alt = alt;
    img.onload = () => {
      img.hidden = false;
      if (fallback) fallback.hidden = true;
      img.parentElement.classList.add('art-loaded');
      if (img.id === 'back-image' || img.id === 'display-back-image') {
        img.parentElement.style.setProperty('--back-ratio', `${img.naturalWidth} / ${img.naturalHeight}`);
      }
    };
    img.onerror = () => {
      img.hidden = true;
      if (fallback) fallback.hidden = false;
      img.parentElement.classList.remove('art-loaded');
    };
    img.src = path;
  }
  function refreshDate() { $('today').textContent = `${random.dateUTC8()} / UTC+8`; }
  refreshDate();
  window.addEventListener('focus', refreshDate);
  $('welcome-copy').textContent = config.copy.welcome;
  $('welcome-instruction').textContent = config.copy.welcomeInstruction;
  $('card').style.transitionDuration = `${config.animation.flipMs}ms`;
  config.districts.forEach(d => {
    const item = document.createElement('div');
    item.className = `district-item ${d.id}`;
    const suit = document.createElement('span');
    suit.className = 'directory-suit'; suit.textContent = d.suit; suit.setAttribute('aria-hidden', 'true');
    const mark = document.createElement('span');
    mark.className = 'directory-mark';
    const emblem = document.createElement('img');
    emblem.className = 'directory-emblem';
    mark.append(suit, emblem);
    loadArt(emblem, suit, config.assets.emblems[d.id], `${d.name} 纹章`);
    const text = document.createElement('div');
    const name = document.createElement('strong'); name.textContent = d.name.toUpperCase();
    const detail = document.createElement('small'); detail.textContent = `${d.chinese} · ${d.institution}`;
    text.append(name, detail); item.append(mark, text); $('district-directory').append(item);
  });
  loadArt($('back-image'), $('back-fallback'), config.assets.cardBack, '原创居民卡背');
  loadArt($('display-back-image'), $('display-back-fallback'), config.assets.cardBack, '原创居民卡背');
  loadArt($('town-emblem'), $('front-suit'), config.assets.townEmblem, 'Escapement 艾斯卡普镇镇徽');
  loadArt($('header-emblem'), null, config.assets.townEmblem, 'Escapement 艾斯卡普镇镇徽');
  loadArt($('escapist-emblem'), null, config.assets.escapistEmblem, 'Escapist 逃逸者纹章');
  function renderProfile(p) {
    const d = config.districts.find(d => d.id === p.districtId);
    $('card-front').className = `card-face card-front ${d.id}`;
    $('front-suit').textContent = d.suit;
    $('emblem-fallback').textContent = d.suit;
    loadArt($('emblem'), $('emblem-fallback'), config.assets.emblems[d.id], `${d.name} 原创纹章`);
    $('district-name').textContent = d.name;
    $('district-subtitle').textContent = `${d.chinese} · ${d.suitName}`;
    $('resident-name').textContent = p.name;
    $('resident-id').textContent = p.residentId;
    $('occupation').textContent = p.occupation;
    $('awakening').textContent = '未觉醒';
    $('awakening').className = '';
    $('escapist-badge').hidden = true;
    $('registration-date').textContent = `${p.date} / UTC+8`;
    $('registration-date').dateTime = p.date;
  }
  $('registration').addEventListener('submit', event => {
    event.preventDefault();
    try {
      profile = random.generateProfile($('nickname').value, random.dateUTC8(), config, data);
    } catch (error) {
      $('name-error').textContent = error.message;
      $('nickname').setAttribute('aria-invalid', 'true');
      $('nickname').focus(); return;
    }
    $('name-error').textContent = '';
    $('nickname').removeAttribute('aria-invalid');
    refreshDate(); renderProfile(profile); phase = 'sealed';
    $('welcome').hidden = true; $('registry').hidden = false;
    $('registry-message').textContent = config.copy.waiting;
    $('card-back').focus();
  });
  $('nickname').addEventListener('input', () => { $('name-error').textContent = ''; $('nickname').removeAttribute('aria-invalid'); });
  $('card-back').addEventListener('click', async () => {
    if (phase !== 'sealed') return;
    phase = 'revealing';
    $('card-back').disabled = true;
    $('card-back').setAttribute('aria-hidden', 'true');
    $('registry-title').focus();
    $('card').classList.add('flipped');
    $('flip-hint').hidden = true;
    if (profile.awakened) {
      $('registry-message').textContent = config.copy.anomaly;
      $('card-stage').classList.add('anomaly');
    }
    await delay(reduceMotion() ? 0 : config.animation.flipMs);
    $('card-front').removeAttribute('inert'); $('card-front').setAttribute('aria-hidden', 'false');
    if (profile.awakened) {
      await delay(config.animation.anomalyMs);
      $('awakening').textContent = '已觉醒 / ESCAPIST';
      $('awakening').className = 'awakened';
      $('escapist-badge').hidden = false;
    }
    $('card-stage').classList.remove('anomaly');
    $('registry-message').textContent = profile.awakened ? config.copy.awakened : config.copy.ordinary;
    $('result-actions').hidden = false;
    phase = 'revealed';
  });
  $('copy-result').addEventListener('click', async () => {
    if (phase !== 'revealed') return;
    const text = random.profileText(profile, config);
    const activeProfile = profile;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      if (profile === activeProfile) $('copy-status').textContent = '居民档案已复制。';
    } catch {
      if (profile !== activeProfile) return;
      $('manual-copy').hidden = false;
      $('copy-text').value = text;
      $('copy-text').focus(); $('copy-text').select();
      let copied = false;
      try { copied = document.execCommand('copy'); } catch { /* Manual selection remains available. */ }
      $('copy-status').textContent = copied ? '居民档案已复制。' : '请按 Ctrl/Cmd+C，或长按选中文字复制。';
      if (copied) { $('manual-copy').hidden = true; $('copy-result').focus(); }
    }
  });
  $('restart').addEventListener('click', () => {
    phase = 'welcome'; profile = null;
    $('registry').hidden = true; $('welcome').hidden = false;
    $('card').classList.remove('flipped');
    $('card-front').setAttribute('inert', ''); $('card-front').setAttribute('aria-hidden', 'true');
    $('card-back').disabled = false; $('card-back').removeAttribute('aria-hidden');
    $('result-actions').hidden = true; $('manual-copy').hidden = true;
    $('copy-status').textContent = ''; $('flip-hint').hidden = false;
    refreshDate(); $('nickname').focus(); $('nickname').select();
  });
})();

