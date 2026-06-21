// Classify a food the user typed and pick Nailong's reaction (happy / angry /
// neutral). Keyword-based, tuned to common Filipino foods + junk. Nailong's
// message uses "Mom" so it can be personalized via voice.personalize().

const GOOD = [
  'vegetable', 'veggie', 'gulay', 'fruit', 'prutas', 'malunggay', 'kangkong', 'pechay',
  'fish', 'isda', 'tilapia', 'bangus', 'galunggong', 'egg', 'itlog', 'water', 'tubig',
  'munggo', 'mongo', 'kamote', 'banana', 'saging', 'oats', 'oatmeal', 'salad', 'ensalada',
  'soup', 'sabaw', 'tinola', 'chicken', 'manok', 'milk', 'gatas', 'nuts', 'mani', 'tahong',
  'papaya', 'mango', 'tomato', 'kamatis', 'lugaw', 'arroz caldo', 'avocado', 'yogurt', 'beans',
];

const BAD = [
  'chips', 'chichirya', 'soda', 'softdrink', 'soft drink', 'coke', 'sprite', 'royal', 'junk',
  'fried', 'french fries', 'fries', 'ice cream', 'candy', 'cake', 'burger', 'instant',
  'cup noodles', 'pancit canton', 'sweets', 'sugar', 'donut', 'pizza', 'fastfood', 'fast food',
  'hotdog', 'bacon', 'chocolate bar', 'energy drink',
];

function matches(text, list) {
  return list.some((k) => text.includes(k));
}

/** @returns {'good'|'bad'|'neutral'} */
export function classifyFood(name) {
  const t = (name || '').toLowerCase();
  if (matches(t, GOOD)) return 'good';
  if (matches(t, BAD)) return 'bad';
  return 'neutral';
}

// verdict → { mood (MASCOT key), message (with "Mom" for personalization) }
export const FOOD_REACTION = {
  good: { mood: 'happy', message: "Yay, Mom! That's so good for you — Nailong is happy 💛" },
  bad: { mood: 'angry', message: "Hmph, Mom! That's not the healthiest... Nailong is a little grumpy 😤 but still loves you." },
  neutral: { mood: 'neutral', message: "Okay Mom, noted! Maybe sneak in some veggies too 🌱" },
};
