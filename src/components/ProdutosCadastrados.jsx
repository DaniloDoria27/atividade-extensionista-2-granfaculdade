import { useState, useEffect } from 'react';
import { Edit2, Trash2, Search, X } from 'lucide-react';
import Modal from './Modal';
import { createPortal } from 'react-dom';

export default function ProdutosCadastrados() {
  const [produtos, setProdutos] = useState([]);
  const [pesquisa, setPesquisa] = useState('');
  const [modalExcluirOpen, setModalExcluirOpen] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  // Estados para o MODAL DE EDIÇÃO
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState('');
  const [editPreco, setEditPreco] = useState('');
  const [editDescricao, setEditDescricao] = useState('');
  const [editGrandeza, setEditGrandeza] = useState('unid.');

  // Estados para MODAIS DE FEEDBACK (Substitutos do alert)
  const [modalAvisoOpen, setModalAvisoOpen] = useState(false);
  const [modalSucessoOpen, setModalSucessoOpen] = useState(false);
  const [modalExcluidoSucessoOpen, setModalExcluidoSucessoOpen] =
    useState(false);

  useEffect(() => {
    const salvos = localStorage.getItem('mvp_produtos');
    if (salvos) {
      setProdutos(JSON.parse(salvos));
    }
  }, []);

  const salvarLocalStorage = (novosProdutos) => {
    localStorage.setItem('mvp_produtos', JSON.stringify(novosProdutos));
    setProdutos(novosProdutos);
  };

  const handleAbrirEditar = (produto) => {
    setEditId(produto.id);
    setEditNome(produto.nome);
    setEditPreco(produto.preco);
    setEditDescricao(produto.descricao || '');
    setEditGrandeza(produto.grandeza || 'unid.');
    setModalEditarOpen(true);
  };

  const handleSalvarEdicao = (e) => {
    e.preventDefault();
    if (!editNome.trim() || !editPreco) {
      setModalAvisoOpen(true);
      return;
    }

    const listaAtualizada = produtos.map((p) => {
      if (p.id === editId) {
        return {
          ...p,
          nome: editNome.trim(),
          preco: parseFloat(editPreco) || 0,
          descricao: editDescricao.trim(),
          grandeza: editGrandeza,
        };
      }
      return p;
    });

    salvarLocalStorage(listaAtualizada);
    setModalEditarOpen(false);
    setModalSucessoOpen(true);
  };

  const handleAbrirExcluir = (produto) => {
    setProdutoParaExcluir(produto);
    setModalExcluirOpen(true);
  };

  const confirmExcluir = () => {
    if (!produtoParaExcluir) return;
    const listaFiltrada = produtos.filter(
      (p) => p.id !== produtoParaExcluir.id
    );
    salvarLocalStorage(listaFiltrada);
    setModalExcluirOpen(false);
    setProdutoParaExcluir(null);
    setModalExcluidoSucessoOpen(true);
  };

  const produtosFiltradosEOrdenados = produtos
    .filter((p) => {
      const normalizar = (txt) =>
        txt
          ? txt
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toLowerCase()
          : '';

      const termo = normalizar(pesquisa);
      const nomeNormalizado = normalizar(p.nome);
      const descricaoNormalizada = normalizar(p.descricao);

      return (
        nomeNormalizado.includes(termo) || descricaoNormalizada.includes(termo)
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
          placeholder='Pesquisar produto por nome ou descrição...'
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

      {/* TABELA DE PRODUTOS */}
      <div className='bg-custom-surface p-6 rounded-lg border border-custom-grid shadow-sm'>
        <h3 className='font-bold text-xl text-custom-main mb-4'>
          Produtos Atuais
        </h3>
        <div className='overflow-x-auto border border-custom-grid rounded-md shadow-sm bg-white'>
          <table className='w-full text-left border-collapse min-w-[750px]'>
            <thead>
              <tr className='bg-gray-50 border-b border-custom-grid text-sm font-bold text-custom-muted uppercase tracking-wider'>
                <th className='py-3 px-4'>Nome do Produto</th>
                <th className='py-3 px-4 w-44 text-left'>Preço Base</th>
                <th className='py-3 px-4'>Descrição / Detalhes</th>
                <th className='py-3 px-4 w-28 text-center'>Ações</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-custom-grid text-base capitalize'>
              {produtosFiltradosEOrdenados.map((p) => (
                <tr
                  key={p.id}
                  className='hover:bg-gray-50/70 transition-colors'
                >
                  <td className='py-3 px-4 font-semibold text-custom-main'>
                    {p.nome}{' '}
                    <span className='text-gray-400 font-normal text-xs lowercase ml-1'>
                      ({p.grandeza || 'unid.'})
                    </span>
                  </td>
                  <td className='py-3 px-4 font-bold text-brand-success text-left font-mono'>
                    R${' '}
                    {p.preco.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td
                    className='py-3 px-4 text-custom-muted lowercase text-sm max-w-xs truncate'
                    title={p.descricao}
                  >
                    {p.descricao || (
                      <span className='text-gray-300 italic'>
                        Sem descrição cadastrada
                      </span>
                    )}
                  </td>
                  <td className='py-3 px-4 text-center space-x-1'>
                    <button
                      onClick={() => handleAbrirEditar(p)}
                      className='p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors'
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleAbrirExcluir(p)}
                      className='p-1.5 text-brand-danger hover:bg-red-50 rounded transition-colors'
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {produtosFiltradosEOrdenados.length === 0 && (
                <tr>
                  <td
                    colSpan='4'
                    className='text-center py-6 text-custom-muted italic bg-gray-50'
                  >
                    Nenhum produto encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PARA EDIÇÃO DE PRODUTOS */}
      {modalEditarOpen &&
        createPortal(
          <div className='fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm'>
            <div className='bg-white rounded-lg shadow-xl border border-custom-grid max-w-2xl w-full overflow-hidden'>
              <div className='bg-gray-50 px-6 py-4 border-b border-custom-grid flex justify-between items-center'>
                <h3 className='text-lg font-bold text-custom-main'>
                  Editar Produto
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
                className='p-6 space-y-4 text-base'
              >
                <div>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Nome do Produto *
                  </label>
                  <input
                    type='text'
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none bg-white capitalize'
                  />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                      Preço Base (R$) *
                    </label>
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      value={editPreco}
                      onChange={(e) => setEditPreco(e.target.value)}
                      className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none font-semibold bg-white'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                      Grandeza *
                    </label>
                    <select
                      value={editGrandeza}
                      onChange={(e) => setEditGrandeza(e.target.value)}
                      className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none bg-white'
                    >
                      <option value='unid.'>Unidade (unid.)</option>
                      <option value='m²'>Metro Quadrado (m²)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
                    Descrição / Detalhes
                  </label>
                  <textarea
                    rows='2'
                    value={editDescricao}
                    onChange={(e) => setEditDescricao(e.target.value)}
                    className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none bg-white resize-none'
                  />
                </div>
                <div className='flex justify-end gap-3 pt-4 border-t border-custom-grid'>
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
        title='Excluir Produto'
        message={`Tem certeza que deseja excluir o produto "${produtoParaExcluir?.nome}"?`}
        onConfirm={confirmExcluir}
        onCancel={() => setModalExcluirOpen(false)}
        confirmText='Sim, excluir'
        cancelText='Não, manter'
      />

      {/* MODAL DE VALIDAÇÃO (AVISO) */}
      <Modal
        isOpen={modalAvisoOpen}
        title='Campos Obrigatórios'
        message='Por favor, certifique-se de que o nome e o preço do produto foram informados.'
        onConfirm={() => setModalAvisoOpen(false)}
        confirmText='Corrigir'
      />

      {/* MODAL DE SUCESSO DE EDIÇÃO */}
      <Modal
        isOpen={modalSucessoOpen}
        title='Sucesso!'
        message='O produto foi atualizado com sucesso.'
        onConfirm={() => setModalSucessoOpen(false)}
        confirmText='Entendido'
      />

      {/* MODAL DE SUCESSO AO EXCLUIR */}
      <Modal
        isOpen={modalExcluidoSucessoOpen}
        title='Produto Excluído!'
        message='O produto foi removido do sistema com sucesso.'
        onConfirm={() => setModalExcluidoSucessoOpen(false)}
        confirmText='Entendido'
      />
    </div>
  );
}
