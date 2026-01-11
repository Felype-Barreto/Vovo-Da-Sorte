export type PrizeRedemptionInfo = {
  lotteryId: string;
  minAmount: number; // Valor mínimo que dispensa lotérica
  maxRetailable: number; // Valor máximo que pode ser resgatado em lotérica
  canRedeemAnywhereAbove: number; // Acima deste valor, deve ir à Caixa
  documentation: string[];
  legalWarnings: string[];
  timeLimit: {
    days: number;
    exceptionInfo?: string;
  };
  taxInfo?: {
    rate: number; // Alíquota em %
    appliesAboveAmount: number;
    basedOnLaw: string;
  };
};

export const PRIZE_REDEMPTION_GUIDE: Record<string, PrizeRedemptionInfo> = {
  megasena: {
    lotteryId: 'megasena',
    minAmount: 0, // Qualquer quantia
    maxRetailable: 2292.71, // Limite atual de lotérica
    canRedeemAnywhereAbove: 2292.71,
    documentation: [
      'CPF',
      'Carteira de Identidade válida',
      'Comprovante de Renda (para valores acima de R$ 2.000)',
      'Comprovante de Endereço (últimos 3 meses)',
    ],
    legalWarnings: [
      'Prêmios devem ser resgatados em até 90 dias',
      'Estão sujeitos a 15% de Imposto de Renda se forem acima de R$ 1.903,98 (valores 2024)',
      'Imposto é retido pela Caixa automaticamente',
      'Prêmios podem ser divididos entre mais de uma pessoa se houver acordo',
    ],
    timeLimit: {
      days: 90,
      exceptionInfo: 'Após 90 dias, o valor caduca e reverte para o FUNDO DE AMPARO AO TRABALHADOR',
    },
    taxInfo: {
      rate: 15,
      appliesAboveAmount: 1903.98,
      basedOnLaw: 'Lei de Loterias 11.977/2009 e Instrução CAIXA',
    },
  },

  lotofacil: {
    lotteryId: 'lotofacil',
    minAmount: 0,
    maxRetailable: 2292.71,
    canRedeemAnywhereAbove: 2292.71,
    documentation: [
      'CPF',
      'RG válido',
      'Comprovante de Renda',
      'Comprovante de Endereço',
    ],
    legalWarnings: [
      'Lotofácil premia desde 11 acertos',
      'Com 11 acertos, você ganha em torno de R$ 15-30 dependendo da concorrência',
      'Prêmios de até R$ 2.292,71 podem ser resgatados em qualquer lotérica',
      'Acima deste valor, é necessário ir direto à Caixa',
      'Sujeito a 15% de Imposto de Renda se acima de R$ 1.903,98',
    ],
    timeLimit: {
      days: 90,
    },
  },

  quina: {
    lotteryId: 'quina',
    minAmount: 0,
    maxRetailable: 2292.71,
    canRedeemAnywhereAbove: 2292.71,
    documentation: [
      'CPF',
      'Documento de Identidade',
      'Comprovante de Renda (acima de R$ 2.000)',
      'Comprovante de Residência',
    ],
    legalWarnings: [
      'Quina premia desde 3 acertos',
      '3 acertos: Aproximadamente R$ 3-5 por bilhete',
      '4 acertos (QUADRA): Valores variam muito por concorrência',
      '5 acertos (QUINA): Prêmio principal',
      'Imposto retido automaticamente',
    ],
    timeLimit: {
      days: 90,
    },
  },

  lotomania: {
    lotteryId: 'lotomania',
    minAmount: 0,
    maxRetailable: 2292.71,
    canRedeemAnywhereAbove: 2292.71,
    documentation: [
      'CPF',
      'RG',
      'Comprovante de Renda',
      'Comprovante de Endereço',
    ],
    legalWarnings: [
      'Lotomania é a única que PODE GANHAR COM ZERO ACERTOS',
      'Se nenhum número coincidir com o sorteio, você vence!',
      'Premia acertos de 16 a 20 números',
      'E também com 0 acertos (Confira o resultado!)',
      'Limite de resgate em lotérica: R$ 2.292,71',
    ],
    timeLimit: {
      days: 90,
    },
  },

  duplasena: {
    lotteryId: 'duplasena',
    minAmount: 0,
    maxRetailable: 2292.71,
    canRedeemAnywhereAbove: 2292.71,
    documentation: [
      'CPF',
      'Documento de Identidade válido',
      'Comprovante de Renda',
      'Comprovante de Endereço (últimos 3 meses)',
    ],
    legalWarnings: [
      'Dupla Sena tem 2 chances por concurso (SG1 e SG2)',
      'Você pode vencer em SG1, em SG2 ou em ambos',
      'Premia desde 4 acertos',
      '4 acertos (QUADRA): Valores baixos, em torno de R$ 50-100',
      '5 acertos (QUINA): Valores maiores',
      '6 acertos (SENA): Prêmio principal',
    ],
    timeLimit: {
      days: 90,
    },
  },
};

/**
 * Obter guia de resgate para uma loteria específica
 */
export function getPrizeRedemptionGuide(lotteryId: string): PrizeRedemptionInfo | null {
  return PRIZE_REDEMPTION_GUIDE[lotteryId] || null;
}

/**
 * Calcular imposto sobre prêmio
 */
export function calculateWithholding(amount: number): { tax: number; net: number } {
  const TAXABLE_THRESHOLD = 1903.98;
  const TAX_RATE = 0.15;

  if (amount <= TAXABLE_THRESHOLD) {
    return { tax: 0, net: amount };
  }

  const tax = amount * TAX_RATE;
  return { tax, net: amount - tax };
}

/**
 * Determinar melhor forma de resgate
 */
export function determineBestRedemptionMethod(
  amount: number,
  lotteryId: string,
): {
  method: 'loteria' | 'caixa';
  reason: string;
  places: string[];
} {
  const guide = getPrizeRedemptionGuide(lotteryId);
  if (!guide) {
    return {
      method: 'caixa',
      reason: 'Loteria desconhecida. Dirija-se a qualquer agência CAIXA.',
      places: ['Agência CAIXA mais próxima'],
    };
  }

  if (amount <= guide.maxRetailable) {
    return {
      method: 'loteria',
      reason: `Valor até R$ ${guide.maxRetailable.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })} pode ser resgatado em qualquer lotérica`,
      places: ['Qualquer lotérica credenciada'],
    };
  }

  return {
    method: 'caixa',
    reason: `Valor acima de R$ ${guide.maxRetailable.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })} deve ser resgatado direto na CAIXA`,
    places: [
      'Agência CAIXA com horário de funcionamento normal',
      'Pode ser necessário agendar previamente para valores muito altos',
    ],
  };
}

/**
 * Gerar alerta sobre prazo de resgate
 */
export function generateDeadlineAlert(drawDate: Date): {
  deadline: Date;
  daysRemaining: number;
  isUrgent: boolean;
} {
  const deadline = new Date(drawDate);
  deadline.setDate(deadline.getDate() + 90);

  const now = new Date();
  const daysRemaining = Math.ceil(
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  return {
    deadline,
    daysRemaining,
    isUrgent: daysRemaining <= 7,
  };
}
