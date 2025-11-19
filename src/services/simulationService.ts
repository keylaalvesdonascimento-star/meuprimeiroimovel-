import { UserData, SimulationResult, Property } from '../types';

// Agora a função aceita a lista de imóveis reais do banco de dados
export const runSimulation = (userData: UserData, availableProperties: Property[]): SimulationResult => {
  
  // 1. Regra da Parcela: Comprometimento de renda de até 30%.
  const maxIncomeInstallment = userData.income * 0.30;

  // 2. Definição do Fator Multiplicador e Subsídio (Baseado na Renda - Minha Casa Minha Vida)
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

    // O financiamento tenta cobrir o valor do imóvel menos o subsídio
    const financingNeeded = targetValue - estimatedSubsidy;
    
    finalFinancing = Math.min(financingNeeded, maxFinancingByIncome);
    finalInstallment = finalFinancing / multiplier;

  } else {
    // CENÁRIO B: Simulação de Potencial (Quanto ele pode comprar?)
    isSpecific = false;
    finalFinancing = maxFinancingByIncome;
    finalInstallment = maxIncomeInstallment;
  }

  // 4. Filtrar Imóveis que cabem no bolso
  let eligibleProperties: Property[] = [];

  if (isSpecific && userData.propertyValue) {
    // Se ele quer um valor especifico, mostramos imóveis próximos daquele valor (+- 20%)
    const minPrice = userData.propertyValue * 0.8;
    const maxPrice = userData.propertyValue * 1.2;
    eligibleProperties = availableProperties.filter(
      p => p.price >= minPrice && p.price <= maxPrice
    ).sort((a, b) => Math.abs(a.price - userData.propertyValue!) - Math.abs(b.price - userData.propertyValue!));
  } else {
    // Se for simulação geral, mostramos o que ele pode pagar
    const estimatedTotalBuyingPower = finalFinancing + estimatedSubsidy;
    
    eligibleProperties = availableProperties.filter(
      (p) => p.price <= (estimatedTotalBuyingPower * 1.15) // Margem de 15% acima
    ).sort((a, b) => a.price - b.price);
  }

  // Se não encontrou nada compatível, mostra os 2 mais baratos como sugestão
  if (eligibleProperties.length === 0 && availableProperties.length > 0) {
      const sortedByPrice = [...availableProperties].sort((a, b) => a.price - b.price);
      eligibleProperties = sortedByPrice.slice(0, 2);
  }

  return {
    maxFinancing: finalFinancing,
    maxInstallment: finalInstallment,
    eligibleProperties,
    isSpecificSimulation: isSpecific,
    targetPropertyValue: userData.propertyValue
  };
};