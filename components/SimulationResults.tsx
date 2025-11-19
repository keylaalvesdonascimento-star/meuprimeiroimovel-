import React from 'react';
import { UserData, SimulationResult } from '../types';
import { PropertyCard } from './PropertyCard';
import { formatCurrency } from '../utils/formatting';
import { CheckCircle, RefreshCw } from 'lucide-react';

interface SimulationResultsProps {
  result: SimulationResult;
  userData: UserData;
  onReset: () => void;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({ result, userData, onReset }) => {
  const isSpecific = result.isSpecificSimulation;
  
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-blue-900 flex items-center gap-2">
              <CheckCircle className="text-orange-500" />
              Olá, {userData.name.split(' ')[0]}!
            </h2>
            <p className="text-slate-600 mt-1">
              {isSpecific ? (
                <>Simulação para imóvel de <strong className="text-slate-900">{formatCurrency(result.targetPropertyValue || 0)}</strong> com renda de {formatCurrency(userData.income)}.</>
              ) : (
                 <>Com renda de <strong className="text-slate-900">{formatCurrency(userData.income)}</strong>, calculamos seu poder de compra:</>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
                onClick={onReset}
                className="text-sm text-orange-600 font-medium hover:text-orange-700 flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors"
            >
                <RefreshCw className="w-4 h-4" />
                Nova Simulação
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
            <div className="relative">
                <p className="text-xs text-slate-500 uppercase font-semibold">
                    {isSpecific ? "Financiamento Aprovado" : "Potencial de Financiamento"}
                </p>
                <p className="text-lg font-bold text-blue-900">{formatCurrency(result.maxFinancing)}</p>
            </div>
            <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Parcela Estimada</p>
                <p className="text-lg font-bold text-slate-700">{formatCurrency(result.maxInstallment)}</p>
            </div>
        </div>
      </div>

      {/* Property Grid */}
      <h3 className="text-xl font-bold text-blue-900 mb-6">
        {isSpecific ? "Imóveis na faixa de preço desejada" : "Imóveis selecionados para o seu perfil"}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {result.eligibleProperties.map((property) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            userData={userData}
            monthlyInstallment={result.maxInstallment} // Showing max capacity as reference
          />
        ))}
      </div>

      {result.eligibleProperties.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-lg">Nenhum imóvel encontrado exatamente nesta faixa de preço.</p>
            <button onClick={onReset} className="mt-4 text-orange-600 font-bold underline">Tentar outro valor</button>
        </div>
      )}
    </div>
  );
};