import { Share } from 'react-native';

/**
 * Hook para compartilhar dados da Mega-Sena via WhatsApp/Telegram
 * 
 * Gera texto ou imagem formatada com informações relevantes
 */
export const useShareLottery = () => {
  const shareAsText = async (content: {
    title: string;
    numbers?: number[];
    drawDate?: string;
    prizes?: { match: number; count: number; prize: string }[];
    customMessage?: string;
  }) => {
    try {
      const lines: string[] = [];

      if (content.customMessage) {
        lines.push(content.customMessage);
        lines.push('');
      }

      lines.push(`${content.title}`);

      if (content.drawDate) {
        lines.push(`Data: ${content.drawDate}`);
      }

      if (content.numbers && content.numbers.length > 0) {
        lines.push(`Números: ${content.numbers.join(' - ')}`);
      }

      if (content.prizes && content.prizes.length > 0) {
        lines.push('');
        lines.push('Prêmios:');
        for (const prize of content.prizes) {
          lines.push(`  ${prize.match} acertos: ${prize.count} ganhador(es) - R$ ${prize.prize}`);
        }
      }

      lines.push('');
      lines.push('Confira mais em: Site Jogos');

      const message = lines.join('\n');

      await Share.share({
        message,
        title: content.title,
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const shareAppPromotion = async () => {
    try {
      const message = `
    Descubra Site Jogos!

    - Analise padrões da Mega-Sena
    - Escaneie seus bilhetes
    - Organize bolões com amigos
    - Veja estatísticas completas

    Totalmente GRÁTIS!

    Baixe agora: [Link da App Store]
      `.trim();

      await Share.share({
        message,
        title: 'Site Jogos - Seu Assistente de Loteria',
      });
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
    }
  };

  const shareStatistics = async (stats: {
    mostFrequent: number[];
    leastFrequent: number[];
    totalAnalyzed: number;
  }) => {
    try {
      const lines: string[] = [
        'Análise de Padrões Mega-Sena',
        '',
        `Total de sorteios analisados: ${stats.totalAnalyzed}`,
        '',
        `Números mais frequentes:`,
        `   ${stats.mostFrequent.join(', ')}`,
        '',
        `Números menos frequentes:`,
        `   ${stats.leastFrequent.join(', ')}`,
        '',
        'Lembre-se: Jogos de azar não garantem lucro!',
        'Use Site Jogos para análise informativa apenas.',
      ];

      const message = lines.join('\n');

      await Share.share({
        message,
        title: 'Análise Mega-Sena',
      });
    } catch (error) {
      console.error('Erro ao compartilhar estatísticas:', error);
    }
  };

  return {
    shareAsText,
    shareAppPromotion,
    shareStatistics,
  };
};
