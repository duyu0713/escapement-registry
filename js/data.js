// 全部为非正史演示数据；可直接替换字符串，不代表正式世界观设定。
(function (root) {
  'use strict';
  const data = {
    roswyn: {
      occupations: ['学生', '教师', '旧书店店员', '文具铺学徒', '裁缝', '面包师', '书店老板', '送信人']
    },
    vesper: {
      occupations: ['巡警', '档案整理员', '锁匠', '夜班车夫', '报刊摊主', '修鞋匠', '街道清扫员', '茶馆侍者']
    },
    cloverden: {
      occupations: ['医师', '护理员', '药剂学徒', '花店店主', '洗衣工', '菜园看护人', '医院厨师', '玻璃器皿修补匠']
    },
    diamora: {
      occupations: ['教堂执事', '烛台看护人', '石匠', '唱诗班成员', '钟表修理匠', '花环编织者', '旅店掌柜', '广场画师']
    }
  };
  root.Escapement = root.Escapement || {};
  root.Escapement.data = data;
  if (typeof module !== 'undefined') module.exports = data;
})(globalThis);

