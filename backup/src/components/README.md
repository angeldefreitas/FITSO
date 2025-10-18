# Componentes de Picker Mejorados

## Descripción
Se han creado componentes de picker tipo rueda para mejorar la entrada de datos biométricos en la aplicación. Estos componentes reemplazan los campos de texto tradicionales y proporcionan una experiencia de usuario más intuitiva y controlada.

## Componentes Disponibles

### NumberPicker (Base)
Componente base reutilizable para selección de números con límites configurables.

**Props:**
- `value: number` - Valor actual seleccionado
- `onValueChange: (value: number) => void` - Callback cuando cambia el valor
- `min: number` - Valor mínimo
- `max: number` - Valor máximo
- `step?: number` - Incremento entre valores (default: 1)
- `unit?: string` - Unidad a mostrar (ej: " kg", " cm")
- `placeholder?: string` - Texto placeholder
- `label: string` - Etiqueta del campo

### AgePicker
Picker específico para edad con límites de 10-90 años.

### WeightPicker
Picker específico para peso con límites de 30-200 kg y incrementos de 0.1 kg (100g).

### HeightPicker
Picker específico para altura con límites de 100-250 cm.

### LoseWeightPicker
Picker específico para perder peso con opciones predefinidas: 1.0, 0.8, 0.5, 0.2 kg/semana.

### GainWeightPicker
Picker específico para ganar peso con opciones predefinidas: 0.2, 0.5 kg/semana.

## Características

✅ **Límites realistas**: Solo permite valores dentro de rangos realistas para humanos
✅ **Interfaz tipo rueda**: Experiencia de usuario intuitiva con scroll
✅ **Validación automática**: No permite valores inválidos
✅ **Diseño consistente**: Sigue el sistema de diseño de la app
✅ **Accesibilidad**: Botones de cancelar y confirmar claros

## Uso

```tsx
import { AgePicker, WeightPicker, HeightPicker, LoseWeightPicker, GainWeightPicker } from '../components';

// En tu componente
const [age, setAge] = useState(25);
const [weight, setWeight] = useState(70);
const [height, setHeight] = useState(175);
const [weightGoalAmount, setWeightGoalAmount] = useState(0.5);
const [goal, setGoal] = useState('lose_weight');

// En el JSX
<AgePicker value={age} onValueChange={setAge} />
<WeightPicker value={weight} onValueChange={setWeight} />
<HeightPicker value={height} onValueChange={setHeight} />

{goal === 'lose_weight' && (
  <LoseWeightPicker value={weightGoalAmount} onValueChange={setWeightGoalAmount} />
)}

{goal === 'gain_weight' && (
  <GainWeightPicker value={weightGoalAmount} onValueChange={setWeightGoalAmount} />
)}
```

## Pantallas Actualizadas

- **OnboardingScreen**: Ahora usa pickers en lugar de TextInput
- **ProfileScreen**: Ahora usa pickers en lugar de TextInput

## Beneficios

1. **Prevención de errores**: Imposible ingresar valores inválidos como texto en campos numéricos
2. **Mejor UX**: Interfaz más intuitiva y moderna
3. **Consistencia**: Todos los campos biométricos tienen el mismo comportamiento
4. **Validación automática**: Los valores siempre están dentro de rangos realistas
