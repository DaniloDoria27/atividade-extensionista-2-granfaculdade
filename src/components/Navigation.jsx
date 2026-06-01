import {
  UserPlus,
  PackagePlus,
  Users,
  Package,
  FileSpreadsheet,
  ShieldCheck, // Adicionado para o ícone de Backup
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'cadastrar-cliente', label: 'Cadastrar Cliente', icon: UserPlus },
    { id: 'cadastrar-produto', label: 'Cadastrar Produto', icon: PackagePlus },
    { id: 'clientes-cadastrados', label: 'Clientes Cadastrados', icon: Users },
    {
      id: 'produtos-cadastrados',
      label: 'Produtos Cadastrados',
      icon: Package,
    },
    { id: 'novo-orcamento', label: 'Novo Orçamento', icon: FileSpreadsheet },
    { id: 'backup', label: 'Backup', icon: ShieldCheck }, // Aba de Backup injetada aqui
  ];

  return (
    <nav className='bg-brand-surface border-b border-brand-border sticky top-0 z-40 shadow-sm'>
      <div className='max-w-7xl mx-auto px-4'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3'>
          {/* Logo / Título do Sistema */}
          <div className='flex items-center gap-2'>
            <div className='flex space-x-9 items-center'>
              <div className='h-8 w-8 flex items-center justify-center text-brand-primary font-bold text-4xl'>
                RQL
              </div>
              <span className='font-bold text-lg tracking-tight text-brand-main'>
                {/* RQL<span className='text-brand-primary'>MVP</span> */}
                <div>
                  GERENCIADOR
                  <div>DE ORÇAMENTOS</div>
                </div>
              </span>
            </div>
          </div>

          {/* Abas de Navegação */}
          <div className='flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg overflow-x-auto'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-surface text-brand-primary shadow-sm'
                      : 'text-brand-muted hover:text-brand-main hover:bg-gray-50'
                  }`}
                >
                  <Icon
                    size={16}
                    className={
                      isActive ? 'text-brand-primary' : 'text-brand-muted'
                    }
                  />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
