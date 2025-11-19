import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { SimulationForm } from './components/SimulationForm';
import { SimulationResults } from './components/SimulationResults';
import { UserData, SimulationResult, Property } from './types';
import { runSimulation } from './services/simulationService';
import { getProperties } from './services/propertyService';
import { AdminPage } from './pages/AdminPage';
import { MOCK_PROPERTIES } from './constants';
import { Building2, Loader2, ShieldCheck } from 'lucide-react';

type AppStep = 'input' | 'results';

const Home: React.FC<{ properties: Property[], loading: boolean }> = ({ properties, loading }) => {
  const [step, setStep] = useState<AppStep>('input');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);

  const handleFormSubmit = (data: UserData) => {
    const result = runSimulation(data, properties);
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-12 h-12 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Conectando ao banco de imóveis...</p>
      </div>
    );
  }

  return (
    <>
      {step === 'results' && (
          <div className="bg-white border-b border-slate-200 py-3 shadow-sm">
            <div className="max-w-6xl mx-auto px-4 flex justify-end">
              <button onClick={handleReset} className="text-sm font-bold text-slate-500 hover:text-orange-600 transition-colors flex items-center gap-2">
                  Refazer Simulação
              </button>
            </div>
          </div>
      )}

      <main className="flex-grow bg-slate-50">
        {step === 'input' && (
          <div className="flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 max-w-3xl">
              <h1 className="text-4xl font-extrabold text-blue-900 sm:text-6xl tracking-tight mb-6">
                O caminho mais curto para o seu <span className="text-orange-600">imóvel próprio.</span>
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed">
                Use nosso simulador inteligente para descobrir exatamente o que você pode comprar hoje, 
                baseado nos {properties.length > 0 ? properties.length : 'melhores'} imóveis disponíveis no mercado.
              </p>
            </div>
            
            <SimulationForm onSubmit={handleFormSubmit} />
            
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center opacity-70 max-w-4xl mx-auto w-full border-t border-slate-200 pt-8">
               <div>
                   <p className="font-bold text-3xl text-blue-900">10k+</p>
                   <p className="text-sm text-slate-600">Simulações feitas</p>
               </div>
               <div>
                   <p className="font-bold text-3xl text-blue-900">{properties.length > 0 ? properties.length : '500'}+</p>
                   <p className="text-sm text-slate-600">Imóveis ativos</p>
               </div>
               <div>
                   <p className="font-bold text-3xl text-blue-900">MCMV</p>
                   <p className="text-sm text-slate-600">Especialistas</p>
               </div>
               <div>
                   <p className="font-bold text-3xl text-blue-900">0%</p>
                   <p className="text-sm text-slate-600">Taxa de simulação</p>
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
    </>
  );
}

const App: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getProperties();
        if (data.length > 0) {
          setProperties(data);
        } else {
          console.log("Banco vazio, usando dados de exemplo.");
          setProperties(MOCK_PROPERTIES);
        }
      } catch (e) {
        console.error("Erro ao carregar banco de dados, usando modo offline", e);
        setProperties(MOCK_PROPERTIES);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col font-sans">
        <header className="bg-blue-950 border-b border-blue-900 sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-4 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="bg-orange-500 p-2 rounded-xl shadow-sm">
                <Building2 className="text-white w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white leading-none">MeuPrimeiro<span className="text-orange-400">Imóvel</span></span>
                <span className="text-[10px] text-blue-200 tracking-wider font-medium">SIMULADOR OFICIAL</span>
              </div>
            </Link>
            
            <Link 
              to="/admin" 
              className="flex items-center gap-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 px-5 py-2.5 rounded-full transition-all shadow-lg hover:shadow-orange-500/20 transform hover:-translate-y-0.5"
              title="Acessar Área do Corretor"
            >
              <ShieldCheck className="w-4 h-4" />
              Área do Corretor
            </Link>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Home properties={properties} loading={loading} />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>

        <footer className="bg-blue-950 border-t border-blue-900 py-12 mt-auto">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <div className="flex justify-center mb-6">
                <div className="bg-blue-900 p-3 rounded-full">
                    <Building2 className="text-blue-200 w-8 h-8" />
                </div>
            </div>
            <p className="text-blue-100 font-medium mb-2">&copy; {new Date().getFullYear()} Meu Primeiro Imóvel.</p>
            <p className="text-blue-300 text-sm max-w-md mx-auto">
              Ajudamos brasileiros a realizarem o sonho da casa própria através de tecnologia e transparência.
            </p>
            <p className="mt-8 text-xs text-blue-500 border-t border-blue-900 pt-4">
              Versão 2.1 (Atualizada)
            </p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;