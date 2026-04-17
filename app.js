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
    '典创', '夺冠金卷', '快乐练习单元卷', '新思维小学奥数全解', '学练考', '优学优练全能夺冠', '中考预测押题卷',
    '必考点', '冲刺100分', '寒假专项训练', '黄冈快乐假期', '黄冈随堂练', '假期快乐练', '课本里的优美句子', '课课练', '快乐寒假',
    '每日6分钟', '期末冲刺100分', '期末冲刺卷', '期末冲刺优选卷', '全能100分', '全能练考卷', '全优达标卷', '思维导图天天练', '幼小衔接', '运算冠军', '同步训练', '阅读与写作', '暑假专项训练', 'AI易错题', '真题卷', '随堂笔记', '大语文周末小报', '教材笔记', '黄冈课课练'
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
  // 首次使用时预置数据
  if (!localStorage.getItem(STORAGE_KEYS.PROVIDERS) || localStorage.getItem(STORAGE_KEYS.PROVIDERS) === '[]') {
    localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(presetData.providers));
  }
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
