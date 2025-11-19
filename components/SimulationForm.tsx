import React, { useState } from 'react';
import { UserData } from '../types';
import { formatCurrency, cleanCurrencyInput } from '../utils/formatting';
import { Calculator, ArrowRight, AlertCircle } from 'lucide-react';

interface SimulationFormProps {
  onSubmit: (data: UserData) => void;
}

export const SimulationForm: React.FC<SimulationFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [incomeStr, setIncomeStr] = useState('');

  const currentIncome = cleanCurrencyInput(incomeStr);
  
  const isIncomeTooLow = currentIncome > 0 && currentIncome < 1500;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && phone && currentIncome >= 1500) {
      onSubmit({ 
        name, 
        phone, 
        income: currentIncome,
      });
    }
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = cleanCurrencyInput(rawValue);
    setIncomeStr(formatCurrency(numericValue));
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="bg-blue-900 p-6 text-center">
        <div className="mx-auto bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
          <Calculator className="text-white w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Simule seu Sonho</h2>
        <p className="text-blue-100 text-sm">
          Descubra o imóvel ideal para o seu bolso em segundos.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
          <input
            id="name"
            type="text"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
            placeholder="Ex: João Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
          <input
            id="phone"
            type="tel"
            required
            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors outline-none"
            placeholder="(11) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="income" className="block text-sm font-medium text-slate-700 mb-1">Renda Bruta Mensal</label>
          <input
            id="income"
            type="text"
            required
            className={`w-full px-4 py-3 rounded-lg border ${isIncomeTooLow ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-300 focus:ring-orange-500 focus:border-orange-500'} transition-colors outline-none`}
            placeholder="R$ 0,00"
            value={incomeStr}
            onChange={handleIncomeChange}
          />
          
          {isIncomeTooLow ? (
            <div className="flex items-start gap-2 mt-2 text-red-600 animate-pulse">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-bold">
                Renda mínima necessária: R$ 1.500,00
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mt-2">Pode somar a renda de até 3 pessoas.</p>
          )}
        </div>

        <button
          type="submit"
          disabled={!name || !phone || !incomeStr || isIncomeTooLow}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 transform hover:-translate-y-0.5"
        >
          Ver Potencial de Compra
          <ArrowRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
};