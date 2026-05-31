import { useState } from 'react';
import { PackagePlus, Trash2 } from 'lucide-react';
import { sanitizeString } from '../utils/helpers';
import Modal from './Modal';

export default function CadastrarProduto() {
  const initialForm = {
    nome: '',
    descricao: '',
    preco: '',
  };

  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleLimpar = () => {
    setForm(initialForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nomeSanitizado = sanitizeString(form.nome);
    const precoNumerico = parseFloat(form.preco);

    if (isNaN(precoNumerico) || precoNumerico <= 0) {
      alert('Por favor, insira um preço válido maior que zero.');
      return;
    }

    const produtoSanitizado = {
      id: nomeSanitizado.replace(/\s+/g, '-'), // Gera um ID único baseado no nome limpo
      nome: nomeSanitizado,
      descricao: sanitizeString(form.descricao),
      preco: precoNumerico,
    };

    // Buscar lista atual no LocalStorage
    const produtosAtuais = JSON.parse(
      localStorage.getItem('mvp_produtos') || '[]'
    );

    // Verifica se já existe um produto com o mesmo nome
    const produtoDuplicado = produtosAtuais.find(
      (p) => p.nome === produtoSanitizado.nome
    );

    if (produtoDuplicado) {
      setPendingData({ lista: produtosAtuais, novoProduto: produtoSanitizado });
      setModalOpen(true);
    } else {
      salvarNoLocalStorage(produtosAtuais, produtoSanitizado);
    }
  };

  const salvarNoLocalStorage = (lista, novoProduto) => {
    // Filtra removendo o antigo caso seja sobrescrita
    const listaFiltrada = lista.filter((p) => p.id !== novoProduto.id);
    const novaLista = [...listaFiltrada, novoProduto];

    localStorage.setItem('mvp_produtos', JSON.stringify(novaLista));
    alert('Produto salvo com sucesso!');
    handleLimpar();
  };

  const confirmarSobrescrita = () => {
    if (pendingData) {
      salvarNoLocalStorage(pendingData.lista, pendingData.novoProduto);
    }
    setModalOpen(false);
    setPendingData(null);
  };

  return (
    <div className='max-w-xl mx-auto bg-brand-surface p-6 rounded-lg border border-brand-border shadow-sm mt-6'>
      <h2 className='text-xl font-bold text-brand-main mb-6 pb-2 border-b border-brand-border'>
        Cadastrar Novo Produto
      </h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className='block text-sm font-medium text-brand-muted mb-1'>
            Nome do Produto *
          </label>
          <input
            type='text'
            name='nome'
            required
            value={form.nome}
            onChange={handleChange}
            placeholder='Ex: Vidro Temperado 8mm'
            className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-brand-muted mb-1'>
            Descrição <span className='text-xs text-gray-400'>(Opcional)</span>
          </label>
          <textarea
            name='descricao'
            rows='3'
            value={form.descricao}
            onChange={handleChange}
            placeholder='Detalhes adicionais, dimensões padrão, marcas, etc.'
            className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm resize-none'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-brand-muted mb-1'>
            Preço Unitário (R$) *
          </label>
          <input
            type='number'
            name='preco'
            step='0.01'
            required
            value={form.preco}
            onChange={handleChange}
            placeholder='0.00'
            className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none focus:ring-1 focus:ring-brand-primary text-sm'
          />
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className='flex justify-end gap-3 pt-4 border-t border-brand-border'>
          <button
            type='button'
            onClick={handleLimpar}
            className='flex items-center gap-2 px-4 py-2 border border-brand-border rounded-md text-sm font-medium text-brand-muted hover:bg-gray-50 transition-colors'
          >
            <Trash2 size={16} />
            Limpar
          </button>
          <button
            type='submit'
            className='flex items-center gap-2 px-5 py-2 rounded-md text-sm font-medium btn-success transition-colors shadow-sm'
          >
            <PackagePlus size={16} />
            Salvar Produto
          </button>
        </div>
      </form>

      {/* POPUP DE AVISO DE PRODUTO DUPLICADO */}
      <Modal
        isOpen={modalOpen}
        title='Produto já cadastrado'
        message={`Já existe um produto com o nome "${form.nome.toLowerCase().trim()}" cadastrado no sistema.\n\nDeseja atualizar o preço e a descrição deste produto?`}
        onConfirm={confirmarSobrescrita}
        onCancel={() => {
          setModalOpen(false);
          setPendingData(null);
        }}
        confirmText='Sim, atualizar'
        cancelText='Não, cancelar'
      />
    </div>
  );
}
