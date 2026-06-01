import { useState } from 'react';
import { Download, Upload, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function Backup() {
  const [mensagemStatus, setMensagemStatus] = useState('');
  const [tipoStatus, setTipoStatus] = useState(''); // 'sucesso' ou 'erro'

  // 1. FUNÇÃO PARA EXPORTAR (DOWNLOAD DO JSON)
  const exportarBackup = () => {
    try {
      const clientes = JSON.parse(localStorage.getItem('mvp_clientes') || '[]');
      const produtos = JSON.parse(localStorage.getItem('mvp_produtos') || '[]');

      // Estrutura o objeto de backup
      const dadosBackup = {
        sistema: 'MVP_Gerenciador',
        versao: '1.0',
        exportadoEm: new Date().toLocaleDateString('pt-BR'),
        clientes: clientes,
        produtos: produtos,
      };

      // Transforma em texto JSON indentado
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(dadosBackup, null, 2)
      )}`;

      // Cria um link temporário na memória para forçar o download do Windows
      const downloadAnchor = document.createElement('a');
      const dataAtual = new Date()
        .toISOString()
        .split('T')[0]
        .split('-')
        .reverse()
        .join('_');

      downloadAnchor.setAttribute('href', jsonString);
      downloadAnchor.setAttribute(
        'download',
        `backup_sistema_${dataAtual}.json`
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      exibirStatus(
        'Backup exportado com sucesso! Guarde o arquivo em um local seguro.',
        'sucesso'
      );
    } catch {
      exibirStatus('Erro ao gerar o arquivo de backup.', 'erro');
    }
  };

  // 2. FUNÇÃO PARA IMPORTAR (LER E SALVAR NO LOCALSTORAGE)
  const importarBackup = (e) => {
    const arquivo = e.target.files[0];
    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = (evento) => {
      try {
        const dadosConvertidos = JSON.parse(evento.target.result);

        // VALIDAÇÃO CRÍTICA: Verifica se o arquivo realmente pertence ao seu sistema
        if (
          dadosConvertidos.sistema !== 'MVP_Gerenciador' ||
          !dadosConvertidos.clientes ||
          !dadosConvertidos.produtos
        ) {
          exibirStatus(
            'Arquivo inválido! O arquivo selecionado não é um backup compatível deste sistema.',
            'erro'
          );
          e.target.value = ''; // Limpa o input
          return;
        }

        // Confirmação de segurança com o usuário
        const confirmar = window.confirm(
          `Atenção!\n\nEste arquivo contém:\n- ${dadosConvertidos.clientes.length} Clientes\n- ${dadosConvertidos.produtos.length} Produtos\n\nAo continuar, TODOS os dados atuais do seu sistema serão substituídos pelos do arquivo. Deseja prosseguir?`
        );

        if (confirmar) {
          localStorage.setItem(
            'mvp_clientes',
            JSON.stringify(dadosConvertidos.clientes)
          );
          localStorage.setItem(
            'mvp_produtos',
            JSON.stringify(dadosConvertidos.produtos)
          );
          exibirStatus(
            'Backup restaurado com sucesso! Os dados foram atualizados.',
            'sucesso'
          );
        }
      } catch {
        exibirStatus(
          'Erro ao ler o arquivo JSON. Certifique-se de que o arquivo não está corrompido.',
          'erro'
        );
      }
      e.target.value = ''; // Limpa o seletor de arquivos
    };

    leitor.readAsText(arquivo);
  };

  const exibirStatus = (mensagem, tipo) => {
    setMensagemStatus(mensagem);
    setTipoStatus(tipo);
    setTimeout(() => setMensagemStatus(''), 7000); // Some após 7 segundos
  };

  return (
    <div className='max-w-2xl mx-auto mt-6 bg-brand-surface p-6 rounded-lg border border-brand-border shadow-sm text-sm text-brand-main'>
      <div className='border-b border-brand-border pb-3 mb-5'>
        <h3 className='text-lg font-bold flex items-center gap-2'>
          <ShieldCheck className='text-brand-primary' size={22} />
          Cópia de Segurança (Backup dos Dados)
        </h3>
        <p className='text-xs text-brand-muted mt-1'>
          Como o sistema armazena os dados localmente no aplicativo, use esta
          tela para evitar a perda de informações em caso de problemas no
          computador.
        </p>
      </div>

      {/* Alertas de Status na Tela */}
      {mensagemStatus && (
        <div
          className={`p-4 rounded-lg mb-5 flex items-start gap-2 border ${
            tipoStatus === 'sucesso'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {tipoStatus === 'erro' && (
            <AlertTriangle size={18} className='shrink-0 mt-0.5' />
          )}
          <span className='font-medium text-xs'>{mensagemStatus}</span>
        </div>
      )}

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* BLOCO EXPORTAR */}
        <div className='p-4 border border-brand-border rounded-lg bg-gray-50 flex flex-col justify-between'>
          <div>
            <h4 className='font-bold text-brand-main mb-1 flex items-center gap-1.5'>
              <Download size={16} className='text-brand-primary' />
              Salvar Dados Atuais
            </h4>
            <p className='text-xs text-brand-muted mb-4 leading-relaxed'>
              Gera um arquivo contendo todos os clientes e produtos cadastrados
              até o momento. Recomendamos fazer isso semanalmente.
            </p>
          </div>
          <button
            type='button'
            onClick={exportarBackup}
            className='w-full py-2.5 bg-brand-primary hover:bg-opacity-90 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm'
          >
            <Download size={16} />
            Baixar Arquivo de Backup
          </button>
        </div>

        {/* BLOCO IMPORTAR */}
        <div className='p-4 border border-brand-border rounded-lg bg-gray-50 flex flex-col justify-between'>
          <div>
            <h4 className='font-bold text-brand-main mb-1 flex items-center gap-1.5'>
              <Upload size={16} className='text-orange-500' />
              Recuperar Dados (Restaurar)
            </h4>
            <p className='text-xs text-brand-muted mb-4 leading-relaxed'>
              Lê um arquivo de backup salvo anteriormente e restaura as
              informações no sistema.{' '}
              <span className='text-brand-danger font-medium'>
                Atenção: Substitui os dados atuais.
              </span>
            </p>
          </div>

          <label className='w-full py-2.5 bg-white border border-brand-border hover:bg-gray-50 text-brand-main font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer text-center'>
            <Upload size={16} className='text-brand-muted' />
            Selecionar Arquivo Backup
            <input
              type='file'
              accept='.json'
              onChange={importarBackup}
              className='hidden'
            />
          </label>
        </div>
      </div>
    </div>
  );
}
