// =========================================================
// data/food-helper.js: everything the Food Helper chat can say.
//
// The Food Helper is NOT a real AI. It looks for key words in
// the question and picks the best answer from this list. Every
// answer uses the same checked information as the Nutrition page
// (data/nutrition.js, based on the NHS Eatwell Guide; see
// sources). To add a new answer, copy one of the TOPICS below.
//
// SAFETY (CLAUDE.md rule 6): no weight-loss, calorie, dieting or
// supplement advice. Questions like that get a kind "talk to a
// parent or doctor" reply instead (SAFETY_REPLIES).
// FLAG for the coach: please read through these answers.
// =========================================================

import { PLATE, TIMELINE, SAMPLE_DAYS, MYTHS } from "./nutrition.js";

// Small helpers to reuse the Nutrition page's own words
const myth = (start) => MYTHS.find((m) => m.myth.startsWith(start)).fact;
const plate = (label) => PLATE.find((p) => p.label === label).examples;
const meal = (day, name, n = 0) => SAMPLE_DAYS[day].filter((m) => m.meal.startsWith(name))[n];

// The topic cards shown before the first question (and as chips after)
export const SUGGESTED = [
  { icon: "🏃", short: "Before training", q: "What should I eat before training?" },
  { icon: "🍽️", short: "After a match", q: "What should I eat after a match?" },
  { icon: "💧", short: "Am I drinking enough?", q: "How do I know if I'm drinking enough?" },
  { icon: "🥤", short: "Protein shakes?", q: "Do I need protein shakes?" },
  { icon: "🍳", short: "Breakfast ideas", q: "What's a good breakfast?" },
  { icon: "⚡", short: "Energy drinks?", q: "Are energy drinks OK?" },
];

export const GREETING =
  "Hi! I'm the Food Helper 🍌 Ask me about food and drinks for football: what to eat before training, match days, water, breakfast and more.";

// When no topic matches
export const NOT_SURE =
  "I'm not sure about that one yet. I only know about food and drinks for football. Try one of the questions below, or look through the tabs on this page.";

// ---------- Safety: questions we never answer ourselves ----------
// Checked FIRST, before the normal topics.
export const SAFETY_REPLIES = [
  {
    // Worries about eating or your body
    words: ["stop eating", "not eating", "starv", "throw up", "vomit", "make myself sick", "hate my body", "too fat", "eating disorder", "anorexi", "bulimi"],
    reply: "Thank you for asking. That's really important, and it's not something a website should answer. Please talk to someone you trust, like a parent, a teacher or your doctor. You're not alone, and they can help.",
  },
  {
    // Weight, dieting and calories
    words: ["weight", "diet", "calorie", "kcal", "fat ", "fatty", "skinny", "thin ", "bulk", "slim", "six pack", "abs ", "fasting"],
    reply: "PITCHPATH doesn't give advice about weight, dieting or calories. You're still growing, so the best plan is regular, balanced meals. If you have questions about your weight or body, talk to a parent and ask a doctor or registered dietitian.",
  },
  {
    // Health problems
    words: ["allerg", "diabet", "sick", "ill ", "pain", "hurt", "injur", "medicine", "asthma", "faint", "dizzy", "headache"],
    reply: "That sounds like a question for a grown-up who knows your health. Please talk to a parent and a doctor. If you have an allergy or a medical condition, always follow your doctor's advice about food.",
  },
];

// ---------- Topics ----------
// words: key words to look for (the more that match, the better).
// A word starting with "~" is very common, so it only counts a little.
// A word starting with "!" is very specific, so it counts a lot.
// tab: which tab on the Nutrition page has more (opened by the link)
export const TOPICS = [
  {
    id: "before",
    words: ["before", "pre ", "ahead", "prepare"],
    reply: `3-4 hours before: ${TIMELINE[0].what.toLowerCase()}, like ${TIMELINE[0].examples.toLowerCase()} 1-2 hours before: ${TIMELINE[1].what.toLowerCase()}, like ${TIMELINE[1].examples.toLowerCase()}`,
    tab: ["timing", "Match day"],
  },
  {
    id: "after",
    words: ["after", "recover", "recovery", "post", "finished"],
    reply: `Within 1-2 hours after: ${TIMELINE[3].what.toLowerCase()}. For example: ${TIMELINE[3].examples.toLowerCase()} Milk is a great drink after training.`,
    tab: ["timing", "Match day"],
  },
  {
    id: "during",
    words: ["during", "half time", "halftime", "break"],
    reply: `${TIMELINE[2].examples} Take sips at every break.`,
    tab: ["hydration", "Hydration"],
  },
  {
    id: "match",
    words: ["match", "game", "matchday", "tournament", "big day"],
    reply: `On a match day: eat a normal balanced meal 3-4 hours before, a light snack 1-2 hours before if you're hungry, sip water during, and have a meal or snack with carbohydrate and protein within 1-2 hours after.`,
    tab: ["timing", "Match day"],
  },
  {
    id: "pee",
    words: ["pee", "urine", "wee", "colour", "color", "enough"],
    reply: "Check the colour of your pee: pale straw means you're well hydrated 👍, yellow means drink some water, and dark yellow means drink water now. Some foods and vitamins change the colour, so if you're worried, ask a parent or doctor.",
    tab: ["hydration", "Hydration"],
  },
  {
    id: "water",
    words: ["water", "~drink", "hydrat", "thirst", "sweat", "bottle"],
    reply: "Sip water all day, not just at training. Have a drink in the hour or two before, sip at every break, and keep drinking afterwards to replace what you sweated out. On hot days, drink more. Water is the best choice.",
    tab: ["hydration", "Hydration"],
  },
  {
    id: "energy-drinks",
    words: ["energy drink", "red bull", "caffeine", "monster", "sting", "coffee"],
    reply: myth("Energy drinks"),
    tab: ["myths", "Myths"],
  },
  {
    id: "supplements",
    words: ["supplement", "protein shake", "protein powder", "powder", "shake", "whey", "creatine", "pill", "vitamin", "tablet"],
    reply: `${myth("Young players need protein shakes")} If a doctor has given you vitamins or medicine, keep following their advice.`,
    tab: ["myths", "Myths"],
  },
  {
    id: "protein",
    words: ["protein", "muscle", "strong", "stronger", "egg", "chicken", "paneer", "dal"],
    reply: `${myth("More protein")} Good protein foods: ${plate("Protein").toLowerCase()}.`,
    tab: ["plate", "Your plate"],
  },
  {
    id: "carbs",
    words: ["carb", "rice", "pasta", "bread", "potato", "roti", "chapati", "~energy", "tired", "fuel"],
    reply: `${myth("Carbohydrates")} Good choices: ${plate("Carbohydrates").toLowerCase()}.`,
    tab: ["plate", "Your plate"],
  },
  {
    id: "breakfast",
    words: ["breakfast", "morning", "wake up"],
    reply: `${myth("Skipping breakfast")} Ideas: ${meal("Training day", "Breakfast").veg.toLowerCase()}, or ${meal("Training day", "Breakfast").nonVeg.toLowerCase()}.`,
    tab: ["sample", "Meal ideas"],
  },
  {
    id: "snacks",
    words: ["snack", "hungry", "between", "school"],
    reply: `Snack ideas: ${meal("Training day", "Mid-morning").veg.toLowerCase()}, ${meal("Rest day", "Snack").veg.toLowerCase()}, or ${meal("Rest day", "Snack", 1).veg.toLowerCase()}. Before training, a banana or toast with honey works well.`,
    tab: ["sample", "Meal ideas"],
  },
  {
    id: "vegetarian",
    words: ["vegetarian", "veg ", "vegan", "meat", "no meat"],
    reply: "Yes, you can be a great footballer and vegetarian. Get protein from beans, lentils, dal, eggs, tofu, paneer, milk and yoghurt. The Meal ideas tab has a vegetarian switch with a full day of ideas. If you're vegan or have other needs, ask a parent to check with a doctor or dietitian.",
    tab: ["sample", "Meal ideas"],
  },
  {
    id: "plate",
    words: ["plate", "balanced", "healthy", "~meal", "lunch", "dinner", "~food"],
    reply: `Fill your plate roughly like this: about a third carbohydrates (${plate("Carbohydrates").toLowerCase()}), about a third fruit and vegetables, some protein (${plate("Protein").toLowerCase()}), and a little dairy and healthy fats. No measuring needed.`,
    tab: ["plate", "Your plate"],
  },
  {
    id: "bones",
    words: ["calcium", "bone", "iron", "milk", "dairy", "grow", "growing"],
    reply: "Calcium (milk, yoghurt, cheese, fortified plant milks) helps build strong bones. Iron (beans, lentils, leafy greens, meat, eggs) helps your energy. You're training and growing, so eat regular meals and snacks.",
    tab: ["plate", "Your plate"],
  },
  {
    id: "treats",
    words: ["treat", "junk", "sweet", "chocolate", "sugar", "fast food", "pizza", "burger", "chips", "ice cream", "cake", "!coke", "!cola", "!pepsi", "!sprite", "!soda", "!fizzy", "!soft drink"],
    reply: "No food is \"banned\". Enjoy treats sometimes, as part of a varied diet. Fizzy and sugary drinks are treats too. For training and matches, water is the best drink. Most of the time, choose normal balanced meals.",
    tab: ["myths", "Myths"],
  },
  {
    id: "rest-day",
    words: ["rest day", "day off", "rest", "no training"],
    reply: `On rest days, keep eating regular balanced meals. For example: ${meal("Rest day", "Breakfast").veg.toLowerCase()} for breakfast and ${meal("Rest day", "Dinner").veg.toLowerCase()} for dinner. You still need to drink water on rest days.`,
    tab: ["sample", "Meal ideas"],
  },
  {
    id: "fruit-veg",
    words: ["fruit", "vegetable", "veggies", "greens", "salad", "banana", "apple"],
    reply: `Fruit and vegetables should be about a third of your plate. ${plate("Fruit and vegetables")}. A banana is a great snack before training.`,
    tab: ["plate", "Your plate"],
  },
  {
    id: "hello",
    words: ["hi ", "hello", "hey ", "thanks", "thank you", "who are you"],
    reply: "Hi! 👋 I'm here to help with food and drinks for football. Ask me a question, or tap one of the buttons below.",
    tab: null,
  },
];
