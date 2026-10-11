const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const config = require('../js/config.js');
const data = require('../js/data.js');
const random = require('../js/random.js');
const { characters, findCharacter, buildNameIndex } = require('../js/escapists.js');
const registry = require('../js/registry.js');
const expected = [
  ['白月葵','葵','ESP VIII-004','roswyn','♥8','心弦偶戏','Phantom Sentiment','学生'],
  ['天田乾','乾','ESP V-003','roswyn','♣5','商榷之术','Silver Tongue','学生'],
  ['赫拉拉·奈德梅亚','赫拉拉','ESP X-012','roswyn','♠10','时序回廊','Eidetic Memory','侦探'],
  ['奥提莉亚·克劳文','奥提莉亚','ESP II-013','roswyn','♦2','命运贷','Loaded Dice','侦探'],
  ['莱昂·斯特罗尔','斯特罗尔','ESP V-014','vesper','♠5','调度者','Dispatch','警长'],
  ['拉基西娅·西奥·拉斐拉','拉基西娅','ESP IV-008','vesper','♥4','命运赋格','Fate Fugue','学生'],
  ['夏汀','夏汀','ESP VII-007','vesper','♠7','铅火直觉','Lead and Fire','学生'],
  ['白鸟希海','希海','ESP I-010','cloverden','♣A','甘霖','Aqua Vitae','医生'],
  ['米瑞可·凯斯','凯斯','ESP XIII-009','cloverden','♦K','万有应许','Miracle N','学生'],
  ['苍树澪','澪','ESP XII-006','cloverden','♣Q','解构重现','Cognition Fabrication','机械铺老板'],
  ['爱丽速子','速子','ESP IV-005','cloverden','♠4','迁跃疾走','Lorentz Factor','机械铺学徒'],
  ['宇咲木流花','流花','ESP IX-015','diamora','♦9','神凭显现','Kenzan','学生'],
  ['雷欧·皮诺克尔','雷欧','ESP VII-001','diamora','♦7','千金一现','Never No Dollars','学生'],
  ['莉西娅·阿尔达里克','莉西娅','ESP IV-002','diamora','♣4','双人成行','It Takes Two','学生'],
  ['卡特拉利·诺布尔','卡特拉利','ESP II-011','diamora','♣2','僭演家','Usurper','学生']
];
const draw = (name, date = '2026-10-11', settings = config) => registry.resolveProfile(name, date, settings, data);
for (const [name, alias, id, districtId, abilityCard, ability, abilityEn, occupation] of expected) {
  test(`正式档案：${name}（含别名、空格和跨日稳定）`, () => {
    const p = { preset: true, name, residentId: id, districtId, abilityCard, ability, abilityEn, occupation, awakened: true, date: null };
    assert.deepEqual(draw(name), p);
    assert.deepEqual(draw(`  ${alias}　`, '2030-01-01'), p);
    assert.deepEqual(draw(name, '2020-01-01', { ...config, seedVersion: 'different', awakeningProbability: 0, districts: [] }), p);
    assert.deepEqual(findCharacter(name).aliases, [alias]);
  });
}
test('15份档案和15个显式别名，无额外推断或重复编号', () => {
  assert.equal(characters.length, 15);
  assert.equal(new Set(characters.map(c => c.archiveId)).size, 15);
  assert.equal(characters.flatMap(c => c.aliases).length, 15);
  assert.throws(() => buildNameIndex([{ name: '甲', aliases: ['别名'] }, { name: '乙', aliases: ['别名'] }]), /重复/);
  assert.throws(() => buildNameIndex([{ name: '甲', aliases: [] }, { name: '乙', aliases: ['甲'] }]), /重复/);
  for (const name of ['乾乾','天田','小葵','雷欧先生','凯斯123','夏 汀','赫拉拉.奈德梅亚','赫拉拉・奈德梅亚','Leon','constructor','__proto__']) assert.equal(findCharacter(name), null);
});
test('地区与能力牌独立，区名及纹章使用原统一映射', () => {
  for (const [name,, , districtId, card] of expected) {
    const p = draw(name);
    assert.equal(p.abilityCard, card);
    assert.ok(config.districts.find(d => d.id === districtId));
    assert.ok(fs.existsSync(path.join(__dirname, '..', config.assets.emblems[districtId])));
  }
  assert.equal(config.districts.find(d => d.id === draw('乾').districtId).suit, '♥');
  assert.equal(draw('乾').abilityCard, '♣5');
});
test('非预设名称逐字段等于旧生成器，包含普通1%觉醒结果', () => {
  let sawAwakened = false;
  for (let i = 0; i < 1000; i++) {
    const name = `访客${i}`;
    for (const date of ['2026-10-11', '2026-10-12']) {
      const p = draw(name, date);
      assert.deepEqual(p, random.generateProfile(name, date, config, data));
      assert.equal(registry.profileText(p, config), random.profileText(p, config));
      assert.equal('ability' in p, false);
      sawAwakened ||= p.awakened;
    }
  }
  assert.ok(sawAwakened);
  for (const bad of ['', ' ', 'x'.repeat(25)]) assert.throws(() => draw(bad));
});
test('正式复制文本完整、显示固定资料、不混入演示职业提示', () => {
  for (const [name,,id,,card,ability,abilityEn,occupation] of expected) {
    const text = registry.profileText(draw(name), config);
    for (const value of [name,id,card,ability,abilityEn,`职业：${occupation}`,'登记日期：■','已觉醒 / ESCAPIST']) assert.ok(text.includes(value));
    assert.ok(!text.includes('非正史'));
  }
});
test('全新脚本上下文（刷新）结果一致，预设不会调用随机生成器', () => {
  const context = vm.createContext({});
  for (const file of ['config','data','random','escapists','registry']) vm.runInContext(fs.readFileSync(path.join(__dirname,`../js/${file}.js`),'utf8'), context);
  vm.runInContext("Escapement.random.generateProfile = () => { throw new Error('不应抽卡'); }", context);
  for (const [name] of expected) {
    const p = vm.runInContext(`Escapement.registry.resolveProfile(${JSON.stringify(name)}, '2027-12-31', Escapement.config, Escapement.data)`,context);
    assert.deepEqual(JSON.parse(JSON.stringify(p)), draw(name));
  }
});
test('静态托管：所有脚本、样式、图片和字体引用可在项目子路径解析', () => {
  const base = 'https://example.github.io/escapement-registry/';
  const root = path.join(__dirname, '..');
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m => m[1]);
  refs.push(config.assets.cardBack, config.assets.townEmblem, config.assets.escapistEmblem, ...Object.values(config.assets.emblems));
  for (const ref of refs) {
    assert.ok(!ref.startsWith('/') && !/^[a-z]+:/i.test(ref));
    assert.ok(new URL(ref,base).pathname.startsWith('/escapement-registry/'));
    assert.ok(fs.existsSync(path.join(root,ref)),ref);
  }
  const css = fs.readFileSync(path.join(root,'css/style.css'),'utf8');
  for (const [,ref] of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
    assert.ok(new URL(ref,base+'css/style.css').pathname.startsWith('/escapement-registry/'));
    assert.ok(fs.existsSync(path.join(root,'css',ref)),ref);
  }
  assert.ok(refs.indexOf('js/escapists.js') < refs.indexOf('js/registry.js'));
  assert.ok(refs.indexOf('js/registry.js') < refs.indexOf('js/main.js'));
});
