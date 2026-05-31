import { useState, useEffect } from 'react';
import { Search, Package, Trash2 } from 'lucide-react';
import Modal from './Modal';

export default function ProdutosCadastrados() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [modalDeletarOpen, setModalDeletarOpen] = useState(false);
  const [produtoParaDeletar, setProdutoParaDeletar] = useState(null);

  const carregarProdutos = () => {
    const dados = JSON.parse(localStorage.getItem('mvp_produtos') || '[]');
    dados.sort((a, b) => a.nome.localeCompare(b.nome));
    setProdutos(dados);
  };

  useEffect(() => {
    carregarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter((produto) => {
    const termo = busca.toLowerCase().trim();
    return (
      produto.nome.includes(termo) ||
      (produto.descricao && produto.descricao.includes(termo))
    );
  });

  const handleGatilhoDeletar = (produto) => {
    setProdutoParaDeletar(produto);
    setModalDeletarOpen(true);
  };

  const confirmarExclusao = () => {
    if (produtoParaDeletar) {
      const novaLista = produtos.filter((p) => p.id !== produtoParaDeletar.id);
      localStorage.setItem('mvp_produtos', JSON.stringify(novaLista));
      carregarProdutos();
    }
    setModalDeletarOpen(false);
    setProdutoParaDeletar(null);
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
          placeholder='Buscar produto por nome ou descrição...'
          className='w-full pl-10 pr-4 py-2.5 border border-brand-border rounded-lg bg-brand-surface focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm shadow-sm'
        />
      </div>

      <p className='text-xs text-brand-muted mb-3 font-medium'>
        {produtosFiltrados.length}{' '}
        {produtosFiltrados.length === 1
          ? 'produto encontrado'
          : 'produtos encontrados'}
      </p>

      {produtosFiltrados.length === 0 ? (
        <div className='bg-brand-surface p-12 text-center rounded-lg border border-brand-border shadow-sm'>
          <p className='text-brand-muted text-sm'>
            Nenhum produto cadastrado ou encontrado com esse termo.
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {produtosFiltrados.map((produto) => (
            <div
              key={produto.id}
              className='bg-brand-surface p-5 rounded-lg border border-brand-border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group'
            >
              <div>
                <div className='flex items-start justify-between gap-4 mb-2'>
                  <h3 className='font-bold text-base text-brand-main capitalize tracking-tight line-clamp-2'>
                    {produto.nome}
                  </h3>
                  <div className='h-8 w-8 rounded-lg bg-gray-50 text-brand-muted flex items-center justify-center shrink-0'>
                    <Package size={16} />
                  </div>
                </div>

                <p className='text-xs text-brand-muted line-clamp-3 mb-4 min-h-[2rem] capitalize'>
                  {produto.descricao || (
                    <span className='text-gray-300 italic'>
                      Sem descrição informada
                    </span>
                  )}
                </p>
              </div>

              <div className='border-t border-brand-border pt-2 mt-2 flex items-center justify-between'>
                {/* Botão de Deletar Produto */}
                <button
                  type='button'
                  onClick={() => handleGatilhoDeletar(produto)}
                  className='p-1.5 text-gray-400 hover:text-brand-danger hover:bg-red-50 rounded-md transition-colors'
                  title='Excluir Produto'
                >
                  <Trash2 size={16} />
                </button>

                <div className='flex items-center text-brand-success font-bold text-lg'>
                  <span className='text-xs font-semibold mr-0.5'>R$</span>
                  {produto.preco.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POPUP DE CONFIRMAÇÃO DE EXCLUSÃO */}
      <Modal
        isOpen={modalDeletarOpen}
        title='Excluir Produto'
        message={`Atenção! Você está prestes a remover permanentemente o produto:\n"${produtoParaDeletar?.nome?.toUpperCase()}"\n\nEsta ação não poderá ser desfeita e ele deixará de constar nos seletores. Confirma?`}
        onConfirm={confirmarExclusao}
        onCancel={() => {
          setModalDeletarOpen(false);
          setProdutoParaDeletar(null);
        }}
        confirmText='Sim, excluir'
        cancelText='Não, cancelar'
      />
    </div>
  );
}
