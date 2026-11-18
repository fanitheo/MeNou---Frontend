/**
 * Activity Diagram 1 (FR1 - Profile Setup) & User Story S-1:
 * - Missing required fields -> "Incomplete Fields" + highlight fields
 * - Invalid input values -> "Invalid Input Values" + highlight fields
 */
export function validateProfileForm(form) {
  const requiredFields = [
    'age',
    'weight',
    'gender',
    'height',
    'food_allergies',
    'body_type_goals',
    'intolerances'
  ];

  const fieldErrors = {};
  let hasIncomplete = false;

  requiredFields.forEach((field) => {
    const val = form[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      fieldErrors[field] = true;
      hasIncomplete = true;
    }
  });

  if (hasIncomplete) {
    return {
      isValid: false,
      type: 'INCOMPLETE',
      message: 'Incomplete Fields',
      fieldErrors
    };
  }

  let hasInvalid = false;
  const age = Number(form.age);
  const weight = Number(form.weight);
  const height = Number(form.height);
  const bmi = Number(form.bmi);

  if (Number.isNaN(age) || age < 10 || age > 120) {
    fieldErrors.age = true;
    hasInvalid = true;
  }
  if (Number.isNaN(weight) || weight < 25 || weight > 350) {
    fieldErrors.weight = true;
    hasInvalid = true;
  }
  if (Number.isNaN(height) || height <= 0.5 || height > 260) {
    fieldErrors.height = true;
    hasInvalid = true;
  }
  if (form.bmi !== '' && (Number.isNaN(bmi) || bmi < 10 || bmi > 80)) {
    fieldErrors.bmi = true;
    hasInvalid = true;
  }

  if (hasInvalid) {
    return {
      isValid: false,
      type: 'INVALID',
      message: 'Invalid Input Values',
      fieldErrors
    };
  }

  return {
    isValid: true,
    type: 'VALID',
    message: '',
    fieldErrors: {}
  };
}

/**
 * Activity Diagram 2 (FR4 - Manual Ingredient Addition) & User Story S-3:
 * - Missing name -> "Please fill in ingredient's name."
 * - Missing category -> "Please select a category."
 */
export function validateManualIngredient({ ingredientName, ingredient_category }) {
  const fieldErrors = {};

  if (!ingredientName || ingredientName.trim() === '') {
    fieldErrors.ingredientName = true;
    return {
      isValid: false,
      message: "Please fill in ingredient's name.",
      fieldErrors
    };
  }

  if (!Array.isArray(ingredient_category) || ingredient_category.length === 0) {
    fieldErrors.ingredient_category = true;
    return {
      isValid: false,
      message: 'Please select a category.',
      fieldErrors
    };
  }

  return {
    isValid: true,
    message: '',
    fieldErrors: {}
  };
}

/**
 * Activity Diagram 6 (FR17/18 - Submit and Process User Recipe) & User Story S-7:
 * Validates missing required fields client-side and delegates content/DB checks to backend.
 */
export function validatePostRecipeForm({
  recipeTitle,
  recipeIngredients,
  recipeInstructions
}) {
  const fieldErrors = {};
  let hasMissing = false;

  if (!recipeTitle || recipeTitle.trim() === '') {
    fieldErrors.recipeTitle = true;
    hasMissing = true;
  }
  if (!Array.isArray(recipeIngredients) || recipeIngredients.length === 0) {
    fieldErrors.recipeIngredients = true;
    hasMissing = true;
  }
  if (!recipeInstructions || recipeInstructions.trim() === '') {
    fieldErrors.recipeInstructions = true;
    hasMissing = true;
  }

  if (hasMissing) {
    return {
      isValid: false,
      message: 'Missing fields: please fill in all highlighted required fields.',
      fieldErrors
    };
  }

  return {
    isValid: true,
    message: '',
    fieldErrors: {}
  };
}