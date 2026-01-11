/**
 * Sistema de Cálculo de Bolões para Divisão de Custos e Prêmios
 * 
 * Permite calcular a divisão proporcional de um bolão informal entre participantes.
 * Cada participante pode ter contribuído com um valor diferente (cotas).
 */

export interface BolaoParticipant {
  name: string;
  contribution: number; // Valor que pagou
  shares: number; // Número de cotas que possui
}

export interface BolaoResult {
  totalValue: number;
  totalShares: number;
  prizeAmount: number;
  participants: Array<{
    name: string;
    contribution: number;
    shares: number;
    shareholding: number; // Percentual de participação
    prizeShare: number; // Valor do prêmio que receberia
  }>;
  shareValue: number; // Valor de uma cota
}

/**
 * Calcula a divisão do bolão entre participantes
 */
export function calculateBolao(
  totalValue: number,
  participants: BolaoParticipant[],
  prizeAmount: number,
): BolaoResult {
  if (totalValue <= 0) {
    throw new Error('Valor total deve ser maior que 0');
  }

  if (participants.length === 0) {
    throw new Error('Deve haver pelo menos 1 participante');
  }

  if (prizeAmount <= 0) {
    throw new Error('Prêmio deve ser maior que 0');
  }

  // Validar que a soma das contribuições bate com o total
  const sumContributions = participants.reduce((sum, p) => sum + p.contribution, 0);
  if (Math.abs(sumContributions - totalValue) > 0.01) {
    throw new Error(
      `Soma das contribuições (R$ ${sumContributions.toFixed(2)}) não corresponde ao total (R$ ${totalValue.toFixed(2)})`,
    );
  }

  const totalShares = participants.reduce((sum, p) => sum + p.shares, 0);

  if (totalShares === 0) {
    throw new Error('Total de cotas deve ser maior que 0');
  }

  const shareValue = totalValue / totalShares;

  const results = participants.map((participant) => {
    const shareholding = (participant.shares / totalShares) * 100;
    const prizeShare = (shareholding / 100) * prizeAmount;

    return {
      name: participant.name,
      contribution: participant.contribution,
      shares: participant.shares,
      shareholding: shareholding,
      prizeShare: prizeShare,
    };
  });

  return {
    totalValue,
    totalShares,
    prizeAmount,
    participants: results,
    shareValue,
  };
}

/**
 * Formata resultado do bolão para exibição
 */
export function formatBolaoForWhatsApp(result: BolaoResult): string {
  let text = 'RESULTADO DO BOLÃO\n';
  text += '=' . repeat(40) + '\n\n';

  text += `Valor Total Apostado: R$ ${result.totalValue.toFixed(2)}\n`;
  text += `Prêmio: R$ ${result.prizeAmount.toFixed(2)}\n`;
  text += `Total de Cotas: ${result.totalShares}\n`;
  text += `Valor da Cota: R$ ${result.shareValue.toFixed(2)}\n\n`;

  text += 'DIVISÃO DE PRÊMIO:\n';
  text += '─' .repeat(40) + '\n';

  result.participants.forEach((p) => {
    text += `\nParticipante: ${p.name}\n`;
    text += `   Contribuição: R$ ${p.contribution.toFixed(2)}\n`;
    text += `   Cotas: ${p.shares} (${p.shareholding.toFixed(1)}%)\n`;
    text += `   Prêmio: R$ ${p.prizeShare.toFixed(2)}\n`;
  });

  text += '\n' + '=' .repeat(40) + '\n';
  text += 'Gerado pelo Analisador de Loterias\n';

  return text;
}

/**
 * Cria tabela HTML para impressão
 */
export function generateBolaoTable(result: BolaoResult): string {
  let html = '<table border="1" cellpadding="10" cellspacing="0" style="border-collapse: collapse; width: 100%;">\n';

  html += '<thead><tr style="background-color: #f0f0f0;">\n';
  html += '<th>Participante</th>\n';
  html += '<th>Contribuição (R$)</th>\n';
  html += '<th>Cotas</th>\n';
  html += '<th>Participação (%)</th>\n';
  html += '<th>Prêmio (R$)</th>\n';
  html += '</tr></thead>\n';

  html += '<tbody>\n';

  result.participants.forEach((p) => {
    html += '<tr>\n';
    html += `<td>${p.name}</td>\n`;
    html += `<td>${p.contribution.toFixed(2)}</td>\n`;
    html += `<td>${p.shares}</td>\n`;
    html += `<td>${p.shareholding.toFixed(1)}</td>\n`;
    html += `<td>${p.prizeShare.toFixed(2)}</td>\n`;
    html += '</tr>\n';
  });

  html += '</tbody>\n';

  html += '<tfoot style="background-color: #f9f9f9; font-weight: bold;">\n';
  html += '<tr>\n';
  html += '<td>TOTAL</td>\n';
  html += `<td>${result.totalValue.toFixed(2)}</td>\n`;
  html += `<td>${result.totalShares}</td>\n`;
  html += '<td>100.0</td>\n';
  html += `<td>${result.prizeAmount.toFixed(2)}</td>\n`;
  html += '</tr>\n';
  html += '</tfoot>\n';

  html += '</table>\n';

  return html;
}

/**
 * Simula diferentes cenários de prêmios
 */
export function simulateBolaoScenarios(
  result: BolaoResult,
  prizeMultipliers: number[] = [10, 100, 1000, 10000],
): Array<{ multiplier: number; prizeAmount: number; scenario: BolaoResult }> {
  return prizeMultipliers.map((multiplier) => {
    const newPrizeAmount = result.totalValue * multiplier;
    const scenario = calculateBolao(
      result.totalValue,
      result.participants.map((p) => ({
        name: p.name,
        contribution: p.contribution,
        shares: p.shares,
      })),
      newPrizeAmount,
    );

    return {
      multiplier,
      prizeAmount: newPrizeAmount,
      scenario,
    };
  });
}
