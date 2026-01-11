/**
 * 🎨 Premium Color Palette
 * Design System para o novo visual Fintech
 */

export const COLORS = {
  // Gradiente Petróleo
  darkTeal: '#004a44', // Verde Petróleo
  darkestTeal: '#001a17', // Verde Petróleo Profundo
  
  // Acentos
  emeraldGreen: '#20d361', // Verde Sorte (buttons, highlights)
  emeraldBorder: '#10b981', // Borda dos cards glass
  
  // Neutros
  lightGray: '#f3f4f6',
  darkGray: '#1f2937',
  textSecondary: '#6b7280',
  
  // Bolinhas Caixa
  megasena: '#01532B', // Verde Caixa
  quina: '#E31C23', // Vermelho
  lotofacil: '#0066CC', // Azul
  lotomania: '#FF6600', // Laranja
};

/**
 * Gradientes pré-configurados
 */
export const GRADIENTS = {
  background: [COLORS.darkTeal, COLORS.darkestTeal],
  button: [COLORS.emeraldGreen, '#1a8f7f'],
  card: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)'],
};
