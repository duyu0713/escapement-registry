(function (root) {
  'use strict';
  const config = {
    seedVersion: 'escapement-v1',
    nicknameMaxLength: 24,
    awakeningProbability: 0.01,
    districts: [
      { id: 'roswyn', name: 'Roswyn', chinese: '罗斯温', suit: '♥', suitName: 'HEART', institution: '学校', weight: 1 },
      { id: 'vesper', name: 'Vesper', chinese: '维斯珀', suit: '♠', suitName: 'SPADE', institution: '警署', weight: 1 },
      { id: 'cloverden', name: 'Cloverden', chinese: '克洛弗登', suit: '♣', suitName: 'CLUB', institution: '医院', weight: 1 },
      { id: 'diamora', name: 'Diamora', chinese: '迪亚莫拉', suit: '♦', suitName: 'DIAMOND', institution: '教堂', weight: 1 }
    ],
    assets: {
      cardBack: 'assets/images/牌背.png',
      townEmblem: 'assets/images/ESP-ORG-2.png',
      escapistEmblem: 'assets/images/ESPT-2.png',
      emblems: {
        roswyn: 'assets/images/ESP-HRT-2.png',
        vesper: 'assets/images/ESP-SPD-2.png',
        cloverden: 'assets/images/ESP-CLR-2.png',
        diamora: 'assets/images/ESP-DIA-2.png'
      }
    },
    animation: { flipMs: 700, anomalyMs: 1000 },
    copy: {
      welcome: '欢迎来到艾斯卡普镇。',
      welcomeInstruction: '请留下姓名，领取你的居民档案。',
      waiting: '档案已封存，等待你亲手翻开。',
      ordinary: '登记完成。',
      anomaly: '登记记录异常 · 正在核对觉醒状态…',
      awakened: '登记记录已更新 · 已觉醒 / ESCAPIST'
    }
  };
  root.Escapement = root.Escapement || {};
  root.Escapement.config = config;
  if (typeof module !== 'undefined') module.exports = config;
})(globalThis);
