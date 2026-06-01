import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';

export default function CadastrarProduto() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grandeza, setGrandeza] = useState('unid.');

  // Estado para gerenciar os modais de feedback (substitutos dos alerts)
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    title: '',
    message: '',
  });

  // Função auxiliar para abrir o modal de aviso ou sucesso
  const mostrarFeedback = (title, message) => {
    setFeedbackModal({
      isOpen: true,
      title,
      message,
    });
  };

  const handleCadastrar = (e) => {
    e.preventDefault();
    if (!nome.trim() || !preco) {
      mostrarFeedback(
        'Campos Obrigatórios',
        'Por favor, preencha o nome e o preço do produto.'
      );
      return;
    }

    // Busca os produtos atuais salvos no localStorage
    const salvos = localStorage.getItem('mvp_produtos');
    const produtosAtuais = salvos ? JSON.parse(salvos) : [];

    const novoProduto = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      preco: parseFloat(preco) || 0,
      descricao: descricao.trim(),
      grandeza: grandeza, // Guarda a seleção de Grandeza
    };

    const listaAtualizada = [...produtosAtuais, novoProduto];
    localStorage.setItem('mvp_produtos', JSON.stringify(listaAtualizada));

    // Limpa os campos do formulário
    setNome('');
    setPreco('');
    setDescricao('');
    setGrandeza('unid.');

    mostrarFeedback('Sucesso!', 'Produto cadastrado com sucesso!');
  };

  return (
    <div className='max-w-full w-full mx-auto mt-2 text-base font-sans'>
      <div className='bg-custom-surface p-6 rounded-lg border border-custom-grid shadow-sm'>
        <h2 className='font-bold text-xl text-custom-main mb-4 flex items-center gap-2'>
          <Plus size={20} /> Cadastrar Novo Produto
        </h2>
        <form
          onSubmit={handleCadastrar}
          className='grid grid-cols-1 md:grid-cols-12 gap-4 items-end'
        >
          <div className='md:col-span-4'>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Nome do Produto *
            </label>
            <input
              type='text'
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder='Ex: Mármore Carrara'
              className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base capitalize bg-white'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Preço Base (R$) *
            </label>
            <input
              type='number'
              step='0.01'
              min='0'
              value={preco}
              onChange={(e) => setPreco(e.target.value)}
              placeholder='0.00'
              className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base font-semibold bg-white'
            />
          </div>

          {/* NOVO SELETOR DE GRANDEZA REALOCADO */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Grandeza *
            </label>
            <select
              value={grandeza}
              onChange={(e) => setGrandeza(e.target.value)}
              className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base bg-white'
            >
              <option value='unid.'>Unidade (unid.)</option>
              <option value='m²'>Metro Quadrado (m²)</option>
            </select>
          </div>

          <div className='md:col-span-4'>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Descrição / Detalhes
            </label>
            <input
              type='text'
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder='Ex: Acabamento bisotado, espessura 2cm'
              className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base bg-white'
            />
          </div>

          <div className='md:col-span-12 flex justify-end mt-2'>
            <button
              type='submit'
              className='btn-primary px-6 py-2 rounded-md font-semibold text-base shadow-sm'
            >
              Salvar Produto
            </button>
          </div>
        </form>
      </div>

      {/* MODAL DE RETORNO / FEEDBACK (AVISOS E SUCESSO) */}
      <Modal
        isOpen={feedbackModal.isOpen}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onConfirm={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
        confirmText='Entendido'
      />
    </div>
  );
}
