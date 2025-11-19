import React, { useState, useEffect, useRef } from 'react';
import { auth, firebaseConfig } from '../firebase-config';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Property, PropertyType } from '../types';
import { getProperties, addProperty, updateProperty, deleteProperty, uploadPropertyImage } from '../services/propertyService';
import { formatCurrency } from '../utils/formatting';
import { Trash2, Plus, Image as ImageIcon, LogOut, Loader2, Lock, AlertCircle, HelpCircle, ExternalLink, CheckCircle2, Info, Link as LinkIcon, UploadCloud, Database, UserPlus, HardDrive, Edit2, ArrowLeft } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de Login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showSetupHelp, setShowSetupHelp] = useState(false);

  // Estados da Dashboard
  const [properties, setProperties] = useState<Property[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // ID do imóvel sendo editado
  const [uploading, setUploading] = useState(false);
  
  // Estado de Notificações
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Estado do Formulário
  const initialFormState = {
    title: '',
    price: '',
    location: '',
    type: PropertyType.APARTMENT,
    bedrooms: 2,
    bathrooms: 1,
    size: 50,
    description: '',
    youtubeVideoId: '',
    googleMapsLink: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  
  // Estado para gerenciar tipo de imagem
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('url');
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  
  // Referência para limpar o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Verificar se tem alguém logado ao carregar a página
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadProperties();
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-hide notificação após 5 segundos
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const loadProperties = async () => {
    const data = await getProperties();
    setProperties(data);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginError('');
    } catch (error: any) {
      console.error(error);
      setLoginError("Erro ao logar. Verifique se o usuário foi criado no Firebase Authentication.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel? Essa ação não pode ser desfeita.')) {
      try {
        await deleteProperty(id);
        setNotification({ type: 'success', message: 'Imóvel removido com sucesso.' });
        loadProperties();
      } catch (error) {
        setNotification({ type: 'error', message: 'Erro ao remover imóvel.' });
      }
    }
  };

  const handleEdit = (property: Property) => {
    setEditingId(property.id);
    setFormData({
      title: property.title,
      price: property.price.toString(),
      location: property.location,
      type: property.type,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      size: property.size,
      description: property.description || '',
      youtubeVideoId: property.youtubeVideoId || '',
      googleMapsLink: property.googleMapsLink || ''
    });

    // Carregar a primeira imagem para edição se for URL
    if (property.images && property.images.length > 0) {
        // Se for link externo, joga no input de URL
        setImageMode('url');
        setImageUrlInput(property.images[0]);
    } else {
        setImageUrlInput('');
    }

    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
      setIsAdding(false);
      setEditingId(null);
      setFormData(initialFormState);
      setImageUrlInput('');
      setUrlError('');
      setSelectedFiles(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const validateUrl = (url: string) => {
    const lowerUrl = url.toLowerCase();
    if (!url) return '';
    
    if (lowerUrl.startsWith('sandbox:') || lowerUrl.includes('/mnt/data')) {
         return '🚫 Erro: Link local do editor. Use um link público (https://...).';
    } else if (lowerUrl.startsWith('file:') || /^[a-z]:\\/i.test(url)) {
         return '🚫 Erro: Caminho de arquivo local. Use "Enviar Arquivo" ou um link web.';
    } else if (!/^(http|https):\/\//.test(url)) {
         return '⚠️ A URL deve começar com http:// ou https://';
    }
    return '';
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      setImageUrlInput(url);
      setUrlError(validateUrl(url));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const largeFiles = files.filter(f => f.size > 5 * 1024 * 1024);
      
      if (largeFiles.length > 0) {
          alert(`⚠️ O arquivo "${largeFiles[0].name}" é muito grande (Máx 5MB).`);
          if (fileInputRef.current) fileInputRef.current.value = '';
          setSelectedFiles(null);
          return;
      }
      setSelectedFiles(e.target.files);
    }
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setNotification(null);

    try {
      const imageUrls: string[] = [];

      // 1. Validar e Processar Imagens
      if (imageMode === 'url') {
        const cleanUrl = imageUrlInput.trim();
        const error = validateUrl(cleanUrl);
        
        if (error) {
            throw new Error("URL da imagem inválida: " + error);
        }
        if (cleanUrl) {
             imageUrls.push(cleanUrl);
        }
      } else if (imageMode === 'upload' && selectedFiles && selectedFiles.length > 0) {
        try {
            const uploadPromises = (Array.from(selectedFiles) as File[]).map(file => uploadPropertyImage(file));
            const uploadedUrls = await Promise.all(uploadPromises);
            imageUrls.push(...uploadedUrls);
        } catch (uploadError: any) {
            console.error("Erro detalhado upload:", uploadError);
            throw new Error(`Falha no envio da imagem. Tente usar a opção "Colar Link (URL)". Detalhe: ${uploadError.message}`);
        }
      }

      // Se estiver editando e não trocou a imagem, mantém a original
      if (editingId && imageUrls.length === 0) {
           const currentProp = properties.find(p => p.id === editingId);
           if (currentProp && currentProp.images.length > 0) {
               imageUrls.push(...currentProp.images);
           }
      }

      // Fallback de segurança se ainda não tiver imagem válida
      if (imageUrls.length === 0 && !editingId) {
         imageUrls.push('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80');
      }

      // 2. Objeto de Dados
      const propertyData: any = {
        title: formData.title,
        price: Number(formData.price),
        location: formData.location,
        type: formData.type as PropertyType,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        size: Number(formData.size),
        description: formData.description,
        youtubeVideoId: formData.youtubeVideoId,
        googleMapsLink: formData.googleMapsLink,
      };

      // Só atualiza imagem se tiver nova
      if (imageUrls.length > 0) {
          propertyData.images = imageUrls;
      }

      // 3. Salvar ou Atualizar no Banco
      if (editingId) {
          await updateProperty(editingId, propertyData);
          setNotification({ type: 'success', message: 'Imóvel atualizado com sucesso!' });
      } else {
          await addProperty({ ...propertyData, images: imageUrls });
          setNotification({ type: 'success', message: 'Imóvel cadastrado com sucesso!' });
      }
      
      // 4. Limpar Formulário
      cancelForm();
      await loadProperties();
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error: any) {
      console.error(error);
      setNotification({
        type: 'error',
        message: error.message || 'Erro desconhecido ao salvar.'
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-blue-900" /></div>;

  // --- TELA DE LOGIN ---
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 px-4 py-10">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-900 p-4 rounded-full shadow-md">
                <Lock className="text-white w-8 h-8" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-blue-900 mb-2">Área do Corretor</h2>
          <p className="text-center text-slate-500 mb-6 text-sm">Faça login para gerenciar seus imóveis</p>
          
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm flex items-center gap-2">
                <AlertCircle size={16} />
                {loginError}
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="admin@exemplo.com"
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Senha</label>
              <input 
                type="password" 
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="w-full bg-blue-900 text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-transform active:scale-95 shadow-md">
              Entrar no Sistema
            </button>
          </form>
          
          <div className="mt-6 pt-6 border-t border-slate-100">
             <button 
               onClick={() => setShowSetupHelp(!showSetupHelp)}
               className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-orange-600 transition-colors font-medium"
             >
               <HelpCircle size={16} />
               {showSetupHelp ? 'Ocultar Ajuda' : 'Configurar Firebase'}
             </button>

             {showSetupHelp && (
               <div className="mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm animate-in fade-in slide-in-from-top-2 max-h-[400px] overflow-y-auto">
                  <p className="font-bold text-slate-700 mb-2">Links Rápidos:</p>
                  <ul className="space-y-2 mb-4">
                    <li>
                      <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-white rounded border hover:border-orange-500 transition-colors text-blue-900">
                        <span className="flex items-center gap-2"><Database size={16}/> Criar Banco de Dados (Firestore)</span>
                        <ExternalLink size={14}/>
                      </a>
                    </li>
                    <li>
                      <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/storage`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-white rounded border hover:border-orange-500 transition-colors text-blue-900">
                        <span className="flex items-center gap-2"><HardDrive size={16}/> Criar Storage (Imagens)</span>
                        <ExternalLink size={14}/>
                      </a>
                    </li>
                    <li>
                      <a href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2 bg-white rounded border hover:border-orange-500 transition-colors text-blue-900">
                        <span className="flex items-center gap-2"><UserPlus size={16}/> Criar 1º Usuário (Auth)</span>
                        <ExternalLink size={14}/>
                      </a>
                    </li>
                  </ul>
                  <div className="bg-blue-50 p-3 rounded text-blue-800 text-xs">
                    <strong>Dica:</strong> No Firestore, crie uma coleção chamada <code>properties</code>.
                  </div>
               </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD ---
  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header Admin */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-900 p-1.5 rounded-lg">
              <Lock className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-blue-900">Painel Administrativo</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500 hidden md:inline-block">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {notification && (
            <div className={`fixed top-20 right-4 max-w-sm p-4 rounded-lg shadow-xl text-white flex items-center gap-3 z-50 animate-in slide-in-from-right-10 ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                {notification.type === 'success' ? <CheckCircle2 /> : <AlertCircle />}
                <p className="font-medium">{notification.message}</p>
            </div>
        )}

        {!isAdding ? (
          <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Meus Imóveis</h1>
                <p className="text-slate-500">{properties.length} imóveis cadastrados</p>
              </div>
              <button 
                onClick={() => setIsAdding(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-md flex items-center gap-2 transition-colors w-full md:w-auto justify-center"
              >
                <Plus size={20} />
                Adicionar Novo
              </button>
            </div>

            {properties.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-slate-200 border-dashed">
                <div className="bg-slate-50 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="text-slate-300 w-8 h-8" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">Nenhum imóvel encontrado</h3>
                <p className="text-slate-500 mb-4">Comece adicionando seu primeiro imóvel ao sistema.</p>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="text-orange-600 font-bold hover:underline"
                >
                  Cadastrar Imóvel Agora
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((prop) => (
                  <div key={prop.id} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden group">
                    <div className="h-40 bg-slate-100 relative">
                      <img 
                        src={prop.images[0] || 'https://via.placeholder.com/400x300?text=Sem+Imagem'} 
                        alt={prop.title} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(prop)}
                            className="bg-white text-blue-900 p-1.5 rounded shadow hover:bg-blue-50"
                            title="Editar"
                          >
                              <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(prop.id)}
                            className="bg-white text-red-600 p-1.5 rounded shadow hover:bg-red-50"
                            title="Excluir"
                          >
                              <Trash2 size={16} />
                          </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-slate-800 truncate flex-1">{prop.title}</h3>
                          <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 ml-2">{prop.type}</span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2 truncate">{prop.location}</p>
                      <p className="text-lg font-bold text-blue-900">{formatCurrency(prop.price)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={cancelForm}
              className="mb-4 text-slate-500 hover:text-slate-800 flex items-center gap-1 text-sm"
            >
              <ArrowLeft size={16} />
              Voltar para lista
            </button>
            
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <div className="bg-blue-900 p-6 text-white">
                <h2 className="text-xl font-bold">{editingId ? 'Editar Imóvel' : 'Novo Imóvel'}</h2>
                <p className="text-blue-200 text-sm">Preencha os dados abaixo para exibir no site.</p>
              </div>
              
              <form onSubmit={handleSubmitProperty} className="p-6 space-y-6">
                {/* Linha 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Título do Anúncio</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Ex: Apartamento no Centro"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="200000"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                  </div>
                </div>

                {/* Linha 2 */}
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Localização (Bairro/Cidade)</label>
                   <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      placeholder="Ex: Meireles, Fortaleza"
                      value={formData.location}
                      onChange={e => setFormData({...formData, location: e.target.value})}
                    />
                </div>

                {/* Linha 3 - Detalhes */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                    <select
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value as PropertyType})}
                    >
                      {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quartos</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.bedrooms}
                      onChange={e => setFormData({...formData, bedrooms: Number(e.target.value)})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Banheiros</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.bathrooms}
                      onChange={e => setFormData({...formData, bathrooms: Number(e.target.value)})}
                    />
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Área (m²)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                      value={formData.size}
                      onChange={e => setFormData({...formData, size: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Imagem */}
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                        <ImageIcon size={18} />
                        Imagem Principal
                    </label>
                    
                    <div className="flex gap-4 mb-3 text-sm">
                        <button 
                            type="button"
                            onClick={() => setImageMode('url')}
                            className={`flex-1 py-2 rounded-md border flex items-center justify-center gap-2 ${imageMode === 'url' ? 'bg-white border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500' : 'border-slate-300 text-slate-500 hover:bg-white'}`}
                        >
                            <LinkIcon size={16} /> Colar Link (Recomendado)
                        </button>
                        <button 
                            type="button"
                            onClick={() => setImageMode('upload')}
                            className={`flex-1 py-2 rounded-md border flex items-center justify-center gap-2 ${imageMode === 'upload' ? 'bg-white border-orange-500 text-orange-700 shadow-sm ring-1 ring-orange-500' : 'border-slate-300 text-slate-500 hover:bg-white'}`}
                        >
                            <UploadCloud size={16} /> Enviar Arquivo
                        </button>
                    </div>

                    {imageMode === 'url' ? (
                        <div>
                             <input
                                type="text"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm ${urlError ? 'border-red-300 bg-red-50' : 'border-slate-300'}`}
                                placeholder="https://exemplo.com/foto-imovel.jpg"
                                value={imageUrlInput}
                                onChange={handleUrlChange}
                            />
                            {urlError ? (
                                <p className="text-red-600 text-xs mt-1">{urlError}</p>
                            ) : (
                                <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                                    <Info size={12} /> Use links públicos (Unsplash, Imgur, ou do seu site).
                                </p>
                            )}
                        </div>
                    ) : (
                         <div>
                             <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                             />
                             <p className="text-slate-400 text-xs mt-1">Máximo 5MB. O upload pode ser lento.</p>
                         </div>
                    )}
                </div>

                {/* Descrição */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
                    <textarea
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none h-24 text-sm"
                        placeholder="Descreva os diferenciais do imóvel..."
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                    ></textarea>
                </div>

                {/* Extras */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">ID do YouTube (Opcional)</label>
                        <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="Ex: dQw4w9WgXcQ"
                        value={formData.youtubeVideoId}
                        onChange={e => setFormData({...formData, youtubeVideoId: e.target.value})}
                        />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Link Google Maps (Opcional)</label>
                        <input
                        type="text"
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                        placeholder="https://maps.app.goo.gl/..."
                        value={formData.googleMapsLink}
                        onChange={e => setFormData({...formData, googleMapsLink: e.target.value})}
                        />
                    </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={cancelForm}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={uploading || (imageMode === 'url' && !!urlError)}
                        className="flex-1 bg-blue-900 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold py-3 rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin" /> Salvando...
                            </>
                        ) : (
                            'Salvar Imóvel'
                        )}
                    </button>
                </div>

              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};