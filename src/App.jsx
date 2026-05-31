import { useState } from 'react';
import Navigation from './components/Navigation';
import CadastrarCliente from './components/CadastrarCliente';
import CadastrarProduto from './components/CadastrarProduto';
import ClientesCadastrados from './components/ClientesCadastrados';
import ProdutosCadastrados from './components/ProdutosCadastrados';
import NovoOrcamento from './components/NovoOrcamento';

export default function App() {
  const [activeTab, setActiveTab] = useState('novo-orcamento');

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
      default:
        return <NovoOrcamento />;
    }
  };

  return (
    <div className='min-h-screen flex flex-col bg-gray-50 text-[16px]'>
      <div className='print:hidden'>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Alterado para ocupar 98% da largura da tela, aproveitando o espaço horizontal */}
      <main className='flex-1 p-4 max-w-[98%] w-full mx-auto print:p-0 print:max-w-none'>
        {renderTabContent()}
      </main>
    </div>
  );
}
