import { UserData, SimulationResult, Property } from '../types';
import { MOCK_PROPERTIES } from '../constants';

export const runSimulation = (userData: UserData): SimulationResult => {
  // Lógica simplificada para simulação de financiamento no Brasil
  
  // 1. Regra da Parcela: Comprometimento de renda de até 30%.
  const maxIncomeInstallment = userData.income * 0.30;

  // 2. Definição do Fator Multiplicador e Subsídio (Baseado na Renda)
  let multiplier;
  let estimatedSubsidy = 0;

  if (userData.income <= 2000) {
    multiplier = 330; 
    estimatedSubsidy = 55000;
  } else if (userData.income <= 2640) {
    multiplier = 280;
    estimatedSubsidy = 35000;
  } else if (userData.income <= 4400) {
    multiplier = 220;
    estimatedSubsidy = 15000;
  } else {
    multiplier = 160;
    estimatedSubsidy = 0;
  }

  // Capacidade máxima de financiamento baseada APENAS na renda
  const maxFinancingByIncome = maxIncomeInstallment * multiplier;

  let finalFinancing = 0;
  let finalInstallment = 0;
  let isSpecific = false;

  // CENÁRIO A: Usuário definiu um valor de imóvel específico
  if (userData.propertyValue && userData.propertyValue > 0) {
    isSpecific = true;
    const targetValue = userData.propertyValue;

    // REMOVIDO: Regra de 80% LTV para atender solicitação de não calcular entrada
    // O financiamento agora tenta cobrir 100% do valor necessário (respeitando a renda)
    const financingNeeded = targetValue - estimatedSubsidy;
    
    finalFinancing = Math.min(financingNeeded, maxFinancingByIncome);
    
    // Recalcular a parcela baseada no valor realmente financiado
    finalInstallment = finalFinancing / multiplier;

  } else {
    // CENÁRIO B: Simulação de Potencial
    isSpecific = false;
    finalFinancing = maxFinancingByIncome;
    finalInstallment = maxIncomeInstallment;
  }

  // 4. Filtrar Imóveis
  let eligibleProperties: Property[] = [];

  if (isSpecific && userData.propertyValue) {
    const minPrice = userData.propertyValue * 0.8;
    const maxPrice = userData.propertyValue * 1.2;
    eligibleProperties = MOCK_PROPERTIES.filter(
      p => p.price >= minPrice && p.price <= maxPrice
    ).sort((a, b) => Math.abs(a.price - userData.propertyValue!) - Math.abs(b.price - userData.propertyValue!));
  } else {
    // Assume poder de compra = Financiamento + Subsídio (sem considerar entrada adicional)
    const estimatedTotalBuyingPower = finalFinancing + estimatedSubsidy;
    
    eligibleProperties = MOCK_PROPERTIES.filter(
      (p) => p.price <= (estimatedTotalBuyingPower * 1.10)
    ).sort((a, b) => a.price - b.price);
  }

  // Fallback se não achar nada
  if (eligibleProperties.length === 0) {
      eligibleProperties = MOCK_PROPERTIES.slice(0, 2);
  }

  return {
    maxFinancing: finalFinancing,
    maxInstallment: finalInstallment,
    eligibleProperties,
    isSpecificSimulation: isSpecific,
    targetPropertyValue: userData.propertyValue
  };
};