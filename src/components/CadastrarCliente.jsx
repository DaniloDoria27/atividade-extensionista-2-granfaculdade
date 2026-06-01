import { useState } from 'react';
import { Save, Trash2 } from 'lucide-react';
import {
  sanitizeString,
  formatCpfCnpj,
  formatPhone,
  formatCep,
  isValidEmail,
} from '../utils/helpers';
import Modal from './Modal';
import { isValidDocument } from '../utils/helpers';

export default function CadastrarCliente() {
  const initialForm = {
    nome: '',
    tipoDoc: 'CPF', // 'CPF' ou 'CNPJ'
    documento: '',
    contato1: '',
    contato2: '',
    contato3: '',
    email: '',
    logradouro: '',
    numero: '',
    cep: '',
    bairro: '',
    complemento: '',
  };

  const [form, setForm] = useState(initialForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  // Manipulador de mudanças aplicando as máscaras em tempo real
  const handleChange = (e) => {
    const { name, value } = e.target;
    let maskedValue = value;

    if (name === 'documento') {
      maskedValue = formatCpfCnpj(value);
    } else if (['contato1', 'contato2', 'contato3'].includes(name)) {
      maskedValue = formatPhone(value);
    } else if (name === 'cep') {
      maskedValue = formatCep(value);
    }

    setForm({ ...form, [name]: maskedValue });
  };

  // Reseta o tipo de documento e limpa o campo ao alternar Radio Buttons
  const handleTipoDocChange = (tipo) => {
    setForm({ ...form, tipoDoc: tipo, documento: '' });
  };

  const handleLimpar = () => {
    setForm(initialForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Verificador de E-mail
    if (form.email && !isValidEmail(form.email)) {
      alert(
        "Por favor, digite um e-mail válido contendo '@' (Exemplo: cliente@email.com)."
      );
      return;
    }

    // Validador Matemático de CPF/CNPJ
    if (!form.documento) {
      alert('Por favor, preencha o campo de documento (CPF ou CNPJ).');
      return;
    }

    const documentoValido = isValidDocument(form.documento, form.tipoDoc);

    if (!documentoValido) {
      alert(
        `O ${form.tipoDoc} digitado é inválido! Por favor, confira os números.`
      );
      return;
    }

    const numeroTratado =
      form.numero.trim() === '' ? 'S/N' : form.numero.trim();

    const clienteSanitizado = {
      nome: sanitizeString(form.nome),
      tipoDoc: form.tipoDoc,
      documento: form.documento.replace(/\D/g, ''),
      documentoFormatado: form.documento,
      contato1: form.contato1,
      contato2: form.contato2 || '',
      contato3: form.contato3 || '',
      email: sanitizeString(form.email),
      logradouro: sanitizeString(form.logradouro),
      numero: sanitizeString(numeroTratado),
      cep: form.cep,
      bairro: sanitizeString(form.bairro),
      complemento: sanitizeString(form.complemento),
      id: form.documento.replace(/\D/g, '') || crypto.randomUUID(),
    };

    const clientesAtuais = JSON.parse(
      localStorage.getItem('mvp_clientes') || '[]'
    );

    const clienteDuplicado = clientesAtuais.find(
      (c) =>
        (c.documento === clienteSanitizado.documento && c.documento !== '') ||
        c.nome === clienteSanitizado.nome
    );

    if (clienteDuplicado) {
      setPendingData({ lista: clientesAtuais, novoCliente: clienteSanitizado });
      setModalOpen(true);
    } else {
      salvarNoLocalStorage(clientesAtuais, clienteSanitizado);
    }
  };

  const salvarNoLocalStorage = (lista, novoCliente) => {
    const listaFiltrada = lista.filter(
      (c) => c.id !== novoCliente.id && c.nome !== novoCliente.nome
    );
    const novaLista = [...listaFiltrada, novoCliente];
    localStorage.setItem('mvp_clientes', JSON.stringify(novaLista));
    alert('Cliente salvo com sucesso!');
    handleLimpar();
  };

  const confirmarSobrescrita = () => {
    if (pendingData) {
      salvarNoLocalStorage(pendingData.lista, pendingData.novoCliente);
    }
    setModalOpen(false);
    setPendingData(null);
  };

  return (
    /* max-w-7xl expande para a largura ideal da sua barra de navegação superior */
    <div className='max-w-7xl w-full mx-auto bg-brand-surface p-8 rounded-lg border border-brand-border shadow-sm mt-4'>
      <h2 className='text-2xl font-bold text-brand-main mb-6 pb-3 border-b border-brand-border'>
        Cadastrar Novo Cliente
      </h2>

      <form onSubmit={handleSubmit} className='space-y-6'>
        {/* SEÇÃO: INFORMAÇÕES PESSOAIS */}
        <div>
          <h3 className='text-sm font-bold text-brand-primary uppercase tracking-wider mb-4'>
            Informações Pessoais
          </h3>

          {/* Distribuído em até 12 colunas para controle cirúrgico do espaço */}
          <div className='grid grid-cols-1 md:grid-cols-12 gap-5'>
            <div className='md:col-span-6'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Nome completo *
              </label>
              <input
                type='text'
                name='nome'
                required
                value={form.nome}
                onChange={handleChange}
                placeholder='Ex: João Silva Almeida'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-base font-bold text-brand-muted mb-2 uppercase'>
                Tipo Doc. *
              </label>
              <div className='flex gap-4 items-center h-10'>
                <label className='flex items-center gap-2 text-base font-semibold text-brand-main cursor-pointer'>
                  <input
                    type='radio'
                    name='tipoDoc'
                    checked={form.tipoDoc === 'CPF'}
                    onChange={() => handleTipoDocChange('CPF')}
                    className='h-4 w-4 text-brand-primary focus:ring-brand-primary'
                  />
                  CPF
                </label>
                <label className='flex items-center gap-2 text-base font-semibold text-brand-main cursor-pointer'>
                  <input
                    type='radio'
                    name='tipoDoc'
                    checked={form.tipoDoc === 'CNPJ'}
                    onChange={() => handleTipoDocChange('CNPJ')}
                    className='h-4 w-4 text-brand-primary focus:ring-brand-primary'
                  />
                  CNPJ
                </label>
              </div>
            </div>

            <div className='md:col-span-4'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Nº {form.tipoDoc} *
              </label>
              <input
                type='text'
                name='documento'
                required
                value={form.documento}
                maxLength={form.tipoDoc === 'CPF' ? 14 : 18}
                onChange={handleChange}
                placeholder={
                  form.tipoDoc === 'CPF'
                    ? '000.000.000-00'
                    : '00.000.000/0000-00'
                }
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-3'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Contato 1 *
              </label>
              <input
                type='text'
                name='contato1'
                required
                value={form.contato1}
                maxLength={15}
                onChange={handleChange}
                placeholder='(99) 99999-9999'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-3'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Contato 2{' '}
                <span className='text-xs text-gray-400 font-normal'>
                  (Opcional)
                </span>
              </label>
              <input
                type='text'
                name='contato2'
                value={form.contato2}
                maxLength={15}
                onChange={handleChange}
                placeholder='(99) 99999-9999'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-3'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Contato 3{' '}
                <span className='text-xs text-gray-400 font-normal'>
                  (Opcional)
                </span>
              </label>
              <input
                type='text'
                name='contato3'
                value={form.contato3}
                maxLength={15}
                onChange={handleChange}
                placeholder='(99) 99999-9999'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-3'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                E-mail{' '}
                <span className='text-xs text-gray-400 font-normal'>
                  (Opcional)
                </span>
              </label>
              <input
                type='text'
                name='email'
                value={form.email}
                onChange={handleChange}
                placeholder='cliente@email.com'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>
          </div>
        </div>

        {/* SEÇÃO: ENDEREÇO */}
        <div className='pt-6 border-t border-brand-border'>
          <h3 className='text-sm font-bold text-brand-primary uppercase tracking-wider mb-4'>
            Endereço
          </h3>

          {/* Alinhamento horizontal do Endereço em uma única linha no desktop */}
          <div className='grid grid-cols-1 md:grid-cols-12 gap-5'>
            <div className='md:col-span-4'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Logradouro *
              </label>
              <input
                type='text'
                name='logradouro'
                required
                value={form.logradouro}
                onChange={handleChange}
                placeholder='Rua, Avenida, Logradouro...'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Número
              </label>
              <input
                type='text'
                name='numero'
                value={form.numero}
                onChange={handleChange}
                placeholder='Ex: 123'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                CEP{' '}
                <span className='text-xs text-gray-400 font-normal'>
                  (Opcional)
                </span>
              </label>
              <input
                type='text'
                name='cep'
                value={form.cep}
                maxLength={9}
                onChange={handleChange}
                placeholder='00000-000'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Bairro *
              </label>
              <input
                type='text'
                name='bairro'
                required
                value={form.bairro}
                onChange={handleChange}
                placeholder='Bairro'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>

            <div className='md:col-span-2'>
              <label className='block text-base font-bold text-brand-muted mb-1.5 uppercase'>
                Complemento
              </label>
              <input
                type='text'
                name='complemento'
                value={form.complemento}
                onChange={handleChange}
                placeholder='Apto, Bloco...'
                className='w-full px-3 py-2 border border-brand-border rounded-md focus:outline-none text-base bg-white'
              />
            </div>
          </div>
        </div>

        {/* BOTÕES DE AÇÃO */}
        <div className='flex justify-end gap-4 pt-6 border-t border-brand-border'>
          <button
            type='button'
            onClick={handleLimpar}
            className='flex items-center gap-2 px-5 py-2.5 border border-brand-border rounded-md text-base font-bold text-brand-muted hover:bg-gray-50 transition-colors'
          >
            <Trash2 size={18} />
            Limpar Cadastro
          </button>
          <button
            type='submit'
            className='flex items-center gap-2 px-6 py-2.5 rounded-md text-base font-bold btn-success transition-colors shadow-sm'
          >
            <Save size={18} />
            Salvar Cliente
          </button>
        </div>
      </form>

      {/* MODAL DE CONFIRMAÇÃO DE DUPLICIDADE */}
      <Modal
        isOpen={modalOpen}
        title='Cliente já cadastrado'
        message={`Já existe um cliente cadastrado com este Nome ou Documento no sistema.\n\nDeseja realmente atualizar/sobrescrever os dados deste cliente?`}
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
