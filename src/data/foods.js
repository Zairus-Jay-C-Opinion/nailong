// Phase-based food suggestions using affordable, everyday Filipino staples
// available at any palengke or sari-sari store.

export const foodsByPhase = {
  menstrual: {
    title: 'Period days',
    note: 'Replenish lost iron. Warm, easy-to-eat food.',
    foods: [
      { name: 'Lugaw / arroz caldo', why: 'Warm and easy to eat even when you have no appetite' },
      { name: 'Saging (lakatan/saba)', why: 'Potassium helps with cramps and mood' },
      { name: 'Munggo (mongo guisado)', why: 'Rich in iron and protein, very affordable' },
      { name: 'Malunggay in tinola', why: 'Iron and vitamins, usually growing right outside' },
      { name: 'Dark chocolate', why: 'Magnesium helps relax cramps' },
    ],
  },

  follicular: {
    title: 'After your period',
    note: 'Energy is rising. Light, fresh food.',
    foods: [
      { name: 'Ensaladang talong / kamatis', why: 'Light, fresh, and full of vitamins' },
      { name: 'Itlog (fried or salted)', why: 'Protein for energy' },
      { name: 'Banana and milk', why: 'A nutritious breakfast combo' },
      { name: 'Kamote (boiled or ginataan)', why: 'Slow carbs — keeps you full longer' },
    ],
  },

  ovulation: {
    title: 'Fertile window',
    note: 'Peak energy. Eat well to support it.',
    foods: [
      { name: 'Kangkong (adobo or sautéed)', why: 'Iron and fiber, very cheap' },
      { name: 'Tahong (tinola)', why: 'Zinc and iron, great in soup' },
      { name: 'Fruits: papaya, mango', why: 'Antioxidants and vitamin C' },
      { name: 'Fish (galunggong/tilapia)', why: 'Omega-3, light protein' },
    ],
  },

  luteal: {
    title: 'Before your period',
    note: 'Period is coming. Build up iron, avoid too much salt.',
    foods: [
      { name: 'Munggo soup', why: 'Iron stock-up before your period arrives' },
      { name: 'Kamote and banana', why: 'Curbs cravings, slow-release sugar' },
      { name: 'Peanuts', why: 'Magnesium helps with bloating and irritability' },
      { name: 'Lots of water', why: 'Reduces bloating and prevents headaches' },
      { name: 'Leafy greens (pechay)', why: 'Iron and fiber before your period' },
    ],
  },

  unknown: {
    title: 'Eat well today',
    note: 'Log your period for phase-matched food suggestions.',
    foods: [
      { name: 'Vegetables every meal', why: 'Iron and fiber, always a good idea' },
      { name: 'Water — 8 glasses', why: 'Hydration is the most basic care' },
    ],
  },
};

export function getFoodsForPhase(phase) {
  return foodsByPhase[phase] || foodsByPhase.unknown;
}
