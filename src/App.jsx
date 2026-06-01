import { useState, useEffect } from 'react'; // <--- ADICIONADO O useEffect
import Navigation from './components/Navigation';
import CadastrarCliente from './components/CadastrarCliente';
import CadastrarProduto from './components/CadastrarProduto';
import ClientesCadastrados from './components/ClientesCadastrados';
import ProdutosCadastrados from './components/ProdutosCadastrados';
import NovoOrcamento from './components/NovoOrcamento';
import Backup from './components/Backup';

export default function App() {
  const [activeTab, setActiveTab] = useState('novo-orcamento');

  // ADICIONADO: Força o título correto do sistema, substituindo o do Vite
  useEffect(() => {
    document.title = 'RQL - GERENCIADOR DE ORÇAMENTOS';
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'cadastrar-cliente':
        return <CadastrarCliente />;
      case 'cadastrar-produto':
        return <CadastrarProduto />;
      case 'clientes-cadastrados':
        return <ClientesCadastrados />;
      case 'produtos-cadastrados':
        return <ProdutosCadastrados />;
      case 'novo-orcamento':
        return <NovoOrcamento />;
      case 'backup':
        return <Backup />;
      default:
        return <NovoOrcamento />;
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-gray-50 text-[16px]'>
      <div className='print:hidden'>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <main className='flex-1 w-full print:p-0'>
        <div
          id='conteudo-principal'
          className='relative p-4 max-w-[98%] w-full mx-auto print:p-0 print:max-w-none'
        >
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
}
