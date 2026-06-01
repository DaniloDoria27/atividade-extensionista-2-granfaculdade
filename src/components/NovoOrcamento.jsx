import { useState, useEffect } from 'react';
import { Trash2, Printer } from 'lucide-react';
import { calculateArea } from '../utils/helpers';
import Modal from './Modal';
import logoEmpresa from '../img/logo.png';

const DADOS_EMPRESA = {
  nome: 'RQL - Depósito e Marmoraria',
  celular: '(98) 98524-7259 | 98906-8127',
  email: 'depositoemarmorariarql@outlook.com',
  logotipoUrl: logoEmpresa,
  cnpj: '41.505.286/0001-44',
  insc: '12.691.971-2',
  endereco: 'Av. dos Africanos, 50 - Areinha - São Luís/MA - CEP: 65032-075',
};

const normalizarString = (str) => {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

export default function NovoOrcamento() {
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modalLimparOpen, setModalLimparOpen] = useState(false);

  const [customPagamento, setCustomPagamento] = useState('');
  const [customParcelamento, setCustomParcelamento] = useState('');

  const [buscaCliente, setBuscaCliente] = useState('');
  const [mostrarListaCliente, setMostrarListaCliente] = useState(false);
  const [buscaProduto, setBuscaProduto] = useState({});
  const [mostrarListaProduto, setMostrarListaProduto] = useState({});

  const [orcamento, setOrcamento] = useState(() => {
    const salvo = localStorage.getItem('mvp_orcamento_corrente');
    if (salvo) return JSON.parse(salvo);

    return {
      clienteId: '',
      data: (() => {
        const hoje = new Date();
        const ano = hoje.getFullYear();
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const dia = String(hoje.getDate()).padStart(2, '0');
        return `${ano}-${mes}-${dia}`;
      })(),
      vencimento: '',
      prazoEntrega: '',
      tipoPagamento: 'Pix',
      parcelamento: 'À vista',
      descontoReais: '',
      descontoPorcentagem: '',
      acrescimoReais: '',
      acrescimoPorcentagem: '',
      observacoes: '',
      itens: [
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          areaManual: '',
          precoUnitario: '',
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          areaManual: '',
          precoUnitario: '',
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          areaManual: '',
          precoUnitario: '',
        },
      ],
    };
  });

  useEffect(() => {
    const clientesSalvos = JSON.parse(
      localStorage.getItem('mvp_clientes') || '[]'
    );
    const produtosSalvos = JSON.parse(
      localStorage.getItem('mvp_produtos') || '[]'
    );
    setClientes(clientesSalvos);
    setProdutos(produtosSalvos);

    if (orcamento.clienteId) {
      const cli = clientesSalvos.find((c) => c.id === orcamento.clienteId);
      if (cli) setBuscaCliente(cli.nome);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mvp_orcamento_corrente', JSON.stringify(orcamento));
  }, [orcamento]);

  const handleMetaChange = (e) => {
    const { name, value } = e.target;
    if (name === 'vencimento' && value) {
      if (value < orcamento.data) {
        alert(
          'A data de vencimento não pode ser anterior à data de emissão do orçamento!'
        );
        setOrcamento((prev) => ({ ...prev, vencimento: '' }));
        return;
      }
    }
    setOrcamento((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setOrcamento((prev) => {
      const novosItens = prev.itens.map((item) => {
        if (item.id !== id) return item;
        let updatedItem = { ...item, [field]: value };

        // REGRA DE OURO DA ÁREA MANUAL VS AUTOMÁTICA
        if (field === 'largura' || field === 'altura') {
          updatedItem.areaManual = ''; // Se mexeu nas dimensões, anula a área manual anterior
        }

        if (field === 'areaManual' && value !== '') {
          updatedItem.largura = ''; // Se digitou área manual, limpa dimensões automáticas
          updatedItem.altura = '';
        }

        if (field === 'produtoId') {
          const prodCadastrado = produtos.find(
            (p) => p.nome === value || p.id === value
          );
          if (prodCadastrado) {
            updatedItem.produtoId = prodCadastrado.id;
            updatedItem.precoUnitario = prodCadastrado.preco;
          } else {
            updatedItem.produtoId = value;
          }
        }
        return updatedItem;
      });
      return { ...prev, itens: novosItens };
    });
  };

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
          areaManual: '',
          precoUnitario: '',
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
    setBuscaProduto((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
    setMostrarListaProduto((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });
  };

  const handleLimparOrcamento = () => {
    setOrcamento({
      clienteId: '',
      data: new Date().toISOString().split('T')[0],
      vencimento: '',
      prazoEntrega: '',
      tipoPagamento: 'Pix',
      parcelamento: 'À vista',
      descontoReais: '',
      descontoPorcentagem: '',
      acrescimoReais: '',
      acrescimoPorcentagem: '',
      observacoes: '',
      itens: [
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          areaManual: '',
          precoUnitario: '',
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          areaManual: '',
          precoUnitario: '',
        },
        {
          id: crypto.randomUUID(),
          produtoId: '',
          quantidade: 1,
          largura: '',
          altura: '',
          areaManual: '',
          precoUnitario: '',
        },
      ],
    });
    setCustomPagamento('');
    setCustomParcelamento('');
    setBuscaCliente('');
    setBuscaProduto({});
    setMostrarListaCliente(false);
    setMostrarListaProduto({});
    setModalLimparOpen(false);
  };

  const clienteSelecionado = clientes.find(
    (c) => c.id === orcamento.clienteId || c.nome === orcamento.clienteId
  );

  // --- FUNÇÃO LOCAL COESA PARA DETERMINAR A ÁREA DE CADA LINHA E EVITAR ERRO DE SINTAXE ---
  const obterAreaDoItem = (item) => {
    if (
      item.areaManual !== undefined &&
      item.areaManual !== null &&
      item.areaManual !== ''
    ) {
      return parseFloat(item.areaManual) || 0;
    }
    // Se não tiver área manual, calcula usando o utilitário padrão pelas dimensões fornecidas
    return calculateArea(item.largura, item.altura) || 0;
  };

  // CÁLCULO DOS TOTAIS BASEADOS NA ÁREA REAL DE USO
  const subtotalGeral = orcamento.itens.reduce((acc, item) => {
    const qtd = parseInt(item.quantidade) || 0;
    const preco = parseFloat(item.precoUnitario) || 0;
    const areaUso = obterAreaDoItem(item);

    // Se houver área definida (seja por m² manual ou cálculo de L x C), multiplica por ela.
    // Se a área for zero (como itens vendidos por unidade seca), calcula apenas Qtd * Preço.
    const totalLinha = areaUso > 0 ? qtd * preco * areaUso : qtd * preco;
    return acc + totalLinha;
  }, 0);

  // Lógica de Desconto Cruzado (R$ ou %)
  let valorDesconto = 0;
  if (orcamento.descontoReais) {
    valorDesconto = parseFloat(orcamento.descontoReais) || 0;
  } else if (orcamento.descontoPorcentagem) {
    const pct = parseFloat(orcamento.descontoPorcentagem) || 0;
    valorDesconto = subtotalGeral * (pct / 100);
  }

  // Lógica de Acréscimo Cruzado (R$ ou %)
  let valorAcrescimo = 0;
  if (orcamento.acrescimoReais) {
    valorAcrescimo = parseFloat(orcamento.acrescimoReais) || 0;
  } else if (orcamento.acrescimoPorcentagem) {
    const pct = parseFloat(orcamento.acrescimoPorcentagem) || 0;
    valorAcrescimo = subtotalGeral * (pct / 100);
  }

  const totalComModificadores = Math.max(
    0,
    subtotalGeral - valorDesconto + valorAcrescimo
  );

  const porcentagemDescontoExibicao =
    subtotalGeral > 0 ? ((valorDesconto / subtotalGeral) * 100).toFixed(1) : 0;
  const porcentagemAcrescimoExibicao =
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

  const formaPagamentoFinal =
    orcamento.tipoPagamento === 'Outro'
      ? customPagamento
      : orcamento.tipoPagamento;
  const parcelamentoFinal =
    orcamento.parcelamento === 'Outro'
      ? customParcelamento
      : orcamento.parcelamento;

  const clientesFiltrados = clientes.filter((c) =>
    normalizarString(c.nome).includes(normalizarString(buscaCliente))
  );

  return (
    <div className='max-w-full w-full mx-auto mt-2 space-y-5 last:pb-12 text-base font-sans selection:bg-blue-100'>
      {/* CABEÇALHO */}
      <div className='bg-custom-surface p-6 rounded-lg border border-custom-grid shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 items-center print:hidden'>
        <div className='flex items-center gap-5'>
          <div className='h-24 w-24 rounded-lg flex items-center justify-center bg-white p-1'>
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
            <h2 className='font-bold text-xl text-custom-main mb-1'>
              {DADOS_EMPRESA.nome}
            </h2>
            <p className='text-sm text-custom-muted'>
              <strong>Celular:</strong> {DADOS_EMPRESA.celular}
            </p>
            <p className='text-sm text-custom-muted'>
              <strong>E-mail:</strong> {DADOS_EMPRESA.email}
            </p>
            <p className='text-sm text-custom-muted'>
              <strong>Endereço:</strong> {DADOS_EMPRESA.endereco}
            </p>
            <p className='text-sm text-custom-muted'>
              <strong>CNPJ:</strong> {DADOS_EMPRESA.cnpj} |{' '}
              <strong>Insc. Est.:</strong> {DADOS_EMPRESA.insc}
            </p>
          </div>
        </div>
        <div className='flex md:justify-end gap-3'>
          <button
            type='button'
            onClick={() => setModalLimparOpen(true)}
            className='flex items-center gap-2 px-4 py-2 border border-custom-grid text-brand-danger bg-red-50 hover:bg-red-100 rounded-md text-base font-semibold transition-colors'
          >
            <Trash2 size={18} /> Apagar Orçamento
          </button>
          <button
            type='button'
            onClick={handleExportarPDF}
            className='flex items-center gap-2 px-5 py-2 btn-primary rounded-md text-base font-semibold transition-colors shadow-sm'
          >
            <Printer size={18} /> Gerar PDF / Imprimir
          </button>
        </div>
      </div>

      {/* METADADOS PRINCIPAIS */}
      <div className='bg-custom-surface p-6 rounded-lg border border-custom-grid shadow-sm grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 print:hidden'>
        <div className='md:col-span-2 relative'>
          <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
            Selecionar Cliente *
          </label>
          <input
            type='text'
            value={buscaCliente}
            onChange={(e) => {
              const valor = e.target.value;
              setBuscaCliente(valor);
              setMostrarListaCliente(valor.length > 0);
              if (!valor) {
                handleMetaChange({ target: { name: 'clienteId', value: '' } });
              }
            }}
            onFocus={() => {
              if (buscaCliente.length > 0) setMostrarListaCliente(true);
            }}
            onBlur={() => {
              setTimeout(() => setMostrarListaCliente(false), 200);
            }}
            placeholder='Digite para buscar o cliente...'
            className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base bg-white capitalize'
          />
          {mostrarListaCliente && clientesFiltrados.length > 0 && (
            <div className='absolute z-50 w-full mt-1 bg-white border border-custom-grid rounded-md shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100'>
              {clientesFiltrados.map((c) => (
                <div
                  key={c.id}
                  onMouseDown={() => {
                    setBuscaCliente(c.nome);
                    setMostrarListaCliente(false);
                    handleMetaChange({
                      target: { name: 'clienteId', value: c.id },
                    });
                  }}
                  className='px-4 py-2 hover:bg-blue-50 cursor-pointer text-base text-custom-main transition-colors capitalize'
                >
                  {c.nome}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
            Data Emissão *
          </label>
          <input
            type='date'
            name='data'
            value={orcamento.data}
            onChange={handleMetaChange}
            className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base bg-white'
          />
        </div>

        <div>
          <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
            Venc. do Orçamento
          </label>
          <input
            type='date'
            name='vencimento'
            value={orcamento.vencimento}
            onChange={handleMetaChange}
            onKeyDown={(e) => e.preventDefault()}
            className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base cursor-pointer bg-white'
          />
        </div>

        <div>
          <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
            Prazo Entrega
          </label>
          <input
            type='text'
            name='prazoEntrega'
            value={orcamento.prazoEntrega}
            onChange={handleMetaChange}
            placeholder='Ex: 5 dias úteis'
            className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base'
          />
        </div>

        <div>
          <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
            Forma Pagamento
          </label>
          <select
            name='tipoPagamento'
            value={orcamento.tipoPagamento}
            onChange={handleMetaChange}
            className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base bg-white'
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
              className='w-full mt-2 px-3 py-1.5 border border-custom-grid rounded text-base focus:outline-none'
            />
          )}
        </div>

        <div>
          <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
            Parcelamento
          </label>
          <select
            name='parcelamento'
            value={orcamento.parcelamento}
            onChange={handleMetaChange}
            className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base bg-white'
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
              className='w-full mt-2 px-3 py-1.5 border border-custom-grid rounded text-base focus:outline-none'
            />
          )}
        </div>
      </div>

      {/* INFO CLIENTE SELECIONADO */}
      {clienteSelecionado && (
        <div className='bg-blue-50 border border-blue-200 p-4 rounded-lg text-base text-custom-main space-y-1 print:hidden capitalize shadow-sm'>
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
            {clienteSelecionado.numero}
            {clienteSelecionado.complemento &&
              ` - Compl.: ${clienteSelecionado.complemento}`}{' '}
            - Bairro: {clienteSelecionado.bairro}
          </p>
        </div>
      )}

      {/* TABELA DE ITENS */}
      <div className='bg-custom-surface rounded-lg border border-custom-grid shadow-sm overflow-x-auto print:hidden'>
        <table className='w-full text-left border-collapse min-w-[950px]'>
          <thead>
            <tr className='bg-gray-50 border-b border-custom-grid text-sm font-bold text-custom-muted uppercase tracking-wider'>
              <th className='py-3 px-4 w-14 text-center'>Item</th>
              <th className='py-3 px-3 w-72'>Produto *</th>
              <th className='py-3 px-3 w-24'>Qtd *</th>
              <th className='py-3 px-3 w-24'>Larg (m)</th>
              <th className='py-3 px-3 w-24'>Comp (m)</th>
              <th className='py-3 px-3 w-28 text-center'>Área (m²) *</th>
              <th className='py-3 px-3 w-32 text-center'>Preço Unit.</th>
              <th className='py-3 px-3 w-36 text-center'>Total Item</th>
              <th className='py-3 px-4 w-14 text-center'></th>
            </tr>
          </thead>
          <tbody className='divide-y divide-custom-grid text-base'>
            {orcamento.itens.map((item, index) => {
              // Descobre o valor real da área para a interface gráfica
              const areaUso = obterAreaDoItem(item);
              const valorAreaExibido =
                item.areaManual !== ''
                  ? item.areaManual
                  : areaUso > 0
                    ? areaUso.toFixed(2)
                    : '';

              const qtd = parseInt(item.quantidade) || 0;
              const preco = parseFloat(item.precoUnitario) || 0;

              // PREÇO DO ITEM CORRIGIDO PARA REALIZAR A MULTIPLICAÇÃO INTERNA DIRETAMENTE
              const totalItem =
                areaUso > 0 ? qtd * preco * areaUso : qtd * preco;

              const termoBuscaProd =
                buscaProduto[item.id] !== undefined
                  ? buscaProduto[item.id]
                  : produtos.find((p) => p.id === item.produtoId)?.nome ||
                    item.produtoId;

              const produtosFiltrados = produtos.filter((p) =>
                normalizarString(p.nome).includes(
                  normalizarString(termoBuscaProd)
                )
              );

              return (
                <tr
                  key={item.id}
                  className='hover:bg-gray-50/70 transition-colors'
                >
                  <td className='py-3 px-4 text-center font-semibold text-custom-muted'>
                    {index + 1}
                  </td>
                  <td className='py-2 px-3 relative'>
                    <input
                      type='text'
                      value={termoBuscaProd}
                      onChange={(e) => {
                        const valor = e.target.value;
                        setBuscaProduto((prev) => ({
                          ...prev,
                          [item.id]: valor,
                        }));
                        setMostrarListaProduto((prev) => ({
                          ...prev,
                          [item.id]: valor.length > 0,
                        }));
                        handleItemChange(item.id, 'produtoId', valor);
                      }}
                      onFocus={() => {
                        if (termoBuscaProd.length > 0)
                          setMostrarListaProduto((prev) => ({
                            ...prev,
                            [item.id]: true,
                          }));
                      }}
                      onBlur={() => {
                        setTimeout(() => {
                          setMostrarListaProduto((prev) => ({
                            ...prev,
                            [item.id]: false,
                          }));
                        }, 200);
                      }}
                      placeholder='Buscar produto...'
                      className='w-full px-3 py-1.5 border border-custom-grid rounded focus:outline-none text-base bg-white capitalize'
                    />
                    {mostrarListaProduto[item.id] &&
                      produtosFiltrados.length > 0 && (
                        <div className='absolute z-50 w-[calc(100%-24px)] mt-1 bg-white border border-custom-grid rounded shadow-lg max-h-48 overflow-y-auto divide-y divide-gray-100'>
                          {produtosFiltrados.map((p) => (
                            <div
                              key={p.id}
                              onMouseDown={() => {
                                setBuscaProduto((prev) => ({
                                  ...prev,
                                  [item.id]: p.nome,
                                }));
                                setMostrarListaProduto((prev) => ({
                                  ...prev,
                                  [item.id]: false,
                                }));
                                handleItemChange(item.id, 'produtoId', p.id);
                              }}
                              className='px-3 py-2 hover:bg-blue-50 cursor-pointer text-sm text-custom-main transition-colors capitalize'
                            >
                              {p.nome} ({p.grandeza || 'unid.'})
                            </div>
                          ))}
                        </div>
                      )}
                  </td>
                  <td className='py-2 px-3'>
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
                      className='w-full px-3 py-1.5 border border-custom-grid rounded focus:outline-none text-base'
                    />
                  </td>
                  <td className='py-2 px-3'>
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      value={item.largura}
                      onChange={(e) =>
                        handleItemChange(item.id, 'largura', e.target.value)
                      }
                      className='w-full px-3 py-1.5 border border-custom-grid rounded focus:outline-none text-base'
                    />
                  </td>
                  <td className='py-2 px-3'>
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      value={item.altura}
                      onChange={(e) =>
                        handleItemChange(item.id, 'altura', e.target.value)
                      }
                      className='w-full px-3 py-1.5 border border-custom-grid rounded focus:outline-none text-base'
                    />
                  </td>
                  {/* Campo de área editável inteligente */}
                  <td className='py-2 px-3'>
                    <input
                      type='number'
                      step='0.01'
                      min='0'
                      placeholder='0.00'
                      value={valorAreaExibido}
                      onChange={(e) =>
                        handleItemChange(item.id, 'areaManual', e.target.value)
                      }
                      className='w-full px-2 py-1.5 border border-custom-grid rounded focus:outline-none text-base text-center font-semibold bg-white'
                    />
                  </td>
                  <td className='py-2 px-3'>
                    <div className='relative min-w-[110px]'>
                      <span className='absolute inset-y-0 left-0 pl-2.5 flex items-center text-sm font-bold text-custom-muted'>
                        R$
                      </span>
                      <input
                        type='number'
                        step='0.01'
                        min='0'
                        placeholder='0.00'
                        value={item.precoUnitario}
                        onChange={(e) =>
                          handleItemChange(
                            item.id,
                            'precoUnitario',
                            e.target.value
                          )
                        }
                        className='w-full pl-8 pr-1 py-1.5 border border-custom-grid rounded focus:outline-none text-base font-semibold text-center'
                      />
                    </div>
                  </td>
                  <td className='py-2 px-3 text-center font-bold text-custom-main'>
                    R${' '}
                    {totalItem.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className='py-2 px-4 text-center'>
                    <button
                      type='button'
                      onClick={() => removerLinha(item.id)}
                      className='p-1.5 text-gray-400 hover:text-brand-danger rounded transition-colors'
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className='p-3 bg-gray-50 border-t border-custom-grid'>
          <button
            type='button'
            onClick={adicionarLinha}
            className='text-xs font-bold text-brand-primary uppercase tracking-wider bg-white px-3 py-1.5 border border-custom-grid rounded shadow-sm transition-colors'
          >
            + Adicionar Linha
          </button>
        </div>
      </div>

      {/* REAJUSTES E OBSERVAÇÕES */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5 print:hidden'>
        <div className='bg-custom-surface p-5 rounded-lg border border-custom-grid shadow-sm space-y-4'>
          {/* SEÇÃO DE DESCONTO EXCLUSIVO */}
          <div className='border-b border-gray-100 pb-3'>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Conceder Desconto
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-base font-bold text-custom-muted'>
                  R$
                </span>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={orcamento.descontoReais}
                  disabled={!!orcamento.descontoPorcentagem}
                  onChange={(e) =>
                    setOrcamento((prev) => ({
                      ...prev,
                      descontoReais: e.target.value,
                    }))
                  }
                  placeholder='Valor em R$'
                  className='w-full pl-9 pr-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base font-medium disabled:bg-gray-100 disabled:text-gray-400'
                />
              </div>
              <div className='relative'>
                <span className='absolute inset-y-0 right-0 pr-3 flex items-center text-base font-bold text-custom-muted'>
                  %
                </span>
                <input
                  type='number'
                  step='0.1'
                  min='0'
                  max='100'
                  value={orcamento.descontoPorcentagem}
                  disabled={!!orcamento.descontoReais}
                  onChange={(e) =>
                    setOrcamento((prev) => ({
                      ...prev,
                      descontoPorcentagem: e.target.value,
                    }))
                  }
                  placeholder='Porcentagem %'
                  className='w-full pl-3 pr-8 py-2 border border-custom-grid rounded-md focus:outline-none text-base font-medium disabled:bg-gray-100 disabled:text-gray-400'
                />
              </div>
            </div>
            {valorDesconto > 0 && (
              <p className='text-xs text-brand-success font-bold mt-1'>
                Abatimento total de {porcentagemDescontoExibicao}% (- R${' '}
                {valorDesconto.toFixed(2)})
              </p>
            )}
          </div>

          {/* SEÇÃO DE ACRESCIMO EXCLUSIVO */}
          <div className='border-b border-gray-100 pb-2'>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Adicionar Acréscimo / Taxa
            </label>
            <div className='grid grid-cols-2 gap-3'>
              <div className='relative'>
                <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-base font-bold text-custom-muted'>
                  R$
                </span>
                <input
                  type='number'
                  step='0.01'
                  min='0'
                  value={orcamento.acrescimoReais}
                  disabled={!!orcamento.acrescimoPorcentagem}
                  onChange={(e) =>
                    setOrcamento((prev) => ({
                      ...prev,
                      acrescimoReais: e.target.value,
                    }))
                  }
                  placeholder='Valor em R$'
                  className='w-full pl-9 pr-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base font-medium disabled:bg-gray-100 disabled:text-gray-400'
                />
              </div>
              <div className='relative'>
                <span className='absolute inset-y-0 right-0 pr-3 flex items-center text-base font-bold text-custom-muted'>
                  %
                </span>
                <input
                  type='number'
                  step='0.1'
                  min='0'
                  value={orcamento.acrescimoPorcentagem}
                  disabled={!!orcamento.acrescimoReais}
                  onChange={(e) =>
                    setOrcamento((prev) => ({
                      ...prev,
                      acrescimoPorcentagem: e.target.value,
                    }))
                  }
                  placeholder='Porcentagem %'
                  className='w-full pl-3 pr-8 py-2 border border-custom-grid rounded-md focus:outline-none text-base font-medium disabled:bg-gray-100 disabled:text-gray-400'
                />
              </div>
            </div>
            {valorAcrescimo > 0 && (
              <p className='text-xs text-brand-danger font-bold mt-1'>
                Acréscimo total de {porcentagemAcrescimoExibicao}% (+ R${' '}
                {valorAcrescimo.toFixed(2)})
              </p>
            )}
          </div>

          <div>
            <label className='block text-sm font-bold text-custom-muted uppercase mb-1.5'>
              Observações do Orçamento{' '}
              <span className='text-xs text-gray-400'>(Opcional)</span>
            </label>
            <textarea
              name='observacoes'
              rows='3'
              value={orcamento.observacoes}
              onChange={handleMetaChange}
              placeholder='Ex: Informações adicionais...'
              className='w-full px-3 py-2 border border-custom-grid rounded-md focus:outline-none text-base resize-none'
            />
          </div>
        </div>

        <div className='bg-custom-surface p-5 rounded-lg border border-custom-grid shadow-sm space-y-3 justify-between flex flex-col'>
          <div className='space-y-2'>
            <div className='flex justify-between text-custom-muted text-base'>
              <span>Subtotal Bruto:</span>
              <span className='font-bold'>
                R${' '}
                {subtotalGeral.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
            {valorDesconto > 0 && (
              <div className='flex justify-between text-brand-danger text-base'>
                <span>Desconto Aplicado:</span>
                <span className='font-bold'>
                  - R${' '}
                  {valorDesconto.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {valorAcrescimo > 0 && (
              <div className='flex justify-between text-brand-main text-base'>
                <span>Acréscimo Adicionado:</span>
                <span className='font-bold'>
                  + R${' '}
                  {valorAcrescimo.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
          <div className='flex justify-between text-lg font-bold text-custom-main pt-3 border-t border-custom-grid items-end'>
            <span>TOTAL LÍQUIDO:</span>
            <span className='text-2xl text-brand-success'>
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
              <strong>Contato Celular:</strong> {DADOS_EMPRESA.celular}
            </p>
            <p className='text-custom-muted print:text-black mt-0.5'>
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
                {clienteSelecionado.logradouro}, Nº {clienteSelecionado.numero}
                {clienteSelecionado.complemento &&
                  ` , Compl.: ${clienteSelecionado.complemento}`}{' '}
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
                DESCRIÇÃO DO PRODUTO / SERVIÇO
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
              const areaUso = obterAreaDoItem(item);

              const qtd = parseInt(item.quantidade) || 0;
              const preco = parseFloat(item.precoUnitario) || 0;
              const totalItem =
                areaUso > 0 ? qtd * preco * areaUso : qtd * preco;

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
                        {item.produtoId || 'Não especificado'}
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
                    {areaUso > 0 ? `${areaUso.toFixed(2)} m²` : '-'}
                  </td>
                  <td className='border border-black p-1.5 text-center'>
                    R${' '}
                    {preco.toLocaleString('pt-BR', {
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

      {/* BLOCO DE ASSINATURAS NO PDF - OCULTO NA TELA, VISÍVEL APENAS NA IMPRESSÃO/PDF */}
      <div className='hidden print:grid print:grid-cols-2 print:gap-6 mt-4 text-center'>
        {/* ASSINATURA EMITENTE */}
        <div className='flex flex-col items-center mt-12 w-full'>
          <div className='w-full border-t border-black max-w-[280px]'></div>
          <p className='text-[10px] font-bold uppercase tracking-wide mt-1 text-gray-700 leading-tight text-center max-w-[280px]'>
            {DADOS_EMPRESA.nome}
          </p>
          <p className='text-[9px] text-gray-500 font-normal leading-tight text-center'>
            Emitente
          </p>
        </div>

        {/* ASSINATURA CLIENTE */}
        <div className='flex flex-col items-center mt-12 w-full'>
          <div className='w-full border-t border-black max-w-[280px]'></div>
          <p
            className='text-[10px] font-bold uppercase tracking-wide mt-1 text-gray-700 truncate max-w-[280px] leading-tight text-center'
            title={
              clienteSelecionado
                ? clienteSelecionado.nome
                : 'Assinatura do Cliente'
            }
          >
            {clienteSelecionado
              ? clienteSelecionado.nome
              : 'Assinatura do Cliente'}
          </p>
          <p className='text-[9px] text-gray-500 font-normal leading-tight text-center'>
            Cliente
          </p>
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
