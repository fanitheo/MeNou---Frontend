export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const DEFAULT_USER_ID = Number(
  import.meta.env.VITE_DEFAULT_USER_ID || 1
);

export const DEFAULT_KITCHEN_ID = Number(
  import.meta.env.VITE_DEFAULT_KITCHEN_ID || 1
);

export const KITCHEN_CATEGORIES = [
  {
    name: 'Meat',
    pluralTitle: 'Meat Products',
    image:
      '[https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 101, ingredientName: 'Ground Beef', defaultUnit: 'gr', defaultQty: '500' },
      { ingredientID: 102, ingredientName: 'Ground Pork', defaultUnit: 'gr', defaultQty: '250' },
      { ingredientID: 103, ingredientName: 'Chicken Breast', defaultUnit: 'gr', defaultQty: '400' },
      { ingredientID: 104, ingredientName: 'Turkey Slices', defaultUnit: 'gr', defaultQty: '200' },
      { ingredientID: 105, ingredientName: 'Lamb Chops', defaultUnit: 'kg', defaultQty: '1' }
    ]
  },
  {
    name: 'Oils',
    pluralTitle: 'Oils & Fats',
    image:
      '[https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 201, ingredientName: 'Extra Virgin Olive Oil', defaultUnit: 'lt', defaultQty: '1' },
      { ingredientID: 202, ingredientName: 'Sunflower Oil', defaultUnit: 'lt', defaultQty: '1' },
      { ingredientID: 203, ingredientName: 'Sesame Oil', defaultUnit: 'ml', defaultQty: '250' },
      { ingredientID: 204, ingredientName: 'Coconut Oil', defaultUnit: 'ml', defaultQty: '300' }
    ]
  },
  {
    name: 'Dairy',
    pluralTitle: 'Dairy Products',
    image:
      '[https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 301, ingredientName: 'Feta Cheese', defaultUnit: 'gr', defaultQty: '200' },
      { ingredientID: 302, ingredientName: 'Greek Yogurt', defaultUnit: 'gr', defaultQty: '300' },
      { ingredientID: 303, ingredientName: 'Whole Milk', defaultUnit: 'lt', defaultQty: '1' },
      { ingredientID: 304, ingredientName: 'Butter', defaultUnit: 'gr', defaultQty: '250' },
      { ingredientID: 305, ingredientName: 'Mozzarella', defaultUnit: 'gr', defaultQty: '200' },
      { ingredientID: 306, ingredientName: 'Cottage Cheese', defaultUnit: 'gr', defaultQty: '200' },
      { ingredientID: 307, ingredientName: 'Kefir', defaultUnit: 'ml', defaultQty: '500' }
    ]
  },
  {
    name: 'Seasoning',
    pluralTitle: 'Seasoning & Spices',
    image:
      '[https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 401, ingredientName: 'Salt', defaultUnit: 'gr', defaultQty: '100' },
      { ingredientID: 402, ingredientName: 'Black Pepper', defaultUnit: 'gr', defaultQty: '50' },
      { ingredientID: 403, ingredientName: 'Garlic Powder', defaultUnit: 'gr', defaultQty: '40' },
      { ingredientID: 404, ingredientName: 'Oregano', defaultUnit: 'gr', defaultQty: '30' },
      { ingredientID: 405, ingredientName: 'Turmeric', defaultUnit: 'gr', defaultQty: '40' },
      { ingredientID: 406, ingredientName: 'Paprika', defaultUnit: 'gr', defaultQty: '40' }
    ]
  },
  {
    name: 'Pasta',
    pluralTitle: 'Pasta & Grains',
    image:
      '[https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 501, ingredientName: 'Spaghetti', defaultUnit: 'gr', defaultQty: '500' },
      { ingredientID: 502, ingredientName: 'Penne', defaultUnit: 'gr', defaultQty: '500' },
      { ingredientID: 503, ingredientName: 'Orzo', defaultUnit: 'gr', defaultQty: '500' },
      { ingredientID: 504, ingredientName: 'Fusilli', defaultUnit: 'gr', defaultQty: '500' }
    ]
  },
  {
    name: 'Fruit',
    pluralTitle: 'Fresh Fruit',
    image:
      '[https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 601, ingredientName: 'Apple', defaultUnit: 'kg', defaultQty: '1' },
      { ingredientID: 602, ingredientName: 'Banana', defaultUnit: 'kg', defaultQty: '1' },
      { ingredientID: 603, ingredientName: 'Lemon', defaultUnit: 'gr', defaultQty: '300' },
      { ingredientID: 604, ingredientName: 'Orange', defaultUnit: 'kg', defaultQty: '1' }
    ]
  },
  {
    name: 'Vegetables',
    pluralTitle: 'Fresh Vegetables',
    image:
      '[https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 701, ingredientName: 'Tomato', defaultUnit: 'kg', defaultQty: '1' },
      { ingredientID: 702, ingredientName: 'Onion', defaultUnit: 'gr', defaultQty: '500' },
      { ingredientID: 703, ingredientName: 'Parsley', defaultUnit: 'gr', defaultQty: '100' },
      { ingredientID: 704, ingredientName: 'Potato', defaultUnit: 'kg', defaultQty: '1' },
      { ingredientID: 705, ingredientName: 'Garlic', defaultUnit: 'gr', defaultQty: '100' }
    ]
  },
  {
    name: 'Fish',
    pluralTitle: 'Fish & Seafood',
    image:
      '[https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80](https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=80)',
    items: [
      { ingredientID: 801, ingredientName: 'Salmon Fillet', defaultUnit: 'gr', defaultQty: '300' },
      { ingredientID: 802, ingredientName: 'Sea Bream', defaultUnit: 'gr', defaultQty: '600' },
      { ingredientID: 803, ingredientName: 'Shrimp', defaultUnit: 'gr', defaultQty: '400' }
    ]
  }
];

export const INGREDIENT_UNITS = ['kg', 'gr', 'lt', 'ml', 'pieces', 'bunch', 'tbsp'];

export const SEARCH_FILTER_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'High Protein',
  'Low Calorie',
  'Quick (<30 min)'
];