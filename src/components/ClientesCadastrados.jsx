import { useState, useEffect } from 'react';
import { Search, User, Phone, MapPin, Mail, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function ClientesCadastrados() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalDeletarOpen, setModalDeletarOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);

  const carregarClientes = () => {
    const dados = JSON.parse(localStorage.getItem('mvp_clientes') || '[]');
    dados.sort((a, b) => a.nome.localeCompare(b.nome));
    setClientes(dados);
  };

  useEffect(() => {
    carregarClientes();
  }, []);

  const clientesFiltrados = clientes.filter((cliente) => {
    const termo = busca.toLowerCase().trim();
    return (
      cliente.nome.includes(termo) ||
      cliente.documento.includes(termo) ||
      cliente.documentoFormatado.includes(termo) ||
      (cliente.email && cliente.email.includes(termo))
    );
  });

  const handleGatilhoDeletar = (cliente) => {
    setClienteParaDeletar(cliente);
    setModalDeletarOpen(true);
  };

  const confirmarExclusao = () => {
    if (clienteParaDeletar) {
      const novaLista = clientes.filter((c) => c.id !== clienteParaDeletar.id);
      localStorage.setItem('mvp_clientes', JSON.stringify(novaLista));
      carregarClientes();
    }
    setModalDeletarOpen(false);
    setClienteParaDeletar(null);
  };

  return (
    <div className='max-w-full mx-auto mt-4'>
      <div className='mb-4 relative'>
        <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-muted'>
          <Search size={18} />
        </div>
        <input
          type='text'
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder='Buscar cliente por nome, documento ou e-mail...'
          className='w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-lg bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm shadow-sm'
        />
      </div>

      <p className='text-xs text-brand-muted mb-3 font-medium'>
        {clientesFiltrados.length}{' '}
        {clientesFiltrados.length === 1
          ? 'cliente encontrado'
          : 'clientes encontrados'}
      </p>

      {clientesFiltrados.length === 0 ? (
        <div className='bg-brand-surface p-12 text-center rounded-lg border border-brand-border shadow-sm'>
          <p className='text-brand-muted text-sm'>
            Nenhum cliente cadastrado ou encontrado.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
          {clientesFiltrados.map((cliente) => (
            <div
              key={cliente.id}
              className='bg-brand-surface p-5 rounded-lg border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group'
            >
              <div>
                <div className='flex items-start justify-between gap-2 border-b border-brand-border pb-3 mb-3'>
                  <div>
                    <h3 className='font-bold text-base text-brand-main capitalize'>
                      {cliente.nome}
                    </h3>
                    <span className='inline-block mt-1 bg-gray-100 text-brand-muted text-xs font-semibold px-2 py-0.5 rounded'>
                      {cliente.tipoDoc}: {cliente.documentoFormatado}
                    </span>
                  </div>

                  {/* Botão de Deletar Cliente */}
                  <button
                    type='button'
                    onClick={() => handleGatilhoDeletar(cliente)}
                    className='p-1.5 text-gray-400 hover:text-brand-danger hover:bg-red-50 rounded-md transition-colors'
                    title='Excluir Cliente'
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className='space-y-2 text-sm text-brand-muted'>
                  <div className='flex items-center gap-2'>
                    <Phone size={14} className='text-brand-primary shrink-0' />
                    <span>{cliente.contato1}</span>
                    {cliente.contato2 && (
                      <span className='text-gray-300'>|</span>
                    )}
                    {cliente.contato2 && <span>{cliente.contato2}</span>}
                    {cliente.contato3 && (
                      <span className='text-gray-300'>|</span>
                    )}
                    {cliente.contato3 && <span>{cliente.contato3}</span>}
                  </div>

                  {cliente.email && (
                    <div className='flex items-center gap-2'>
                      <Mail size={14} className='text-brand-primary shrink-0' />
                      <span className='lowercase'>{cliente.email}</span>
                    </div>
                  )}

                  <div className='flex items-start gap-2 pt-1'>
                    <MapPin
                      size={14}
                      className='text-brand-primary shrink-0 mt-0.5'
                    />
                    <span className='capitalize text-xs leading-relaxed'>
                      {cliente.logradouro}, Nº {cliente.numero}
                      {cliente.complemento && ` - ${cliente.complemento}`}
                      {` - Bairro: ${cliente.bairro}`}
                      {cliente.cep && ` - CEP: ${cliente.cep}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal
        isOpen={modalDeletarOpen}
        title='Excluir Cadastro do Cliente'
        message={`Atenção! Você está prestes a remover permanentemente o cliente:\n"${clienteParaDeletar?.nome?.toUpperCase()}"\n\nEsta ação não poderá ser desfeita. Confirma a exclusão?`}
        onConfirm={confirmarExclusao}
        onCancel={() => {
          setModalDeletarOpen(false);
          setClienteParaDeletar(null);
        }}
        confirmText='Sim, excluir'
        cancelText='Não, cancelar'
      />
    </div>
  );
}
