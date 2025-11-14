// Em um arquivo como /src/utils/dateUtils.js
import { format, parse, parseISO } from 'date-fns';

/**
 * Converte uma string 'yyyy-mm-dd' (ISO) para 'dd/MM/yyyy' (BR).
 * @param {string} isoString A data no formato 'yyyy-mm-dd'.
 * @returns {string} A data no formato 'dd/MM/yyyy'.
 */
export const formatarIsoParaBr = (isoString) => {
  if (!isoString) return '';
  try {
    const date = parseISO(isoString);
    return format(date, 'dd/MM/yyyy');
  } catch (error) {
    console.warn("Erro ao formatar data ISO:", isoString, error);
    return ''; // Retorna vazio se a data for inválida
  }
};

/**
 * Converte uma string 'dd/MM/yyyy' (BR) para 'yyyy-mm-dd' (ISO).
 * @param {string} brString A data no formato 'dd/MM/yyyy'.
 * @returns {string} A data no formato 'yyyy-mm-dd'.
 */
export const formatarBrParaIso = (brString) => {
  if (!brString) return '';
  try {
    const date = parse(brString, 'dd/MM/yyyy', new Date());
    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.warn("Erro ao formatar data BR:", brString, error);
    return ''; // Retorna vazio se a data for inválida
  }
};