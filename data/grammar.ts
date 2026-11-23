export type GrammarPoint = {
  id: string;
  level: number;
  title: string;
  formula: string;
  explanation: string;
  examples: { zh: string; pinyin: string; vi: string }[];
};

export const grammarPoints: GrammarPoint[] = [
  { id: 'g_shi', level: 1, title: 'Câu với 是 (A 是 B)', formula: 'A + 是 + B', explanation: 'Dùng để nói A là B (giới thiệu tên, nghề, quốc tịch...).', examples: [
    { zh: '我是学生。', pinyin: 'Wǒ shì xuéshēng.', vi: 'Tôi là học sinh.' },
    { zh: '他是老师。', pinyin: 'Tā shì lǎoshī.', vi: 'Anh ấy là giáo viên.' },
  ]},
  { id: 'g_de', level: 1, title: 'Trợ từ sở hữu 的', formula: 'A + 的 + B', explanation: 'Đặt 的 giữa người sở hữu và vật được sở hữu.', examples: [
    { zh: '我的书', pinyin: 'wǒ de shū', vi: 'sách của tôi' },
    { zh: '他的朋友', pinyin: 'tā de péngyou', vi: 'bạn của anh ấy' },
  ]},
  { id: 'g_ma', level: 1, title: 'Câu hỏi yes/no với 吗', formula: 'Câu + 吗？', explanation: 'Thêm 吗 cuối câu trần thuật để tạo câu hỏi có/không.', examples: [
    { zh: '你好吗？', pinyin: 'Nǐ hǎo ma?', vi: 'Bạn khỏe không?' },
    { zh: '你是学生吗？', pinyin: 'Nǐ shì xuéshēng ma?', vi: 'Bạn là học sinh à?' },
  ]},
  { id: 'g_bu', level: 1, title: 'Phủ định với 不', formula: '不 + động từ / tính từ', explanation: 'Dùng cho hiện tại và tương lai. Với 有 phải dùng 没有.', examples: [
    { zh: '我不去。', pinyin: 'Wǒ bù qù.', vi: 'Tôi không đi.' },
    { zh: '我没有钱。', pinyin: 'Wǒ méiyǒu qián.', vi: 'Tôi không có tiền.' },
  ]},
  { id: 'g_hen', level: 1, title: 'Tính từ làm vị ngữ với 很', formula: 'Chủ ngữ + 很 + tính từ', explanation: 'Khi tính từ đứng làm vị ngữ, thường thêm 很 (rất) để câu tự nhiên.', examples: [
    { zh: '我很好。', pinyin: 'Wǒ hěn hǎo.', vi: 'Tôi rất khỏe.' },
    { zh: '今天很热。', pinyin: 'Jīntiān hěn rè.', vi: 'Hôm nay rất nóng.' },
  ]},
  { id: 'g_you', level: 1, title: '有 / 没有', formula: 'Chủ ngữ + 有 + tân ngữ', explanation: 'Diễn tả sự sở hữu hoặc tồn tại. Phủ định là 没有.', examples: [
    { zh: '我有一只猫。', pinyin: 'Wǒ yǒu yì zhī māo.', vi: 'Tôi có một con mèo.' },
    { zh: '他没有车。', pinyin: 'Tā méiyǒu chē.', vi: 'Anh ấy không có xe.' },
  ]},
  { id: 'g_zai', level: 1, title: '在 (ở / đang)', formula: 'Chủ ngữ + 在 + địa điểm / 在 + động từ', explanation: '在 đứng trước địa điểm nghĩa là "ở"; đứng trước động từ nghĩa là "đang".', examples: [
    { zh: '我在家。', pinyin: 'Wǒ zài jiā.', vi: 'Tôi ở nhà.' },
    { zh: '他在看书。', pinyin: 'Tā zài kàn shū.', vi: 'Anh ấy đang đọc sách.' },
  ]},
  { id: 'g_hui_neng', level: 1, title: '会 / 能', formula: 'Chủ ngữ + 会/能 + động từ', explanation: '会: biết làm (kỹ năng học được). 能: có thể (điều kiện cho phép).', examples: [
    { zh: '我会说中文。', pinyin: 'Wǒ huì shuō Zhōngwén.', vi: 'Tôi biết nói tiếng Trung.' },
    { zh: '我今天不能去。', pinyin: 'Wǒ jīntiān bù néng qù.', vi: 'Hôm nay tôi không thể đi.' },
  ]},
  { id: 'g_xiang_yao', level: 1, title: '想 / 要', formula: 'Chủ ngữ + 想/要 + động từ', explanation: '想: muốn (nguyện vọng). 要: cần/muốn (mạnh hơn, có ý định).', examples: [
    { zh: '我想喝水。', pinyin: 'Wǒ xiǎng hē shuǐ.', vi: 'Tôi muốn uống nước.' },
    { zh: '我要买这个。', pinyin: 'Wǒ yào mǎi zhège.', vi: 'Tôi muốn mua cái này.' },
  ]},
  { id: 'g_tai_le', level: 2, title: '太…了', formula: '太 + tính từ + 了', explanation: 'Diễn tả mức độ quá cao: "quá...".', examples: [
    { zh: '太好了！', pinyin: 'Tài hǎo le!', vi: 'Tốt quá!' },
    { zh: '这个太贵了。', pinyin: 'Zhège tài guì le.', vi: 'Cái này đắt quá.' },
  ]},
  { id: 'g_dou_ye', level: 2, title: '都 / 也', formula: 'Chủ ngữ + 都/也 + động từ', explanation: '都: đều (tất cả). 也: cũng.', examples: [
    { zh: '我们都很好。', pinyin: 'Wǒmen dōu hěn hǎo.', vi: 'Chúng tôi đều khỏe.' },
    { zh: '我也喜欢。', pinyin: 'Wǒ yě xǐhuan.', vi: 'Tôi cũng thích.' },
  ]},
  { id: 'g_bi', level: 2, title: 'So sánh với 比', formula: 'A + 比 + B + tính từ', explanation: 'Dùng để so sánh: A ... hơn B.', examples: [
    { zh: '我比他高。', pinyin: 'Wǒ bǐ tā gāo.', vi: 'Tôi cao hơn anh ấy.' },
    { zh: '今天比昨天热。', pinyin: 'Jīntiān bǐ zuótiān rè.', vi: 'Hôm nay nóng hơn hôm qua.' },
  ]},
];
