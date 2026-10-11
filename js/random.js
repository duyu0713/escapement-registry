(function (root) {
  'use strict';
  // FNV-1a over UTF-16 code units; integer overflow is explicitly 32-bit.
  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
    }
    return hash >>> 0;
  }
  function createRandom(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6D2B79F5) | 0;
      let t = Math.imul(state ^ (state >>> 15), 1 | state);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function dateUTC8(now = new Date()) {
    return new Date(now.getTime() + 8 * 3600000).toISOString().slice(0, 10);
  }
  function normalizeNickname(value, maxLength = 24) {
    const name = String(value).normalize('NFC').trim();
    if (!name) throw new Error('请先写下你的昵称。');
    if (Array.from(name).length > maxLength) throw new Error(`昵称请控制在 ${maxLength} 个字符以内。`);
    if (/[\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff]/u.test(name)) throw new Error('昵称中不能包含控制字符或隐藏格式字符。');
    return name;
  }
  function validateConfig(config, data) {
    if (!Number.isFinite(config.awakeningProbability) || config.awakeningProbability < 0 || config.awakeningProbability > 1) throw new Error('觉醒概率必须在 0 到 1 之间。');
    if (config.districts.length !== 4 || new Set(config.districts.map(d => d.id)).size !== 4) throw new Error('必须配置四个不同的区域。');
    let total = 0;
    for (const district of config.districts) {
      if (!Number.isFinite(district.weight) || district.weight < 0) throw new Error('区域权重必须是非负数。');
      total += district.weight;
      for (const field of ['occupations']) {
        const pool = data[district.id]?.[field];
        if (!Array.isArray(pool) || !pool.length || pool.some(s => typeof s !== 'string' || !s.trim())) throw new Error('职业池必须包含非空文字。');
      }
    }
    if (!Number.isFinite(total) || total <= 0) throw new Error('区域总权重必须大于零。');
    return total;
  }
  function generateProfile(nickname, date, config, data) {
    const name = normalizeNickname(nickname, config.nicknameMaxLength);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) throw new Error('登记日期无效。');
    const total = validateConfig(config, data);
    const rng = createRandom(hashString(JSON.stringify([config.seedVersion, name, date])));
    // Fixed consumption order: district, awakening, occupation, ID.
    // Always draw all four values; pool size and awakening never alter the sequence.
    const rolls = Array.from({ length: 4 }, () => rng());
    let cumulative = 0;
    const district = config.districts.find(d => { cumulative += d.weight; return rolls[0] * total < cumulative; });
    const pool = data[district.id];
    return {
      name, date, districtId: district.id,
      residentId: `ER-${date.replaceAll('-', '')}-${Math.floor(rolls[3] * 4294967296).toString(16).toUpperCase().padStart(8, '0')}`,
      occupation: pool.occupations[Math.floor(rolls[2] * pool.occupations.length)],
      awakened: rolls[1] < config.awakeningProbability
    };
  }
  function profileText(profile, config) {
    const d = config.districts.find(item => item.id === profile.districtId);
    return ['艾斯卡普镇居民登记处 / Escapement', `居民姓名：${profile.name}`, `居民编号：${profile.residentId}`, `所属区域：${d.suit} ${d.name} / ${d.chinese} · ${d.suitName}`, `职业：${profile.occupation}`, `觉醒状态：${profile.awakened ? '已觉醒 / ESCAPIST' : '未觉醒'}`, `登记日期：${profile.date}（UTC+8）`, '职业为非正史演示数据。'].join('\n');
  }
  const api = { hashString, createRandom, dateUTC8, normalizeNickname, generateProfile, profileText, validateConfig };
  root.Escapement = root.Escapement || {};
  root.Escapement.random = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

