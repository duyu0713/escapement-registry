(function (root) {
  'use strict';
  const { random, escapists } = root.Escapement;
  function resolveProfile(nickname, date, config, data) {
    const character = escapists.findCharacter(nickname);
    if (!character) return random.generateProfile(nickname, date, config, data);
    return {
      preset: true,
      name: character.name,
      residentId: character.archiveId,
      districtId: character.district,
      occupation: character.occupation ?? '未登记',
      awakened: character.awakened,
      // 未提供正式登记日期，保持未知；不使用当天日期或编造历史日期。
      date: null,
      abilityCard: character.suit + character.rank,
      ability: character.ability,
      abilityEn: character.abilityEn
    };
  }
  function profileText(profile, config) {
    if (!profile.preset) return random.profileText(profile, config);
    const district = config.districts.find(d => d.id === profile.districtId);
    return [
      '艾斯卡普镇居民登记处 / Escapement',
      `居民姓名：${profile.name}`, `居民编号：${profile.residentId}`,
      `所属区域：${district.suit} ${district.name} / ${district.chinese} · ${district.suitName}`,
      `职业：${profile.occupation}`, '觉醒状态：已觉醒 / ESCAPIST',
      `能力牌：${profile.abilityCard}`, `异能：${profile.ability} / ${profile.abilityEn}`,
      '登记日期：■'
    ].join('\n');
  }
  const api = { resolveProfile, profileText };
  root.Escapement.registry = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
