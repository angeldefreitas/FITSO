const Joi = require('joi');

// Esquemas de validación
const schemas = {
  // Registro de usuario
  register: Joi.object({
    name: Joi.string()
      .min(2)
      .max(100)
      .required()
      .messages({
        'string.min': 'El nombre debe tener al menos 2 caracteres',
        'string.max': 'El nombre no puede tener más de 100 caracteres',
        'any.required': 'El nombre es requerido'
      }),
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'string.max': 'La contraseña no puede tener más de 128 caracteres',
        'any.required': 'La contraseña es requerida'
      })
  }),

  // Login de usuario
  login: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido'
      }),
    password: Joi.string()
      .required()
      .messages({
        'any.required': 'La contraseña es requerida'
      })
  }),

  // Solicitar reset de contraseña
  forgotPassword: Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'El email debe tener un formato válido',
        'any.required': 'El email es requerido'
      })
  }),

  // Reset de contraseña
  resetPassword: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'El token es requerido'
      }),
    password: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'La contraseña debe tener al menos 6 caracteres',
        'string.max': 'La contraseña no puede tener más de 128 caracteres',
        'any.required': 'La contraseña es requerida'
      })
  }),

  // Verificar email
  verifyEmail: Joi.object({
    token: Joi.string()
      .required()
      .messages({
        'any.required': 'El token de verificación es requerido'
      })
  }),

  // Cambiar contraseña
  changePassword: Joi.object({
    currentPassword: Joi.string()
      .required()
      .messages({
        'any.required': 'La contraseña actual es requerida'
      }),
    newPassword: Joi.string()
      .min(6)
      .max(128)
      .required()
      .messages({
        'string.min': 'La nueva contraseña debe tener al menos 6 caracteres',
        'string.max': 'La nueva contraseña no puede tener más de 128 caracteres',
        'any.required': 'La nueva contraseña es requerida'
      })
  }),

  // Perfil de usuario
  userProfile: Joi.object({
    age: Joi.number()
      .integer()
      .min(13)
      .max(120)
      .optional()
      .messages({
        'number.min': 'La edad debe ser al menos 13 años',
        'number.max': 'La edad no puede ser mayor a 120 años'
      }),
    gender: Joi.string()
      .valid('male', 'female')
      .optional()
      .messages({
        'any.only': 'El género debe ser male, female u other'
      }),
    height: Joi.number()
      .integer()
      .min(100)
      .max(250)
      .optional()
      .messages({
        'number.min': 'La altura debe ser al menos 100 cm',
        'number.max': 'La altura no puede ser mayor a 250 cm'
      }),
    weight: Joi.number()
      .min(30)
      .max(300)
      .optional()
      .messages({
        'number.min': 'El peso debe ser al menos 30 kg',
        'number.max': 'El peso no puede ser mayor a 300 kg'
      }),
    activity_level: Joi.string()
      .valid('sedentary', 'light', 'moderate', 'active', 'very_active')
      .optional()
      .messages({
        'any.only': 'El nivel de actividad debe ser: sedentary, light, moderate, active o very_active'
      }),
    goal: Joi.string()
      .valid('lose_weight', 'maintain_weight', 'gain_weight')
      .optional()
      .messages({
        'any.only': 'El objetivo debe ser: lose_weight, maintain_weight o gain_weight'
      }),
    target_weight: Joi.number()
      .min(30)
      .max(300)
      .optional()
      .messages({
        'number.min': 'El peso objetivo debe ser al menos 30 kg',
        'number.max': 'El peso objetivo no puede ser mayor a 300 kg'
      })
  }),

  // Datos biométricos
  biometricData: Joi.object({
    age: Joi.number()
      .integer()
      .min(13)
      .max(120)
      .required()
      .messages({
        'number.base': 'La edad debe ser un número',
        'number.integer': 'La edad debe ser un número entero',
        'number.min': 'La edad debe ser al menos 13 años',
        'number.max': 'La edad no puede ser mayor a 120 años',
        'any.required': 'La edad es requerida'
      }),
    heightCm: Joi.number()
      .min(100)
      .max(250)
      .required()
      .messages({
        'number.base': 'La altura debe ser un número',
        'number.min': 'La altura debe ser al menos 100 cm',
        'number.max': 'La altura no puede ser mayor a 250 cm',
        'any.required': 'La altura es requerida'
      }),
    weightKg: Joi.number()
      .min(30)
      .max(300)
      .required()
      .messages({
        'number.base': 'El peso debe ser un número',
        'number.min': 'El peso debe ser al menos 30 kg',
        'number.max': 'El peso no puede ser mayor a 300 kg',
        'any.required': 'El peso es requerido'
      }),
    gender: Joi.string()
      .valid('male', 'female')
      .required()
      .messages({
        'any.only': 'El género debe ser male o female',
        'any.required': 'El género es requerido'
      }),
    activityLevel: Joi.string()
      .valid('sedentary', 'light', 'moderate', 'active', 'very_active')
      .required()
      .messages({
        'any.only': 'El nivel de actividad debe ser sedentary, light, moderate, active o very_active',
        'any.required': 'El nivel de actividad es requerido'
      })
  }),

  // Datos de metas
  goalsData: Joi.object({
    goal: Joi.string()
      .valid('lose_weight', 'maintain_weight', 'gain_weight')
      .required()
      .messages({
        'any.only': 'El objetivo debe ser lose_weight, maintain_weight o gain_weight',
        'any.required': 'El objetivo es requerido'
      }),
    weightGoalAmount: Joi.number()
      .min(0.1)
      .max(5)
      .when('goal', {
        is: Joi.string().valid('lose_weight', 'gain_weight'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
      .messages({
        'number.base': 'La cantidad objetivo debe ser un número',
        'number.min': 'La cantidad objetivo debe ser al menos 0.1 kg/semana',
        'number.max': 'La cantidad objetivo no puede ser mayor a 5 kg/semana',
        'any.required': 'La cantidad objetivo es requerida para este tipo de meta'
      }),
    nutritionGoals: Joi.any().optional()
  }),

  // Datos de perfil (flexible)
  profileData: Joi.object({
    age: Joi.number()
      .integer()
      .min(13)
      .max(120)
      .optional()
      .messages({
        'number.base': 'La edad debe ser un número',
        'number.integer': 'La edad debe ser un número entero',
        'number.min': 'La edad debe ser al menos 13 años',
        'number.max': 'La edad no puede ser mayor a 120 años'
      }),
    height: Joi.number()
      .min(100)
      .max(250)
      .optional()
      .messages({
        'number.base': 'La altura debe ser un número',
        'number.min': 'La altura debe ser al menos 100 cm',
        'number.max': 'La altura no puede ser mayor a 250 cm'
      }),
    weight: Joi.number()
      .min(30)
      .max(300)
      .optional()
      .messages({
        'number.base': 'El peso debe ser un número',
        'number.min': 'El peso debe ser al menos 30 kg',
        'number.max': 'El peso no puede ser mayor a 300 kg'
      }),
    gender: Joi.string()
      .valid('male', 'female')
      .optional()
      .messages({
        'any.only': 'El género debe ser male, female u other'
      }),
    activity_level: Joi.string()
      .valid('sedentary', 'light', 'moderate', 'active', 'very_active')
      .optional()
      .messages({
        'any.only': 'El nivel de actividad debe ser sedentary, light, moderate, active o very_active'
      }),
    goal: Joi.string()
      .valid('lose_weight', 'maintain_weight', 'gain_weight')
      .optional()
      .messages({
        'any.only': 'El objetivo debe ser lose_weight, maintain_weight o gain_weight'
      }),
    target_weight: Joi.number()
      .min(0)
      .max(5)
      .optional()
      .messages({
        'number.base': 'El peso objetivo debe ser un número',
        'number.min': 'El peso objetivo debe ser al menos 0 kg/semana',
        'number.max': 'El peso objetivo no puede ser mayor a 5 kg/semana'
      })
  }),

  // Alimento
  food: Joi.object({
    name: Joi.string()
      .min(1)
      .max(255)
      .required()
      .messages({
        'string.min': 'El nombre del alimento es requerido',
        'string.max': 'El nombre no puede tener más de 255 caracteres',
        'any.required': 'El nombre del alimento es requerido'
      }),
    brand: Joi.string()
      .max(255)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La marca no puede tener más de 255 caracteres'
      }),
    barcode: Joi.string()
      .max(50)
      .optional()
      .allow('')
      .messages({
        'string.max': 'El código de barras no puede tener más de 50 caracteres'
      }),
    calories_per_100g: Joi.number()
      .min(0)
      .max(10000)
      .required()
      .messages({
        'number.base': 'Las calorías deben ser un número',
        'number.min': 'Las calorías no pueden ser negativas',
        'number.max': 'Las calorías no pueden ser mayores a 10000 por 100g',
        'any.required': 'Las calorías por 100g son requeridas'
      }),
    protein_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .default(0)
      .messages({
        'number.base': 'Las proteínas deben ser un número',
        'number.min': 'Las proteínas no pueden ser negativas',
        'number.max': 'Las proteínas no pueden ser mayores a 1000g por 100g'
      }),
    carbs_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .default(0)
      .messages({
        'number.base': 'Los carbohidratos deben ser un número',
        'number.min': 'Los carbohidratos no pueden ser negativos',
        'number.max': 'Los carbohidratos no pueden ser mayores a 1000g por 100g'
      }),
    fat_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .default(0)
      .messages({
        'number.base': 'Las grasas deben ser un número',
        'number.min': 'Las grasas no pueden ser negativas',
        'number.max': 'Las grasas no pueden ser mayores a 1000g por 100g'
      }),
    fiber_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .default(0)
      .messages({
        'number.base': 'La fibra debe ser un número',
        'number.min': 'La fibra no puede ser negativa',
        'number.max': 'La fibra no puede ser mayor a 1000g por 100g'
      }),
    sugar_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .default(0)
      .messages({
        'number.base': 'El azúcar debe ser un número',
        'number.min': 'El azúcar no puede ser negativo',
        'number.max': 'El azúcar no puede ser mayor a 1000g por 100g'
      }),
    sodium_per_100g: Joi.number()
      .min(0)
      .max(10000)
      .optional()
      .default(0)
      .messages({
        'number.base': 'El sodio debe ser un número',
        'number.min': 'El sodio no puede ser negativo',
        'number.max': 'El sodio no puede ser mayor a 10000mg por 100g'
      })
  }),

  // Actualización de alimento
  foodUpdate: Joi.object({
    name: Joi.string()
      .min(1)
      .max(255)
      .optional()
      .messages({
        'string.min': 'El nombre del alimento es requerido',
        'string.max': 'El nombre no puede tener más de 255 caracteres'
      }),
    brand: Joi.string()
      .max(255)
      .optional()
      .allow('')
      .messages({
        'string.max': 'La marca no puede tener más de 255 caracteres'
      }),
    barcode: Joi.string()
      .max(50)
      .optional()
      .allow('')
      .messages({
        'string.max': 'El código de barras no puede tener más de 50 caracteres'
      }),
    calories_per_100g: Joi.number()
      .min(0)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'Las calorías deben ser un número',
        'number.min': 'Las calorías no pueden ser negativas',
        'number.max': 'Las calorías no pueden ser mayores a 10000 por 100g'
      }),
    protein_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'Las proteínas deben ser un número',
        'number.min': 'Las proteínas no pueden ser negativas',
        'number.max': 'Las proteínas no pueden ser mayores a 1000g por 100g'
      }),
    carbs_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'Los carbohidratos deben ser un número',
        'number.min': 'Los carbohidratos no pueden ser negativos',
        'number.max': 'Los carbohidratos no pueden ser mayores a 1000g por 100g'
      }),
    fat_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'Las grasas deben ser un número',
        'number.min': 'Las grasas no pueden ser negativas',
        'number.max': 'Las grasas no pueden ser mayores a 1000g por 100g'
      }),
    fiber_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'La fibra debe ser un número',
        'number.min': 'La fibra no puede ser negativa',
        'number.max': 'La fibra no puede ser mayor a 1000g por 100g'
      }),
    sugar_per_100g: Joi.number()
      .min(0)
      .max(1000)
      .optional()
      .messages({
        'number.base': 'El azúcar debe ser un número',
        'number.min': 'El azúcar no puede ser negativo',
        'number.max': 'El azúcar no puede ser mayor a 1000g por 100g'
      }),
    sodium_per_100g: Joi.number()
      .min(0)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'El sodio debe ser un número',
        'number.min': 'El sodio no puede ser negativo',
        'number.max': 'El sodio no puede ser mayor a 10000mg por 100g'
      })
  }),

  // Entrada de comida
  meal: Joi.object({
    food_id: Joi.string()
      .uuid()
      .required()
      .messages({
        'string.guid': 'El ID del alimento debe ser un UUID válido',
        'any.required': 'El ID del alimento es requerido'
      }),
    quantity: Joi.number()
      .min(0.1)
      .max(10000)
      .required()
      .messages({
        'number.base': 'La cantidad debe ser un número',
        'number.min': 'La cantidad debe ser al menos 0.1 gramos',
        'number.max': 'La cantidad no puede ser mayor a 10000 gramos',
        'any.required': 'La cantidad es requerida'
      }),
    meal_type: Joi.string()
      .valid('breakfast', 'lunch', 'dinner', 'snack')
      .required()
      .messages({
        'any.only': 'El tipo de comida debe ser: breakfast, lunch, dinner o snack',
        'any.required': 'El tipo de comida es requerido'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD',
        'any.required': 'La fecha es requerida'
      })
  }),

  // Actualización de entrada de comida
  mealUpdate: Joi.object({
    food_id: Joi.string()
      .uuid()
      .optional()
      .messages({
        'string.guid': 'El ID del alimento debe ser un UUID válido'
      }),
    quantity: Joi.number()
      .min(0.1)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'La cantidad debe ser un número',
        'number.min': 'La cantidad debe ser al menos 0.1 gramos',
        'number.max': 'La cantidad no puede ser mayor a 10000 gramos'
      }),
    meal_type: Joi.string()
      .valid('breakfast', 'lunch', 'dinner', 'snack')
      .optional()
      .messages({
        'any.only': 'El tipo de comida debe ser: breakfast, lunch, dinner o snack'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD'
      })
  }),

  // Entrada de peso
  weightEntry: Joi.object({
    weight: Joi.number()
      .min(0.1)
      .max(500)
      .required()
      .messages({
        'number.base': 'El peso debe ser un número',
        'number.min': 'El peso debe ser al menos 0.1 kg',
        'number.max': 'El peso no puede ser mayor a 500 kg',
        'any.required': 'El peso es requerido'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD',
        'any.required': 'La fecha es requerida'
      }),
    notes: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Las notas no pueden tener más de 500 caracteres'
      })
  }),

  // Actualización de entrada de peso
  weightEntryUpdate: Joi.object({
    weight: Joi.number()
      .min(0.1)
      .max(500)
      .optional()
      .messages({
        'number.base': 'El peso debe ser un número',
        'number.min': 'El peso debe ser al menos 0.1 kg',
        'number.max': 'El peso no puede ser mayor a 500 kg'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD'
      }),
    notes: Joi.string()
      .max(500)
      .optional()
      .allow('')
      .messages({
        'string.max': 'Las notas no pueden tener más de 500 caracteres'
      })
  }),

  // Entrada de agua
  waterEntry: Joi.object({
    amount_ml: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .required()
      .messages({
        'number.base': 'La cantidad de agua debe ser un número',
        'number.integer': 'La cantidad de agua debe ser un número entero',
        'number.min': 'La cantidad de agua debe ser al menos 1 ml',
        'number.max': 'La cantidad de agua no puede ser mayor a 10000 ml',
        'any.required': 'La cantidad de agua es requerida'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD',
        'any.required': 'La fecha es requerida'
      })
  }),

  // Actualización de entrada de agua
  waterEntryUpdate: Joi.object({
    amount_ml: Joi.number()
      .integer()
      .min(1)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'La cantidad de agua debe ser un número',
        'number.integer': 'La cantidad de agua debe ser un número entero',
        'number.min': 'La cantidad de agua debe ser al menos 1 ml',
        'number.max': 'La cantidad de agua no puede ser mayor a 10000 ml'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD'
      })
  }),

  // Entrada de calorías quemadas
  caloriesBurnedEntry: Joi.object({
    calories_burned: Joi.number()
      .integer()
      .min(0)
      .max(10000)
      .required()
      .messages({
        'number.base': 'Las calorías quemadas deben ser un número',
        'number.integer': 'Las calorías quemadas deben ser un número entero',
        'number.min': 'Las calorías quemadas no pueden ser negativas',
        'number.max': 'Las calorías quemadas no pueden ser mayores a 10000',
        'any.required': 'Las calorías quemadas son requeridas'
      }),
    calories_goal: Joi.number()
      .integer()
      .min(100)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'El objetivo de calorías debe ser un número',
        'number.integer': 'El objetivo de calorías debe ser un número entero',
        'number.min': 'El objetivo de calorías debe ser al menos 100',
        'number.max': 'El objetivo de calorías no puede ser mayor a 10000'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .required()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD',
        'any.required': 'La fecha es requerida'
      })
  }),

  // Actualización de entrada de calorías quemadas
  caloriesBurnedEntryUpdate: Joi.object({
    calories_burned: Joi.number()
      .integer()
      .min(0)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'Las calorías quemadas deben ser un número',
        'number.integer': 'Las calorías quemadas deben ser un número entero',
        'number.min': 'Las calorías quemadas no pueden ser negativas',
        'number.max': 'Las calorías quemadas no pueden ser mayores a 10000'
      }),
    calories_goal: Joi.number()
      .integer()
      .min(100)
      .max(10000)
      .optional()
      .messages({
        'number.base': 'El objetivo de calorías debe ser un número',
        'number.integer': 'El objetivo de calorías debe ser un número entero',
        'number.min': 'El objetivo de calorías debe ser al menos 100',
        'number.max': 'El objetivo de calorías no puede ser mayor a 10000'
      }),
    entry_date: Joi.string()
      .pattern(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .messages({
        'string.pattern.base': 'La fecha debe tener el formato YYYY-MM-DD'
      })
  })
};

// Middleware de validación
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Mostrar todos los errores
      stripUnknown: true // Remover campos no definidos en el esquema
    });

    if (error) {
      const errorMessages = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errorMessages
      });
    }

    // Reemplazar req.body con los datos validados
    req.body = value;
    next();
  };
};

module.exports = {
  schemas,
  validate
};
