/* ============================================================================
   词库数据：内置分类 + 自建词库（localStorage 持久化）
   ========================================================================== */

export type WordItem = { en: string; zh: string; emoji: string }

export type CategoryWords = { label: string; color: string; words: WordItem[] }

/* 内置分类的展示配置 */
export const CATEGORY_DEFS: Record<string, { label: string; color: string }> = {
  animals: { label: '🐾 动物', color: '#58C97B' },
  fruits: { label: '🍎 水果', color: '#FF6F9C' },
  colors: { label: '🎨 颜色', color: '#9B7EDE' },
  numbers: { label: '🔢 数字', color: '#FFD35C' },
  family: { label: '👪 家人', color: '#3FA0E8' },
  school: { label: '✏️ 文具', color: '#58C97B' },
  Grade1A: { label: '一年级上册', color: '#FF6F9C' },
  Grade1B: { label: '一年级下册', color: '#9B7EDE' },
  Grade2A: { label: '二年级上册', color: '#FFD35C' },
  Grade2B: { label: '二年级下册', color: '#3FA0E8' },
  Grade3A: { label: '三年级上册', color: '#58C97B' },
  Grade3B: { label: '三年级下册', color: '#FF6F9C' },
  Grade4A: { label: '四年级上册', color: '#9B7EDE' },
  Grade4B: { label: '四年级下册', color: '#FFD35C' },
  Grade5A: { label: '五年级上册', color: '#3FA0E8' },
  Grade5B: { label: '五年级下册', color: '#58C97B' },
}

/* 内置单词表 */
const BUILTIN_WORDS: Record<string, WordItem[]> = {
  animals: [
    { en: 'cat', zh: '猫', emoji: '🐱' }, { en: 'dog', zh: '狗', emoji: '🐶' },
    { en: 'pig', zh: '猪', emoji: '🐷' }, { en: 'cow', zh: '奶牛', emoji: '🐮' },
    { en: 'fox', zh: '狐狸', emoji: '🦊' }, { en: 'owl', zh: '猫头鹰', emoji: '🦉' },
    { en: 'bee', zh: '蜜蜂', emoji: '🐝' }, { en: 'fish', zh: '鱼', emoji: '🐟' },
    { en: 'frog', zh: '青蛙', emoji: '🐸' }, { en: 'duck', zh: '鸭子', emoji: '🦆' },
    { en: 'lion', zh: '狮子', emoji: '🦁' }, { en: 'bear', zh: '熊', emoji: '🐻' },
    { en: 'wolf', zh: '狼', emoji: '🐺' }, { en: 'sheep', zh: '绵羊', emoji: '🐑' },
    { en: 'horse', zh: '马', emoji: '🐴' }, { en: 'tiger', zh: '老虎', emoji: '🐯' },
    { en: 'zebra', zh: '斑马', emoji: '🦓' },
  ],
  fruits: [
    { en: 'fig', zh: '无花果', emoji: '' }, { en: 'blueberry', zh: '蓝莓', emoji: '🫐' }, { en: 'pear', zh: '梨', emoji: '🍐' },
    { en: 'plum', zh: '李子', emoji: '🍑' }, { en: 'lime', zh: '青柠', emoji: '🍋' },
    { en: 'kiwi', zh: '猕猴桃', emoji: '🥝' }, { en: 'apple', zh: '苹果', emoji: '🍎' },
    { en: 'grape', zh: '葡萄', emoji: '🍇' }, { en: 'lemon', zh: '柠檬', emoji: '🍋' },
    { en: 'mango', zh: '芒果', emoji: '🥭' }, { en: 'melon', zh: '甜瓜', emoji: '🍈' },
    { en: 'peach', zh: '桃子', emoji: '🍑' }, { en: 'cherry', zh: '樱桃', emoji: '🍒' },
    { en: 'banana', zh: '香蕉', emoji: '🍌' }, { en: 'orange', zh: '橙子', emoji: '🍊' },
  ],
  colors: [
    { en: 'red', zh: '红色', emoji: '🔴' }, { en: 'tan', zh: '棕黄色', emoji: '🟤' },
    { en: 'gray', zh: '灰色', emoji: '⚪' }, { en: 'gold', zh: '金色', emoji: '🟡' },
    { en: 'blue', zh: '蓝色', emoji: '🔵' }, { en: 'pink', zh: '粉色', emoji: '🩷' },
    { en: 'green', zh: '绿色', emoji: '🟢' }, { en: 'black', zh: '黑色', emoji: '⚫' },
    { en: 'white', zh: '白色', emoji: '⚪' }, { en: 'brown', zh: '棕色', emoji: '🟤' },
    { en: 'purple', zh: '紫色', emoji: '🟣' }, { en: 'orange', zh: '橙色', emoji: '🟠' },
  ],
  numbers: [
    { en: 'one', zh: '一', emoji: '1️⃣' }, { en: 'two', zh: '二', emoji: '2️⃣' },
    { en: 'six', zh: '六', emoji: '6️⃣' }, { en: 'ten', zh: '十', emoji: '🔟' },
    { en: 'four', zh: '四', emoji: '4️⃣' }, { en: 'five', zh: '五', emoji: '5️⃣' },
    { en: 'nine', zh: '九', emoji: '9️⃣' }, { en: 'three', zh: '三', emoji: '3️⃣' },
    { en: 'seven', zh: '七', emoji: '7️⃣' }, { en: 'eight', zh: '八', emoji: '8️⃣' },
  ],
  family: [
    { en: 'mom', zh: '妈妈', emoji: '👩' }, { en: 'dad', zh: '爸爸', emoji: '👨' },
    { en: 'baby', zh: '婴儿', emoji: '👶' }, { en: 'sister', zh: '姐妹', emoji: '👧' },
    { en: 'brother', zh: '兄弟', emoji: '👦' }, { en: 'grandma', zh: '奶奶', emoji: '👵' },
    { en: 'grandpa', zh: '爷爷', emoji: '👴' },
  ],
  school: [
    { en: 'pen', zh: '钢笔', emoji: '🖊️' }, { en: 'bag', zh: '书包', emoji: '🎒' },
    { en: 'book', zh: '书', emoji: '📖' }, { en: 'desk', zh: '桌子', emoji: '🪑' },
    { en: 'ruler', zh: '尺子', emoji: '📏' }, { en: 'pencil', zh: '铅笔', emoji: '✏️' },
    { en: 'crayon', zh: '蜡笔', emoji: '🖍️' }, { en: 'eraser', zh: '橡皮', emoji: '🧽' },
    { en: 'scissors', zh: '剪刀', emoji: '✂️' },
  ],
  Grade1A:[
    { en: 'morning', zh: '早上，上午', emoji: '🌅' },
    { en: 'afternoon', zh: '下午', emoji: '☀️' },
    { en: 'book', zh: '书', emoji: '📖' },
    { en: 'ruler', zh: '尺子', emoji: '📏' },
    { en: 'pencil', zh: '铅笔', emoji: '✏️' },
    { en: 'rubber', zh: '橡皮', emoji: '🧽' },
    { en: 'eye', zh: '眼睛', emoji: '👁️' },
    { en: 'mouth', zh: '嘴巴', emoji: '👄' },
    { en: 'face', zh: '脸', emoji: '😊' },
    { en: 'nose', zh: '鼻子', emoji: '👃' },
    { en: 'ear', zh: '耳朵', emoji: '👂' },
    { en: 'dance', zh: '跳舞', emoji: '💃' },
    { en: 'read', zh: '读书', emoji: '📚' },
    { en: 'sing', zh: '唱歌', emoji: '🎤' },
    { en: 'draw', zh: '画画', emoji: '🎨' },
    { en: 'grandfather', zh: '爷爷，外公', emoji: '👴' },
    { en: 'grandmother', zh: '奶奶，外婆', emoji: '👵' },
    { en: 'father', zh: '爸爸', emoji: '👨' },
    { en: 'mother', zh: '妈妈', emoji: '👩' },
    { en: 'me', zh: '我', emoji: '🙋' },
    { en: 'fat', zh: '胖的', emoji: '🐷' },
    { en: 'thin', zh: '瘦的', emoji: '🦗' },
    { en: 'tall', zh: '高的', emoji: '📐' },
    { en: 'short', zh: '矮的', emoji: '📏' },
    { en: 'one', zh: '一', emoji: '1️⃣' },
    { en: 'two', zh: '二', emoji: '2️⃣' },
    { en: 'three', zh: '三', emoji: '3️⃣' },
    { en: 'four', zh: '四', emoji: '4️⃣' },
    { en: 'five', zh: '五', emoji: '5️⃣' },
    { en: 'six', zh: '六', emoji: '6️⃣' },
    { en: 'apple', zh: '苹果', emoji: '🍎' },
    { en: 'pear', zh: '梨', emoji: '🍐' },
    { en: 'peach', zh: '桃子', emoji: '🍑' },
    { en: 'orange', zh: '橙子', emoji: '🍊' },
    { en: 'hamburger', zh: '汉堡包', emoji: '🍔' },
    { en: 'pizza', zh: '披萨饼', emoji: '🍕' },
    { en: 'cake', zh: '蛋糕', emoji: '🎂' },
    { en: 'pie', zh: '馅饼', emoji: '🥧' },
    { en: 'chick', zh: '小鸡', emoji: '🐥' },
    { en: 'duck', zh: '鸭子', emoji: '🦆' },
    { en: 'cow', zh: '奶牛', emoji: '🐄' },
    { en: 'pig', zh: '猪', emoji: '🐷' },
    { en: 'bear', zh: '熊', emoji: '🐻' },
    { en: 'tiger', zh: '老虎', emoji: '🐯' },
    { en: 'monkey', zh: '猴子', emoji: '🐒' },
    { en: 'panda', zh: '熊猫', emoji: '🐼' },
    { en: 'red', zh: '红色', emoji: '🔴' },
    { en: 'blue', zh: '蓝色', emoji: '🔵' },
    { en: 'yellow', zh: '黄色', emoji: '🟡' },
    { en: 'green', zh: '绿色', emoji: '🟢' }
],
Grade1B:[
    { en: 'frog', zh: '青蛙', emoji: '🐸' },
    { en: 'rabbit', zh: '兔子', emoji: '🐰' },
    { en: 'bee', zh: '蜜蜂', emoji: '🐝' },
    { en: 'bird', zh: '小鸟', emoji: '🐦' },
    { en: 'sheep', zh: '绵羊', emoji: '🐑' },
    { en: 'hen', zh: '母鸡', emoji: '🐔' },
    { en: 'dog', zh: '狗', emoji: '🐶' },
    { en: 'cat', zh: '猫', emoji: '🐱' },
    { en: 'rice', zh: '米饭', emoji: '🍚' },
    { en: 'soup', zh: '汤', emoji: '🍲' },
    { en: 'egg', zh: '鸡蛋', emoji: '🥚' },
    { en: 'noodles', zh: '面条', emoji: '🍜' },
    { en: 'ball', zh: '球', emoji: '⚽' },
    { en: 'doll', zh: '洋娃娃', emoji: '🎎' },
    { en: 'bicycle', zh: '自行车', emoji: '🚲' },
    { en: 'kite', zh: '风筝', emoji: '🪁' },
    { en: 'jelly', zh: '果冻', emoji: '🍮' },
    { en: 'ice‑cream', zh: '冰淇淋', emoji: '🍦' },
    { en: 'sweet', zh: '糖果', emoji: '🍬' },
    { en: 'biscuit', zh: '饼干', emoji: '🍪' },
    { en: 'cola', zh: '可乐', emoji: '🥤' },
    { en: 'juice', zh: '果汁', emoji: '🧃' },
    { en: 'milk', zh: '牛奶', emoji: '🥛' },
    { en: 'water', zh: '水', emoji: '💧' },
    { en: 'warm', zh: '温暖的', emoji: '🌤️' },
    { en: 'hot', zh: '热的', emoji: '🔥' },
    { en: 'spring', zh: '春天', emoji: '🌷' },
    { en: 'summer', zh: '夏天', emoji: '☀️' },
    { en: 'sunny', zh: '晴朗的', emoji: '🌞' },
    { en: 'cloudy', zh: '多云的', emoji: '☁️' },
    { en: 'rainy', zh: '下雨的', emoji: '🌧️' },
    { en: 'windy', zh: '刮风的', emoji: '💨' },
    { en: 'T‑shirt', zh: 'T恤衫', emoji: '👕' },
    { en: 'dress', zh: '连衣裙', emoji: '👗' },
    { en: 'shorts', zh: '短裤', emoji: '🩳' },
    { en: 'blouse', zh: '女式衬衫', emoji: '👚' },
    { en: 'ride', zh: '骑', emoji: '🚴' },
    { en: 'skip', zh: '跳绳', emoji: '🪀' },
    { en: 'play', zh: '玩耍', emoji: '🎮' },
    { en: 'fly', zh: '放飞', emoji: '🪁' },
    { en: 'gift', zh: '礼物', emoji: '🎁' },
    { en: 'card', zh: '贺卡', emoji: '💌' },
    { en: 'firecracker', zh: '鞭炮', emoji: '🧨' },
    { en: 'firework', zh: '烟花', emoji: '🎆' },
    { en: 'boy', zh: '男孩', emoji: '👦' },
    { en: 'wolf', zh: '狼', emoji: '🐺' },
    { en: 'farmer', zh: '农民', emoji: '👨‍🌾' }
],
Grade2A:[
    { en: 'evening', zh: '傍晚', emoji: '🌆' },
    { en: 'night', zh: '夜晚', emoji: '🌙' },
    { en: 'boy', zh: '男孩', emoji: '👦' },
    { en: 'girl', zh: '女孩', emoji: '👧' },
    { en: 'big', zh: '大的', emoji: '🗻' },
    { en: 'small', zh: '小的', emoji: '🔍' },
    { en: 'seven', zh: '七', emoji: '7️⃣' },
    { en: 'eight', zh: '八', emoji: '8️⃣' },
    { en: 'nine', zh: '九', emoji: '9️⃣' },
    { en: 'ten', zh: '十', emoji: '🔟' },
    { en: 'run', zh: '跑', emoji: '🏃' },
    { en: 'write', zh: '写', emoji: '✍️' },
    { en: 'swim', zh: '游泳', emoji: '🏊' },
    { en: 'fly', zh: '飞', emoji: '🦅' },
    { en: 'old', zh: '年老的', emoji: '👴' },
    { en: 'young', zh: '年轻的', emoji: '👶' },
    { en: 'hair', zh: '头发', emoji: '💇' },
    { en: 'head', zh: '头', emoji: '👤' },
    { en: 'face', zh: '脸', emoji: '😊' },
    { en: 'slide', zh: '滑滑梯', emoji: '🛝' },
    { en: 'swing', zh: '秋千', emoji: '🎪' },
    { en: 'seesaw', zh: '跷跷板', emoji: '⚖️' },
    { en: 'bag', zh: '书包', emoji: '🎒' },
    { en: 'box', zh: '盒子', emoji: '📦' },
    { en: 'desk', zh: '书桌', emoji: '🪑' },
    { en: 'chair', zh: '椅子', emoji: '🪑' },
    { en: 'kitchen', zh: '厨房', emoji: '🍳' },
    { en: 'bowl', zh: '碗', emoji: '🥣' },
    { en: 'spoon', zh: '勺子', emoji: '🥄' },
    { en: 'chopsticks', zh: '筷子', emoji: '🥢' },
    { en: 'moon', zh: '月亮', emoji: '🌙' },
    { en: 'star', zh: '星星', emoji: '⭐' },
    { en: 'sun', zh: '太阳', emoji: '☀️' },
    { en: 'flower', zh: '花', emoji: '🌸' },
    { en: 'tree', zh: '树', emoji: '🌳' },
    { en: 'leaf', zh: '树叶', emoji: '🍃' },
    { en: 'butterfly', zh: '蝴蝶', emoji: '🦋' },
    { en: 'ladybird', zh: '瓢虫', emoji: '🐞' }
],
Grade2B:[
    { en: 'soft', zh: '柔软的', emoji: '🧸' },
    { en: 'hard', zh: '坚硬的', emoji: '🪨' },
    { en: 'rough', zh: '粗糙的', emoji: '🌵' },
    { en: 'smooth', zh: '光滑的', emoji: '🪞' },
    { en: 'watch', zh: '手表', emoji: '⌚' },
    { en: 'bag', zh: '包', emoji: '👜' },
    { en: 'glass', zh: '玻璃杯', emoji: '🥛' },
    { en: 'touch', zh: '摸', emoji: '🤚' },
    { en: 'blind', zh: '失明的', emoji: '👁️‍🗨️' },
    { en: 'pineapple', zh: '菠萝', emoji: '🍍' },
    { en: 'banana', zh: '香蕉', emoji: '🍌' },
    { en: 'lemon', zh: '柠檬', emoji: '🍋' },
    { en: 'melon', zh: '瓜', emoji: '🍈' },
    { en: 'taste', zh: '尝', emoji: '👅' },
    { en: 'sweet', zh: '甜的', emoji: '🍬' },
    { en: 'sour', zh: '酸的', emoji: '🍋' },
    { en: 'salt', zh: '盐', emoji: '🧂' },
    { en: 'salty', zh: '咸的', emoji: '🧂' },
    { en: 'bitter', zh: '苦的', emoji: '☕' },
    { en: 'tooth', zh: '牙齿', emoji: '🦷' },
    { en: 'teeth', zh: '牙齿(复数)', emoji: '🦷' },
    { en: 'hop', zh: '单脚跳', emoji: '🐇' },
    { en: 'jump', zh: '跳', emoji: '🦘' },
    { en: 'walk', zh: '走路', emoji: '🚶' },
    { en: 'climb', zh: '爬', emoji: '🧗' },
    { en: 'summer', zh: '夏天', emoji: '☀️' },
    { en: 'autumn', zh: '秋天', emoji: '🍂' },
    { en: 'winter', zh: '冬天', emoji: '❄️' },
    { en: 'cool', zh: '凉爽的', emoji: '🍃' },
    { en: 'cold', zh: '寒冷的', emoji: '🥶' },
    { en: 'snow', zh: '雪', emoji: '❄️' },
    { en: 'scarf', zh: '围巾', emoji: '🧣' },
    { en: 'gloves', zh: '手套', emoji: '🧤' }
],
Grade3A:[
    { en: 'hello', zh: '你好', emoji: '👋' },
    { en: 'hi', zh: '嗨', emoji: '✋' },
    { en: 'good', zh: '好的', emoji: '👍' },
    { en: 'morning', zh: '早晨', emoji: '🌅' },
    { en: 'afternoon', zh: '下午', emoji: '☀️' },
    { en: 'how', zh: '怎样', emoji: '❓' },
    { en: 'are', zh: '是', emoji: '✅' },
    { en: 'you', zh: '你，你们', emoji: '🙋' },
    { en: 'fine', zh: '健康的', emoji: '💪' },
    { en: 'thank', zh: '感谢', emoji: '🙏' },
    { en: 'yes', zh: '是的', emoji: '✔️' },
    { en: 'no', zh: '不', emoji: '❌' },
    { en: 'friend', zh: '朋友', emoji: '🤝' },
    { en: 'this', zh: '这个', emoji: '👉' },
    { en: 'is', zh: '是', emoji: '✅' },
    { en: 'my', zh: '我的', emoji: '👈' },
    { en: 'he', zh: '他', emoji: '👨' },
    { en: 'she', zh: '她', emoji: '👩' },
    { en: 'classroom', zh: '教室', emoji: '🏫' },
    { en: 'window', zh: '窗户', emoji: '🪟' },
    { en: 'door', zh: '门', emoji: '🚪' },
    { en: 'blackboard', zh: '黑板', emoji: '📋' },
    { en: 'desk', zh: '书桌', emoji: '🪑' },
    { en: 'chair', zh: '椅子', emoji: '🪑' },
    { en: 'fruit', zh: '水果', emoji: '🍓' },
    { en: 'apple', zh: '苹果', emoji: '🍎' },
    { en: 'banana', zh: '香蕉', emoji: '🍌' },
    { en: 'pear', zh: '梨', emoji: '🍐' },
    { en: 'orange', zh: '橙子', emoji: '🍊' },
    { en: 'room', zh: '房间', emoji: '🛏️' },
    { en: 'bed', zh: '床', emoji: '🛏️' },
    { en: 'table', zh: '桌子', emoji: '🍽️' },
    { en: 'lamp', zh: '台灯', emoji: '💡' },
    { en: 'where', zh: '哪里', emoji: '📍' },
    { en: 'animal', zh: '动物', emoji: '🦁' },
    { en: 'dog', zh: '狗', emoji: '🐶' },
    { en: 'cat', zh: '猫', emoji: '🐱' },
    { en: 'bird', zh: '小鸟', emoji: '🐦' },
    { en: 'fish', zh: '鱼', emoji: '🐟' },
    { en: 'season', zh: '季节', emoji: '🗓️' },
    { en: 'spring', zh: '春天', emoji: '🌷' },
    { en: 'summer', zh: '夏天', emoji: '☀️' },
    { en: 'autumn', zh: '秋天', emoji: '🍂' },
    { en: 'winter', zh: '冬天', emoji: '❄️' }
],
Grade3B:[
    { en: 'subject', zh: '科目', emoji: '📖' },
    { en: 'Chinese', zh: '语文', emoji: '🇨🇳' },
    { en: 'Maths', zh: '数学', emoji: '🔢' },
    { en: 'English', zh: '英语', emoji: '🔤' },
    { en: 'Music', zh: '音乐', emoji: '🎵' },
    { en: 'Art', zh: '美术', emoji: '🎨' },
    { en: 'P.E.', zh: '体育', emoji: '⚽' },
    { en: 'break', zh: '课间休息', emoji: '⏸️' },
    { en: 'day', zh: '天', emoji: '☀️' },
    { en: 'Monday', zh: '周一', emoji: '📅' },
    { en: 'Tuesday', zh: '周二', emoji: '📅' },
    { en: 'Wednesday', zh: '周三', emoji: '📅' },
    { en: 'Thursday', zh: '周四', emoji: '📅' },
    { en: 'Friday', zh: '周五', emoji: '📅' },
    { en: 'Saturday', zh: '周六', emoji: '📅' },
    { en: 'Sunday', zh: '周日', emoji: '📅' },
    { en: 'food', zh: '食物', emoji: '🍔' },
    { en: 'rice', zh: '米饭', emoji: '🍚' },
    { en: 'noodles', zh: '面条', emoji: '🍜' },
    { en: 'bread', zh: '面包', emoji: '🍞' },
    { en: 'milk', zh: '牛奶', emoji: '🥛' },
    { en: 'water', zh: '水', emoji: '💧' },
    { en: 'drink', zh: '喝', emoji: '🥤' },
    { en: 'clothes', zh: '衣服', emoji: '👕' },
    { en: 'shirt', zh: '衬衫', emoji: '👔' },
    { en: 'skirt', zh: '短裙', emoji: '👗' },
    { en: 'coat', zh: '外套', emoji: '🧥' },
    { en: 'sweater', zh: '毛衣', emoji: '🧶' },
    { en: 'weather', zh: '天气', emoji: '🌤️' },
    { en: 'windy', zh: '有风的', emoji: '💨' },
    { en: 'rainy', zh: '下雨的', emoji: '🌧️' },
    { en: 'sunny', zh: '晴朗的', emoji: '🌞' },
    { en: 'cloudy', zh: '多云的', emoji: '☁️' }
],
Grade4A:[
    { en: 'home', zh: '家', emoji: '🏠' },
    { en: 'city', zh: '城市', emoji: '🏙️' },
    { en: 'country', zh: '乡村', emoji: '🌾' },
    { en: 'building', zh: '大楼', emoji: '🏢' },
    { en: 'flat', zh: '公寓', emoji: '🏬' },
    { en: 'house', zh: '房子', emoji: '🏡' },
    { en: 'street', zh: '街道', emoji: '🛣️' },
    { en: 'farm', zh: '农场', emoji: '🌻' },
    { en: 'animal', zh: '动物', emoji: '🐴' },
    { en: 'horse', zh: '马', emoji: '🐎' },
    { en: 'cow', zh: '奶牛', emoji: '🐄' },
    { en: 'pig', zh: '猪', emoji: '🐷' },
    { en: 'sheep', zh: '绵羊', emoji: '🐑' },
    { en: 'goat', zh: '山羊', emoji: '🐐' },
    { en: 'number', zh: '数字', emoji: '🔢' },
    { en: 'thirty', zh: '三十', emoji: '3️⃣0️⃣' },
    { en: 'forty', zh: '四十', emoji: '4️⃣0️⃣' },
    { en: 'fifty', zh: '五十', emoji: '5️⃣0️⃣' },
    { en: 'sixty', zh: '六十', emoji: '6️⃣0️⃣' },
    { en: 'seventy', zh: '七十', emoji: '7️⃣0️⃣' },
    { en: 'eighty', zh: '八十', emoji: '8️⃣0️⃣' },
    { en: 'ninety', zh: '九十', emoji: '9️⃣0️⃣' },
    { en: 'shopping', zh: '购物', emoji: '🛒' },
    { en: 'supermarket', zh: '超市', emoji: '🏪' },
    { en: 'toy', zh: '玩具', emoji: '🎮' },
    { en: 'plant', zh: '植物', emoji: '🌱' },
    { en: 'root', zh: '根', emoji: '🌿' },
    { en: 'stem', zh: '茎', emoji: '🌾' },
    { en: 'leaf', zh: '叶子', emoji: '🍃' },
    { en: 'flower', zh: '花', emoji: '🌸' },
    { en: 'fruit', zh: '果实', emoji: '🍎' },
    { en: 'season', zh: '季节', emoji: '🗓️' },
    { en: 'spring', zh: '春天', emoji: '🌷' },
    { en: 'summer', zh: '夏天', emoji: '☀️' },
    { en: 'autumn', zh: '秋天', emoji: '🍂' },
    { en: 'winter', zh: '冬天', emoji: '❄️' }
],
Grade4B:[
    { en: 'sign', zh: '标识', emoji: '🚏' },
    { en: 'forest', zh: '森林', emoji: '🌲' },
    { en: 'river', zh: '小河', emoji: '🌊' },
    { en: 'lake', zh: '湖泊', emoji: '💧' },
    { en: 'path', zh: '小路', emoji: '🛤️' },
    { en: 'rule', zh: '规则', emoji: '📜' },
    { en: 'quiet', zh: '安静的', emoji: '🤫' },
    { en: 'loud', zh: '吵闹的', emoji: '📢' },
    { en: 'fire', zh: '火', emoji: '🔥' },
    { en: 'safety', zh: '安全', emoji: '🛡️' },
    { en: 'cross', zh: '穿过', emoji: '🚶‍➡️' },
    { en: 'road', zh: '马路', emoji: '🛣️' },
    { en: 'traffic', zh: '交通', emoji: '🚦' },
    { en: 'light', zh: '灯', emoji: '💡' },
    { en: 'grandparent', zh: '祖父母', emoji: '👵' },
    { en: 'visit', zh: '拜访', emoji: '🏘️' },
    { en: 'weekend', zh: '周末', emoji: '🎉' },
    { en: 'garden', zh: '花园', emoji: '🌷' },
    { en: 'grow', zh: '种植', emoji: '🌱' },
    { en: 'vegetable', zh: '蔬菜', emoji: '🥬' },
    { en: 'tomato', zh: '西红柿', emoji: '🍅' },
    { en: 'potato', zh: '土豆', emoji: '🥔' }
],
Grade5A:[
    { en: 'hobby', zh: '爱好', emoji: '🎯' },
    { en: 'collect', zh: '收集', emoji: '📥' },
    { en: 'sticker', zh: '贴纸', emoji: '🏷️' },
    { en: 'album', zh: '相册', emoji: '📔' },
    { en: 'play chess', zh: '下棋', emoji: '♟️' },
    { en: 'camp', zh: '露营', emoji: '⛺' },
    { en: 'cycle', zh: '骑自行车', emoji: '🚴' },
    { en: 'should', zh: '应该', emoji: '✅' },
    { en: 'must', zh: '必须', emoji: '❗' },
    { en: 'mustn’t', zh: '禁止', emoji: '🚫' },
    { en: 'healthy', zh: '健康的', emoji: '💪' },
    { en: 'unhealthy', zh: '不健康的', emoji: '⚠️' },
    { en: 'diet', zh: '饮食', emoji: '🥗' },
    { en: 'fruit', zh: '水果', emoji: '🍓' },
    { en: 'vegetable', zh: '蔬菜', emoji: '🥦' },
    { en: 'o’clock', zh: '点钟', emoji: '🕒' },
    { en: 'quarter', zh: '一刻钟', emoji: '⏱️' },
    { en: 'half', zh: '一半', emoji: '🥪' },
    { en: 'past', zh: '过', emoji: '⏪' },
    { en: 'to', zh: '差', emoji: '⏩' },
    { en: 'travel', zh: '旅行', emoji: '✈️' },
    { en: 'plane', zh: '飞机', emoji: '🛩️' },
    { en: 'train', zh: '火车', emoji: '🚞' },
    { en: 'ferry', zh: '轮渡', emoji: '⛴️' },
    { en: 'taxi', zh: '出租车', emoji: '🚕' }
],
Grade5B:[
    { en: 'change', zh: '变化', emoji: '🔄' },
    { en: 'then', zh: '那时', emoji: '⏳' },
    { en: 'now', zh: '现在', emoji: '⏰' },
    { en: 'before', zh: '以前', emoji: '🕰️' },
    { en: 'different', zh: '不同的', emoji: '🔀' },
    { en: 'same', zh: '相同的', emoji: '🟰' },
    { en: 'life', zh: '生活', emoji: '🏡' },
    { en: 'work', zh: '工作', emoji: '💼' },
    { en: 'telephone', zh: '电话', emoji: '☎️' },
    { en: 'mobile phone', zh: '手机', emoji: '📱' },
    { en: 'e‑mail', zh: '电子邮件', emoji: '📧' },
    { en: 'festival', zh: '节日', emoji: '🎉' },
    { en: 'Spring Festival', zh: '春节', emoji: '🧨' },
    { en: 'Dragon Boat Festival', zh: '端午节', emoji: '🚣' },
    { en: 'Mid‑autumn Festival', zh: '中秋节', emoji: '🥮' },
    { en: 'Double Ninth Festival', zh: '重阳节', emoji: '🌄' }
]
}

/* 按单词长度排序（短词优先，符合儿童学习节奏） */
export function sortByLength(words: WordItem[]): WordItem[] {
  return [...words].sort((a, b) => a.en.length - b.en.length)
}

/** 合并内置 + 自建词库 */
export function buildCategories(customWords: WordItem[]): Record<string, CategoryWords> {
  const cats: Record<string, CategoryWords> = {}
  Object.entries(CATEGORY_DEFS).forEach(([key, def]) => {
    cats[key] = { ...def, words: sortByLength(BUILTIN_WORDS[key]) }
  })
  cats.custom = { label: '📚 我的词库', color: '#FF9F5A', words: sortByLength(customWords) }
  return cats
}

/* ---------------- 自建词库（存于浏览器本地） ---------------- */
const CUSTOM_KEY = 'ttrain_custom_words_v1'

export function loadCustomWords(): WordItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_KEY)
    const arr = raw ? JSON.parse(raw) : []
    return Array.isArray(arr) ? (arr as WordItem[]) : []
  } catch {
    return []
  }
}

export function saveCustomWords(words: WordItem[]): void {
  try {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(words))
  } catch {
    /* storage unavailable */
  }
}

/* ---------------- 解析：粘贴文本 / 上传文件 ---------------- */
export function parseLines(text: string): WordItem[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(',').map((p) => p.trim())
      const en = (parts[0] || '').toLowerCase().replace(/[^a-z]/g, '')
      const zh = parts[1] || ''
      const emoji = parts[2] || '📝'
      return en ? { en, zh, emoji } : null
    })
    .filter(Boolean) as WordItem[]
}

export function parseFileContent(text: string): WordItem[] {
  const trimmed = text.trim()
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const data = JSON.parse(trimmed)
      const arr = Array.isArray(data) ? data : data.words || []
      const words: WordItem[] = arr.map((w: Record<string, unknown>) => ({
        en: String(w.en ?? w.word ?? '').toLowerCase().replace(/[^a-z]/g, ''),
        zh: String(w.zh ?? w.meaning ?? ''),
        emoji: String(w.emoji ?? '📝'),
      }))
      return words.filter((w) => w.en)
    } catch {
      // 不是合法 JSON，按 CSV/文本处理
    }
  }
  return parseLines(trimmed)
}
