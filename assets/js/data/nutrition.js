// =========================================================
// data/nutrition.js: meal ideas, timeline and myths for the
// Nutrition page. Food-based only. No calorie numbers, no
// dieting, no supplements (spec Sections 6.5 and 9).
// =========================================================

// The "football plate" proportions (a simplified picture based
// on the NHS Eatwell Guide; see sources). FLAG: check with teacher/coach.
export const PLATE = [
  { label: "Carbohydrates", percent: 35, color: "#FFC857", examples: "Rice, pasta, bread, potatoes, oats, chapati, noodles" },
  { label: "Fruit and vegetables", percent: 35, color: "#0B6E4F", examples: "Any fresh, frozen or tinned: aim for lots of colours" },
  { label: "Protein", percent: 20, color: "#F26B21", examples: "Beans, lentils, eggs, chicken, fish, tofu, paneer" },
  { label: "Dairy and healthy fats", percent: 10, color: "#4A90C2", examples: "Milk, yoghurt, cheese, nuts, seeds, olive oil" },
];

// Timeline for a training or match day.
export const TIMELINE = [
  { when: "3-4 hours before", what: "A normal balanced meal", examples: "Pasta with tomato and vegetable sauce and chicken or beans; rice with dal and vegetables." },
  { when: "1-2 hours before", what: "A light snack, if you're hungry", examples: "A banana, a slice of toast with honey, a small yoghurt or a handful of crackers." },
  { when: "During", what: "Sips of water", examples: "Drink water at breaks. Water is enough for normal training sessions." },
  { when: "Within 1-2 hours after", what: "A meal or snack with carbohydrate and protein", examples: "Milk and a sandwich, eggs on toast, rice and beans, or a normal family meal." },
];

// Sample days. Each meal has a vegetarian (veg) and a non-vegetarian (nonVeg) idea.
export const SAMPLE_DAYS = {
  "Training day": [
    { meal: "Breakfast", veg: "Porridge (oats) made with milk, topped with banana", nonVeg: "Scrambled eggs on wholemeal toast with a glass of milk" },
    { meal: "Mid-morning snack", veg: "An apple and a handful of nuts (if no allergy)", nonVeg: "An apple and a cheese sandwich" },
    { meal: "Lunch", veg: "Wholemeal wrap with hummus, cheese and salad, plus a yoghurt", nonVeg: "Chicken and salad sandwich, plus a piece of fruit" },
    { meal: "Before training (1-2 h)", veg: "Banana or toast with honey", nonVeg: "Banana or toast with honey" },
    { meal: "After training / dinner", veg: "Rice with lentil dal or bean chilli and vegetables", nonVeg: "Pasta with tuna or chicken, tomato sauce and vegetables" },
    { meal: "Drinks", veg: "Water through the day. Milk is a good after-training drink.", nonVeg: "Water through the day. Milk is a good after-training drink." },
  ],
  "Rest day": [
    { meal: "Breakfast", veg: "Wholegrain cereal with milk and berries", nonVeg: "Boiled eggs with toast and an orange" },
    { meal: "Snack", veg: "Yoghurt with a sprinkle of seeds", nonVeg: "Yoghurt with fruit" },
    { meal: "Lunch", veg: "Vegetable soup with bread and cheese", nonVeg: "Jacket potato with beans or tuna and salad" },
    { meal: "Snack", veg: "Carrot sticks and hummus", nonVeg: "Carrot sticks and hummus" },
    { meal: "Dinner", veg: "Vegetable stir-fry with tofu or paneer and noodles", nonVeg: "Fish or chicken with potatoes and vegetables" },
    { meal: "Drinks", veg: "Water. You still need to drink on rest days.", nonVeg: "Water. You still need to drink on rest days." },
  ],
};

export const MYTHS = [
  {
    myth: "Skipping breakfast helps you play lighter and faster.",
    fact: "Skipping meals means less energy for training and school. Eat regular meals and snacks so your body has fuel.",
  },
  {
    myth: "Energy drinks give you more energy for football.",
    fact: "Energy drinks contain caffeine and lots of sugar and are not recommended for children and teenagers. Water is the best drink for training.",
  },
  {
    myth: "More protein = more muscle.",
    fact: "Muscles grow from training, rest, sleep and eating enough overall. Normal meals with protein foods (beans, eggs, dairy, meat, fish) give young players what they need.",
  },
  {
    myth: "Young players need protein shakes and supplements.",
    fact: "Supplements, protein powders and energy drinks are not needed for young players. Real food is enough, and some supplements are not tested for safety in teenagers.",
  },
  {
    myth: "Carbohydrates are bad for you.",
    fact: "Carbohydrates (like rice, pasta, bread and potatoes) are your main fuel for running and training. They should be part of most meals.",
  },
  {
    myth: "You only need to drink when you're thirsty during a match.",
    fact: "Drink water through the day and sip at breaks in training and matches. Feeling very thirsty can mean you are already a bit dehydrated.",
  },
];
