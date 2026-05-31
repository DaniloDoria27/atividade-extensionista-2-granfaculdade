import { useState, useEffect } from 'react';
import { Trash2, Printer } from 'lucide-react';
import { calculateArea, calculateItemTotal } from '../utils/helpers';
import Modal from './Modal';
import logoEmpresa from '../img/logo.png';

const DADOS_EMPRESA = {
  nome: 'RQL - Depósito e Marmoraria ',
  celular: '(99) 99999-9999',
  email: 'depositoemarmorariarql@outlook.com',
  logotipoUrl: logoEmpresa,
  cnpj: '41.505.286/0001-44',
  insc: '12.691.971-2',
  endereco: 'Av. dos Africanos, 50 - Areinha - São Luís/MA - CEP: 65032-075',
};

export default function NovoOrcamento() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modalLimparOpen, setModalLimparOpen] = useState(false);

  // Estados locais para controlar se o usuário quer digitar algo personalizado
  const [customPagamento, setCustomPagamento] = useState('');
  const [customParcelamento, setCustomParcelamento] = useState('');

  const [orcamento, setOrcamento] = useState(() => {
    const salvo = localStorage.getItem('mvp_orcamento_corrente');
    if (salvo) return JSON.parse(salvo);

    return {
      clienteId: '',
      data: new Date().toISOString().split('T')[0],
      vencimento: '',
      prazoEntrega: '',
      tipoPagamento: 'Pix',
      parcelamento: 'À vista',
      descontoReais: 0,
      acrescimoReais: 0,
      observacoes: '',
      itens: [
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
      ],
    };
  });

  useEffect(() => {
    setClientes(JSON.parse(localStorage.getItem('mvp_clientes') || '[]'));
    setProdutos(JSON.parse(localStorage.getItem('mvp_produtos') || '[]'));
  }, []);

  // // Validação Cirúrgica de Data de Vencimento retroativa
  // useEffect(() => {
  //   if (orcamento.vencimento && orcamento.vencimento < orcamento.data) {
  //     alert(
  //       'A data de vencimento não pode ser anterior à data de emissão do orçamento!'
  //     );
  //     setOrcamento((prev) => ({ ...prev, vencimento: '' }));
  //   }
  // }, [orcamento.vencimento, orcamento.data]);

  useEffect(() => {
    localStorage.setItem('mvp_orcamento_corrente', JSON.stringify(orcamento));
  }, [orcamento]);

  const handleMetaChange = (e) => {
    const { name, value } = e.target;

    // Validação imediata e segura ao selecionar a data no calendário
    if (name === 'vencimento' && value) {
      if (value < orcamento.data) {
        alert(
          'A data de vencimento não pode ser anterior à data de emissão do orçamento!'
        );
        setOrcamento((prev) => ({ ...prev, vencimento: '' }));
        return; // Aborta a atualização do estado com a data retroativa
      }
    }

    setOrcamento((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setOrcamento((prev) => {
      const novosItens = prev.itens.map((item) => {
        if (item.id !== id) return item;
        let updatedItem = { ...item, [field]: value };
        if (field === 'produtoId') {
          const prodCadastrado = produtos.find((p) => p.id === value);
          updatedItem.precoUnitario = prodCadastrado ? prodCadastrado.preco : 0;
        }
        return updatedItem;
      });
      return { ...prev, itens: novosItens };
    });
  };

  // const handleVencimentoBlur = () => {
  //   // Só valida se o campo de vencimento estiver totalmente preenchido
  //   if (orcamento.vencimento) {
  //     // Verifica se a string da data tem o tamanho completo de um input date (YYYY-MM-DD = 10 caracteres)
  //     if (
  //       orcamento.vencimento.length === 10 &&
  //       orcamento.vencimento < orcamento.data
  //     ) {
  //       alert(
  //         'A data de vencimento não pode ser anterior à data de emissão do orçamento!'
  //       );
  //       setOrcamento((prev) => ({ ...prev, vencimento: '' }));
  //     }
  //   }
  // };

  const adicionarLinha = () => {
    setOrcamento((prev) => ({
      ...prev,
      itens: [
        ...prev.itens,
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
      ],
    }));
  };

  const removerLinha = (id) => {
    if (orcamento.itens.length <= 1) {
      alert('O orçamento deve conter pelo menos 1 item.');
      return;
    }
    setOrcamento((prev) => ({
      ...prev,
      itens: prev.itens.filter((item) => item.id !== id),
    }));
  };

  const handleLimparOrcamento = () => {
    setOrcamento({
      clienteId: '',
      data: new Date().toISOString().split('T')[0],
      vencimento: '',
      prazoEntrega: '',
      tipoPagamento: 'Pix',
      parcelamento: 'À vista',
      descontoReais: 0,
      acrescimoReais: 0,
      observacoes: '',
      itens: [
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          precoUnitario: 0,
        },
      ],
    });
    setCustomPagamento('');
    setCustomParcelamento('');
    setModalLimparOpen(false);
  };

  const clienteSelecionado = clientes.find((c) => c.id === orcamento.clienteId);

  const subtotalGeral = orcamento.itens.reduce((acc, item) => {
    return (
      acc +
      calculateItemTotal(
        item.quantidade,
        item.precoUnitario,
        item.largura,
        item.altura
      )
    );
  }, 0);

  const valorDesconto = parseFloat(orcamento.descontoReais) || 0;
  const valorAcrescimo = parseFloat(orcamento.acrescimoReais) || 0;
  const totalComModificadores = Math.max(
    0,
    subtotalGeral - valorDesconto + valorAcrescimo
  );

  const porcentagemDesconto =
    subtotalGeral > 0 ? ((valorDesconto / subtotalGeral) * 100).toFixed(1) : 0;
  const porcentagemAcrescimo =
    subtotalGeral > 0 ? ((valorAcrescimo / subtotalGeral) * 100).toFixed(1) : 0;

  const handleExportarPDF = () => {
    if (!orcamento.clienteId) {
      alert(
        'Por favor, selecione um cliente antes de gerar o PDF do orçamento.'
      );
      return;
    }
    window.print();
  };

  // Define os textos finais que vão sair no espelho do PDF
  const formaPagamentoFinal =
    orcamento.tipoPagamento === 'Outro'
      ? customPagamento
      : orcamento.tipoPagamento;
  const parcelamentoFinal =
    orcamento.parcelamento === 'Outro'
      ? customParcelamento
      : orcamento.parcelamento;

  return (
    <div className='max-w-6xl mx-auto mt-2 space-y-4 last:pb-12'>
      {/* CABEÇALHO */}
      <div className='bg-custom-surface p-5 rounded-lg border border-custom-grid shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 items-center print:hidden'>
        <div className='flex items-center gap-4'>
          <div className='h-20 w-20 rounded-lg flex items-center justify-center   '>
            <img
              src={DADOS_EMPRESA.logotipoUrl}
              alt='Logo Empresa'
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              className='object-contain max-h-full max-w-full'
            />
          </div>
          <div>
            <h2 className='font-bold text-base text-custom-main'>
              {DADOS_EMPRESA.nome}
            </h2>
            <p className='text-xs text-custom-muted'>
              Celular: {DADOS_EMPRESA.celular} | E-mail: {DADOS_EMPRESA.email}
            </p>
            <p className='text-xs text-custom-muted'>
              Endereço: {DADOS_EMPRESA.endereco}
            </p>
            <p className='text-xs text-custom-muted'>
              CNPJ: {DADOS_EMPRESA.cnpj} | Insc. Est.: {DADOS_EMPRESA.insc}
            </p>
          </div>
        </div>
        <div className='flex md:justify-end gap-2'>
          <button
            type='button'
            onClick={() => setModalLimparOpen(true)}
            className='flex items-center gap-1.5 px-3 py-1.5 border border-custom-grid text-brand-danger bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium transition-colors'
          >
            <Trash2 size={16} /> Apagar Orçamento
          </button>
          <button
            type='button'
            onClick={handleExportarPDF}
            className='flex items-center gap-1.5 px-4 py-1.5 btn-primary rounded-md text-sm font-medium transition-colors shadow-sm'
          >
            <Printer size={16} /> Gerar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* METADADOS PRINCIPAIS */}
      <div className='bg-custom-surface p-5 rounded-lg border border-custom-grid shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 print:hidden'>
        <div className='md:col-span-2'>
          <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
            Selecionar Cliente *
          </label>
          <select
            name='clienteId'
            value={orcamento.clienteId}
            onChange={handleMetaChange}
            className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm bg-white capitalize'
          >
            <option value=''>-- Escolha um Cliente --</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
            Data Emissão *
          </label>
          <input
            type='date'
            name='data'
            value={orcamento.data}
            onChange={handleMetaChange}
            className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm'
          />
        </div>

        <div>
          <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
            Venc. do Orçamento
          </label>
          <input
            type='date'
            name='vencimento'
            value={orcamento.vencimento}
            onChange={handleMetaChange}
            onKeyDown={(e) => e.preventDefault()} // <--- Bloqueia o teclado perfeitamente
            className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm cursor-pointer'
          />
        </div>

        <div>
          <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
            Prazo Entrega
          </label>
          <input
            type='text'
            name='prazoEntrega'
            value={orcamento.prazoEntrega}
            onChange={handleMetaChange}
            placeholder='Ex: 5 dias úteis'
            className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm'
          />
        </div>

        {/* FORMA DE PAGAMENTO MELHORADA */}
        <div>
          <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
            Forma Pagamento
          </label>
          <select
            name='tipoPagamento'
            value={orcamento.tipoPagamento}
            onChange={handleMetaChange}
            className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm bg-white'
          >
            <option value='Pix'>Pix</option>
            <option value='Dinheiro / Espécie'>Dinheiro / Espécie</option>
            <option value='Crédito'>Crédito</option>
            <option value='Débito'>Débito</option>
            <option value='Outro'>Outro (Digitar)</option>
          </select>
          {orcamento.tipoPagamento === 'Outro' && (
            <input
              type='text'
              value={customPagamento}
              onChange={(e) => setCustomPagamento(e.target.value)}
              placeholder='Qual forma?'
              className='w-full mt-1.5 px-2 py-1 border border-custom-grid rounded text-sm focus:outline-none'
            />
          )}
        </div>

        {/* PARCELAMENTO MELHORADO */}
        <div>
          <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
            Parcelamento
          </label>
          <select
            name='parcelamento'
            value={orcamento.parcelamento}
            onChange={handleMetaChange}
            className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm bg-white'
          >
            <option value='À vista'>À vista</option>
            {[...Array(11)].map((_, i) => (
              <option key={i + 2} value={`${i + 2}x`}>
                {i + 2}x
              </option>
            ))}
            <option value='Outro'>Outro (Digitar)</option>
          </select>
          {orcamento.parcelamento === 'Outro' && (
            <input
              type='text'
              value={customParcelamento}
              onChange={(e) => setCustomParcelamento(e.target.value)}
              placeholder='Ex: 24x boleto'
              className='w-full mt-1.5 px-2 py-1 border border-custom-grid rounded text-sm focus:outline-none'
            />
          )}
        </div>
      </div>

      {/* INFO CLIENTE */}
      {clienteSelecionado && (
        <div className='bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-custom-main space-y-0.5 print:hidden capitalize'>
          <p>
            <strong>Contato:</strong> {clienteSelecionado.contato1}{' '}
            {clienteSelecionado.email && (
              <>
                | <strong>E-mail:</strong>{' '}
                <span className='lowercase font-normal'>
                  {clienteSelecionado.email}
                </span>
              </>
            )}
          </p>
          <p>
            <strong>Endereço:</strong> {clienteSelecionado.logradouro}, Nº{' '}
            {clienteSelecionado.numero} - Bairro: {clienteSelecionado.bairro}
          </p>
        </div>
      )}

      {/* TABELA DE ITENS */}
      <div className='bg-custom-surface rounded-lg border border-custom-grid shadow-sm overflow-x-auto print:hidden'>
        <table className='w-full text-left border-collapse min-w-[800px]'>
          <thead>
            <tr className='bg-gray-50 border-b border-custom-grid text-xs font-semibold text-custom-muted uppercase tracking-wider'>
              <th className='py-2.5 px-3 w-12 text-center'>Item</th>
              <th className='py-2.5 px-2 w-64'>Produto *</th>
              <th className='py-2.5 px-2 w-20'>Qtd *</th>
              <th className='py-2.5 px-2 w-20'>Larg (m)</th>
              <th className='py-2.5 px-2 w-20'>Comp (m)</th>
              <th className='py-2.5 px-2 w-24 text-center'>Área (m²)</th>
              <th className='py-2.5 px-2 w-28 text-center'>Preço Unit.</th>
              <th className='py-2.5 px-2 w-32 text-center'>Total Item</th>
              <th className='py-2.5 px-3 w-12 text-center'></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-custom-grid text-sm'>
            {orcamento.itens.map((item, index) => {
              const area = calculateArea(item.largura, item.altura);
              const totalItem = calculateItemTotal(
                item.quantidade,
                item.precoUnitario,
                item.largura,
                item.altura
              );

              return (
                <tr
                  key={item.id}
                  className='hover:bg-gray-50/70 transition-colors'
                >
                  <td className='py-2 px-3 text-center font-medium text-custom-muted'>
                    {index + 1}
                  </td>
                  <td className='py-1 px-2'>
                    <select
                      value={item.produtoId}
                      onChange={(e) =>
                        handleItemChange(item.id, 'produtoId', e.target.value)
                      }
                      className='w-full px-2 py-1 border border-custom-grid rounded focus:outline-none text-sm bg-white capitalize'
                    >
                      <option value=''>-- Escolha --</option>
                      {produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className='py-1 px-2'>
                    <input
                      type='number'
                      min='1'
                      value={item.quantidade}
                      onChange={(e) =>
                        handleItemChange(
                          item.id,
                          'quantidade',
                          parseInt(e.target.value) || 0
                        )
                      }
                      className='w-full px-2 py-1 border border-custom-grid rounded focus:outline-none text-sm'
                    />
                  </td>
                  <td className='py-1 px-2'>
                    <input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      value={item.largura}
                      onChange={(e) =>
                        handleItemChange(item.id, 'largura', e.target.value)
                      }
                      className='w-full px-2 py-1 border border-custom-grid rounded focus:outline-none text-sm'
                    />
                  </td>
                  <td className='py-1 px-2'>
                    <input
                      type='number'
                      step='0.01'
                      placeholder='0.00'
                      value={item.altura}
                      onChange={(e) =>
                        handleItemChange(item.id, 'altura', e.target.value)
                      }
                      className='w-full px-2 py-1 border border-custom-grid rounded focus:outline-none text-sm'
                    />
                  </td>
                  <td className='py-1 px-2 text-center font-medium text-custom-muted'>
                    {area ? (
                      `${area} m²`
                    ) : (
                      <span className='text-gray-300'>-</span>
                    )}
                  </td>
                  <td className='py-1 px-2'>
                    <div className='relative min-w-[100px]'>
                      <span className='absolute inset-y-0 left-0 pl-2 flex items-center text-xs font-semibold text-custom-muted'>
                        R$
                      </span>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        placeholder='0.00'
                        value={item.precoUnitario || ''}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'precoUnitario',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className='w-full pl-7 pr-1 py-1 border border-custom-grid rounded focus:outline-none text-sm font-medium text-center'
                      />
                    </div>
                  </td>
                  <td className='py-1 px-2 text-center font-bold text-custom-main'>
                    R${' '}
                    {totalItem.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className='py-1 px-3 text-center'>
                    <button
                      type='button'
                      onClick={() => removerLinha(item.id)}
                      className='p-1 text-gray-400 hover:text-brand-danger rounded transition-colors'
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className='p-2 bg-gray-50 border-t border-custom-grid'>
          <button
            type='button'
            onClick={adicionarLinha}
            className='text-xs font-bold text-brand-primary uppercase tracking-wider bg-white px-2.5 py-1 border border-custom-grid rounded shadow-sm transition-colors'
          >
            + Adicionar Linha
          </button>
        </div>
      </div>

      {/* DESCONTO, ACRÉSCIMO E OBSERVAÇÕES */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 print:hidden'>
        <div className='bg-custom-surface p-4 rounded-lg border border-custom-grid shadow-sm space-y-3'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
                Conceder Desconto (R$)
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-2.5 flex items-center text-sm font-semibold text-custom-muted'>
                  R$
                </span>
                <input
                  type='number'
                  step='0.01'
                  value={orcamento.descontoReais}
                  onChange={(e) =>
                    setOrcamento((prev) => ({
                      ...prev,
                      descontoReais: e.target.value,
                    }))
                  }
                  placeholder='0.00'
                  className='w-full pl-8 pr-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm font-medium'
                />
              </div>
              {valorDesconto > 0 && (
                <p className='text-[11px] text-brand-success font-semibold mt-0.5'>
                  Abatimento de {porcentagemDesconto}%
                </p>
              )}
            </div>

            <div>
              <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
                Adicionar Acréscimo/Taxa (R$)
              </label>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-2.5 flex items-center text-sm font-semibold text-custom-muted'>
                  R$
                </span>
                <input
                  type='number'
                  step='0.01'
                  value={orcamento.acrescimoReais}
                  onChange={(e) =>
                    setOrcamento((prev) => ({
                      ...prev,
                      acrescimoReais: e.target.value,
                    }))
                  }
                  placeholder='0.00'
                  className='w-full pl-8 pr-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm font-medium'
                />
              </div>
              {valorAcrescimo > 0 && (
                <p className='text-[11px] text-brand-danger font-semibold mt-0.5'>
                  Acréscimo de {porcentagemAcrescimo}%
                </p>
              )}
            </div>
          </div>

          <div>
            <label className='block text-xs font-semibold text-custom-muted uppercase mb-1'>
              Observações do Orçamento{' '}
              <span className='text-[10px] text-gray-400'>(Opcional)</span>
            </label>
            <textarea
              name='observacoes'
              rows='2'
              value={orcamento.observacoes}
              onChange={handleMetaChange}
              placeholder='Ex: Informações adicionais sobre entrega, garantia ou dados bancários...'
              className='w-full px-2 py-1.5 border border-custom-grid rounded-md focus:outline-none text-sm resize-none'
            />
          </div>
        </div>

        <div className='bg-custom-surface p-4 rounded-lg border border-custom-grid shadow-sm space-y-2 text-sm justify-between flex flex-col'>
          <div className='space-y-1.5'>
            <div className='flex justify-between text-custom-muted'>
              <span>Subtotal Bruto:</span>
              <span className='font-semibold'>
                R${' '}
                {subtotalGeral.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {valorDesconto > 0 && (
              <div className='flex justify-between text-brand-danger'>
                <span>Desconto Aplicado:</span>
                <span className='font-semibold'>
                  - R${' '}
                  {valorDesconto.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {valorAcrescimo > 0 && (
              <div className='flex justify-between text-brand-main'>
                <span>Acréscimo Adicionado:</span>
                <span className='font-semibold'>
                  + R${' '}
                  {valorAcrescimo.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
          <div className='flex justify-between text-base font-bold text-custom-main pt-2 border-t border-custom-grid items-end'>
            <span>TOTAL LÍQUIDO:</span>
            <span className='text-xl text-brand-success'>
              R${' '}
              {totalComModificadores.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* ESPELHO DO PDF */}
      <div className='hidden print:block w-full text-black font-sans text-xs p-2 capitalize'>
        <div className='border-b-2 border-black pb-2 mb-4 flex justify-between items-end'>
          <div>
            <h1 className='text-lg font-bold uppercase tracking-tight'>
              {DADOS_EMPRESA.nome}
            </h1>
            <p className='text-custom-muted print:text-black'>
              <strong>Contato Celular:</strong> {DADOS_EMPRESA.celular} |{' '}
              <strong>E-mail:</strong>{' '}
              <span className='lowercase font-normal'>
                {DADOS_EMPRESA.email}
              </span>
            </p>
            <p className='text-custom-muted print:text-black mt-0.5'>
              <strong>CNPJ:</strong> {DADOS_EMPRESA.cnpj} |{' '}
              <strong>Inscrição Estadual:</strong> {DADOS_EMPRESA.insc}
            </p>
            <p className='text-custom-muted print:text-black mt-0.5'>
              <strong>Endereço:</strong> {DADOS_EMPRESA.endereco}
            </p>
          </div>
          <div className='text-right'>
            <h2 className='text-sm font-bold uppercase text-gray-700'>
              Orçamento Comercial
            </h2>
            <p>
              <strong>Emissão:</strong>{' '}
              {orcamento.data.split('-').reverse().join('/')}
            </p>
            {orcamento.vencimento && (
              <p>
                <strong>Venc. do Orçamento:</strong>{' '}
                {orcamento.vencimento.split('-').reverse().join('/')}
              </p>
            )}
          </div>
        </div>

        <div className='border border-black p-2 mb-4 space-y-1 bg-gray-50'>
          <p className='text-sm font-bold uppercase tracking-wide border-b border-gray-300 pb-0.5 mb-1 text-gray-800'>
            Dados do Cliente
          </p>
          {clienteSelecionado ? (
            <>
              <p>
                <strong>Nome/Razão Social:</strong> {clienteSelecionado.nome}
              </p>
              <p>
                <strong>Documento ({clienteSelecionado.tipoDoc}):</strong>{' '}
                {clienteSelecionado.documentoFormatado}
              </p>
              <p>
                <strong>Telefone:</strong> {clienteSelecionado.contato1}
              </p>
              <p>
                <strong>Endereço Completo:</strong>{' '}
                {clienteSelecionado.logradouro}, Nº {clienteSelecionado.numero}{' '}
                - Bairro: {clienteSelecionado.bairro}
              </p>
            </>
          ) : (
            <p className='text-red-600 italic'>Nenhum cliente selecionado.</p>
          )}
        </div>

        <table className='w-full text-left border-collapse border border-black mb-4'>
          <thead>
            <tr className='bg-gray-200 border-b border-black font-bold uppercase text-[10px]'>
              <th className='border border-black p-1.5 w-8 text-center'>Nº</th>
              <th className='border border-black p-1.5'>
                Discriminação do Produto / Serviço
              </th>
              <th className='border border-black p-1.5 w-12 text-center'>
                Qtd
              </th>
              <th className='border border-black p-1.5 w-16 text-center'>
                Larg (m)
              </th>
              <th className='border border-black p-1.5 w-16 text-center'>
                Comp (m)
              </th>
              <th className='border border-black p-1.5 w-20 text-center'>
                Área (m²)
              </th>
              <th className='border border-black p-1.5 w-24 text-center'>
                Preço Unit.
              </th>
              <th className='border border-black p-1.5 w-28 text-center'>
                Preço Total
              </th>
            </tr>
          </thead>
          <tbody>
            {orcamento.itens.map((item, index) => {
              const prod = produtos.find((p) => p.id === item.produtoId);
              const area = calculateArea(item.largura, item.altura);
              const totalItem = calculateItemTotal(
                item.quantidade,
                item.precoUnitario,
                item.largura,
                item.altura
              );

              return (
                <tr key={item.id} className='border-b border-gray-400'>
                  <td className='border border-black p-1.5 text-center font-bold'>
                    {index + 1}
                  </td>
                  <td className='border border-black p-1.5 font-medium'>
                    {prod ? (
                      prod.nome
                    ) : (
                      <span className='text-gray-400 italic'>
                        Não especificado
                      </span>
                    )}
                  </td>
                  <td className='border border-black p-1.5 text-center'>
                    {item.quantidade}
                  </td>
                  <td className='border border-black p-1.5 text-center'>
                    {item.largura || '-'}
                  </td>
                  <td className='border border-black p-1.5 text-center'>
                    {item.altura || '-'}
                  </td>
                  <td className='border border-black p-1.5 text-center'>
                    {area ? `${area} m²` : '-'}
                  </td>
                  <td className='border border-black p-1.5 text-center'>
                    R${' '}
                    {item.precoUnitario.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className='border border-black p-1.5 text-center font-bold'>
                    R${' '}
                    {totalItem.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className='grid grid-cols-2 gap-4 items-start'>
          <div className='space-y-3 h-full'>
            <div className='border border-black p-2 space-y-1 bg-gray-50'>
              <p className='font-bold uppercase text-[10px] text-gray-700 border-b border-gray-300 pb-0.5 mb-1'>
                Condições de Pagamento
              </p>
              <p>
                <strong>Prazo de Entrega:</strong>{' '}
                {orcamento.prazoEntrega || 'A combinar'}
              </p>
              <p>
                <strong>Forma de Pagamento:</strong>{' '}
                {formaPagamentoFinal || 'A combinar'}
              </p>
              {parcelamentoFinal && (
                <p>
                  <strong>Parcelamento / Prazo:</strong> {parcelamentoFinal}
                </p>
              )}
            </div>
            {orcamento.observacoes && (
              <div className='border border-black p-2 bg-white rounded'>
                <p className='font-bold uppercase text-[10px] text-gray-700 border-b border-gray-300 pb-0.5 mb-1'>
                  Observações Adicionais
                </p>
                <p className='text-[11px] leading-relaxed lowercase whitespace-pre-line'>
                  {orcamento.observacoes}
                </p>
              </div>
            )}
          </div>

          <table className='w-full border-collapse border border-black'>
            <tbody>
              <tr>
                <td className='border border-black p-1.5 font-bold uppercase bg-gray-100 text-right'>
                  Subtotal Bruto:
                </td>
                <td className='border border-black p-1.5 text-right'>
                  R${' '}
                  {subtotalGeral.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
              {valorDesconto > 0 && (
                <tr className='text-red-700'>
                  <td className='border border-black p-1.5 font-bold uppercase bg-gray-100 text-right'>
                    Desconto (-):
                  </td>
                  <td className='border border-black p-1.5 text-right'>
                    - R${' '}
                    {valorDesconto.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )}
              {valorAcrescimo > 0 && (
                <tr className='text-blue-900'>
                  <td className='border border-black p-1.5 font-bold uppercase bg-gray-100 text-right'>
                    Acréscimo (+):
                  </td>
                  <td className='border border-black p-1.5 text-right'>
                    + R${' '}
                    {valorAcrescimo.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              )}
              <tr className='text-sm font-bold bg-gray-200'>
                <td className='border border-black p-2 uppercase text-right'>
                  VALOR LÍQUIDO TOTAL:
                </td>
                <td className='border border-black p-2 text-right text-green-800'>
                  R${' '}
                  {totalComModificadores.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* BLOCO DE ASSINATURAS NO PDF */}
      <div className='mt-8 grid grid-cols-2 gap-6 text-center print:grid print:grid-cols-2 print:gap-6'>
        {/* Assinatura da Empresa */}
        <div className='flex flex-col items-center justify-end h-16'>
          <div className='w-full border-t border-black max-w-[280px]'></div>
          <p className='text-[10px] font-bold uppercase tracking-wide mt-1 text-gray-700'>
            {DADOS_EMPRESA.nome}
          </p>
          <p className='text-[9px] text-gray-500 font-normal'>Emitente</p>
        </div>

        {/* Assinatura do Cliente */}
        <div className='flex flex-col items-center justify-end h-16'>
          <div className='w-full border-t border-black max-w-[280px]'></div>
          <p className='text-[10px] font-bold uppercase tracking-wide mt-1 text-gray-700 truncate max-w-[280px]'>
            {clienteSelecionado
              ? clienteSelecionado.nome
              : 'Assinatura do Cliente'}
          </p>
          <p className='text-[9px] text-gray-500 font-normal'>Cliente</p>
        </div>
      </div>

      <Modal
        isOpen={modalLimparOpen}
        title='Apagar e Zerar Orçamento'
        message={`Atenção! Você está prestes a limpar por completo todas as linhas e cabeçalhos deste orçamento atual.\n\nEsta operação não pode ser desfeita. Deseja continuar?`}
        onConfirm={handleLimparOrcamento}
        onCancel={() => setModalLimparOpen(false)}
        confirmText='Sim, apagar tudo'
        cancelText='Não, manter'
      />
    </div>
  );
}
