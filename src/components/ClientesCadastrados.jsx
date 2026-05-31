import { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  MapPin,
  Mail,
  Trash2,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import Modal from './Modal';
import {
  formatCpfCnpj,
  formatPhone,
  formatCep,
  isValidEmail,
  isValidDocument,
} from '../utils/helpers'; // Certifique-se de que o caminho para o seu helpers.js está correto

export default function ClientesCadastrados() {
  const [clientes, setClientes] = useState([]);
  const [busca, setBusca] = useState('');

  // Estados para o Modal de Deleção
  const [modalDeletarOpen, setModalDeletarOpen] = useState(false);
  const [clienteParaDeletar, setClienteParaDeletar] = useState(null);

  // Estados para o Modal de Edição Completa
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [dadosEdicao, setDadosEdicao] = useState(null);

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
      cliente.nome.toLowerCase().includes(termo) ||
      cliente.documento.includes(termo) ||
      cliente.documentoFormatado.includes(termo) ||
      (cliente.email && cliente.email.toLowerCase().includes(termo))
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

  // Fluxo de Edição Geral via Modal
  const abrirModalEditar = (cliente) => {
    setDadosEdicao({ ...cliente });
    setModalEditarOpen(true);
  };

  // Tratamento Inteligente de Inputs com Máscaras Dinâmicas do helpers.js
  const handleEdicaoChange = (e) => {
    const { name, value } = e.target;
    let valueFormatado = value;

    if (name === 'documentoFormatado') {
      valueFormatado = formatCpfCnpj(value);
    } else if (['contato1', 'contato2', 'contato3'].includes(name)) {
      valueFormatado = formatPhone(value);
    } else if (name === 'cep') {
      valueFormatado = formatCep(value);
    }

    setDadosEdicao({ ...dadosEdicao, [name]: valueFormatado });
  };

  const salvarEdicaoCompleta = (e) => {
    e.preventDefault();

    // 1. Validação de Nome
    if (!dadosEdicao.nome.trim()) {
      alert('O nome do cliente é obrigatório.');
      return;
    }

    // 2. Validação Matemática do Documento (CPF/CNPJ)
    const digitosApenas = dadosEdicao.documentoFormatado.replace(/\D/g, '');
    if (!isValidDocument(dadosEdicao.documentoFormatado, dadosEdicao.tipoDoc)) {
      alert(
        `O número de ${dadosEdicao.tipoDoc} informado é inválido. Por favor, confira os dígitos.`
      );
      return;
    }

    // 3. Validação de Estrutura de E-mail
    if (dadosEdicao.email && !isValidEmail(dadosEdicao.email)) {
      alert(
        'O formato do e-mail inserido é inválido. Certifique-se de usar um "@" válido.'
      );
      return;
    }

    // 4. Validação de Contato Mínimo
    if (!dadosEdicao.contato1.trim()) {
      alert('O contato principal do cliente é obrigatório.');
      return;
    }

    // Atualiza a propriedade limpa do documento para buscas idênticas ao cadastro padrão
    const dadosAtualizados = {
      ...dadosEdicao,
      documento: digitosApenas,
    };

    const novaLista = clientes.map((c) =>
      c.id === dadosAtualizados.id ? dadosAtualizados : c
    );
    localStorage.setItem('mvp_clientes', JSON.stringify(novaLista));

    setModalEditarOpen(false);
    setDadosEdicao(null);
    carregarClientes();
    alert('Cadastro do cliente atualizado com sucesso!');
  };

  return (
    <div className='max-w-full mx-auto mt-4'>
      {/* BARRA DE BUSCA */}
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

      {/* LISTAGEM DE CARDS */}
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
                      {cliente.ie && ` | IE: ${cliente.ie}`}
                    </span>
                  </div>

                  <div className='flex items-center gap-1 shrink-0'>
                    <button
                      type='button'
                      onClick={() => abrirModalEditar(cliente)}
                      className='p-1.5 text-gray-400 hover:text-brand-primary hover:bg-orange-50 rounded-md transition-colors'
                      title='Editar Cadastro Completo'
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type='button'
                      onClick={() => handleGatilhoDeletar(cliente)}
                      className='p-1.5 text-gray-400 hover:text-brand-danger hover:bg-red-50 rounded-md transition-colors'
                      title='Excluir Cliente'
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className='space-y-2 text-sm text-brand-muted'>
                  <div className='flex items-center gap-2 flex-wrap'>
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

      {/* MODAL GLOBAL DE EDIÇÃO DE TODAS AS INFORMAÇÕES */}
      {modalEditarOpen && dadosEdicao && (
        <div className='fixed -inset-5 z-[9998] flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in text-sm text-brand-main'>
          <div className='w-full max-w-2xl rounded-lg bg-brand-surface p-6 shadow-xl border border-brand-border max-h-[90vh] overflow-y-auto mt-5'>
            <div className='flex items-center justify-between border-b border-brand-border pb-3 mb-4'>
              <h3 className='text-lg font-bold text-brand-main flex items-center gap-2'>
                <Pencil size={18} className='text-brand-primary' />
                Editar Cadastro do Cliente
              </h3>
              <button
                type='button'
                onClick={() => setModalEditarOpen(false)}
                className='text-gray-400 hover:text-brand-danger p-1 rounded-md'
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={salvarEdicaoCompleta}
              className='space-y-4 text-left'
            >
              {/* Seção 1: Identificação Básica */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    Nome / Razão Social:
                  </label>
                  <input
                    type='text'
                    name='nome'
                    value={dadosEdicao.nome || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary capitalize'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    E-mail:
                  </label>
                  <input
                    type='text'
                    name='email'
                    value={dadosEdicao.email || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary lowercase'
                    placeholder='exemplo@email.com'
                  />
                </div>
              </div>

              {/* Seção 2: Documentos Fixos com Máscaras */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-3 rounded-lg border border-brand-border'>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    Tipo de Doc:
                  </label>
                  <input
                    type='text'
                    value={dadosEdicao.tipoDoc || ''}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg bg-gray-100 cursor-not-allowed font-medium text-center'
                    disabled
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    {dadosEdicao.tipoDoc} (Apenas números):
                  </label>
                  <input
                    type='text'
                    name='documentoFormatado'
                    value={dadosEdicao.documentoFormatado || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary font-mono'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    Inscrição Estadual (IE):
                  </label>
                  <input
                    type='text'
                    name='ie'
                    value={dadosEdicao.ie || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                    placeholder='Isento / Numeração'
                  />
                </div>
              </div>

              {/* Seção 3: Telefones de Contato com Máscaras */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    Contato Principal:
                  </label>
                  <input
                    type='text'
                    name='contato1'
                    value={dadosEdicao.contato1 || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                    placeholder='(00) 00000-0000'
                    required
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    Contato 2 (Opcional):
                  </label>
                  <input
                    type='text'
                    name='contato2'
                    value={dadosEdicao.contato2 || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                    placeholder='(00) 00000-0000'
                  />
                </div>
                <div>
                  <label className='block text-xs font-semibold text-brand-muted mb-1'>
                    Contato 3 (Opcional):
                  </label>
                  <input
                    type='text'
                    name='contato3'
                    value={dadosEdicao.contato3 || ''}
                    onChange={handleEdicaoChange}
                    className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                    placeholder='(00) 00000-0000'
                  />
                </div>
              </div>

              {/* Seção 4: Endereço Detalhado */}
              <div className='border-t border-brand-border pt-3 mt-2'>
                <h4 className='text-xs font-bold text-brand-primary uppercase tracking-wider mb-2'>
                  Endereço de Entrega/Faturamento
                </h4>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-3'>
                  <div className='md:col-span-2'>
                    <label className='block text-xs font-semibold text-brand-muted mb-1'>
                      Logradouro (Rua, Avenida...):
                    </label>
                    <input
                      type='text'
                      name='logradouro'
                      value={dadosEdicao.logradouro || ''}
                      onChange={handleEdicaoChange}
                      className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary capitalize'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-brand-muted mb-1'>
                      Número:
                    </label>
                    <input
                      type='text'
                      name='numero'
                      value={dadosEdicao.numero || ''}
                      onChange={handleEdicaoChange}
                      className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                  <div>
                    <label className='block text-xs font-semibold text-brand-muted mb-1'>
                      Complemento:
                    </label>
                    <input
                      type='text'
                      name='complemento'
                      value={dadosEdicao.complemento || ''}
                      onChange={handleEdicaoChange}
                      className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                      placeholder='Apto, Bloco, Sala...'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-brand-muted mb-1'>
                      Bairro:
                    </label>
                    <input
                      type='text'
                      name='bairro'
                      value={dadosEdicao.bairro || ''}
                      onChange={handleEdicaoChange}
                      className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary capitalize'
                    />
                  </div>
                  <div>
                    <label className='block text-xs font-semibold text-brand-muted mb-1'>
                      CEP:
                    </label>
                    <input
                      type='text'
                      name='cep'
                      value={dadosEdicao.cep || ''}
                      onChange={handleEdicaoChange}
                      className='w-full px-3 py-2 border border-brand-border rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-primary'
                      placeholder='00000-000'
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação do Modal */}
              <div className='flex justify-end gap-3 pt-4 border-t border-brand-border mt-4'>
                <button
                  type='button'
                  onClick={() => setModalEditarOpen(false)}
                  className='px-4 py-2 border border-brand-border text-sm font-medium rounded-lg text-brand-muted hover:bg-gray-100 transition-colors'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-5 py-2 bg-brand-primary hover:bg-brand-primary-hover text-white text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm'
                >
                  <Save size={16} /> Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
