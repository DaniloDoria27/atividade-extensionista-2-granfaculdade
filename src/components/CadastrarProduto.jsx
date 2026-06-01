import { useState } from 'react';
import { Plus } from 'lucide-react';
import Modal from './Modal';

export default function CadastrarProduto() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [grandeza, setGrandeza] = useState('unid.');

  // Estado expandido para gerenciar feedback e confirmações de substituição
  const [feedbackModal, setFeedbackModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ok',
    onConfirm: () => {},
    showCancel: false,
    cancelText: 'Cancelar',
    onCancel: () => {},
  });

  // Função auxiliar para abrir o modal genérico
  const mostrarFeedback = (title, message, options = {}) => {
    setFeedbackModal({
      isOpen: true,
      title,
      message,
      confirmText: options.confirmText || 'Ok',
      onConfirm:
        options.onConfirm ||
        (() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))),
      showCancel: options.showCancel || false,
      cancelText: options.cancelText || 'Cancelar',
      onCancel:
        options.onCancel ||
        (() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))),
    });
  };

  // Função auxiliar para normalizar o texto (remover acentos e colocar em minúsculo)
  const normalizarTexto = (texto) => {
    return texto
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Remove marcas de acentuação
  };

  // Executa o salvamento real do produto (seja novo ou substituição)
  const salvarNoLocalStorage = (
    produtosAtuais,
    produtoParaSalvar,
    isSubstituicao = false
  ) => {
    let listaAtualizada;

    if (isSubstituicao) {
      // Substitui o produto existente mantendo o ID original ou atualizando os dados na mesma posição
      listaAtualizada = produtosAtuais.map((prod) =>
        normalizarTexto(prod.nome) === normalizarTexto(produtoParaSalvar.nome)
          ? {
              ...prod,
              preco: produtoParaSalvar.preco,
              descricao: produtoParaSalvar.descricao,
              grandeza: produtoParaSalvar.grandeza,
            }
          : prod
      );
    } else {
      // Adiciona como novo produto
      listaAtualizada = [...produtosAtuais, produtoParaSalvar];
    }

    localStorage.setItem('mvp_produtos', JSON.stringify(listaAtualizada));

    // Limpa os campos do formulário
    setNome('');
    setPreco('');
    setDescricao('');
    setGrandeza('unid.');

    // Fecha o modal atual e mostra o sucesso
    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
    setTimeout(() => {
      mostrarFeedback('Sucesso!', 'Produto salvo com sucesso!');
    }, 100);
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

    const salvos = localStorage.getItem('mvp_produtos');
    const produtosAtuais = salvos ? JSON.parse(salvos) : [];

    const nomeNormalizadoNovo = normalizarTexto(nome);

    // Verifica se já existe um produto com o mesmo nome (ignorando caixa e acentos)
    const produtoExistente = produtosAtuais.find(
      (prod) => normalizarTexto(prod.nome) === nomeNormalizadoNovo
    );

    const dadosProduto = {
      id: crypto.randomUUID(),
      nome: nome.trim(),
      preco: parseFloat(preco) || 0,
      descricao: descricao.trim(),
      grandeza: grandeza,
    };

    if (produtoExistente) {
      // Se já existe, abre o modal perguntando se deseja substituir
      mostrarFeedback(
        'Produto Já Cadastrado',
        `Já existe um produto cadastrado como "${produtoExistente.nome}". Deseja substituir os dados existentes por estes novos?`,
        {
          confirmText: 'Sim, substituir',
          showCancel: true,
          cancelText: 'Cancelar',
          onConfirm: () =>
            salvarNoLocalStorage(produtosAtuais, dadosProduto, true),
          onCancel: () =>
            setFeedbackModal((prev) => ({ ...prev, isOpen: false })),
        }
      );
    } else {
      // Se não existe duplicidade, salva direto
      salvarNoLocalStorage(produtosAtuais, dadosProduto, false);
    }
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
              <option value='m'>Metro (m)</option>
              <option value='cm'>Centímetro (cm)</option>
              <option value='mm'>Milímetro (mm)</option>
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

      {/* MODAL DE RETORNO / FEEDBACK REAPROVEITADO COM PARÂMETROS DINÂMICOS */}
      <Modal
        isOpen={feedbackModal.isOpen}
        title={feedbackModal.title}
        message={feedbackModal.message}
        onConfirm={feedbackModal.onConfirm}
        confirmText={feedbackModal.confirmText}
        onCancel={feedbackModal.showCancel ? feedbackModal.onCancel : undefined}
        cancelText={
          feedbackModal.showCancel ? feedbackModal.cancelText : undefined
        }
      />
    </div>
  );
}
