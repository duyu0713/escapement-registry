// 正式角色资料。district 是居住区域；suit/rank 仅代表能力牌，二者独立。
(function (root) {
  'use strict';
  const characters = [
    { name: '白月葵', aliases: ['葵'], archiveId: 'ESP VIII-004', district: 'roswyn', suit: '♥', rank: '8', ability: '心弦偶戏', abilityEn: 'Phantom Sentiment', occupation: '学生', awakened: true },
    { name: '天田乾', aliases: ['乾'], archiveId: 'ESP V-003', district: 'roswyn', suit: '♣', rank: '5', ability: '商榷之术', abilityEn: 'Silver Tongue', occupation: '学生', awakened: true },
    { name: '赫拉拉·奈德梅亚', aliases: ['赫拉拉'], archiveId: 'ESP X-012', district: 'roswyn', suit: '♠', rank: '10', ability: '时序回廊', abilityEn: 'Eidetic Memory', occupation: '侦探', awakened: true },
    { name: '奥提莉亚·克劳文', aliases: ['奥提莉亚'], archiveId: 'ESP II-013', district: 'roswyn', suit: '♦', rank: '2', ability: '命运贷', abilityEn: 'Loaded Dice', occupation: '侦探', awakened: true },
    { name: '莱昂·斯特罗尔', aliases: ['斯特罗尔'], archiveId: 'ESP V-014', district: 'vesper', suit: '♠', rank: '5', ability: '调度者', abilityEn: 'Dispatch', occupation: '警长', awakened: true },
    { name: '拉基西娅·西奥·拉斐拉', aliases: ['拉基西娅'], archiveId: 'ESP IV-008', district: 'vesper', suit: '♥', rank: '4', ability: '命运赋格', abilityEn: 'Fate Fugue', occupation: '学生', awakened: true },
    { name: '夏汀', aliases: ['夏汀'], archiveId: 'ESP VII-007', district: 'vesper', suit: '♠', rank: '7', ability: '铅火直觉', abilityEn: 'Lead and Fire', occupation: '学生', awakened: true },
    { name: '白鸟希海', aliases: ['希海'], archiveId: 'ESP I-010', district: 'cloverden', suit: '♣', rank: 'A', ability: '甘霖', abilityEn: 'Aqua Vitae', occupation: '医生', awakened: true },
    { name: '米瑞可·凯斯', aliases: ['凯斯'], archiveId: 'ESP XIII-009', district: 'cloverden', suit: '♦', rank: 'K', ability: '万有应许', abilityEn: 'Miracle N', occupation: '学生', awakened: true },
    { name: '苍树澪', aliases: ['澪'], archiveId: 'ESP XII-006', district: 'cloverden', suit: '♣', rank: 'Q', ability: '解构重现', abilityEn: 'Cognition Fabrication', occupation: '机械铺老板', awakened: true },
    { name: '爱丽速子', aliases: ['速子'], archiveId: 'ESP IV-005', district: 'cloverden', suit: '♠', rank: '4', ability: '迁跃疾走', abilityEn: 'Lorentz Factor', occupation: '机械铺学徒', awakened: true },
    { name: '宇咲木流花', aliases: ['流花'], archiveId: 'ESP IX-015', district: 'diamora', suit: '♦', rank: '9', ability: '神凭显现', abilityEn: 'Kenzan', occupation: '学生', awakened: true },
    { name: '雷欧·皮诺克尔', aliases: ['雷欧'], archiveId: 'ESP VII-001', district: 'diamora', suit: '♦', rank: '7', ability: '千金一现', abilityEn: 'Never No Dollars', occupation: '学生', awakened: true },
    { name: '莉西娅·阿尔达里克', aliases: ['莉西娅'], archiveId: 'ESP IV-002', district: 'diamora', suit: '♣', rank: '4', ability: '双人成行', abilityEn: 'It Takes Two', occupation: '学生', awakened: true },
    { name: '卡特拉利·诺布尔', aliases: ['卡特拉利'], archiveId: 'ESP II-011', district: 'diamora', suit: '♣', rank: '2', ability: '僭演家', abilityEn: 'Usurper', occupation: '学生', awakened: true }
  ];
  function buildNameIndex(records) {
    const index = new Map();
    for (const record of records) {
      for (const name of new Set([record.name, ...record.aliases])) {
        if (!name || name !== name.trim()) throw new Error('预设姓名或别名不能为空，也不能带首尾空格。');
        if (index.has(name) && index.get(name) !== record) throw new Error(`姓名或别名重复：${name}`);
        index.set(name, record);
      }
    }
    return index;
  }
  characters.forEach(c => { Object.freeze(c.aliases); Object.freeze(c); });
  Object.freeze(characters);
  const index = buildNameIndex(characters);
  function findCharacter(input) { return index.get(String(input).trim()) || null; }
  const api = { characters, findCharacter, buildNameIndex };
  root.Escapement = root.Escapement || {};
  root.Escapement.escapists = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);
