/**
 * 教辅店铺个性化生产规则库 - 应用脚本
 */

var currentBrand = '';
var currentProvider = '';

// ========================================
// 数据存储（本地存储）
// ========================================
const STORAGE_KEYS = {
  PROVIDERS: 'rule_library_providers',
  BRANDS: 'rule_library_brands',
  SERIES: 'rule_library_series'
};

// 预置数据（来自PDF - 完整数据）
const presetData = {
  brands: [
    '木牍中考', '木牍中考•名师教案', '木牍中考•课时A计划',
    '优学精讲', '优学精研', '第一梯队', '备考最优解',
    '全效学习', '全效作业本',
    '衡水金卷·先享题',
    '中学生数理化',
    '中辰优学',
    '优才书系', '同步课课练',
    '创新大课堂',
    '择数',
    '优品', '优品金题卷',
    '精准教学', '能力培优', '同步夯实基础', '期中期末复习',
    '课堂在线', '亿典教育', '周报经典',
    '大语文', '师大金卷',
    '豫燕川',
    '百川育人', 'A+金题',
    '小作家报·读写天下',
    '高中快车道',
    '考点大观',
    '九级跳', '中考密卷',
    '小四科', '大王科', '同步口算',
    '易中考', '中考新方向',
    '博师在线', '冲刺吧期末', '课课帮', '领跑', '名校期末', '星阅读', '中考快递', '备考', '必刷卷', '培优计划', '特训帮', '时文阅读', '深阅读',
    '典创', '夺冠金卷', '快乐练习单元卷', '新思维小学奥数全解', '学练考', '优学优练全能夺冠', '中考预测押题卷',
    '跟着课文背单词', '金山背单词', '聚焦中考',
    '鸿浩教科', '一线调研', '学易优', '学仕邦', '秒杀中考', '良师教案', '洪荒英语',
    '轮轮清', '厚积薄发', '一战成名', '一战成名·新中考', '中考密卷',
    '必考点', '冲刺100分', '寒假专项训练', '黄冈快乐假期', '黄冈随堂练', '假期快乐练', '课本里的优美句子', '课课练', '快乐寒假',
    '名校有约', '走好高中第一步', '单元滚动检测示范卷', '高考解码', '课堂百分百', '快乐假期', '领航密卷', '培优限时练', '易捷金卷', '易捷英语', '走好高中第1步', '训练达人',
    '计算全能天天练', '胜在', '胜在阅读', '学霸训练', '阅读达人', '胜在中考',
    '思而优', '超级备考', '王朝霞系列丛书', '天籁英语', '天籁',
    '同步宝典', '学考一号', '选考一号', '暑假一号', '衔接宝典', '尖峰学堂', '教材全解全析',
    '巅峰中考', '探究100分', '探究乐园', '探究在线',
    '初中学霸创新题', '小学教材搭档', '小学学霸冲A卷', '小学学霸默写', '小学学霸速记', '学霸作业本', '初中学霸冲A卷', '绿卡创新题', '绿卡作业本',
    '练客', '练客中考', '一战成名', '中考导航', '单元期末大练考',
    '鼎成中考', '领扬中考卷', '完美期末卷', '5i英语', '鼎尖小考', '学英语', '壹道学',
    '开心作业', '特优冲刺100分', '思考力阅读', '英语宝典', '百特英语', '压轴题', '押题卷',
    '金科大联考', '桃李源', '假期成才路', '指南针', '冲锋舟', '三美备考', '三步作文',
    '夺冠冲刺100分', '期末夺冠总复习', '8848?新教材新考卷', '8848?学霸期末卷', '8848?学霸小考卷', '8848?学霸一卷通',
    '春晓', '黄冈优练', '探究学案', '直播课堂', '直播新课堂', '作文方程式',
    '基础全刷', '跟着课本学古文', '思维导图', '晨读计划', '幼狮学堂', '阿桂写作文',
    '轻松计算', '知识梳理大考卷', '追梦之旅', '优秀生', '金榜高考密押', '大数据押题', '高考专家摸底卷',
    '众相原创', '高效考卷', '快乐考卷', '期末冲刺必刷卷', '有效课堂', '中考新方向', '中考押题',
    '中考一品设计', '红卷', '绿卷', '考进名校', '快乐假期', '天府中考一本通', '高分演练', '倍多分',
    '聚优', '单元金卷', '一本全', '周末限时测·基础过关', '金版新学案', '正禾一本通',
    '百分导学', '名校好卷', '易考优', '中考易', '名题金卷', '快乐学习报', '聚能课堂',
    '南方凤凰台', '课时学案·作业', '金试卷', '学霸大练兵', '红对勾', '黄冈必刷卷',
    '黄冈口算天天练', '黄冈名卷', '黄冈名师天天练', '期末金考卷', '小学毕业升学必备', '黄冈计算天天练',
    '每日6分钟', '期末冲刺100分', '期末冲刺卷', '期末冲刺优选卷', '全能100分', '全能练考卷', '全优达标卷', '思维导图天天练', '幼小衔接', '运算冠军', '同步训练', '阅读与写作', '暑假专项训练', 'AI易错题', '真题卷', '随堂笔记', '大语文周末小报', '教材笔记', '黄冈课课练',
    '一战通关', '金榜设计', '双基聚焦', '新高考3+3', '天疆中考', '非常阅读', '黄金模拟卷', '考点通', '满分作文', '同步拓展阅读训练', '整本书阅读', '智慧解析', '中考刷题必备', '中考真题分类必刷', '中学作文帮', '中考必备', '河南中考', '千里马', '勤径千里马', '勤径小学升', '勤径学升', '小学升', '中考123', '中考全程复习', '领跑者',
    '高考黑白题', '经纶学典', '锁定高考', '学霸大题小做', '学霸典中典', '学霸高考●白题', '学霸黑白题', '学霸题中题', '学霸组合训练', '学霸高考·蓝题',
    '登攀优秀作文', '四点格练字帖', '衡中课堂', '考前信息卷', '相约高考', '知识金典', '高途考前冲刺', '成才之路', '衡中学案', '儿童数学思维发展', '华夏万卷', '金榜行动', '随堂1+1', '教材解读', '赢在中考·高效备考', '模拟冲刺卷',
    '高考冲刺训练小题练', '高考小题练抢分特训', '抢分课堂', '走进名著', '莘莘文化', '金牌邦', '金版教程',
    '常德标准卷', '达州标准卷', '国华考试', '衡阳标准卷', '湖南标准卷', '架构中考', '江西标准卷', '解密中考', '凉山标准卷', '泸州标准卷', '南充标准卷', '邵阳标准卷', '四川标准卷', '算到底', '小学标准卷', '星城中考', '学本课堂', '学期总复习', '益阳标准卷', '中考2号', '中考导学案', '中考拐点', '中考总动员', '重庆标准卷',
    '鸿鹄志·精英新课堂', '鸿鹄志·名师测控', '鸿鹄志·名校绿卡', '鸿鹄志·期末冲刺王·暑假作业', '鸿鹄志·素养学堂', '鸿鹄志·中考王',
    '金奖口算', '优佳好', '一本', '相约名校', '县中联盟', '传统文化1+1', '晋一中考', '快乐优秀生',
    '绩优名卷', '名校课堂', '名校培优', '中考新航向', '中考直通车', '名师大课堂', '智学校本学案', '学霸必刷卷',
    '天源图书', '学策新亮点', '网络画板', '导与练', '课堂快线',
    'A卷', '百分期末考', '单元计划', '解密英语', '授之以渔', '优势阅读',
    '高考冲刺押题6套', '高考导航押题6套', '志鸿优化训练',
    '高职高考龙门大决战', '尖刀侠', '闪过英语', '四轮复习', '英语洞穿词汇',
    '仿真冲刺卷', '精编高考12套', '练测卷', '玩转假期', '学考一本通', '赢在课堂', '赢在起点', '真题汇编',
    '西南名校联盟', '课堂在线', '亿典教育',
    '创新方案', '名校之约', '新高考方案', '新课程学案', '芝麻开花', '优化大考卷', '一帆工具书', '学习帮', '语文帮', '核心素养阅读', '口算天天练', '应用题天天练', '培优精练', '给力数学', '优佳设计', '有趣的数学文化', '名师优题',
    '大语文阅读', '小学高效课时100', '小学知识与能力测试卷', '小学总复习 我爱学习', '新课堂', '一线课堂', '新考典', '新一线必刷卷', '假期复习计划', '小状元', '一线优选卷', '湖湘名校教育联合体', '三湘名校教育联盟', '天壹名校联盟', '湖南省T8联盟', '名师导航', '提分教练', '艺术生文化课考前100天', '读者报', '艾玛', '默写100分', '提分方案', '高升无忧', '锦上添花', '圣手神算', '易考100', '重点校', '爱典学', '直击高考', '名校课堂', '火线100天', '在线学堂', '拔尖特训', '通成1典', '通成学典', '分类精粹', '试卷精编', '导与练', '高考零起点', 'T8联考', '稳派教育', '稳派六脉卷', '新领程', '优翼·学练优', '致胜中考', '标准课堂', '多维课时练', '五维英语', '精彩三年', '精彩练习', '全程检测卷', '精彩假期', '决胜中考', '中考先锋', '高分突破', '小尚同学', '考场锦鲤', '词汇表解大全', '语法表解大全', '复习计划', '金牌题库', '名师100分', '本真语文', '常青藤英语', '沸腾英语', '高分密码', '计算题天天练', '口算题天天练', '一启卷', '一启阅', '阅读理解100篇', '阅读理解天天练', '阅读天天练', '作文天天练', '作文左学右练', '速记掌中宝', '试题与研究', '新视野', '名师解密', '互动英语', '创新教程', '创新示范卷', '快乐假期', '创维设计', '高考高手', '高考密码猜题卷', '十年高考', '题型查缺补漏练', '壹铭高考真题', '家长帮 学霸笔记', '金版卷王', '金版课堂', '数学文化趣味阅读', '阳光阅读100', '翰庭学霸', '学霸智慧课堂', '激活中考', '学海金卷', '益卷', '黄冈小状元', '龙门书局', '状元绘', '学海领航', '中职生青春记忆', '安全教育', '安全教育读本', '朝读美文', '大语文阅读素养', '高考前沿', '高中生生涯规划', '古代文化常识', '国学课堂', '实验探究报告', '实用写作', '数学文化趣读', '写作思维', '新课堂', '英语读本', '作文训练', '普高大联考', '中原名校大联考', '高分必刷', '高分畅刷', '数学一号', '玩转小考', '物理一号', '中考必刷', '优课堂给力A+', '蓉城课堂给力A', '1号卷', '安徽第一卷', '考场高手', '全讲全解参考大全', '一本学记', '小英宝盒', '超级考卷', '龙门之星', '支点·同步系列', '状元郎', '追击小考', '追击中考', '给力阅读', '夺冠计划', '给力寒假', '名师指津', '爱疯英语', '名校面对面', '快乐练习作业本', '七彩金卷', '期末大冲刺', '教材3D解读', '魔力寒假A计划', '魔力暑假A计划', '无敌卷王', '小考神童', '学海风暴', '学海乐园', '中考一卷通', '初中学业水平考试预测八套卷', '假期好时光', '口算课课练', '名师手把手', '期末考前示范卷', '一课通', '中考必备考前重难点题型集训', '中考预测模拟卷', '中考321', '全程复习大考卷',
    '七彩课堂', '教材一点通', '星级教案', '七彩同步作文', '七彩练霸', '七彩作业', '小白鹅', '七彩同步训练',
    '教材完全解读', '完全解读', '新教材完全解读', '梓耕教育',
    '鼎尖教案', '汉字解码', '教与学', '名校直通车', '全新教案', '全新学案', '文言文新读', '五校联考', '校本教材', '优化设计', '字源识字',
    '艺考一本通', '迎考一本通',
    '高分作文听写字帖', '模板作文听写字帖', '同步听写字帖', '这样练',
    '高高手', '名师面对面', '新征程', '语文花开', '名校课堂',
    '中国大语文@后土传媒', '作文好简单', '名师指点', '通关阅读',
    '黄冈100分闯关', '黄冈金牌之路·练闯考', '聚焦中考', '四清导航', '原创新课堂', '中考精英',
    '1号专题', '假期作业', '乐夺冠', '期末满分卷', '学考英语', '智考王', '智乐星中考'
  ],
  providers: [
    // 安徽木牍教育图书有限公司
    { shop: '', shopname: '', name: '安徽木牍教育图书有限公司', brand: '木牍中考', series: '同步优质课件', split: '通用规则', pricing: '3元', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '安徽木牍教育图书有限公司', brand: '木牍中考•名师教案', series: '同步配套', split: '不换页眉页脚，直接上传', pricing: '', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '安徽木牍教育图书有限公司', brand: '木牍中考•课时A计划', series: '同步配套', split: '通用规则', pricing: '3元', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '安徽木牍教育图书有限公司', brand: '木牍中考•课时A计划', series: '小册子', split: '不换页眉页脚，直接上传', pricing: '', publishTime: '立即发布', specialCase: '' },
    
    // 胶州市拾光树文化传媒中心
    { shop: '', shopname: '', name: '胶州市拾光树文化传媒中心', brand: '优学精讲', series: '高中同步', split: '通用规则', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '胶州市拾光树文化传媒中心', brand: '优学精研', series: '高考一轮总复习', split: '按资源类型建书上传', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '胶州市拾光树文化传媒中心', brand: '第一梯队', series: '高考二轮', split: '按资源类型建书上传', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '胶州市拾光树文化传媒中心', brand: '备考最优解', series: '高考二轮', split: '按资源类型建书上传', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    
    // 湖南书虫教育科技有限公司
    { shop: '', shopname: '', name: '湖南书虫教育科技有限公司', brand: '全效学习', series: '同步学练测', split: '通用规则', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    
    // 河北金卷教育科技有限公司
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '周测卷', split: '通用规则', pricing: '4元', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '专题卷', split: '通用规则', pricing: '4元', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '专项分组练', split: '通用规则', pricing: '4元', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '掌涵基础分自主小练', split: '通用规则', pricing: '4元', publishTime: '按教学进度发布', specialCase: '' },
    
    // 中学生数理化高中版编辑部
    { shop: '', shopname: '', name: '中学生数理化高中版编辑部', brand: '中学生数理化', series: '高中版', split: '通用规则', pricing: '1元', publishTime: '按教学进度发布', specialCase: '如有，参考特例说明' },
    
    // 山东中辰文化传媒有限公司
    { shop: '', shopname: '', name: '山东中辰文化传媒有限公司', brand: '中辰优学', series: '黄冈必刷卷', split: '通用规则', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '山东中辰文化传媒有限公司', brand: '中辰优学', series: '黄冈名卷', split: '通用规则', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '山东中辰文化传媒有限公司', brand: '中辰优学', series: '黄冈名师天练', split: '通用规则', pricing: '通用规则', publishTime: '按教学进度发布', specialCase: '' },
    { shop: '', shopname: '', name: '山东中辰文化传媒有限公司', brand: '中辰优学', series: '黄冈计算天练', split: '通用规则', pricing: '通用规则', publishTime: '按单元拆分', specialCase: '' },
    { shop: '', shopname: '', name: '山东中辰文化传媒有限公司', brand: '中辰优学', series: '小学毕业升学必备', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '参考特例试卷规则' },
    { shop: '', shopname: '', name: '山东中辰文化传媒有限公司', brand: '中辰优学', series: '期末真题汇编卷', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '参考特例试卷规则' },
    
    // 郑州启明星书业有限公司
    { shop: '', shopname: '', name: '郑州启明星书业有限公司', brand: '优才书系', series: '英才同步单元卷', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '郑州启明星书业有限公司', brand: '同步课课练', series: '小学同步课课练', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '' },
    
    // 梁山金大文化传媒有限公司
    { shop: '', shopname: '', name: '梁山金大文化传媒有限公司', brand: '创新大课堂', series: '高考二轮复习', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '梁山金大文化传媒有限公司', brand: '创新大课堂', series: '168优化重组卷', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '梁山金大文化传媒有限公司', brand: '创新大课堂', series: '高考一轮总复习', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '' },
    { shop: '', shopname: '', name: '梁山金大文化传媒有限公司', brand: '创新大课堂', series: '高中同步辅导与测试', split: '通用规则', pricing: '通用规则', publishTime: '立即发布', specialCase: '' },
    
    // 天津择数文化传媒有限公司
    { shop: '择数官方', shopname: '择数官方店铺', name: '天津择数文化传媒有限公司', brand: '择数', series: '高考闪电提分基础必刷1000题', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    
    // 洛阳字里行间文化传播有限公司 - 优品
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '初中单元与期末', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '日日清口算题卡', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '同步真题阅读精准练', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '小升初高题全优卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '小学同步测试卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '初中期末考试必刷卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '小学期末红100必刷卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '学业测评一卷通期末卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '初中全能训练', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品', series: '初中单元卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    
    // 洛阳字里行间文化传播有限公司 - 优品金题卷
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '初中单元与期末', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '日日清口算题卡', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '同步真题阅读精准练', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '小升初高题全优卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '小学同步测试卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '初中期末考试必刷卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '小学期末红100必刷卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '学业测评一卷通期末卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '初中全能训练', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳字里行间文化传播有限公司', brand: '优品金题卷', series: '初中单元卷', split: '通用规则', pricing: '通用规则', publishTime: '通用规则', specialCase: '' },
    
    // 河南捷睿必达教育科技有限公司 - 精准教学
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '星际题库精编版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '开学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '单元专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '期中测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '期末测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '期末过关检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '期末复习专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '精准教学', series: '期末押题密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南捷睿必达教育科技有限公司 - 能力培优
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '星际题库精编版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '开学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '单元专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '期中测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '期末测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '期末过关检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '期末复习专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '能力培优', series: '期末押题密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南捷睿必达教育科技有限公司 - 同步夯实基础
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '星际题库精编版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '开学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '单元专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '期中测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '期末测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '期末过关检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '期末复习专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '同步夯实基础', series: '期末押题密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南捷睿必达教育科技有限公司 - 期中期末复习
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '星际题库精编版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '开学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '单元专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '期中测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '期末测试AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '期末过关检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '期末复习专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南捷睿必达教育科技有限公司', brand: '期中期末复习', series: '期末押题密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山西英雅特教育科技有限公司 - 课堂在线
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '课堂在线', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '课堂在线', series: '高考英语听力课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '课堂在线', series: '高中同步英语听力课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '课堂在线', series: '初中英语语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '课堂在线', series: '高中英语语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山西英雅特教育科技有限公司 - 亿典教育
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '亿典教育', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '亿典教育', series: '高考英语听力课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '亿典教育', series: '高中同步英语听力课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '亿典教育', series: '初中英语语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '亿典教育', series: '高中英语语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山西英雅特教育科技有限公司 - 周报经典
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '周报经典', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '周报经典', series: '高考英语听力课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '周报经典', series: '高中同步英语听力课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '周报经典', series: '初中英语语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山西英雅特教育科技有限公司', brand: '周报经典', series: '高中英语语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 时代京版北京文化传播有限公司 - 大语文
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '大语文', series: '高中语文专项', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '大语文', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '大语文', series: '高中同步课时基础检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '大语文', series: '高中同步双测领航卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '大语文', series: '高考复习冲刺全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 时代京版北京文化传播有限公司 - 师大金卷
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '师大金卷', series: '高中语文专项', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '师大金卷', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '师大金卷', series: '高中同步课时基础检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '师大金卷', series: '高中同步双测领航卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '时代京版北京文化传播有限公司', brand: '师大金卷', series: '高考复习冲刺全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 洛阳燕川文化传播有限公司
    { shop: '', shopname: '', name: '洛阳燕川文化传播有限公司', brand: '豫燕川', series: '小升初总复习方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳燕川文化传播有限公司', brand: '豫燕川', series: '中考提分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 浙江金睿文化传媒有限公司 - 全效学习
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效学习', series: '初中同步课件及教参', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效学习', series: '期末综合复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效学习', series: '中考学练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效学习', series: '高中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 浙江金睿文化传媒有限公司 - 全效作业本
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效作业本', series: '初中同步课件及教参', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效作业本', series: '期末综合复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效作业本', series: '中考学练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江金睿文化传媒有限公司', brand: '全效作业本', series: '高中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 淄博书通数字文化发展有限公司
    { shop: '', shopname: '', name: '淄博书通数字文化发展有限公司', brand: '百川育人', series: '中考必刷真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '淄博书通数字文化发展有限公司', brand: '百川育人', series: '同步大试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '淄博书通数字文化发展有限公司', brand: 'A+金题', series: '中考必刷真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '淄博书通数字文化发展有限公司', brand: 'A+金题', series: '同步大试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东泉之源文化传媒有限公司
    { shop: '', shopname: '', name: '山东泉之源文化传媒有限公司', brand: '小作家报·读写天下', series: '高考复习阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东泉之源文化传媒有限公司', brand: '小作家报·读写天下', series: '高中同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 上海万瑞威尔文化创意有限公司
    { shop: '', shopname: '', name: '上海万瑞威尔文化创意有限公司', brand: '高中快车道', series: '高中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 沈阳庠序书刊有限公司
    { shop: '', shopname: '', name: '沈阳庠序书刊有限公司', brand: '考点大观', series: '全国中考真题分类一卷通', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 郑州纳睿文化传播有限公司
    { shop: '', shopname: '', name: '郑州纳睿文化传播有限公司', brand: '九级跳', series: '小升初衔接试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州纳睿文化传播有限公司', brand: '九级跳', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州纳睿文化传播有限公司', brand: '中考密卷', series: '小升初衔接试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州纳睿文化传播有限公司', brand: '中考密卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南小旗手图书销售有限公司
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '小四科', series: '活页好卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '小四科', series: '期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '小四科', series: '计算+应用题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '大王科', series: '活页好卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '大王科', series: '期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '大王科', series: '计算+应用题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '同步口算', series: '活页好卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '同步口算', series: '期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南小旗手图书销售有限公司', brand: '同步口算', series: '计算+应用题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南君德容文化传播有限公司
    { shop: '', shopname: '', name: '河南君德容文化传播有限公司', brand: '易中考', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南君德容文化传播有限公司', brand: '中考新方向', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 典创
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '典创', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 夺冠金卷
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '夺冠金卷', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 快乐练习单元卷
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '快乐练习单元卷', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 新思维小学奥数全解
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '新思维小学奥数全解', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 学练考
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '学练考', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 优学优练全能夺冠
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '优学优练全能夺冠', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 西安玖典文创科技有限公司 - 中考预测押题卷
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '小学期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '初中测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '高中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '小学测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '小学奥数', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '小学单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '中考专项模拟大小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '初中期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '初中单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安玖典文创科技有限公司', brand: '中考预测押题卷', series: '小学单元诊断试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 郑州荣恒图书发行有限公司 - 必考点
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学同步阶段测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学寒假专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学寒假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学语文句子训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学数学专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '初中期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '初中期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '初中练考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学练考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学思维导图训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '幼小衔接训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '初中数学运算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '初中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学阅读强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小学暑假专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '必考点', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 郑州荣恒图书发行有限公司 - 冲刺100分
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学同步阶段测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学寒假专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学寒假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学语文句子训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学数学专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '初中期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '初中练考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学练考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学思维导图训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '幼小衔接训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '初中数学运算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '初中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学阅读强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小学暑假专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '冲刺100分', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 郑州荣恒图书发行有限公司 - 黄冈快乐假期
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学同步阶段测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学寒假专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学寒假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学语文句子训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学数学专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '初中期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '初中练考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学练考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学思维导图训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '幼小衔接训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '初中数学运算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '初中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学阅读强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小学暑假专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州荣恒图书发行有限公司', brand: '黄冈快乐假期', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 博师在线
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '博师在线', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 冲刺吧期末
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大���众��文化发展有限公司', brand: '冲刺吧期末', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '冲刺吧期末', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 课课帮
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '课课帮', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 领跑
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展���限���司', brand: '领跑', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '领跑', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
// 大连众里文化发展有限公司 - 名校期末
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '名校期末', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 星阅读
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '���连众里文化发展有限公司', brand: '星阅读', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '星阅读', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 中考快递
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众��文化发展有限公司', brand: '中考快递', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限���司', brand: '中考快递', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '中考快递', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 备考
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备���', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里��化��展有限公司', brand: '备考', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '备考', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 必刷卷
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '必刷卷', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 培优计划
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文��发��有限公司', brand: '培优计划', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '培优计划', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 特训帮
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '特训帮', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 时文阅读
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学课时辅助��册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展���限���司', brand: '时文阅读', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '时文阅读', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 大连众里文化发展有限公司 - 深阅读
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中阶段测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中同步专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中综合测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学计算之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学课时辅助手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学默写之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学预习之星', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中古诗文课内必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中古诗文真题集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中语文课外文言文分层训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中同步检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '初中同步时文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学专题培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学同步作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学阅读写作培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学阅读培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学拉分提培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学课时小测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学基础培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学典型题专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学单元培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学听力培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学语法培优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学英语专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '大连众里文化发展有限公司', brand: '深阅读', series: '小学课课分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 太原四季文化图书有限公司 - 跟着课文背单词
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '跟着课文背单词', series: '英语词汇表', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '跟着课文背单词', series: '英语词汇手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '跟着课文背单词', series: '中考总复习指导用书', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 太原四季文化图书有限公司 - 金山背单词
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '金山背单词', series: '英语词汇表', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '金山背单词', series: '英语词汇手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '金山背单词', series: '中考总复习指导用书', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 太原四季文化图书有限公司 - 聚焦中考
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '聚焦中考', series: '英语词汇表', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '聚焦中考', series: '英语词汇手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原四季文化图书有限公司', brand: '聚焦中考', series: '中考总复习指导用书', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河北鸿浩教育科技有限公司 - 鸿浩教科
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '金典同步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '作文备考实打实', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '高考英语写作必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '一线调研 高中同步讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '数学解题技法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '备考夺分时鲜金素材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '鸿浩教科', series: '高考二轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河北鸿浩教育科技有限公司 - 一线调研
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '金典同步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '作文备考实打实', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '高考英语写作必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '一线调研 高中同步讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '数学解题技法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '备考夺分时鲜金素材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北鸿浩教育科技有限公司', brand: '一线调研', series: '高考二轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 梁山学易优文化传媒有限公司 - 学易优
    { shop: '', shopname: '', name: '梁山学易优文化传媒有限公司', brand: '学易优', series: '同步学案导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山学易优文化传媒有限公司', brand: '学易优', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山学易优文化传媒有限公司', brand: '学易优', series: '必刷题真题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 合肥市徽文文化传播有限公司 - 学仕邦
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '创新作业本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '大联考单元期末测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '中考科学集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '学仕邦', series: '阅读理解 完型填空', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 合肥市徽文文化传播有限公司 - 秒杀中考
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '创新作业本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '大联考单元期末测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '中考科学集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '秒杀中考', series: '阅读理解 完型填空', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 合肥市徽文文化传播有限公司 - 良师教案
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '创新作业本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '大联考单元期末测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '中考科学集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '中考试题汇���', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '良师教案', series: '阅读理解 完型填空', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 合肥市徽文文化传播有限公司 - 洪荒英语
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '创新作业本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '大联考单元期末测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '中考科学集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥市徽文文化传播有限公司', brand: '洪荒英语', series: '阅读理解 完型填空', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东一得文化科技有限公司 - 轮轮清
    { shop: '', shopname: '', name: '山东一得文化科技有限公司', brand: '轮轮清', series: '齐鲁名校大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 陕西灰犀牛图书策划有限公司 - 厚积薄发
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '中考源动力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '备考新思路', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '巅峰速查', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '核心词汇必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '话题读写必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '基础知识训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '教材词句诵读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '进阶训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '考前逆袭方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '考前新方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '命题点诠练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '模拟题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '题型题组集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '五行卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '学业水平考试模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '语言文字积累与梳理', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '长线战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '中考乾坤卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '中考听力复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '题型强化特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '全真模拟冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '临考热点手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '学业水平考试指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '原创模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '厚积薄发', series: '真题与拓展训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 陕西灰犀牛图书策划有限公司 - 一战成名
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '中考源动力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '备考新思路', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '巅峰速查', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '核心词汇必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '话题读写必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '基础知识训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '教材词句诵读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '进阶训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '考前逆袭方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '考前新方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '命题点诠练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '模拟题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '题型题组集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '五行卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '学业水平考试模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '语言文字积累与梳理', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '长线战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '中考乾坤卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '中考听力复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '题型强化特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '全真模拟冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '临考热点手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '学业水平考试指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '原创模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名', series: '真题与拓展训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 陕西灰犀牛图书策划有限公司 - 一战成名·新中考
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '中考源动力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '备考新思路', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '巅峰速查', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '核心词汇必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '话题读写必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '基础知识训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '教材词句诵读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '进阶训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '考前逆袭方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图���策���有限公司', brand: '一战成名·新中考', series: '考前新方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '命题点诠练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '模拟题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '题型题组集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '五行卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '学业水平考试模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '语言文字积累与梳理', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '长线战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '中考乾坤卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '中考听力复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '题型强化特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '全真模拟冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '临考热点手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '学业水平考试指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '原创模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '一战成名·新中考', series: '真题与拓展训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 陕西灰犀牛图书策划有限公司 - 中考密卷
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '中考源动力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '备考新思路', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '巅峰速查', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '核心词汇必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '话题读写必背', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '基础知识训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '教材词句诵读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '进阶训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '考前逆袭方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '考前新方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '命题点诠练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '模拟题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划��限��司', brand: '中考密卷', series: '题型题组集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '五行卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '学业水平考试模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '语言文字积累与梳理', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '长线战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '中考乾坤卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '中考听力复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '题型强化特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '全真模拟冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '临考热点手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '学业水平考试指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '原创模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西灰犀牛图书策划有限公司', brand: '中考密卷', series: '真题与拓展训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河北金卷教育科技有限公司 - 衡水金卷·先享题(补充)
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '单元检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '单元月结提升卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '调研卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '夯基模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '教学质量联合测评', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '考前悟题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '考试试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '摸底测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '模拟试题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '模拟押题密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '期末考试试题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '期末质量检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '期中试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '信息卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '压轴卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '语文要素教学设计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '月考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '质检考试试题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '周测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '周测月结提升卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北金卷教育科技有限公司', brand: '衡水金卷·先享题', series: '专项提分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东强联文化传媒有限公司 - 名校有约
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '高考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '学业水平考试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '一轮单元强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '过好假期每一天', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '走好高中第一步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '百强名校·优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '百强名校优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '单元滚动检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '复习讲义', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '高频考点电子图书教辅', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '考前热身卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '抢A计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '语文要素教学设计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '真题汇编试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '单元培优双测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '小升初衔接教程', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '冲刺名校卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '45分钟课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: 'AB双向分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '高分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '小题突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '小题突破·大题攻略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '水平模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校��约', series: '英语听力通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '教材衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '写字课课练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '计算全能', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '名校有约', series: '水平测试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东强联文化传媒有限公司 - 走好高中第一步
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '高考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '学业水平考试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '一轮单元强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '过好假期每一天', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '走好高中第一步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '百强名校·优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '百强名校优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '单元滚动检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '复习讲义', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '高频考点电子图书教辅', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '考前热身卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '抢A计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '语文要素教学设计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '真题汇编试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '单元培优双测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '小升初衔接教程', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '冲刺名校卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '45分钟课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: 'AB双向分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '高分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '小题突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '小题突破·大题攻略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '水平模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '英语听力通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '教材衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '写字课课练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '计算全能', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '走好高中第一步', series: '水平测试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东强联文化传媒有限公司 - 单元滚动检测示范卷
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '高考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '学业水平考试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '一轮单元强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '过好假期每一天', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '走好高中第一步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '百强名校·优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '百强名校优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '单元滚动检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '复习讲义', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '高频考点电子图书教辅', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '考前热身卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '抢A计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '语文要素教学设计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '真题汇编试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '单元培优双测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东���联���化传媒有限公司', brand: '单元滚动检测示范卷', series: '小升初衔接教程', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '冲刺名校卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '45分钟课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: 'AB双向分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '高分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '小题突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '小题突破·大题攻略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '水平模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '英语听力通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '教材衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '写字课课练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '计算全能', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '单元滚动检测示范卷', series: '水平测试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东强联文化传媒有限公司 - 高考解码
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '高考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '学业水平考试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '一轮单元强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '过好假期每一天', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '走好高中第一步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山��强联文化传媒有限公司', brand: '高考解码', series: '百强名校·优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '百强名校优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '单元滚动检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '复习讲义', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '高频考点电子图书教辅', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '考前热身卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '强化检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '抢A计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '语文要素教学设计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '真题汇编试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '单元培优双测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '小升初衔接教程', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '冲刺名校卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '45分钟课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: 'AB双向分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '分层检测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '高分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '小题突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '小题突破·大题攻略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '优化组合卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '水平模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '英语听力通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '教材衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '写字课课练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '计算全能', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东强联文化传媒有限公司', brand: '高考解码', series: '水平测试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 计算全能天天练
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '计算全能天天练', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 胜在
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 胜在阅读
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在阅读', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 学霸训练
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '学霸训练', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 训练达人
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '训练达人', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 阅读达人
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '阅读达人', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 济南小鸣同学教育科技有限公司 - 胜在中考
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '初中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '高中英语词霸笔记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '同步阅读与写话全能训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '高中英语七选五', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '完形填空阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '初中阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '济南小鸣同学教育科技有限公司', brand: '胜在中考', series: '同步教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 中山市思而优文化发展有限公司 - 思而优
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '超级中考班中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '高图英语初中同步周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '全程突破初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '全程突破同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '全程突破小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '全程突破小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '全程突破小学同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '中考突破中考信息卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '中考突破中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '中考新考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '高图英语周周练初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '中考突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '思而优', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 中山市思而优文化发展有限公司 - 超级备考
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '超级中考班中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '高图英语初中同步周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '全程突破初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '全程突破同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '全程突破小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '全程突破小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '全程突破小学同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '中考突破中考信息卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '中考突破中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '中考新考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '高图英语周周练初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '中考突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '中山市思而优文化发展有限公司', brand: '超级备考', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 洛阳朝霞文化股份有限公司 - 王朝霞系列丛书
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '初中同步考点梳理时习卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '初中同步期末真题精选', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '河南省中考真题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '河南中考名师预测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛��朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小升初重点校毕业升学及招生分班必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小升初重点校毕业升学及招生分班模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小升初重点校各地真题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小升初重点学校考前突破密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学期末试卷精选', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学期末试卷研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学期末真题精选', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学少而精期末活页卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学同步创维新课堂优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学同步考点梳理时习卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学同步培优100分单元AB卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学同步少而精单元活页卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学同步知识集锦1+1', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学雁塔新题期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '中考名师预测卷（8套+1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学口算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '德才兼备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '期末冲刺抢分计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '初中期末试卷研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '初中期末试卷精选', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳朝霞文化股份有限公司', brand: '王朝霞系列丛书', series: '小学期末冲刺课内阅读押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东孟儒文化传媒有限公司 - 天籁英语
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁英语', series: '听力仿真强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁英语', series: '听力专项模拟训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁英语', series: '晨读晚练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁英语', series: '初中英语听力训练与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东孟儒文化传媒有限公司 - 天籁
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁', series: '听力仿真强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁', series: '听力专项模拟训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁', series: '晨读晚练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东孟儒文化传媒有限公司', brand: '天籁', series: '初中英语听力训��与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 金华市合创展教育图书有限公司 - 同步宝典
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '高中同步课程精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '高中同步知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '高中复习方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '选考宝典课程精炼', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '同步宝典', series: '高中选考宝典知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 金华市合创展教育图书有限公司 - 学考一号
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '学考一号', series: '高中同步课程精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '学考一号', series: '高中同步知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '学考一号', series: '高中复习方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '学考一号', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '学考一号', series: '选考宝典课程精炼', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '学考一号', series: '高中选考宝典知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 金华市合创展教育图书有限公司 - 选考一号
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '选考一号', series: '高中同步课程精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '选考一号', series: '高中同步知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '选考一号', series: '高中复习方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '选考一号', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '选考一号', series: '选考宝典课程精炼', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '选考一号', series: '高中选考宝典知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 金华市合创展教育图书有限公司 - 暑假一号
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '暑假一号', series: '高中同步课程精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '暑假一号', series: '高中同步知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '暑假一号', series: '高中复习方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '暑假一号', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '暑假一号', series: '选考宝典课程精炼', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '暑假一号', series: '高中选考宝典知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 金华市合创展教育图书有限公司 - 衔接宝典
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '衔接宝典', series: '高中同步课程精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '衔接宝典', series: '高中同步知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '衔接宝典', series: '高中复习方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '衔接宝典', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '衔接宝典', series: '选考宝典课程精炼', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '衔接宝典', series: '高中选考宝典知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 金华市合创展教育图书有限公司 - 尖峰学堂
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '尖峰学堂', series: '高中同步课程精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '尖峰学堂', series: '高中同步知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '尖峰学堂', series: '高中复习方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '尖峰学堂', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '尖峰学堂', series: '选考宝典课程精炼', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '金华市合创展教育图书有限公司', brand: '尖峰学堂', series: '高中选考宝典知识手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 保定市三合图书销售有限公司 - 教材全解全析
    { shop: '', shopname: '', name: '保定市三合图书销售有限公司', brand: '教材全解全���', series: '小学同步教学教材解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 荆州市南宇图书有限公司 - 巅峰中考
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '中考试题专题训练(一二轮必备)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '小学同步单元测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '小升初高效课堂总复习突破模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '小升初总复习高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '小学同步高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '小学同步新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '初中同步备课资源新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '初中同步高效课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '初中同步高效课堂教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '初中同步高效课堂速记手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '初中同步课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '中考试题专题训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '中考总复习讲练册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '巅峰中考', series: '中考总复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 荆州市南宇图书有限公司 - 探究100分
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '中考试题专题训练(一二轮必备)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '小学同步单元测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '小升初高效课堂总复习突破模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '小升初总复习高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '小学同步高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市���宇���书有限公司', brand: '探究100分', series: '小学同步新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '初中同步备课资源新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '初中同步高效课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '初中同步高效课堂教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '初中同步高效课堂速记手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '初中同步课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '中考试题专题训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '中考总复习讲练册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究100分', series: '中考总复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 荆州市南宇图书有限公司 - 探究乐园
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '中考试题专题训练(一二轮必备)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '小学同步单元测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '小升初高效课堂总复习突破模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '小升初总复习高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '小学同步高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '小学同步新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '初中同步备课资源新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '初中同步高效课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '初中同步高效课堂教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '初中同步高效课堂速记手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '初中同步课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '���究���园', series: '中考试题专题训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '中考总复习讲练册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究乐园', series: '中考总复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 荆州市南宇图书有限公司 - 探究在线
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '中考试题专题训练(一二轮必备)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '小学同步单元测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '小升初高效课堂总复习突破模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '小升初总复习高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '小学同步高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '小学同步新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '初中同步备课资源新教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '初中同步高效课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '初中同步高效课堂教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '初中同步高效课堂速记手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '初中同步课堂导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '中考试题专题训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '中考总复习讲练册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '荆州市南宇图书有限公司', brand: '探究在线', series: '中考总复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 初中学霸创新题
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸创新题', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 小学教材搭档
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学教材搭档', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '��东绿卡教育科技有限公司', brand: '小学教材搭档', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 小学学霸冲A卷
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸冲A卷', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 小学学霸默写
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸默写', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 小学学霸速记
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '小学学霸速记', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 学霸作业本
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '学霸作业本', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 初中学霸冲A卷
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '初中学霸冲A卷', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 绿卡创新题
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡创新题', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 山东绿卡教育科技有限公司 - 绿卡作业本
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '小学同步知识清单', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '小学同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '小学同步期末大通关', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '小学同步配套课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '初中同步备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东绿卡教育科技有限公司', brand: '绿卡作业本', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 陕西炼书客图书策划有限公司 - 练客
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '初中同步必背古诗文全梳理', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '初中同步高分默写', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '初中同步高分速记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '初中同步高分听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '初中同步精编期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考高分阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考零失分限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考提优方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考天天小卷一练提优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考新思路抓分卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考英语高分听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考真题精选', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考总复习新思路', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考提优', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考真题精选+提分小卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考高分速查', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '奔跑突围卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '中考红枣卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '陕西炼书客图书策划有限公司', brand: '练客', series: '新中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南鼎成教育科技有限公司
    { shop: '', shopname: '', name: '河南鼎成教育科技有限公司', brand: '鼎成中考', series: '精准提分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南鼎成教育科技有限公司', brand: '鼎成中考', series: '活页好题', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河南领扬文化传播有限公司
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '领扬中考卷', series: '中考必刷冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '领扬中考卷', series: '中考模拟预测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '领扬中考卷', series: '中考信息调整卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '领扬中考卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '领扬中考卷', series: '初中同步期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '完美期末卷', series: '中考必刷冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '完美期末卷', series: '中考模拟预测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '完美期末卷', series: '中考信息调整卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '完美期末卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南领扬文化传播有限公司', brand: '完美期末卷', series: '初中同步期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川汇合明聚教育科技有限公司 - 5i英语
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '名校名师大考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '同步测评卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '同步单元导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '总复习名校题库', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '同步听读说', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '简学阅读·B卷周计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '小学英语话题阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '5i英语', series: '英语易过关', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川汇合明聚教育科技有限公司 - 鼎尖小考
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '名校名师大考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '同步测评卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '同步单元导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '总复习名校题库', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '同步听读说', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '简学阅读·B卷周计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '小学英语话题阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '鼎尖小考', series: '英语易过关', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川汇合明聚教育科技有限公司 - 学英语
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '名校名师大考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '同步测评卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '同步单元导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '总复习名校题库', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '同步听读说', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '简学阅读·B卷周计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '小学英语话题阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '学英语', series: '英语易过关', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川汇合明聚教育科技有限公司 - 壹道学
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '名校名师大考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '同步测评卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '同步单元导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '总复习名校题库', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '同步听读说', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '简学阅读·B卷周计划', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '小学英语话题阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川汇合明聚教育科技有限公司', brand: '壹道学', series: '英语易过关', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 洛阳贵海图书有限公司
    { shop: '', shopname: '', name: '洛阳贵海图书有限公司', brand: '开心作业', series: '基础教研', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳贵海图书有限公司', brand: '开心作业', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳贵海图书有限公司', brand: '特优冲刺100分', series: '基础教研', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳贵海图书有限公司', brand: '特优冲刺100分', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 北京成大文教科技有限公司 - 思考力阅读
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '阅读理解 完型填空 语法填空 七选五 读后续写 概要写作 微写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '新课标听力水平测试标准训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '听力考点综合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '听力微技能分级集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '听力微技能考场集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '听力考点标准训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '真题真练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '思考力阅读', series: '尖子生听力论道', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 北京成大文教科技有限公司 - 英语宝典
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '阅读理解 完型填空 语法填空 七选五 读后续写 概要写作 微写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '新课标听力水平测试标准训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '听力考点综合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '听力微技能分级集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '听力微技能考场集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '听力考点标准训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '真题真练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '英语宝典', series: '尖子生听力论道', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 北京成大文教科技有限公司 - 百特英语
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '阅读理解 完型填空 语法填空 七选五 读后续写 概要写作 微写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '新课标听力水平测试标准训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '听力考点综合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '听力微技能分级集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '听力微技能考场集训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '听力考点标准训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '真题真练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京成大文教科技有限公司', brand: '百特英语', series: '尖子生听力论道', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 河北斗米文化传媒有限公司
    { shop: '', shopname: '', name: '河北斗米文化传媒有限公司', brand: '压轴题', series: '初中真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北斗米文化传媒有限公司', brand: '压轴题', series: '初中期末押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北斗米文化传媒有限公司', brand: '押题卷', series: '初中真题汇编卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北斗米文化传媒有限公司', brand: '押题卷', series: '初中期末押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 南京冠途文化传播有限公司
    { shop: '', shopname: '', name: '南京冠途文化传播有限公司', brand: '金科大联考', series: '质量检测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京冠途文化传播有限公司', brand: '金科大联考', series: '月考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京冠途文化传播有限公司', brand: '金科大联考', series: '联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京冠途文化传播有限公司', brand: '金科大联考', series: '期中卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 保定桃李源文化传播有限公司
    { shop: '', shopname: '', name: '保定桃李源文化传播有限公司', brand: '桃李源', series: '必刷题', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川多能教育书业有限公司 - 假期成才路
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '初中暑假复习与衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '闯关中考中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '导学探究初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '课堂优化初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '神州中考中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '针对学习小学同步课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '中考前沿中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '初中寒假复习与衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '中考1对1', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '高考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '高考导航', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '假期成才路', series: '针对学习小学同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川多能教育书业有限公司 - 指南针
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '初中暑假复习与衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '闯关中考中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '导学探究初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '课堂优化初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '神州中考中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '针对学习小学同步课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '中考前沿中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '初中寒假复习与衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '中考1对1', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '高考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '高考导航', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '指南针', series: '针对学习小学同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    
    // 四川多能教育书业有限公司 - 冲锋舟
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '初中暑假复习与衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '闯关中考中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '导学探究初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '课堂优化初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '神州中考中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '针对学习小学同步课时练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '中考前沿中考复习备考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '初中寒假复习与衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '中考1对1', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '高考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '高考导航', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川多能教育书业有限公司', brand: '冲锋舟', series: '针对学习小学同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南突唯文化传播有限公司
    { shop: '', shopname: '', name: '河南突唯文化传播有限公司', brand: '一战通关', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 梁山智源数字化科技有限公司
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '金榜设计', series: '中招模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '金榜设计', series: '模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '金榜设计', series: '考试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '金榜设计', series: '中招押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '双基聚焦', series: '中招模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '双基聚焦', series: '模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '双基聚焦', series: '考试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '双基聚焦', series: '中招押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '新高考3+3', series: '中招模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '新高考3+3', series: '模拟测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '新高考3+3', series: '考试一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山智源数字化科技有限公司', brand: '新高考3+3', series: '中招押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南天疆教育科技有限公司
    { shop: '', shopname: '', name: '河南天疆教育科技有限公司', brand: '天疆中考', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 洛阳大爱图书有限公司
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '非常阅读', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '黄金模拟卷', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '考点通', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '满分作文', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '同步拓展阅读训练', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '整本书阅读', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '智慧解析', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考刷题必备', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考真题分类必刷', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '���学作文帮', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '初中作文36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中学作文帮', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '初中现代文阅读制胜密码', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考复习模拟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考复习训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考疑难要点名师解析', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考作文帮分类训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '初中同步阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '初中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '高中生必读经典名著指导手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考语文现代文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考复习专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '初���作���36计', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '初中作文72变', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '初中作文方法大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考满分作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳大爱图书有限公司', brand: '中考必备', series: '中考试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南省新优学教育科技有限公司
    { shop: '', shopname: '', name: '河南省新优学教育科技有限公司', brand: '河南中考', series: '金8套仿真卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南省新优学教育科技有限公司', brand: '河南中考', series: '满分作文十年经典', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南省新优学教育科技有限公司', brand: '河南中考', series: '名著精讲精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南省新优学教育科技有限公司', brand: '河南中考', series: '命题非常解读', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书���销���限公司', brand: '千里马', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '千里马', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '��径千里马', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径千里马', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司 - 勤径小学升
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径小学升', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司 - 勤径学升
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '��考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈��滨勤为径图书经销有限公司', brand: '勤径学升', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '勤径学升', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司 - 小学升
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初��随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学��', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨��为��图书经销有限公司', brand: '小学升', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '小学升', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司 - 中考123
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔���勤为径图书经销有限公司', brand: '中考123', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考123', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司 - 中考全程复习
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为��图��经销有限公司', brand: '中考全程复习', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学课文作家作品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '中考全程复习', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 哈尔滨勤为径图书经销有限公司 - 领跑者
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中生必读名著精读精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '经典名著青少版', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '脑写同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '同步阅读与写作', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '文言文精析精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '系统基础复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学字词句段篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '英语完形填空与阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '英语阅读理解专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中卷国文素养读本', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '丁咚上学记', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '跟我一起科学冒险', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '红色经典系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '课外阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '快乐读书吧', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '竖式脱式同步计算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '同步脑写字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学课文作��作��', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学口算天天练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学期末仿真试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学随堂小练10分钟', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学同步应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '英语听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '英语听力应试策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学同步口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中阅读卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '高考一轮考点增分练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '高考一轮通关卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '高中同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '全程时习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '周周测单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中同步全程导练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考必备试题精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考二轮仿真大联考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考二轮复习必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考三轮全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考总复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '仿真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学计算小达人', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '中考全程复习测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '基础章节总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '小学走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '初中走向假期', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '速记速算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '同步练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '哈尔滨勤为径图书经销有限公司', brand: '领跑者', series: '考前十五天复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东一帆融媒教育科技有限公司
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考二轮复习专题辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '创新方案', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考二轮复习专���辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '名校之约', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考二轮复习专题辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新高考方案', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考二轮复习专题辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '新课程学案', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考二轮复习专题辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆���媒教育科技有限公司', brand: '芝麻开花', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '芝麻开花', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考二轮复习专题辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '优化大考卷', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考二轮复习专题辅导与测试', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高三总复习一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高中同步创新课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考模拟押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考一轮单元阶段检测示范卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考二轮专题增分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考复习一书三用（一轮二轮冲刺）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考浙江二次选考专题增分方略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高中同步导学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考二轮专题突破卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '微积分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '时事政治', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '作文帆', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东一帆融媒教育科技有限公司', brand: '一帆工具书', series: '非常听力', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 滨州市众邦图书有限公司
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '夺冠金考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '初中同步基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '初中同步现代文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '初中同步语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高考基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高考文言文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高考文言文专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高考语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高中古诗文必背古诗文赏析与训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高中古诗文强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高中同步基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高中同步语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高中阅读题抢分专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '课外文言文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '小学同步基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '小学同步语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '中考古诗文课文赏析与课外拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '中考基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '中考文言文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '中考现代文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '中考语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '学习帮', series: '高考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '夺冠金考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '初中同步基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '初中同步现代文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '初中同步语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高考基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高考文言文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高考文言文专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高考语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高中古诗文必背古诗文赏析与训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高中古诗文强化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高中同步基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高中同步语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高中阅读题抢分专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '课外文言文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '小学同步基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '小学同步语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '中考古诗文课文赏析与课外拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '中考基础小练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '中考文言文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '中考现代文阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '中考语文升格作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州市众邦图书有限公司', brand: '语文帮', series: '高考复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 西安华梦文创科技有限公司
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '核心素养阅读', series: '阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '核心素养阅读', series: '口算练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '核心素养阅读', series: '应��题��习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '核心素养阅读', series: '课时精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '核心素养阅读', series: '全程自测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '核心素养阅读', series: '专项强训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '口算天天练', series: '阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '口算天天练', series: '口算练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '口算天天练', series: '应用题练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '口算天天练', series: '课时精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '口算天天练', series: '全程自测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '口算天天练', series: '专项强训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '应用题天天练', series: '阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '应用题天天练', series: '口算练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '应用题天天练', series: '应用题练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '应用题天天练', series: '课时精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '应用题天天练', series: '全程自测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '应用题天天练', series: '专项强训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '培优精练', series: '阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '培优精练', series: '口算练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '培优精练', series: '应用题练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '培优精练', series: '课时精练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '培优精练', series: '全程自测卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '西安华梦文创科技有限公司', brand: '培优精练', series: '专项强训', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 文科创新（北京）教育科技有限公司
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '高考总复习典型真题分析与巧解方法点拨', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '高考总复习核心考点大全与特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '中考总复习典型真题分析与巧解方法点拨', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '中考总复习核心考点大全与特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '新高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '初中同步数学阅读课', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '给力数学', series: '小学同步数学阅读课', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '高考总复习典型真题分析与巧解方法点拨', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '高考总复习核心考点大全与特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '中考总复习典型真题分析与巧解方法点拨', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '中考总复习核心考点大全与特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '新高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '初中同步数学阅读课', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '优佳设计', series: '小学同步数学阅读课', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '高考总复习典型真题分析与巧解方法点拨', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '高考总复习核心考点大全与特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '中考总复习典型真题分析与巧解方法点拨', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '中考总复习核心考点大全与特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '新高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '初中同步数学阅读课', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '文科创新（北京）教育科技有限公司', brand: '有趣的数学文化', series: '小学同步数学阅读课', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南晨勤文化传媒有限公司
    { shop: '', shopname: '', name: '河南晨勤文化传媒有限公司', brand: '名师优题', series: '小学同步卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 郑州海豚图书有限公司
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '非连续性文本阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '古诗文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '基础知识读练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '名著考点导练与综合性学习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '文言文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州海豚图书有限公司', brand: '大语文阅读', series: '现代文国学训练', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 滨州稼和明文化传媒有限公司
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学高效课时100', series: '课时同步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学高效课时100', series: '测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学高效课时100', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学高效课时100', series: '升学全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学知识与能力测试卷', series: '课时同步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学知识与能力测试卷', series: '测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学知识与能力测试卷', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学知识与能力测试卷', series: '升学全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学总复习 我爱学习', series: '课时同步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学总复习 我爱学习', series: '测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学总复习 我爱学习', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '小学总复习 我爱学习', series: '升学全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '新课堂', series: '课时同步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '新课堂', series: '测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '新课堂', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '滨州稼和明文化传媒有限公司', brand: '新课堂', series: '升学全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南文轩文化传播有限公司
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '中考必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '小学假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '小学随堂手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '小学同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '小学阅读真题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线课堂', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '中考必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '小学假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '小学随堂手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '小学同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '小学阅读真题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新考典', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '中考必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '小学假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '小学随堂手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '小学同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '小学阅读真题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '新一线必刷卷', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '中考必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '小学假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '小学随堂手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '小学同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '小学阅读真题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '假期复习计划', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '中考必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '小学假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '小学随堂手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '小学同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '小学阅读真题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '小状元', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '中考必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '小学假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '小学随堂手册', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '小学同步作文', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '小学阅读真题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河南文轩文化传播有限公司', brand: '一线优选卷', series: '初中期末冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖南天一文化发展有限公司
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '湖湘名校教育联合体', series: '高中联考试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '湖湘名校教育联合体', series: '高中联考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '三湘名校教育联盟', series: '高中联考试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '三湘名校教育联盟', series: '高中联考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '天壹名校联盟', series: '高中联考试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '天壹名校联盟', series: '高中联考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '湖南省T8联盟', series: '高中联考试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖南天一文化发展有限公司', brand: '湖南省T8联盟', series: '高中联考系列', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东众旺汇金教育科技有限公司
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '名师导航', series: '高考一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '名师导航', series: '高中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '名师导航', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '名师导航', series: '高考二轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '名师导航', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山��众旺汇金教育科技有限公司', brand: '提分教练', series: '高考一轮', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '提分教练', series: '高中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '提分教练', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '提分教练', series: '高考二轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东众旺汇金教育科技有限公司', brand: '提分教练', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东名师文化传媒有限公司
    { shop: '', shopname: '', name: '山东名师文化传媒有限公司', brand: '艺术生文化课考前100天', series: '高考艺考', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京三爱创新教育科技中心
    { shop: '', shopname: '', name: '北京三爱创新教育科技中心', brand: '读者报', series: '小学同步创新作文', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河北艾玛文化发展有限公司
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '小学复习助力卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '小学英语阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '小升初英语精品卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '小学英语同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '艾玛', series: '小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '小学复习助力卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '小学英语阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '小升初英语精品卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '小学英语同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '默写100分', series: '小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '小学复习助力卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '小学英语阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '小学语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '小升初英语精品卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '小学英语同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北艾玛文化发展有限公司', brand: '提分方案', series: '小升初总复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 洛阳九歌文化传播有限公司
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '招生分班卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '小考专家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '冲刺密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '必练密题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '期末大赢家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '直击考点与单元双测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '口算题卡', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '高升无忧', series: '小学毕业升学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '招生分班卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '小考专家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '冲刺密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '必练密题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '期末大赢家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '直击考点与单元双测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '口算题卡', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '锦上添花', series: '小学毕业升学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '招生分班卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '小考专家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '冲刺密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '必练密题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '期末大赢家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '直击考点与单元双测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '��手��算', series: '口算题卡', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '圣手神算', series: '小学毕业升学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '招生分班卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '小考专家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '冲刺密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '必练密题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '期末大赢家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '直击考点与单元双测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '口算题卡', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '易考100', series: '小学毕业升学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '招生分班卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '小考专家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '冲刺密卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '必练密题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '期末大赢家', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '直击考点与单元双测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '口算题卡', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '洛阳九歌文化传播有限公司', brand: '重点校', series: '小学毕业升学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南典学文化传播有限公司
    { shop: '', shopname: '', name: '河南典学文化传播有限公司', brand: '爱典学', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东学智文化传媒有��公��
    { shop: '', shopname: '', name: '山东学智文化传媒有限公司', brand: '直击高考', series: '高考精选卷仿真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 武汉睿芯教育科技有限公司
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中教师用书', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中暑假衔接期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中周末练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '名校课堂', series: '初中单元+期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中教师用书', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中期末试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中暑假衔接期末复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中周末练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '武汉睿芯教育科技有限公司', brand: '火线100天', series: '初中单元+期末卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 辽宁教育周报出版有限公司
    { shop: '', shopname: '', name: '辽宁教育周报出版有限公司', brand: '在线学堂', series: '同步教辅精品课堂', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 江苏通典文化传媒集团有限公司
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '小升初真卷精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '尖子生学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '暑期升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '寒假升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '决战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '决战小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '拔尖特训', series: '小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '小升初真卷精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '尖子生学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '暑期升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '寒假升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '决战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '决战小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成1典', series: '小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '小升初真卷精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '尖子生学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '暑��升��训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '寒假升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '决战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '决战小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '通成学典', series: '小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '小升初真卷精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '尖子生学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '暑期升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '寒假升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '决战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '决战小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '分类精粹', series: '小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '小升初真卷精编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '尖子生学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '小学总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '暑期升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '寒假升级训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '决战中考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '决战小考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '江苏通典文化传媒集团有限公司', brand: '试卷精编', series: '小考', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东瀚海书韵教育科技有限公司
    { shop: '', shopname: '', name: '山东瀚海书韵教育科技有限公司', brand: '导与练', series: '高考二轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东瀚海书韵教育科技有限公司', brand: '导与练', series: '高考仿真冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东瀚海书韵教育科技有限公司', brand: '导与练', series: '高考古诗文背诵推荐篇目', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东瀚海书韵教育科技有限公司', brand: '导与练', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东瀚海书韵教育科技有限公司', brand: '导与练', series: '高中同步全程学习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 长沙零起点文化传播有限公司
    { shop: '', shopname: '', name: '长沙零起点文化传播有限公司', brand: '高考零起点', series: '老高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '长沙零起点文化传播有限公司', brand: '高考零起点', series: '新高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '长沙零起点文化传播有限公司', brand: '高考零起点', series: '中职专用', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北稳派教育科技有限公司
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: 'T8联考', series: '高考联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: 'T8联考', series: '高考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: 'T8联考', series: '高中同步联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: 'T8联考', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派教育', series: '高考联��卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派教育', series: '高考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派教育', series: '高中同步联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派教育', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派六脉卷', series: '高考联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派六脉卷', series: '高考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派六脉卷', series: '高中同步联考卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北稳派教育科技有限公司', brand: '稳派六脉卷', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北盈未来教育科技有限公司
    { shop: '', shopname: '', name: '湖北盈未来教育科技有限公司', brand: '新领程', series: '小学同步高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北盈未来教育科技有限公司', brand: '新领程', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北盈未来教育科技有限公司', brand: '新领程', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北盈未来教育科技有限公司', brand: '优翼·学练优', series: '小学同步高效课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北盈未来教育科技有限公司', brand: '优翼·学练优', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北盈未来教育科技有限公司', brand: '优翼·学练优', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 梁山县文轩图书有限公司
    { shop: '', shopname: '', name: '梁山县文轩图书有限公司', brand: '致胜中考', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山县文轩图书有限公司', brand: '致胜中考', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山县文轩图书有限公司', brand: '标准课堂', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山县文轩图书有限公司', brand: '标准课堂', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 郑州邦尔学文化传媒有限公司
    { shop: '', shopname: '', name: '郑州邦尔学文化传媒有限公司', brand: '多维课时练', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州邦尔学文化传媒有限公司', brand: '多维课时练', series: '初中英语专项', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州邦尔学文化传媒有限公司', brand: '五维英语', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '郑州邦尔学文化传媒有限公司', brand: '五维英语', series: '初中英语专项', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 浙江良品图书有限公司
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '高考汇编与名师优创', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '高考尖峰', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '高中同步教师专用', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '高中同步课程探究与巩固', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '精品课堂', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '名师优创微专题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '新问题导引一题一课核心微专题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '选考尖峰', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '学考尖峰', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '中考高效作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '中考教师专用', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '中考题型卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '中考中档题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '中考专题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '中考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '初中同步教师专用', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '初中同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '高中暑假作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '浙江良品图书有限公司', brand: '精彩三年', series: '就练这一本', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京金海豚教育科技有限公司 - 一启阅
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步英语词汇专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习七选五、语法填空与短文改错优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习听力限时训练模拟优化52套', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习语法优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步七选五、语法填空与短文改错优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步听力限时训练模拟优化52套', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步完形填空与阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步主题阅读优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步拓展阅读120篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习听力限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习完形填空与阅读理解限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习语法优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考英语词汇专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步词汇与语法踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步时文完形填空与阅理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步素养拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步完形阅读与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步完型填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习五项全练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考复习阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考英语新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中���步五项全练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步新高中语法必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中同步阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高中英语新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步101句学透语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步素养拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步听力100篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步英语阅读理解100篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习时文完形填空与阅理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习时文阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习限时训练(3合1)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考复习阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '中考完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '高考奥赛自主招生知识思维能力对接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步培优必练50题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步数学计算题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步数学口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '初中同步单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步数学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步英语阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学同步语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '一启阅', series: '小学英语作文', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京金海豚教育科技有限公司 - 应用题天天练
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步素养阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步文言文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步现代文与古诗文踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中语文基础知识专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习古诗文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中语文基础知识专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习素养阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习文言文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习现代文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中毕业升学英语总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步词汇&语法&阅读&听说&写作五步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步随堂测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步听力限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步完形填空与阅读理解限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步完形填空与阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步英语词汇专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习七选五、语法填空与短文改错优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习听力限时训练模拟优化52套', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习语法优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步七选五、语法填空与短文改错优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有��公��', brand: '应用题天天练', series: '高中同步听力限时训练模拟优化52套', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步完形填空与阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步主题阅读优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步拓展阅读120篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习听力限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习完形填空与阅读理解限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习语法优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考英语词汇专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步词汇与语法踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步时文完形填空与阅理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步素养拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步完形阅读与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步完型填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习五项全练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考复习阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考英语新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步五项全练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步新高中语法必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中同步阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高中英语新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步101句学透语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步素养拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步听力100篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步英语阅读理解100篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习时文完形填空与阅理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习时文阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习限时训练(3合1)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考复习阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '中考完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '高考奥赛自主招生知识思维能力对接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步培优必练50题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步数学计算题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步数学口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '初中同步单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步数学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步英语阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学同步语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '应用题天天练', series: '小学英语作文', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京金海豚教育科技有限公司 - 阅读理解100篇
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步素养阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步文言文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步现代文与古诗文踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中语文基础知识专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习古诗文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中语文基础知识专项训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习素养阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习文言文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习现代文阅读踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中毕业升学英语总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步词汇&语法&阅读&听说&写作五步练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步随堂测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步听力限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步完形填空与阅读理解限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步完形填空与阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步英语词汇专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习七选五、语法填空与短文改错优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习听力限时训练模拟优化52套', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习语法优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步七选五、语法填空与短文改错优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步听力限时训练模拟优化52套', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步完形填空与阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步主题阅读优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步拓展阅读120篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习听力限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习完形填空与阅读理解限时训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海���教���科技有限公司', brand: '阅读理解100篇', series: '中考复习语法优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习阅读理解优化训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考英语词汇专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步词汇与语法踩点夺分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步时文完形填空与阅理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步素养拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步完形阅读与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步完型填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习五项全练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考复习阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考英语新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步五项全练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步限时训练（3合1）', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步新高中语法必备', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中同步阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高中英语新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步101句学透语法', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步素养拓展阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步听力100篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步英语阅读理解100篇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习法分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习时文完形填空与阅理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习时文阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习听力分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习限时训练(3合1)', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习新题型专练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '���京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考复习阅读理解', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '中考完形填空与阅读理解分层突破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '高考奥赛自主招生知识思维能力对接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步培优必练50题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步数学计算题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步数学口算', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '初中同步单元卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步数学应用题', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步英语阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学同步语文阅读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京金海豚教育科技有限公司', brand: '阅读理解100篇', series: '小学英语作文', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山西唐文文化发展有限公司
    { shop: '', shopname: '', name: '山西唐文文化发展有限公司', brand: '速记掌中宝', series: '小学语文速记', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南长风教育科技有限公司
    { shop: '', shopname: '', name: '河南长风教育科技有限公司', brand: '试题与研究', series: '中考试题与研究精讲', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东海之星图书有限公司
    { shop: '', shopname: '', name: '山东海之星图书有限公司', brand: '新视野', series: '阅读训练', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河南硕源教育咨询有限公司
    { shop: '', shopname: '', name: '河南硕源教育咨询有限公司', brand: '名师解密', series: '中考热点试题汇编', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北梦之组文化传播有限公司
    { shop: '', shopname: '', name: '湖北梦之组文化传播有限公司', brand: '互动英语', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北梦之组文化传播有限公司', brand: '互动英语', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北梦之组文化传播有限公司', brand: '互动英语', series: '幼儿互动', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 南京经纶文化传媒有限公司
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '高考黑白题', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '经纶学典', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '锁定高考', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸大题小做', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸典中典', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考●白题', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸黑白题', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸题中题', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传���有���公司', brand: '学霸组合训练', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸组合训练', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '高考大组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '高考疯狂小题抢高分', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '高考古诗文64篇+古代文化知识', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '高中同步学霸组合训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '小学同步学霸提高班', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '小学同步学霸提优辅导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '小学同步学霸提优练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '高中同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南京经纶文化传媒有限公司', brand: '学霸高考·蓝题', series: '新高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 梁山儒舟文化传媒有限公司
    { shop: '', shopname: '', name: '梁山儒舟文化传媒有限公司', brand: '登攀优秀作文', series: '作文产品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山儒舟文化传媒有限公司', brand: '登攀优秀作文', series: '小学字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山儒舟文化传媒有限公司', brand: '四点格练字帖', series: '作文产品', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '梁山儒舟文化传媒有限公司', brand: '四点格练字帖', series: '小学字帖', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 华版（北京）文化有限公司
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '衡中课堂', series: '课时周测月考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '衡中课堂', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '衡中课堂', series: '321高考大演练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '衡中课堂', series: '高考猜题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '考前信息卷', series: '课时周测月考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '考前信息卷', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '考前信息卷', series: '321高考大演练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '考前信息卷', series: '高考猜题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '相约高考', series: '课时周测月考', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '相约高考', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '相约高考', series: '321高考大演练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '华版（北京）文化有限公司', brand: '相约高考', series: '高考猜题卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 陕西志立文化发展有限公司
    { shop: '', shopname: '', name: '陕西志立文化发展有限公司', brand: '知识金典', series: '小学新课标试卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 高途教育科技集团有限公司
    { shop: '', shopname: '', name: '高途教育科技集团有限公司', brand: '高途考前冲刺', series: '考前100题', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河北万卷文化有限公司
    { shop: '', shopname: '', name: '河北万卷文化有限公司', brand: '成才之路', series: '高中新教材同步学习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北万卷文化有限公司', brand: '成才之路', series: '高考二轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北万卷文化有限公司', brand: '成才之路', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北万卷文化有限公司', brand: '衡中学案', series: '高中新教材同步学习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北万卷文化有限公司', brand: '衡中学案', series: '高考二轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北万卷文化有限公司', brand: '衡中学案', series: '高考一轮总复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河北优盛文化传播有限公司
    { shop: '', shopname: '', name: '河北优盛文化传播有限公司', brand: '儿童数学思维发展', series: '数学思想方法教与学', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 四川华夏万卷文化传媒股份有限公司
    { shop: '', shopname: '', name: '四川华夏万卷文化传媒股份有限公司', brand: '华夏万卷', series: '小学生同步字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川华夏万卷文化传媒股份有限公司', brand: '华夏万卷', series: '小学字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川华夏万卷文化传媒股份有限公司', brand: '华夏万卷', series: '初中字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '���川���夏万卷文化传媒股份有限公司', brand: '华夏万卷', series: '英语字帖', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '四川华夏万卷文化传媒股份有限公司', brand: '华夏万卷', series: '高中字帖', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北海韵文化传媒有限公司
    { shop: '', shopname: '', name: '湖北海韵文化传媒有限公司', brand: '金榜行动', series: '小学同步教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北海韵文化传媒有限公司', brand: '金榜行动', series: '小学同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北海韵文化传媒有限公司', brand: '金榜行动', series: '初中同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北海韵文化传媒有限公司', brand: '随堂1+1', series: '小学同步教案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北海韵文化传媒有限公司', brand: '随堂1+1', series: '小学同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北海韵文化传媒有限公司', brand: '随堂1+1', series: '初中同步课件', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东百川数字科技有限公司
    { shop: '', shopname: '', name: '山东百川数字科技有限公司', brand: '教材解读', series: '初中同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东百川数字科技有限公司', brand: '教材解读', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 潍坊博雅图文制作有限公司
    { shop: '', shopname: '', name: '潍坊博雅图文制作有限公司', brand: '赢在中考·高效备考', series: '中考模拟试卷汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '潍坊博雅图文制作有限公司', brand: '赢在中考·高效备考', series: '中考全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '潍坊博雅图文制作有限公司', brand: '赢在中考·高效备考', series: '中考模拟冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '潍坊博雅图文制作有限公司', brand: '模拟冲刺卷', series: '中考模拟试卷汇编', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '潍坊博雅图文制作有限公司', brand: '模拟冲刺卷', series: '中考全真模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '潍坊博雅图文制作有限公司', brand: '模拟冲刺卷', series: '中考模拟冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 南昌博智文化传播有限公司
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考冲刺训练小题练', series: '高考冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考冲刺训练小题练', series: '高考抢分特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考冲刺训练小题练', series: '高考总复习单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考冲刺训练小题练', series: '高考总复习单元滚动卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考冲刺训练小题练', series: '高中同步学考练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考冲刺训练小题练', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考小题练抢分特训', series: '高考冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考小题练抢分特训', series: '高考抢分特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考小题练抢分特训', series: '高考总复习单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考小题练抢分特训', series: '高考总复习单元滚动卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考小题练抢分特训', series: '高中同步学考练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '高考小题练抢分特训', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '抢分课堂', series: '高考冲刺', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '抢分课堂', series: '高考抢分特训', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '抢分课堂', series: '高考总复习单元测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '抢分课堂', series: '高考总复习单元滚动卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '抢分课堂', series: '高中同步学考练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '南昌博智文化传播有限公司', brand: '抢分课堂', series: '高考总复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 江苏文泉图书文化有限公司
    { shop: '', shopname: '', name: '江苏文泉图书文化有限公司', brand: '走进名著', series: '初中语文教材指定阅读书目', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京华企之星科技发展中心
    { shop: '', shopname: '', name: '北京华企之星科技发展中心', brand: '莘莘文化', series: '读后续写', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京华企之星科技发展中心', brand: '莘莘文化', series: '核心词汇', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山西文海泉文化传播有限公司
    { shop: '', shopname: '', name: '山西文海泉文化传播有限公司', brand: '金牌邦', series: '中考满分作文点金术', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 河北华冠图书有限公司
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高考二轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高考一轮复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高中晨读晚练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高中填充演练一本通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高中同步导学案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高中学习活动案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '高中作业与测评', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '河北华冠图书有限公司', brand: '金版教程', series: '作业与测评全书', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北世纪国华文化传播有限公司
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '常德标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '达州标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '国华考试', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '衡阳标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '湖南标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '架构中考', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '江西标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '解密中考', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '凉山标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '泸州标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '南充标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '邵阳标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '���川���准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '四川标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '算到底', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '小学标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '星城中考', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪文化传播有限公司', brand: '学本课堂', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学本课堂', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学期总复习', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '学��总复习', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '益阳标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考2号', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考导学案', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考拐点', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '中考总动员', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '初中同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '中考模拟卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '中考真题分类', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '中考专项复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '中考复习讲练测', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '中考押题卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '小学同步教学', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '小学同步测试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '中考学业水平质量标准完全解读', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '初中同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北世纪国华文化传播有限公司', brand: '重庆标准卷', series: '小学同步暑假衔接', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北时代卓锦文化传媒有限公司
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '三点分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '中考特训方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '小学毕业总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·精英新课堂', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '三点分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '中考特训方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '小学毕业总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名师测控', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名校绿卡', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名校绿卡', series: '三点分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名校绿卡', series: '中考特训方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名校绿卡', series: '小学毕业总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿鹄志·名校绿卡', series: '假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·名校绿卡', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·名校绿卡', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '三点分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '中考特训方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '小学毕业总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·期末冲刺王·暑假作业', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '三点分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '中考特训方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '小学毕业总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·素养学堂', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '三点分层作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '中考特训方案', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '小学毕业总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '假期作业', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北时代卓锦文化传媒有限公司', brand: '鸿�epoint·中考王', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京五洲时代天华文化传媒有限公司
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '七彩课堂', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '教材一点通', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '星级教案', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '七彩同步作文', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '七彩练霸', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '七彩作业', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '小白鹅', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '北京五洲时代天华文化传媒有限公司', brand: '七彩同步训练', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 吉林梓耕教育科技股份有限公司
    { shop: '', shopname: '', name: '吉林梓耕教育科技股份有限公司', brand: '教材完全解读', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '吉林梓耕教育科技股份有限公司', brand: '完全解读', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '吉林梓耕教育科技股份有限公司', brand: '新教材完全解读', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '吉林梓耕教育科技股份有限公司', brand: '梓耕教育', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东滨州教与学图书有限公司
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '鼎尖教案', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '汉字解码', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '教与学', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '名校直通车', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '全新教案', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '全新学案', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '文言文新读', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '五校联考', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '校本教材', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '优化设计', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东滨州教与学图书有限公司', brand: '字源识字', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 合肥亚泰嘉和文化传播有限公司
    { shop: '', shopname: '', name: '合肥亚泰嘉和文化传播有限公司', brand: '学考一本通', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥亚泰嘉和文化传播有限公司', brand: '艺考一本通', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '合肥亚泰嘉和文化传播有限公司', brand: '迎考一本通', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 福州学熙文化传媒有限公司
    { shop: '', shopname: '', name: '福州学熙文化传媒有限公司', brand: '读后续写', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '福州学熙文化传媒有限公司', brand: '高分作文听写字帖', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '福州学熙文化传媒有限公司', brand: '模板作文听写字帖', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '福州学熙文化传媒有限公司', brand: '同步听写字帖', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '福州学熙文化传媒有限公司', brand: '这样练', series: '通用规则', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北金色花开文化有限公司
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '小学小考满分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '初中语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '小学语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '高高手', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '小学小考满分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '初中语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '小学语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名师面对面', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '小学小考满分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '初中语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '小学语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校直通车', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '小学小考满分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '初中语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '小学语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '新征程', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '小学小考满分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '初中语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '小学语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '语文花开', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '小学小考满分策略', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '小升初', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '小学同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '初中语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '小学语文同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '中考系列', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北金色花开文化有限公司', brand: '名校课堂', series: '初中系列', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东文丰苑图书有限公司
    { shop: '', shopname: '', name: '山东文丰苑图书有限公司', brand: '名师大课堂', series: '初升高衔接教材', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东文丰苑图书有限公司', brand: '名师大课堂', series: '高考总复习艺术生必备', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 太原市后土文化传媒有限公司
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '初中同步学霸课课通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '初中同步学霸追梦卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '高考二轮复习学霸圆梦卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '高考命题题源', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '高考一轮学霸专题追梦卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '高考语文冲刺卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '高中同步学霸步步高', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '高中同步学霸追梦卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '小学命题题源', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '小学同步学霸课课通', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '小学同步学霸追梦卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '太原市后土文化传媒有限公司', brand: '中国大语文@后土传媒', series: '中考命题题源', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 广州思脉图书发行有限公司
    { shop: '', shopname: '', name: '广州思脉图书发行有限公司', brand: '作文好简单', series: '初中生作文大全', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '广州思脉图书发行有限公司', brand: '作文好简单', series: '小学生作文大全', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 北京明信弘德文化发展有限公司
    { shop: '', shopname: '', name: '北京明信弘德文化发展有限公司', brand: '名师指点', series: '作文大全', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 安阳市超世通文化传媒有限公司
    { shop: '', shopname: '', name: '安阳市超世通文化传媒有限公司', brand: '通关阅读', series: '小学同步训练', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 湖北猎豹教育科技有限公司
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '黄冈100分闯关', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '黄冈100分闯关', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '黄冈100分闯关', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '黄冈金牌之路·练闯考', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '黄冈金牌之路·练闯考', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '黄冈金牌之路·练闯考', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '聚焦中考', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '聚焦中考', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '聚焦中考', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '四清导航', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '四清导航', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '四清导航', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '原创新课堂', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '原创新课堂', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '原创新课堂', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '中考精英', series: '初中同步', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '中考精英', series: '中考复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '湖北猎豹教育科技有限公司', brand: '中考精英', series: '小学同步练习', split: '', pricing: '', publishTime: '', specialCase: '' },

    // 山东智乐星教育科技股份有限公司
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '1号专题', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '假期作业', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '乐夺冠', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '期末满分卷', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '学考英语', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智考王', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '中考现代文阅读专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '中考阅读理解+完形填空专项击破', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中期末暑假系统总复习', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '中考提分必刷卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中期末复习指导', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中阅读理解与完形填空专项突破周周练', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中学业水平考试考前验收卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '初中学业水平考试全真模拟试卷', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '命题研究', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '时政热点', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '学考传奇', split: '', pricing: '', publishTime: '', specialCase: '' },
    { shop: '', shopname: '', name: '山东智乐星教育科技股份有限公司', brand: '智乐星中考', series: '中考备战', split: '', pricing: '', publishTime: '', specialCase: '' },
  ]
};

// 默认数据
const defaultData = {
  providers: [],
  brands: ['人教版', '北师大版', '苏教版', '沪教版', '部编版'],
  series: []
};

// 初始化数据
function initData() {
  const storedData = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  console.log('检查存储数据:', storedData ? storedData.substring(0, 200) : '无');
  
  // 如果已有用户数据，直接使用已有数据，不覆盖
  if (storedData && storedData !== '[]' && storedData !== 'null') {
    try {
      const parsed = JSON.parse(storedData);
      if (parsed && parsed.length > 0) {
        console.log('已有数据条数:', parsed.length);
        return; // 已有数据，保留不处理
      }
    } catch(e) {
      console.log('解析数据出错:', e);
    }
  }
  
  // 首次使用时预置数据
  console.log('初始化预设数据条数:', presetData.providers.length);
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(presetData.providers));
  if (!localStorage.getItem(STORAGE_KEYS.BRANDS) || localStorage.getItem(STORAGE_KEYS.BRANDS) === '[]') {
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(presetData.brands.map((name, i) => ({ id: (i + 1).toString(), name }))));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SERIES)) {
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(defaultData.series));
  }
}

// 重置为预置数据（可清除所有修改）
function resetToPresetData() {
  if (confirm('确定要重置所有数据吗？这将清除所有已修改的数据，恢复为初始数据。')) {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(presetData.providers));
    localStorage.setItem(STORAGE_KEYS.BRANDS, JSON.stringify(presetData.brands.map((name, i) => ({ id: (i + 1).toString(), name }))));
    localStorage.setItem(STORAGE_KEYS.SERIES, JSON.stringify(defaultData.series));
    loadProviders();
    loadBrands();
    updateStats();
    showToast('数据已重置为初始状态');
  }
}

// 数据操作
function getData(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

function setData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ========================================
// 页面导航
// ========================================
function goPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById('page-' + pageId).classList.add('active');
  window.scrollTo(0, 0);
  
  if (pageId === 'provider') {
    loadProviders();
    loadBrands();
    loadProviderSelect();
  }
  
  if (pageId === 'ai') {
    // AI页面初始化
  }
}

function goHome() {
  goPage('home');
}

// ========================================
// 折叠功能
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  initData();
  initCollapsibles();
  updateStats();
  
  // 页面加载时初始化下拉框
  loadProviderSelect();
  
  // 为品牌下拉框添加 onchange 事件
  var brandSelect = document.getElementById('brand-select');
  if (brandSelect) {
    brandSelect.onchange = function() { onBrandChange(); };
  }
  
  // 输入框回车搜索
  ['provider-search', 'shop-search', 'shopname-search'].forEach(id => {
    document.getElementById(id)?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchProvider();
    });
  });
  
  document.getElementById('ai-query')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') aiQuery();
  });
  
  // 点击其他地方关闭下拉框
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('provider-dropdown');
    const input = document.getElementById('provider-search-input');
    if (dropdown && !dropdown.contains(e.target) && (!input || !input.contains(e.target))) {
      dropdown.style.display = 'none';
    }
  });
});

function initCollapsibles() {
  document.querySelectorAll('.collapsible').forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.dataset.target;
      const content = document.getElementById(targetId);
      if (content) {
        header.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
      }
    });
  });
}

// ========================================
// 统计更新
// ========================================
function updateStats() {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const brands = getData(STORAGE_KEYS.BRANDS);
  
  const statProviders = document.getElementById('stat-providers');
  const statBrands = document.getElementById('stat-brands');
  
  if (statProviders) animateNumber(statProviders, providers.length);
  if (statBrands) animateNumber(statBrands, brands.length);
}

function animateNumber(element, target) {
  let current = 0;
  const step = Math.ceil(target / 20);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    element.textContent = current;
  }, 50);
}

// ========================================
// 提供者查询
// ========================================
function loadProviders() {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const brands = getData(STORAGE_KEYS.BRANDS);
  const container = document.getElementById('provider-list');
  const countBadge = document.getElementById('provider-count');
  
  if (!container) return;
  
  if (providers.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无提供者，请点击上方「新增提供者」按钮添加</p>
      </div>
    `;
    if (countBadge) countBadge.textContent = '0';
    return;
  }
  
  container.innerHTML = providers.map((p, index) => {
    const brandName = p.brand || '';
    const seriesName = p.series || '';
    
    return `
      <div class="provider-item">
        <div class="provider-avatar">${(p.name || '未').charAt(0).toUpperCase()}</div>
        <div class="provider-info">
          <div class="provider-name">${p.name || '未命名'}</div>
          <div class="provider-meta">
            ${p.shop || p.shopname ? '🏪' + (p.shop || '') + (p.shop && p.shopname ? ' / ' : '') + (p.shopname || '') : ''} ${brandName}${seriesName ? ' · ' + seriesName : ''}
          </div>
          <div class="provider-tags">
            ${p.split ? '<span class="ptag">拆分:' + p.split + '</span>' : ''}
            ${p.pricing ? '<span class="ptag">定价:' + p.pricing + '</span>' : ''}
            ${p.publishTime ? '<span class="ptag">发布:' + p.publishTime + '</span>' : ''}
            ${p.specialCase ? '<span class="ptag ptag-warn">特例:' + p.specialCase + '</span>' : ''}
          </div>
        </div>
        <div class="provider-actions">
          <button onclick="editProvider(${index})">编辑</button>
          <button onclick="deleteProvider(${index})">删除</button>
        </div>
      </div>
    `;
  }).join('');
  
  if (countBadge) countBadge.textContent = providers.length;
}

function loadBrands() {
  const brands = getData(STORAGE_KEYS.BRANDS);
  const selects = [
    document.getElementById('brand-select'),
    document.getElementById('new-provider-brand'),
    document.getElementById('new-series-brand')
  ];
  
  selects.forEach(select => {
    if (!select) return;
    const currentVal = select.value;
    select.innerHTML = '<option value="">— 选择品牌 —</option>' + 
      brands.map(b => `<option value="${b.id || b}">${b.name || b}</option>`).join('');
    select.value = currentVal;
  });
}

function loadProviderSelect() {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const select = document.getElementById('provider-select');
  if (!select) return;
  
  const uniqueProviders = [...new Set(providers.map(p => p.name).filter(Boolean))];
  select.innerHTML = '<option value="">— 选择提供者 —</option>' + 
    uniqueProviders.map(p => `<option value="${p}">${p}</option>`).join('');
}

function onProviderSelect() {
  const providerName = document.getElementById('provider-select')?.value;
  if (!providerName) return;
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const matched = providers.filter(p => p.name === providerName);
  
  if (matched.length > 0) {
    // 获取该提供者下的所有品牌（去重）
    const uniqueBrands = [...new Set(matched.map(p => p.brand).filter(Boolean))];
    
    // 填充品牌下拉框
    const brandSelect = document.getElementById('brand-select');
    if (brandSelect) {
      brandSelect.innerHTML = '<option value="">— 选择品牌 —</option>' + 
        uniqueBrands.map(b => `<option value="${b}">${b}</option>`).join('');
    }
    
    // 清空系列下拉框
    const seriesSelect = document.getElementById('series-select');
    if (seriesSelect) {
      seriesSelect.innerHTML = '<option value="">— 选择系列 —</option>';
    }
    
    // 自动选择第一个品牌并显示匹配
    if (uniqueBrands.length > 0) {
      brandSelect.value = uniqueBrands[0];
      onBrandChange();
    }
    
    showMatchHint(matched);
  }
  
  loadProviders();
}

// 提供者输入搜索
function onProviderSearchInput() {
  var input = document.getElementById('provider-search-input').value.trim().toLowerCase();
  var dropdown = document.getElementById('provider-dropdown');
  
  if (!input) {
    dropdown.style.display = 'none';
    return;
  }
  
  var providers = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  var providersData = providers ? JSON.parse(providers) : presetData.providers;
  var uniqueProviders = [...new Set(providersData.map(function(p) { return p.name; }).filter(Boolean))];
  var matched = uniqueProviders.filter(function(p) { return p.toLowerCase().indexOf(input) !== -1; });
  
  if (matched.length === 0) {
    dropdown.style.display = 'none';
    return;
  }
  
  dropdown.innerHTML = matched.slice(0, 10).map(function(p) { 
    return '<div class="dropdown-item" onclick="selectProvider(\'' + p + '\')">' + p + '</div>';
  }).join('');
  dropdown.style.display = 'block';
}

function searchProviderByInput() {
  var input = document.getElementById('provider-search-input').value.trim();
  if (!input) return;
  
  var providers = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  var providersData = providers ? JSON.parse(providers) : presetData.providers;
  var matched = providersData.filter(function(p) { return p.name && p.name.indexOf(input) !== -1; });
  
  // 如果存在匹配提供者，调用选择逻辑
  if (matched.length > 0) {
    selectProvider(matched[0].name);
  } else {
    // 如果不存在，弹出新增提供者窗口
    openAddProviderDirect(input);
  }
}

// 直接新增提供者（搜索不匹配时触发）
function openAddProviderDirect(name) {
  currentProvider = name;
  var input = document.getElementById('provider-search-input');
  if (input) input.value = name;
  var dropdown = document.getElementById('provider-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  openAddProvider();
}

function selectProvider(providerName) {
  var dropdown = document.getElementById('provider-dropdown');
  if (dropdown) dropdown.style.display = 'none';
  
  var input = document.getElementById('provider-search-input');
  if (input) input.value = providerName;
  currentProvider = providerName;
  
  var providers = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  var providersData = providers ? JSON.parse(providers) : presetData.providers;
  var matched = providersData.filter(function(p) { return p.name === providerName; });
  
  if (matched.length === 0) {
    matched = providersData.filter(function(p) { 
      return p.name && p.name.indexOf(providerName) !== -1; 
    });
  }
  
hideManualInput();
   
  if (matched.length > 0) {
    var uniqueBrands = matched.map(function(p) { return p.brand; }).filter(Boolean);
    uniqueBrands = [...new Set(uniqueBrands)];
    
    var brandSelect = document.getElementById('brand-select');
    if (brandSelect) {
      brandSelect.innerHTML = '<option value="">— 选择品牌 —</option>' + 
        uniqueBrands.map(function(b) { return '<option value="' + b + '">' + b + '</option>'; }).join('');
    }
    
    var seriesSelect = document.getElementById('series-select');
    if (seriesSelect) {
      seriesSelect.innerHTML = '<option value="">— 选择系列 —</option>';
    }
    
    showMatchHint(matched);
    loadProviders();
    
    // 等待用户手动选择品牌和系列，不自动选中
  }
}

function onBrandChange() {
  var brandSelect = document.getElementById('brand-select');
  var brandId = brandSelect ? brandSelect.value : '';
  
  // 获取显示的文本（品牌名）
  var brandName = brandSelect ? brandSelect.options[brandSelect.selectedIndex].text : '';
  if (brandName === '— 选择品牌 —') brandName = '';
  
  currentBrand = brandId;
  
  if (!brandId) return;
  
  // 获取当前选择的品牌名（用于匹配）
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  // 从预置数据和本地存储中匹配
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  var matched;
  if (providerName && providerName.trim() !== '') {
    matched = allProviders.filter(function(p) { 
      return p.name === providerName && (p.brand === brandName || p.brand === brandId);
    });
  } else {
    matched = allProviders.filter(function(p) { 
      return p.brand === brandName || p.brand === brandId;
    });
  }
  
  var uniqueSeries = matched.map(function(p) { return p.series; }).filter(Boolean);
  uniqueSeries = [...new Set(uniqueSeries)];
  
  var seriesSelect = document.getElementById('series-select');
  if (seriesSelect) {
    seriesSelect.innerHTML = '<option value="">— 选择系列 —</option>' + 
      uniqueSeries.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
  }
}

function displayBrandRule(brandName) {
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  if (!brandName) return;
  
  var matched = presetData.providers.filter(function(p) { 
    if (providerName) {
      return p.brand === brandName && p.name === providerName;
    }
    return p.brand === brandName;
  });
  
  if (matched.length === 0) return;
  
  // 显示第一个匹配项的规则作为示例
  var rule = matched[0];
  var displayBox = document.getElementById('custom-rule-display');
  if (displayBox) {
    displayBox.style.display = 'block';
    displayBox.innerHTML = '<div class="rule-display-header"><span class="rule-icon">📋</span> <span>' + brandName + ' 规则</span></div>' +
      '<div class="rule-display-content">' +
      '<div class="rule-item"><span class="label">拆分：</span><span class="value">' + (rule.split || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">定价：</span><span class="value">' + (rule.pricing || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">发布时间：</span><span class="value">' + (rule.publishTime || '无') + '</span></div>' +
      '<div class="rule-item"><span class="label">特例：</span><span class="value">' + (rule.specialCase || '无') + '</span></div>' +
      '</div>';
  }
}

function onSeriesChange() {
  var seriesSelect = document.getElementById('series-select');
  var seriesName = seriesSelect ? seriesSelect.value : '';
  var brandSelect = document.getElementById('brand-select');
  var brandName = brandSelect ? brandSelect.value : '';
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  if (!seriesName || !brandName) {
    // 如果没有选择完整，仍显示提示
    var displayBox = document.getElementById('custom-rule-display');
    if (displayBox) {
      displayBox.style.display = 'block';
      displayBox.innerHTML = '<div class="rule-display-header"><span class="rule-icon">📋</span> 规则查询</span></div>' +
        '<div class="rule-display-content">' +
        '<p>请完整选择：提供者 → 品牌 → 系列</p>' +
        '</div>';
    }
    return;
  }
  
  // 检查 presetData 和 localStorage
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  // 获取匹配的规则数据：宽松匹配（包含关系）
  var matched = allProviders.filter(function(p) {
    return p.name && p.name.includes(providerName) && p.brand === brandName && p.series === seriesName;
  });
  
  // 如果没有精确匹配，按品牌+系列匹配
  if (matched.length === 0) {
    matched = allProviders.filter(function(p) {
      return p.brand === brandName && p.series === seriesName;
    });
  }
  
  console.log('matched:', matched.length);
  
  // 显示规则
  var currentRule = matched.length > 0 ? matched[0] : {split: '', pricing: '', publishTime: '', specialCase: ''};
  var displayBox = document.getElementById('custom-rule-display');
  if (displayBox) {
    displayBox.style.display = 'block';
    displayBox.innerHTML = '<div class="rule-display-header">' +
        '<span class="rule-icon">📋</span> <span>' + brandName + ' - ' + seriesName + ' 规则</span>' +
        '<button class="btn-edit-rule" onclick="editRule()">✏️ 修改</button>' +
      '</div>' +
      '<div class="rule-display-content" id="rule-content">' +
        '<div class="rule-item"><span class="label">拆分：</span><span class="value" id="rule-split">' + (currentRule.split || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">定价：</span><span class="value" id="rule-pricing">' + (currentRule.pricing || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">发布时间：</span><span class="value" id="rule-publishTime">' + (currentRule.publishTime || '待录入') + '</span></div>' +
        '<div class="rule-item"><span class="label">特例：</span><span class="value" id="rule-specialCase">' + (currentRule.specialCase || '待录入') + '</span></div>' +
      '</div>' +
      '<div class="rule-edit-content" id="rule-edit" style="display:none;">' +
        '<div class="rule-item"><span class="label">拆分：</span><input type="text" id="edit-split" value="' + (currentRule.split || '') + '" class="rule-input"></div>' +
        '<div class="rule-item"><span class="label">定价：</span><input type="text" id="edit-pricing" value="' + (currentRule.pricing || '') + '" class="rule-input"></div>' +
        '<div class="rule-item"><span class="label">发布时间：</span><input type="text" id="edit-publishTime" value="' + (currentRule.publishTime || '') + '" class="rule-input"></div>' +
        '<div class="rule-item"><span class="label">特例：</span><input type="text" id="edit-specialCase" value="' + (currentRule.specialCase || '') + '" class="rule-input"></div>' +
        '<div class="rule-btn-wrap">' +
          '<button class="btn-cancel" onclick="cancelEdit()">取消</button>' +
          '<button class="btn-save" onclick="saveEditRule()">保存</button>' +
        '</div>' +
      '</div>';
  }
}

// 修改规则
function editRule() {
  document.getElementById('rule-content').style.display = 'none';
  document.querySelector('.rule-display-header .btn-edit-rule').style.display = 'none';
  document.getElementById('rule-edit').style.display = 'block';
}

// 取消修改
function cancelEdit() {
  document.getElementById('rule-content').style.display = 'block';
  document.querySelector('.rule-display-header .btn-edit-rule').style.display = 'inline-block';
  document.getElementById('rule-edit').style.display = 'none';
}

// 保存修改
function saveEditRule() {
  var seriesSelect = document.getElementById('series-select');
  var seriesName = seriesSelect ? seriesSelect.value : '';
  var brandSelect = document.getElementById('brand-select');
  var brandName = brandSelect ? brandSelect.value : '';
  var providerInput = document.getElementById('provider-search-input');
  var providerName = providerInput ? providerInput.value : '';
  
  var newSplit = document.getElementById('edit-split').value.trim();
  var newPricing = document.getElementById('edit-pricing').value.trim();
  var newPublishTime = document.getElementById('edit-publishTime').value.trim();
  var newSpecialCase = document.getElementById('edit-specialCase').value.trim();
  
  // 获取当前数据
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  // 查找匹配项
  var matchedIndex = -1;
  var newProvidersList = [...localProviders];
  
  for (var i = 0; i < newProvidersList.length; i++) {
    if (newProvidersList[i].name === providerName && newProvidersList[i].brand === brandName && newProvidersList[i].series === seriesName) {
      matchedIndex = i;
      break;
    }
  }
  
  if (matchedIndex >= 0) {
    // 更新现有项
    newProvidersList[matchedIndex].split = newSplit;
    newProvidersList[matchedIndex].pricing = newPricing;
    newProvidersList[matchedIndex].publishTime = newPublishTime;
    newProvidersList[matchedIndex].specialCase = newSpecialCase;
  } else {
    // 新增项
    newProvidersList.push({
      name: providerName,
      brand: brandName,
      series: seriesName,
      split: newSplit,
      pricing: newPricing,
      publishTime: newPublishTime,
      specialCase: newSpecialCase
    });
  }
  
  setData(STORAGE_KEYS.PROVIDERS, newProvidersList);
  showToast('保存成功');
  cancelEdit();
  
  // 刷新显示
  onSeriesChange();
}

function showManualInput() {
  var section = document.getElementById('manual-input-section');
  var form = document.getElementById('manual-input-form');
  if (section) section.style.display = 'block';
  if (form) form.style.display = 'flex';
}

function hideManualInput() {
  var section = document.getElementById('manual-input-section');
  var form = document.getElementById('manual-input-form');
  if (section) section.style.display = 'none';
  if (form) form.style.display = 'none';
}

function loadSeries(brandId, targetSelect) {
  const allSeries = getData(STORAGE_KEYS.SERIES);
  const filteredSeries = brandId ? allSeries.filter(s => s.brandId === brandId) : allSeries;
  
  if (!targetSelect) return;
  
  const currentVal = targetSelect.value;
  targetSelect.innerHTML = '<option value="">— 选择系列 —</option>' +
    filteredSeries.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
  targetSelect.value = currentVal;
}

function searchProvider() {
  const shopKeyword = document.getElementById('shop-search')?.value.trim().toLowerCase();
  const providerKeyword = document.getElementById('provider-search')?.value.trim().toLowerCase();
  const brandId = document.getElementById('brand-select')?.value;
  const seriesId = document.getElementById('series-select')?.value;
  
  const brands = getData(STORAGE_KEYS.BRANDS);
  const series = getData(STORAGE_KEYS.SERIES);
  let providers = getData(STORAGE_KEYS.PROVIDERS);
  
  // 智能匹配：如果输入了店铺信息，自动填充提供者、品牌、系列
  if (shopKeyword) {
    const matchedProviders = providers.filter(p => 
      (p.shop && p.shop.toLowerCase().includes(shopKeyword)) ||
      (p.shopname && p.shopname.toLowerCase().includes(shopKeyword))
    );
    
    if (matchedProviders.length > 0) {
      // 自动填充第一个匹配的提供者信息
      const firstMatch = matchedProviders[0];
      if (!providerKeyword) {
        document.getElementById('provider-search').value = firstMatch.name || '';
      }
      
      // 自动选择品牌
      if (!brandId && firstMatch.brand) {
        const brandItem = brands.find(b => b.name === firstMatch.brand);
        if (brandItem) {
          document.getElementById('brand-select').value = brandItem.id;
          loadSeries(brandItem.id, document.getElementById('series-select'));
        }
      }
      
      // 自动选择系列
      setTimeout(() => {
        if (!seriesId && firstMatch.series) {
          document.getElementById('series-select').value = firstMatch.series;
        }
      }, 100);
      
      // 显示匹配结果提示
      showMatchHint(matchedProviders);
    }
  }
  
  // 继续过滤
  const filtered = providers.filter(p => {
    const shopMatch = !shopKeyword || 
      (p.shop && p.shop.toLowerCase().includes(shopKeyword)) ||
      (p.shopname && p.shopname.toLowerCase().includes(shopKeyword));
    const providerMatch = !providerKeyword || (p.name && p.name.toLowerCase().includes(providerKeyword));
    const brandMatch = !brandId || p.brand === brandId || (brands.find(b => b.id === brandId)?.name === p.brand);
    const seriesMatch = !seriesId || p.series === seriesId;
    
    return shopMatch && providerMatch && brandMatch && seriesMatch;
  });

  const container = document.getElementById('provider-list');
  if (!container) return;
  
  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">🔍</span>
        <p>未找到匹配的提供者</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map((p, index) => {
    const brandName = p.brand || '';
    const seriesName = p.series || '';
    const realIndex = providers.indexOf(p);
    
    return `
      <div class="provider-item">
        <div class="provider-avatar">${(p.name || '未').charAt(0).toUpperCase()}</div>
        <div class="provider-info">
          <div class="provider-name">${p.name || '未命名'}</div>
          <div class="provider-meta">
            ${p.shop || p.shopname ? '🏪' + (p.shop || '') + (p.shop && p.shopname ? ' / ' : '') + (p.shopname || '') : ''} ${brandName}${seriesName ? ' · ' + seriesName : ''}
          </div>
          <div class="provider-tags">
            ${p.split ? '<span class="ptag">拆分:' + p.split + '</span>' : ''}
            ${p.pricing ? '<span class="ptag">定价:' + p.pricing + '</span>' : ''}
            ${p.publishTime ? '<span class="ptag">发布:' + p.publishTime + '</span>' : ''}
            ${p.specialCase ? '<span class="ptag ptag-warn">特例:' + p.specialCase + '</span>' : ''}
          </div>
        </div>
        <div class="provider-actions">
          <button onclick="editProvider(${realIndex})">编辑</button>
          <button onclick="deleteProvider(${realIndex})">删除</button>
        </div>
      </div>
    `;
  }).join('');
  
  const countBadge = document.getElementById('provider-count');
  if (countBadge) countBadge.textContent = filtered.length;
}

function showMatchHint(matchedProviders) {
  const display = document.getElementById('custom-rule-display');
  if (!display) return;
  
  if (matchedProviders.length === 0) {
    display.style.display = 'none';
    return;
  }
  
  const first = matchedProviders[0];
  display.style.display = 'block';
  display.innerHTML = `
    <div class="match-hint">
      <span class="match-icon">✅</span>
      <span class="match-text">已自动匹配：提供者 <strong>${first.name || '-'}</strong> · 品牌 <strong>${first.brand || '-'}</strong> · 系列 <strong>${first.series || '-'}</strong></span>
      ${matchedProviders.length > 1 ? `<span class="match-count">（共${matchedProviders.length}条匹配）</span>` : ''}
    </div>
  `;
}

// ========================================
// 手工录入信息保存
// ========================================
function saveRuleInput() {
  const brandId = document.getElementById('brand-select')?.value;
  const seriesId = document.getElementById('series-select')?.value;
  const providerKeyword = document.getElementById('provider-search')?.value.trim();
  
  if (!providerKeyword && !brandId && !seriesId) {
    showToast('请先选择或输入提供者信息');
    return;
  }
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const brands = getData(STORAGE_KEYS.BRANDS);
  
  // 查找匹配的提供者
  let targetProvider = null;
  let targetIndex = -1;
  
  for (let i = 0; i < providers.length; i++) {
    const p = providers[i];
    const brandMatch = !brandId || p.brand === brandId || (brands.find(b => b.id === brandId)?.name === p.brand);
    const seriesMatch = !seriesId || p.series === seriesId;
    const providerMatch = !providerKeyword || (p.name && p.name.includes(providerKeyword));
    
    if (brandMatch && seriesMatch && providerMatch) {
      targetProvider = p;
      targetIndex = i;
      break;
    }
  }
  
  // 如果没找到匹配的新提供者
  if (!targetProvider) {
    showToast('未找到匹配的提供者，请先新增');
    return;
  }
  
  // 更新录入信息
  const split = document.getElementById('split-dimension')?.value.trim();
  const pricing = document.getElementById('pricing')?.value.trim();
  const publishTime = document.getElementById('publish-time')?.value.trim();
  const specialCase = document.getElementById('special-case')?.value.trim();
  
  providers[targetIndex] = {
    ...providers[targetIndex],
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || ''
  };
  
  setData(STORAGE_KEYS.PROVIDERS, providers);
  loadProviders();
  showToast('录入信息已保存');
}

// ========================================
// 弹窗操作
// ========================================
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  document.body.style.overflow = '';
}

function openAddProvider() {
  document.getElementById('modal-provider-title').textContent = '新增提供者';
  
  // 清空表单（保留已输入的搜索关键词）
  var searchInput = document.getElementById('provider-search-input');
  var keyword = searchInput ? searchInput.value : '';
  
  document.getElementById('new-provider-shop').value = '';
  document.getElementById('new-provider-name').value = keyword;
  document.getElementById('new-provider-brand').value = '';
  document.getElementById('new-provider-series').value = '';
  document.getElementById('new-provider-split').value = '';
  document.getElementById('new-provider-pricing').value = '';
  document.getElementById('new-provider-publishtime').value = '';
  document.getElementById('new-provider-special').value = '';
  
  openModal('modal-provider');
}

function openAddBrand() {
  // 新增品牌时弹出与新增提供者相同的弹窗
  openAddProvider();
}

function openAddSeries() {
  // 新增系列时弹出与新增提供者相同的弹窗
  openAddProvider();
}

// ========================================
// 保存操作
// ========================================
function saveProvider() {
  const shop = document.getElementById('new-provider-shop')?.value.trim();
  const shopname = document.getElementById('new-provider-shopname')?.value.trim();
  const name = document.getElementById('new-provider-name')?.value.trim();
  const brandName = document.getElementById('new-provider-brand')?.value.trim();
  const seriesName = document.getElementById('new-provider-series')?.value.trim();
  const split = document.getElementById('new-provider-split')?.value.trim();
  const pricing = document.getElementById('new-provider-pricing')?.value.trim();
  const publishTime = document.getElementById('new-provider-publishtime')?.value.trim();
  const specialCase = document.getElementById('new-provider-special')?.value.trim();
  
  if (!name) {
    showToast('请输入提供者名称');
    return;
  }
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  providers.push({
    shop: shop || '',
    shopname: shopname || '',
    name,
    brand: brandName || '',
    series: seriesName || '',
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || ''
  });
  setData(STORAGE_KEYS.PROVIDERS, providers);
  
  showToast('保存成功');
  closeModal('modal-provider');
  
  // 刷新当前页面显示
  var brandSelect = document.getElementById('brand-select');
  var seriesSelect = document.getElementById('series-select');
  if (brandSelect) {
    brandSelect.innerHTML = '<option value="">— 选择品牌 —</option>' + 
      '<option value="' + brandName + '">' + brandName + '</option>';
  }
  if (seriesSelect) {
    seriesSelect.innerHTML = '<option value="">— 选择系列 —</option>' + 
      '<option value="' + seriesName + '">' + seriesName + '</option>';
    if (seriesName) seriesSelect.value = seriesName;
  }
  
  // 显示新增的规则
  if (brandName) {
    displayBrandRule(brandName);
  }
  showToast('提供者添加成功');
}

function saveBrand() {
  const name = document.getElementById('new-brand-name')?.value.trim();
  
  if (!name) {
    showToast('请输入品牌名称');
    return;
  }
  
  const brands = getData(STORAGE_KEYS.BRANDS);
  
  if (brands.some(b => (b.name || b) === name)) {
    showToast('该品牌已存在');
    return;
  }
  
  brands.push({ id: Date.now().toString(), name });
  setData(STORAGE_KEYS.BRANDS, brands);
  
  closeModal('modal-brand');
  loadBrands();
  showToast('品牌添加成功');
}

function saveSeries() {
  const brandId = document.getElementById('new-series-brand')?.value;
  const name = document.getElementById('new-series-name')?.value.trim();
  
  if (!brandId) {
    showToast('请选择所属品牌');
    return;
  }
  
  if (!name) {
    showToast('请输入系列名称');
    return;
  }
  
  const series = getData(STORAGE_KEYS.SERIES);
  
  if (series.some(s => s.brandId === brandId && s.name === name)) {
    showToast('该系列已存在');
    return;
  }
  
  series.push({ id: Date.now().toString(), brandId, name });
  setData(STORAGE_KEYS.SERIES, series);
  
  closeModal('modal-series');
  showToast('系列添加成功');
}

// ========================================
// 编辑删除
// ========================================
let editingProviderIndex = null;

function editProvider(index) {
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  const provider = providers[index];
  
  if (!provider) return;
  
  editingProviderIndex = index;
  document.getElementById('modal-provider-title').textContent = '编辑提供者';
  
  document.getElementById('new-provider-shop').value = provider.shop || '';
  document.getElementById('new-provider-shopname').value = provider.shopname || '';
  document.getElementById('new-provider-name').value = provider.name || '';
  document.getElementById('new-provider-split').value = provider.split || '';
  document.getElementById('new-provider-pricing').value = provider.pricing || '';
  document.getElementById('new-provider-publishtime').value = provider.publishTime || '';
  document.getElementById('new-provider-special').value = provider.specialCase || '';
  
  loadBrands();
  
  setTimeout(() => {
    document.getElementById('new-provider-brand').value = provider.brandId || '';
    loadSeries(provider.brandId, document.getElementById('new-provider-series'));
    setTimeout(() => {
      document.getElementById('new-provider-series').value = provider.seriesId || '';
    }, 50);
  }, 50);
  
  openModal('modal-provider');
  
  const saveBtn = document.querySelector('#modal-provider .btn-save');
  saveBtn.onclick = () => updateProvider();
}

function updateProvider() {
  const shop = document.getElementById('new-provider-shop')?.value.trim();
  const shopname = document.getElementById('new-provider-shopname')?.value.trim();
  const name = document.getElementById('new-provider-name')?.value.trim();
  const brandId = document.getElementById('new-provider-brand')?.value;
  const seriesId = document.getElementById('new-provider-series')?.value;
  const split = document.getElementById('new-provider-split')?.value.trim();
  const pricing = document.getElementById('new-provider-pricing')?.value.trim();
  const publishTime = document.getElementById('new-provider-publishtime')?.value.trim();
  const specialCase = document.getElementById('new-provider-special')?.value.trim();
  
  if (!name) {
    showToast('请输入提供者名称');
    return;
  }
  
  const brands = getData(STORAGE_KEYS.BRANDS);
  const brandName = brandId ? (brands.find(b => b.id === brandId)?.name || '') : '';
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  providers[editingProviderIndex] = {
    shop: shop || '',
    shopname: shopname || '',
    name,
    brand: brandName,
    brandId: brandId || null,
    seriesId: seriesId || null,
    series: seriesId ? (getData(STORAGE_KEYS.SERIES).find(s => s.id === seriesId)?.name || '') : '',
    split: split || '',
    pricing: pricing || '',
    publishTime: publishTime || '',
    specialCase: specialCase || ''
  };
  setData(STORAGE_KEYS.PROVIDERS, providers);
  
  closeModal('modal-provider');
  loadProviders();
  showToast('提供者更新成功');
  
  const saveBtn = document.querySelector('#modal-provider .btn-save');
  saveBtn.onclick = saveProvider;
  editingProviderIndex = null;
}

function deleteProvider(index) {
  if (!confirm('确定要删除该提供者吗？')) return;
  
  const providers = getData(STORAGE_KEYS.PROVIDERS);
  providers.splice(index, 1);
  setData(STORAGE_KEYS.PROVIDERS, providers);
  
  loadProviders();
  updateStats();
  showToast('提供者已删除');
}

// ========================================
// AI 查询
// ========================================
function setAiQuery(keyword) {
  document.getElementById('ai-query').value = keyword;
  aiQuery();
}

function aiQuery() {
  const query = document.getElementById('ai-query')?.value.trim();
  const resultBox = document.getElementById('ai-result');
  
  if (!query) {
    resultBox.innerHTML = '';
    return;
  }
  
  const queryLower = query.toLowerCase();
  
  // 首先搜索提供者/品牌/系列数据
  var localProviders = getData(STORAGE_KEYS.PROVIDERS);
  var allProviders = [...presetData.providers, ...localProviders];
  
  // 搜索匹配提供者、品牌、系列
  var matchedProviders = allProviders.filter(function(p) {
    return (p.name && p.name.includes(query)) ||
           (p.brand && p.brand.includes(query)) ||
           (p.series && p.series.includes(query));
  });
  
  if (matchedProviders.length > 0) {
    // 按提供者分组显示
    var providerGroups = {};
    matchedProviders.forEach(function(p) {
      if (!providerGroups[p.name]) {
        providerGroups[p.name] = { brand: {}, series: [] };
      }
      if (p.brand && !providerGroups[p.name].brand[p.brand]) {
        providerGroups[p.name].brand[p.brand] = [];
      }
      if (p.brand && p.series) {
        providerGroups[p.name].brand[p.brand].push(p);
      }
    });
    
    var html = '';
    for (var providerName in providerGroups) {
      var group = providerGroups[providerName];
      html += '<div class="ai-result-card">' +
        '<div class="ai-result-header">' +
          '<span class="ai-result-icon">🏢</span>' +
          '<span class="ai-result-title">' + providerName + '</span>' +
        '</div>' +
        '<div class="ai-result-body">';
      
      for (var brandName in group.brand) {
        var seriesList = group.brand[brandName];
        // 按每个系列显示规则
        seriesList.forEach(function(rule) {
          html += '<div class="ai-result-section">' +
            '<h5>📦 ' + brandName + ' - ' + (rule.series || '未分类') + '</h5>' +
            '<p><strong>拆分：</strong>' + (rule.split || '无') + '</p>' +
            '<p><strong>定价：</strong>' + (rule.pricing || '无') + '</p>' +
            '<p><strong>发布时间：</strong>' + (rule.publishTime || '无') + '</p>' +
            '<p><strong>特例：</strong>' + (rule.specialCase || '无') + '</p>' +
          '</div>';
        });
      }
      
      html += '</div></div>';
    }
    
    resultBox.innerHTML = html;
    return;
  }
  
  // 如果没有匹配到提供者/品牌/系列，搜索通用规则
  const rules = getAIRules();
  const matched = rules.filter(r => 
    queryLower.includes(r.keyword) || r.keyword.includes(queryLower)
  );
  
  if (matched.length === 0) {
    resultBox.innerHTML = `
      <div class="ai-result-card">
        <div class="ai-result-header">
          <span class="ai-result-icon">🔍</span>
          <span class="ai-result-title">未找到匹配规则</span>
        </div>
        <div class="ai-result-body">
          <p>未找到与「${query}」直接相关的规则。请尝试其他关键词，或查看通用规则页面获取完整信息。</p>
        </div>
      </div>
    `;
    return;
  }
  
  resultBox.innerHTML = matched.map(rule => `
    <div class="ai-result-card">
      <div class="ai-result-header">
        <span class="ai-result-icon">${rule.icon}</span>
        <span class="ai-result-title">${rule.title}</span>
      </div>
      <div class="ai-result-body">
        ${rule.sections.map(s => `
          <div class="ai-result-section">
            <h5>${s.title}</h5>
            ${s.content}
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function getAIRules() {
  return [
    {
      keyword: 'pdf',
      icon: '📄',
      title: 'PDF 资料处理规则',
      sections: [
        {
          title: '拆分维度',
          content: `
            <ul>
              <li><strong>按目录拆分</strong> - 有目录的PDF按目录结构进行拆分</li>
              <li><strong>按标题拆分</strong> - 无目录则按标题进行拆分</li>
              <li><strong>杜绝单页</strong> - 禁止出现单独一页的情况</li>
            </ul>
          `
        },
        {
          title: '特殊情况',
          content: '<p>若存在主书+小册子，小册子拆分后需单独建立专辑上传。</p>'
        }
      ]
    },
    {
      keyword: 'ppt',
      icon: '📽️',
      title: 'PPT 资料处理规则',
      sections: [
        {
          title: '处理流程',
          content: `
            <ul>
              <li>检查并删除敏感信息（联系方式、二维码等）</li>
              <li>确认无误后直接上传</li>
            </ul>
          `
        }
      ]
    },
    {
      keyword: 'word',
      icon: '📝',
      title: 'WORD 资料处理规则',
      sections: [
        {
          title: '处理流程',
          content: `
            <ul>
              <li>检查并删除敏感信息（联系方式、二维码等）</li>
              <li>确认无误后直接上传</li>
            </ul>
          `
        }
      ]
    },
    {
      keyword: '真题',
      icon: '📋',
      title: '真题试卷处理规则',
      sections: [
        {
          title: '高考真题',
          content: '<p><span class="sc-action green">不处理，直接上传</span></p>'
        },
        {
          title: '中考/小升初真题',
          content: '<p>发布后在 XMP 后台加入网校通</p>'
        },
        {
          title: '普通真题卷（校考/统考）',
          content: `
            <ul>
              <li>作者打标：<code>教辅精选</code></li>
              <li>发布后在 XMP 后台加入网校通</li>
            </ul>
          `
        }
      ]
    },
    {
      keyword: '电子样书',
      icon: '📖',
      title: '电子样书处理规则',
      sections: [
        {
          title: '命名规范',
          content: '<p>专辑名 & 资料名末尾补充 <code>-电子样书</code></p>'
        },
        {
          title: '标签设置',
          content: `
            <ul>
              <li>资料和专辑额外勾选「样书」标签</li>
              <li>资料额外勾选「禁止下载」标签</li>
            </ul>
          `
        },
        {
          title: '其他',
          content: '<p>定价 <code>0元</code>，选择「立即发布」</p>'
        }
      ]
    },
    {
      keyword: '定价',
      icon: '💰',
      title: '定价参考规则',
      sections: [
        {
          title: '定价文档',
          content: '<p>参考定价文档：<a href="https://docs.qq.com/doc/DUVNLeVZ0TXl5S1VT" target="_blank">查看定价文档 →</a></p>'
        }
      ]
    },
    {
      keyword: '中考',
      icon: '📋',
      title: '中考相关规则',
      sections: [
        {
          title: '中考真题',
          content: '<p>发布后在 XMP 后台加入网校通</p>'
        },
        {
          title: '中考复习资料',
          content: '<p>按通用规则处理：PDF按目录拆分，命名规范等</p>'
        }
      ]
    },
    {
      keyword: '人教',
      icon: '🏷️',
      title: '人教版相关规则',
      sections: [
        {
          title: '专辑命名',
          content: '<p>【人教版】学年 + 年级 + 学科 + 具体名称（版本）</p>'
        },
        {
          title: '通用规则',
          content: '<p>人教版产品遵循通用生产规则，包括资料拆分、命名、专辑设置等。</p>'
        }
      ]
    },
    {
      keyword: '音视频',
      icon: '🎬',
      title: '音视频处理规则',
      sections: [
        {
          title: '必选操作',
          content: '<p>勾选 <span class="sc-action red">「禁止下载」标签</span></p>'
        }
      ]
    },
    {
      keyword: '中职',
      icon: '🏫',
      title: '中职产品规则',
      sections: [
        {
          title: '处理方式',
          content: '<p>发布后在 XMP 后台加入网校通</p>'
        }
      ]
    },
    {
      keyword: '专辑',
      icon: '🗂️',
      title: '专辑设置规则',
      sections: [
        {
          title: '专辑目录',
          content: `
            <ul>
              <li><strong>有目录书籍</strong>：1:1 还原目录结构，资料按顺序排序</li>
              <li><strong>同步书籍</strong>：获取主数据目录，资料放入对应目录下</li>
            </ul>
          `
        },
        {
          title: '专辑封面',
          content: `
            <ul>
              <li>无封面 → 使用去年同期产品封面</li>
              <li>去年无 → 智能平台生成，最下标须写：学科网书城</li>
            </ul>
          `
        },
        {
          title: '标签设置',
          content: '<p>专辑"热点""推荐"等标签栏，<strong>不做任何勾选</strong></p>'
        }
      ]
    }
  ];
}

// ========================================
// Toast 提示
// ========================================
function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  
  toast.querySelector('.toast-message').textContent = message;
  toast.style.display = 'flex';
  
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ========================================
// 动态样式
// ========================================
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  .empty-state {
    text-align: center;
    padding: 60px 24px;
    color: var(--text-muted);
  }
  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }
  .empty-state p {
    font-size: 14px;
  }
  .provider-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 6px;
  }
  .ptag {
    background: rgba(79, 140, 255, 0.1);
    color: var(--primary-blue);
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
  }
  .ptag-warn {
    background: rgba(245, 158, 11, 0.1);
    color: var(--warning);
  }
  .custom-rule-box {
    background: linear-gradient(135deg, rgba(79, 140, 255, 0.08) 0%, rgba(124, 92, 246, 0.08) 100%);
    border: 1px solid rgba(79, 140, 255, 0.2);
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
  }
  .rule-display-header {
    font-size: 16px;
    font-weight: 600;
    color: var(--primary-blue);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .rule-item {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid rgba(79, 140, 255, 0.1);
  }
  .rule-item .label {
    width: 80px;
    color: var(--text-muted);
    font-size: 13px;
  }
  .rule-item .value {
    color: var(--text-dark);
    font-size: 13px;
    font-weight: 500;
  }
`;
document.head.appendChild(extraStyles);
