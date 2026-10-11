const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const config = require('../js/config.js');
const data = require('../js/data.js');
const api = require('../js/random.js');
const draw = (name = '钟表访客', date = '2026-10-11', settings = config, pools = data) => api.generateProfile(name, date, settings, pools);
test('同名同日的每个字段完全一致，且不调用 Math.random', () => {
  const expected = draw();
  const previous = Math.random;
  Math.random = () => { throw new Error('Non-deterministic RNG'); };
  try { for (let i = 0; i < 100; i++) assert.deepEqual(draw(), expected); }
  finally { Math.random = previous; }
});
test('独立运行环境与当前运行环境结果一致', () => {
  const sandbox = vm.createContext({});
  for (const file of ['config.js', 'data.js', 'random.js']) vm.runInContext(fs.readFileSync(path.join(__dirname, '../js', file), 'utf8'), sandbox);
  const result = vm.runInContext("Escapement.random.generateProfile('钟表访客','2026-10-11',Escapement.config,Escapement.data)", sandbox);
  assert.deepEqual(JSON.parse(JSON.stringify(result)), draw());
});
test('哈希和伪随机算法具有固定校验向量', () => {
  assert.equal(api.hashString('hello'), 1335831723);
  assert.equal(api.createRandom(1)(), 0.6270739405881613);
});
test('UTC+8 午夜边界与年月日切换', () => {
  assert.equal(api.dateUTC8(new Date('2026-10-10T15:59:59.999Z')), '2026-10-10');
  assert.equal(api.dateUTC8(new Date('2026-10-10T16:00:00Z')), '2026-10-11');
  assert.equal(api.dateUTC8(new Date('2026-12-31T16:00:00Z')), '2027-01-01');
});
test('新日期生成新的稳定档案，姓名规范化一致', () => {
  assert.notDeepEqual(draw(), draw('钟表访客', '2026-10-12'));
  assert.deepEqual(draw(' 钟表访客 '), draw());
  assert.deepEqual(draw('e\u0301'), draw('é'));
});
test('空白、超长、控制字符、非法日期均被拒绝，Unicode 长度正确', () => {
  for (const name of ['', '  ', 'a'.repeat(25), 'a\nb', '\u200b']) assert.throws(() => draw(name));
  assert.doesNotThrow(() => draw('😀'.repeat(24)));
  for (const date of ['2026-02-30', '2026-13-01', 'bad']) assert.throws(() => draw('访客', date));
});
test('演示池数量、四区名称和配置合法', () => {
  assert.deepEqual(config.districts.map(d => d.name), ['Roswyn', 'Vesper', 'Cloverden', 'Diamora']);
  for (const d of config.districts) { assert.ok(data[d.id].occupations.length >= 8); assert.deepEqual(Object.keys(data[d.id]), ['occupations']); }
  assert.throws(() => draw('访客', '2026-10-11', { ...config, awakeningProbability: 1.1 }));
});
test('修改觉醒概率不影响其余字段；0% 与 100% 边界正确', () => {
  for (let i = 0; i < 1000; i++) {
    const ordinary = draw(`访客${i}`, '2026-10-11', { ...config, awakeningProbability: 0 });
    const awakened = draw(`访客${i}`, '2026-10-11', { ...config, awakeningProbability: 1 });
    assert.equal(ordinary.awakened, false); assert.equal(awakened.awakened, true);
    assert.deepEqual({ ...ordinary, awakened: true }, awakened);
  }
});
test('改变区域权重或数据池不会改变觉醒随机值和登记编号', () => {
  for (let i = 0; i < 1000; i++) {
    const base = draw(`访客${i}`);
    const smallerPools = Object.fromEntries(Object.entries(data).map(([key, pool]) => [key, { occupations: pool.occupations.slice(0, 1) }]));
    const changedPool = draw(`访客${i}`, '2026-10-11', config, smallerPools);
    assert.equal(changedPool.awakened, base.awakened); assert.equal(changedPool.residentId, base.residentId);
    for (const target of config.districts) {
      const settings = { ...config, districts: config.districts.map(d => ({ ...d, weight: d.id === target.id ? 1 : 0 })) };
      const p = draw(`访客${i}`, '2026-10-11', settings);
      assert.equal(p.districtId, target.id); assert.equal(p.awakened, base.awakened); assert.equal(p.residentId, base.residentId);
    }
  }
});
test('固定大样本：四区均可抽中，各区觉醒率接近 1%', () => {
  const counts = Object.fromEntries(config.districts.map(d => [d.id, { total: 0, awakened: 0 }]));
  for (let i = 0; i < 40000; i++) {
    const p = draw(`样本-${i}`); counts[p.districtId].total++; counts[p.districtId].awakened += Number(p.awakened);
    assert.ok(data[p.districtId].occupations.includes(p.occupation));
  }
  for (const count of Object.values(counts)) {
    assert.ok(count.total / 40000 > .235 && count.total / 40000 < .265);
    assert.ok(count.awakened / count.total > .006 && count.awakened / count.total < .014);
  }
});
test('复制内容完整且仅包含指定档案字段，无额外能力', () => {
  const p = draw('测试'); const text = api.profileText(p, config);
  for (const value of [p.name, p.date, p.residentId, p.occupation, '非正史演示数据']) assert.ok(text.includes(value));
  assert.deepEqual(Object.keys(p).sort(), ['name','date','districtId','residentId','occupation','awakened'].sort());
  for (const awakened of [false, true]) {
    const lines = api.profileText({ ...p, awakened }, config).split('\n');
    assert.deepEqual(lines.slice(1, -1).map(line => line.split('：')[0]), ['居民姓名', '居民编号', '所属区域', '职业', '觉醒状态', '登记日期']);
    assert.equal(lines[5], `觉醒状态：${awakened ? '已觉醒 / ESCAPIST' : '未觉醒'}`);
  }
});

