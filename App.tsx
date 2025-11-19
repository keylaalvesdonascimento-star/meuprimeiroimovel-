import React, { useState } from 'react';
import { SimulationForm } from './components/SimulationForm';
import { SimulationResults } from './components/SimulationResults';
import { UserData, SimulationResult } from './types';
import { runSimulation } from './services/simulationService';
import { Building2 } from 'lucide-react';

type AppStep = 'input' | 'results';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('input');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleFormSubmit = (data: UserData) => {
    const result = runSimulation(data);
    setUserData(data);
    setSimulationResult(result);
    setStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setStep('input');
    setUserData(null);
    setSimulationResult(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 p-1.5 rounded-lg">
              <Building2 className="text-white w-6 h-6" />
            </div>
            <span className="font-bold text-xl text-blue-900 tracking-tight">MeuPrimeiro<span className="text-orange-600">Imóvel</span></span>
          </div>
          {step === 'results' && (
             <button onClick={handleReset} className="text-sm text-slate-500 hover:text-orange-600 transition-colors">
                Refazer
             </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow bg-slate-50">
        {step === 'input' && (
          <div className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 max-w-2xl">
              <h1 className="text-4xl font-extrabold text-blue-900 sm:text-5xl tracking-tight mb-4">
                Pare de pagar aluguel. <br />
                <span className="text-orange-600">Invista no seu futuro.</span>
              </h1>
              <p className="text-lg text-slate-600">
                Simule agora seu poder de compra e conecte-se diretamente com corretores especialistas em primeiros imóveis.
              </p>
            </div>
            <SimulationForm onSubmit={handleFormSubmit} />
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-60 max-w-4xl mx-auto w-full">
               <div>
                   <p className="font-bold text-3xl text-blue-900">10k+</p>
                   <p className="text-sm text-slate-600">Famílias atendidas</p>
               </div>
               <div>
                   <p className="font-bold text-3xl text-blue-900">500+</p>
                   <p className="text-sm text-slate-600">Imóveis disponíveis</p>
               </div>
               <div>
                   <p className="font-bold text-3xl text-blue-900">Minha Casa</p>
                   <p className="text-sm text-slate-600">Minha Vida</p>
               </div>
               <div>
                   <p className="font-bold text-3xl text-blue-900">0%</p>
                   <p className="text-sm text-slate-600">Taxa de serviço</p>
               </div>
            </div>
          </div>
        )}

        {step === 'results' && userData && simulationResult && (
          <SimulationResults 
            userData={userData} 
            result={simulationResult} 
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-blue-900 border-t border-blue-800 py-8 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-blue-200 text-sm">
          <p>&copy; {new Date().getFullYear()} Meu Primeiro Imóvel. Todos os direitos reservados.</p>
          <p className="mt-2 text-xs text-blue-400">
            *Os valores apresentados são estimativas e podem variar de acordo com a análise de crédito bancária.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;