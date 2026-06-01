import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X } from 'lucide-react';
import Modal from './Modal';
import { createPortal } from 'react-dom';

export default function ClientesCadastrados() {
  const [clientes, setClientes] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  // Estados para o MODAL DE EDIÇÃO
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editTipoDoc, setEditTipoDoc] = useState('CPF');
  const [editDocumento, setEditDocumento] = useState('');
  const [editContato1, setEditContato1] = useState('');
  const [editContato2, setEditContato2] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editLogradouro, setEditLogradouro] = useState('');
  const [editNumero, setEditNumero] = useState('');
  const [editComplemento, setEditComplemento] = useState('');
  const [editBairro, setEditBairro] = useState('');
  const [editCep, setEditCep] = useState('');

  // Estados para o MODAL DE DETALHES
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);
  const [clienteDetalhado, setClienteDetalhado] = useState(null);

  // Estados para MODAIS DE FEEDBACK (Substitutos do alert)
  const [modalAvisoOpen, setModalAvisoOpen] = useState(false);
  const [modalSucessoOpen, setModalSucessoOpen] = useState(false);
  const [modalExcluidoSucessoOpen, setModalExcluidoSucessoOpen] =
    useState(false);

  useEffect(() => {
    const salvos = localStorage.getItem('mvp_clientes');
    if (salvos) {
      setClientes(JSON.parse(salvos));
    }
  }, []);

  const salvarLocalStorage = (novosClientes) => {
    localStorage.setItem('mvp_clientes', JSON.stringify(novosClientes));
    setClientes(novosClientes);
  };

  const handleAbrirEditar = (cliente) => {
    setEditId(cliente.id);
    setEditNome(cliente.nome);
    setEditTipoDoc(cliente.tipoDoc || 'CPF');
    setEditDocumento(cliente.documentoFormatado || '');
    setEditContato1(cliente.contato1);
    setEditContato2(cliente.contato2 || '');
    setEditEmail(cliente.email || '');
    setEditLogradouro(cliente.logradouro || '');
    setEditNumero(cliente.numero || '');
    setEditComplemento(cliente.complemento || '');
    setEditBairro(cliente.bairro || '');
    setEditCep(cliente.cep || '');
    setModalEditarOpen(true);
  };

  const handleSalvarEdicao = (e) => {
    e.preventDefault();
    if (!editNome.trim() || !editContato1.trim()) {
      setModalAvisoOpen(true);
      return;
    }

    const listaAtualizada = clientes.map((c) => {
      if (c.id === editId) {
        return {
          ...c,
          nome: editNome.trim(),
          tipoDoc: editTipoDoc,
          documentoFormatado: editDocumento.trim(),
          contato1: editContato1.trim(),
          contato2: editContato2.trim(),
          email: editEmail.trim(),
          logradouro: editLogradouro.trim(),
          numero: editNumero.trim(),
          complemento: editComplemento.trim(),
          bairro: editBairro.trim(),
          cep: editCep.trim(),
        };
      }
      return c;
    });

    salvarLocalStorage(listaAtualizada);
    setModalEditarOpen(false);
    setModalSucessoOpen(true);
  };

  const handleAbrirExcluir = (cliente) => {
    setClienteParaExcluir(cliente);
    setModalExcluirOpen(true);
  };

  const confirmExcluir = () => {
    if (!clienteParaExcluir) return;
    const listaFiltrada = clientes.filter(
      (c) => c.id !== clienteParaExcluir.id
    );
    salvarLocalStorage(listaFiltrada);
    setModalExcluirOpen(false);
    setClienteParaExcluir(null);
    setModalExcluidoSucessoOpen(true);
  };

  const handleAbrirDetalhes = (cliente) => {
    setClienteDetalhado(cliente);
    setModalDetalhesOpen(true);
  };

  const clientesFiltradosEOrdenados = clientes
    .filter((c) => {
      const normalizar = (txt) =>
        txt
          ? txt
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
          : '';

      const termo = normalizar(pesquisa);
      const nomeNormalizado = normalizar(c.nome);
      const documentoNormalizado = normalizar(c.documentoFormatado);
      const emailNormalizado = normalizar(c.email);

      return (
        nomeNormalizado.includes(termo) ||
        documentoNormalizado.includes(termo) ||
        emailNormalizado.includes(termo)
      );
    })
    .sort((a, b) =>
      a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' })
    );

  return (
    <div className='max-w-full w-full mx-auto mt-2 space-y-4 text-base font-sans'>
      {/* BARRA DE PESQUISA */}
      <div className='bg-custom-surface p-4 rounded-lg border border-custom-grid shadow-sm flex items-center gap-3 bg-white'>
        <Search size={20} className='text-custom-muted' />
        <input
          type='text'
          value={pesquisa}
          onChange={(e) => setPesquisa(e.target.value)}
          placeholder='Pesquisar cliente por nome, CPF/CNPJ ou e-mail...'
          className='w-full bg-transparent focus:outline-none text-base'
        />
        {pesquisa && (
          <button
            onClick={() => setPesquisa('')}
            className='text-gray-400 hover:text-custom-main'
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* TABELA DE LISTAGEM */}
      <div className='bg-custom-surface p-6 rounded-lg border border-custom-grid shadow-sm'>
        <div className='overflow-x-auto border border-custom-grid rounded-md shadow-sm bg-white'>
          <table className='w-full text-left border-collapse min-w-[800px]'>
            <thead>
              <tr className='bg-gray-50 border-b border-custom-grid text-sm font-bold text-custom-muted uppercase tracking-wider'>
                <th className='py-3 px-4'>Nome / Razão Social</th>
                <th className='py-3 px-4 w-48'>CPF / CNPJ</th>
                <th className='py-3 px-4 w-44'>Contato Principal</th>
                <th className='py-3 px-4 w-60'>E-mail</th>
                <th className='py-3 px-4 w-52 text-center'>Ações</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-custom-grid text-base capitalize'>
              {clientesFiltradosEOrdenados.map((c) => (
                <tr
                  key={c.id}
                  className='hover:bg-gray-50/70 transition-colors'
                >
                  <td className='py-3 px-4 font-semibold text-custom-main'>
                    {c.nome}
                  </td>
                  <td className='py-3 px-4 font-mono text-sm normal-case'>
                    {c.documentoFormatado || '-'}
                  </td>
                  <td className='py-3 px-4 font-medium'>{c.contato1}</td>
                  <td className='py-3 px-4 text-custom-muted lowercase text-sm'>
                    {c.email || '-'}
                  </td>
                  <td className='py-3 px-4 text-center space-x-1.5'>
                    <button
                      onClick={() => handleAbrirDetalhes(c)}
                      className='px-2.5 py-1 text-xs font-bold uppercase tracking-wider border border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded transition-colors'
                    >
                      Ver Detalhes
                    </button>
                    <button
                      onClick={() => handleAbrirEditar(c)}
                      className='p-1 text-gray-500 hover:text-brand-main rounded inline-vertical align-middle transition-colors'
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleAbrirExcluir(c)}
                      className='p-1 text-gray-400 hover:text-brand-danger rounded inline-vertical align-middle transition-colors'
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {clientesFiltradosEOrdenados.length === 0 && (
                <tr>
                  <td
                    colSpan='5'
                    className='text-center py-6 text-custom-muted italic bg-gray-50'
                  >
                    Nenhum cliente encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: VER DETALHES DO CLIENTE */}
      {modalDetalhesOpen &&
        clienteDetalhado &&
        createPortal(
          <div className='fixed top-0 left-0 w-screen h-screen z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
            <div className='bg-white rounded-lg shadow-xl border border-custom-grid max-w-2xl w-full overflow-hidden'>
              <div className='bg-gray-50 px-6 py-4 border-b border-custom-grid flex justify-between items-center'>
                <h3 className='text-lg font-bold text-custom-main capitalize'>
                  Cliente: {clienteDetalhado.nome}
                </h3>
                <button
                  onClick={() => setModalDetalhesOpen(false)}
                  className='text-gray-400 hover:text-custom-main transition-colors'
                >
                  <X size={20} />
                </button>
              </div>
              <div className='p-6 space-y-4 text-base capitalize'>
                <div className='grid grid-cols-2 gap-4 border-b border-gray-100 pb-3'>
                  <div>
                    <span className='block text-xs font-bold text-custom-muted uppercase'>
                      Tipo de Pessoa
                    </span>
                    <span className='font-medium text-custom-main'>
                      {clienteDetalhado.tipoDoc === 'CPF'
                        ? 'Pessoa Física'
                        : 'Pessoa Jurídica'}
                    </span>
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-custom-muted uppercase'>
                      Documento Identificador
                    </span>
                    <span className='font-mono font-medium text-custom-main normal-case'>
                      {clienteDetalhado.documentoFormatado || '-'}
                    </span>
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4 border-b border-gray-100 pb-3'>
                  <div>
                    <span className='block text-xs font-bold text-custom-muted uppercase'>
                      Telefone Principal
                    </span>
                    <span className='font-medium text-custom-main'>
                      {clienteDetalhado.contato1}
                    </span>
                  </div>
                  <div>
                    <span className='block text-xs font-bold text-custom-muted uppercase'>
                      Contato Alternativo
                    </span>
                    <span className='font-medium text-custom-main'>
                      {clienteDetalhado.contato2 || (
                        <span className='text-gray-300 italic'>
                          Não informado
                        </span>
                      )}
                    </span>
                  </div>
                </div>
                <div className='border-b border-gray-100 pb-3'>
                  <span className='block text-xs font-bold text-custom-muted uppercase'>
                    E-mail Cadastrado
                  </span>
                  <span className='font-medium text-custom-main lowercase'>
                    {clienteDetalhado.email || (
                      <span className='text-gray-300 italic'>
                        Não informado
                      </span>
                    )}
                  </span>
                </div>
                <div className='bg-gray-50 p-3 rounded border border-custom-grid space-y-2'>
                  <span className='block text-xs font-bold text-custom-muted uppercase tracking-wider border-b border-gray-200 pb-1'>
                    Endereço Registrado
                  </span>
                  <div className='grid grid-cols-3 gap-2 text-sm'>
                    <p className='col-span-2'>
                      <strong>Logradouro:</strong> {clienteDetalhado.logradouro}
                    </p>
                    <p>
                      <strong>Número:</strong> {clienteDetalhado.numero}
                    </p>
                    <p className='col-span-3'>
                      <strong>Complemento:</strong>{' '}
                      {clienteDetalhado.complemento || (
                        <span className='text-gray-400 italic font-normal'>
                          Sem complemento
                        </span>
                      )}
                    </p>
                    <p>
                      <strong>Bairro:</strong> {clienteDetalhado.bairro}
                    </p>
                    <p>
                      <strong>Cidade/UF:</strong>{' '}
                      {clienteDetalhado.cidade || 'São Luís'} /{' '}
                      {clienteDetalhado.uf || 'MA'}
                    </p>
                    <p className='font-mono'>
                      <strong>CEP:</strong> {clienteDetalhado.cep || '-'}
                    </p>
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-6 py-3 border-t border-custom-grid flex justify-end'>
                <button
                  onClick={() => setModalDetalhesOpen(false)}
                  className='px-5 py-1.5 btn-primary rounded-md font-semibold text-sm shadow-sm'
                >
                  Fechar Detalhes
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL DE EDIÇÃO */}
      {modalEditarOpen &&
        createPortal(
          <div className='fixed top-0 left-0 w-screen h-screen z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
            <div className='bg-white rounded-lg shadow-xl border border-custom-grid max-w-4xl w-full overflow-hidden'>
              <div className='bg-gray-50 px-6 py-4 border-b border-custom-grid flex justify-between items-center'>
                <h3 className='text-lg font-bold text-custom-main'>
                  Editar Dados do Cliente
                </h3>
                <button
                  onClick={() => setModalEditarOpen(false)}
                  className='text-gray-400 hover:text-custom-main transition-colors'
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleSalvarEdicao}
                className='p-6 grid grid-cols-1 md:grid-cols-12 gap-4 text-base'
              >
                <div className='md:col-span-6'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Nome / Razão Social *
                  </label>
                  <input
                    type='text'
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white capitalize focus:outline-none'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Tipo Doc.
                  </label>
                  <select
                    value={editTipoDoc}
                    onChange={(e) => setEditTipoDoc(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  >
                    <option value='CPF'>CPF</option>
                    <option value='CNPJ'>CNPJ</option>
                  </select>
                </div>
                <div className='md:col-span-4'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Nº Documento
                  </label>
                  <input
                    type='text'
                    value={editDocumento}
                    onChange={(e) => setEditDocumento(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  />
                </div>
                <div className='md:col-span-4'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Contato Principal *
                  </label>
                  <input
                    type='text'
                    value={editContato1}
                    onChange={(e) => setEditContato1(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  />
                </div>
                <div className='md:col-span-4'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Contato 2
                  </label>
                  <input
                    type='text'
                    value={editContato2}
                    onChange={(e) => setEditContato2(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  />
                </div>
                <div className='md:col-span-4'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    E-mail
                  </label>
                  <input
                    type='email'
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white text-sm focus:outline-none'
                  />
                </div>
                <div className='md:col-span-5'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Rua / Logradouro
                  </label>
                  <input
                    type='text'
                    value={editLogradouro}
                    onChange={(e) => setEditLogradouro(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white capitalize focus:outline-none'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Número
                  </label>
                  <input
                    type='text'
                    value={editNumero}
                    onChange={(e) => setEditNumero(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  />
                </div>
                <div className='md:col-span-5'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Complemento
                  </label>
                  <input
                    type='text'
                    value={editComplemento}
                    onChange={(e) => setEditComplemento(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  />
                </div>
                <div className='md:col-span-6'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Bairro
                  </label>
                  <input
                    type='text'
                    value={editBairro}
                    onChange={(e) => setEditBairro(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white capitalize focus:outline-none'
                  />
                </div>
                <div className='md:col-span-6'>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    CEP
                  </label>
                  <input
                    type='text'
                    value={editCep}
                    onChange={(e) => setEditCep(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md bg-white focus:outline-none'
                  />
                </div>
                <div className='md:col-span-12 flex justify-end gap-3 pt-4 border-t border-custom-grid mt-2'>
                  <button
                    type='button'
                    onClick={() => setModalEditarOpen(false)}
                    className='px-4 py-2 border border-custom-grid text-custom-muted hover:bg-gray-50 rounded-md font-semibold'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    className='btn-primary px-5 py-2 rounded-md font-semibold shadow-sm'
                  >
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </div>
          </div>,
          document.body
        )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal
        isOpen={modalExcluirOpen}
        title='Excluir Cliente'
        message={`Tem certeza que deseja excluir o cliente "${clienteParaExcluir?.nome}"?`}
        onConfirm={confirmExcluir}
        onCancel={() => setModalExcluirOpen(false)}
        confirmText='Sim, excluir'
        cancelText='Não, manter'
      />

      {/* MODAL DE VALIDAÇÃO (AVISO) */}
      <Modal
        isOpen={modalAvisoOpen}
        title='Campos Obrigatórios'
        message='Por favor, preencha o nome do cliente e o contato principal antes de salvar.'
        onConfirm={() => setModalAvisoOpen(false)}
        confirmText='Ok'
      />

      {/* MODAL DE SUCESSO DE EDIÇÃO */}
      <Modal
        isOpen={modalSucessoOpen}
        title='Sucesso!'
        message='Os dados do cliente foram atualizados.'
        onConfirm={() => setModalSucessoOpen(false)}
        confirmText='Ok'
      />

      {/* MODAL DE SUCESSO AO EXCLUIR */}
      <Modal
        isOpen={modalExcluidoSucessoOpen}
        title='Cliente Excluído!'
        message='O registro do cliente foi removido do sistema com sucesso.'
        onConfirm={() => setModalExcluidoSucessoOpen(false)}
        confirmText='Ok'
      />
    </div>
  );
}
