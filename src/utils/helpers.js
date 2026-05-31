// Remove espaços duplicados e transforma o texto em letras minúsculas
export const sanitizeString = (str) => {
  if (!str) return '';
  return str.replace(/\s+/g, ' ').trim().toLowerCase();
};

// Formata e limita CPF (###.###.###-##) ou CNPJ (##.###.###/####-##)
export const formatCpfCnpj = (value) => {
  const clearValue = value.replace(/\D/g, '');

  if (clearValue.length <= 11) {
    // Garante limite máximo de 11 dígitos para o CPF
    const truncated = clearValue.slice(0, 11);
    return truncated
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // Garante limite máximo de 14 dígitos para o CNPJ e corrige o posicionamento dos pontos/barra
    const truncated = clearValue.slice(0, 14);
    return truncated
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

// Formata telefone celular automaticamente: (##) #####-####
export const formatPhone = (value) => {
  const clearValue = value.replace(/\D/g, '').slice(0, 11); // Limita em 11 dígitos

  if (clearValue.length <= 10) {
    return clearValue
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{4})(\d{4})$/, '$1-$2');
  }
  return clearValue
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2');
};

// Formata CEP automaticamente: #####-###
export const formatCep = (value) => {
  const clearValue = value.replace(/\D/g, '').slice(0, 8); // Limita em 8 dígitos
  return clearValue.replace(/^(\d{5})(\d)/, '$1-$2');
};

// Validador simples de e-mail (Verifica se possui a estrutura básica contendo @)
export const isValidEmail = (email) => {
  if (!email || email.trim() === '') return true; // Se estiver vazio e opcional, ignora
  return email.includes('@') && email.split('@')[1].trim().length > 0;
};

// Calcula a metragem quadrada sutilmente se largura e altura existirem
export const calculateArea = (largura, altura) => {
  const comp = parseFloat(largura);
  const alt = parseFloat(altura);
  if (isNaN(comp) || isNaN(alt) || comp <= 0 || alt <= 0) return 0;
  return parseFloat((comp * alt).toFixed(2));
};

// Fórmula do coração do sistema: Qtd * Preço (ou Qtd * Área * Preço se houver dimensões)
export const calculateItemTotal = (
  quantidade,
  precoUnitario,
  largura,
  altura
) => {
  const qtd = parseInt(quantidade) || 0;
  const preco = parseFloat(precoUnitario) || 0;
  const area = calculateArea(largura, altura);

  if (area > 0) {
    return parseFloat((qtd * area * preco).toFixed(2));
  }
  return parseFloat((qtd * preco).toFixed(2));
};

// Validador oficial de CPF (Algoritmo dos dígitos verificadores)
export const isValidCpf = (cpf) => {
  if (!cpf) return false;

  // Remove tudo que não for número
  const cleanCpf = cpf.replace(/\D/g, '');

  // CPF precisa ter exatamente 11 dígitos
  if (cleanCpf.length !== 11) return false;

  // Elimina CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(cleanCpf)) return false;

  // Validação do 1º Dígito Verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cleanCpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCpf.charAt(9))) return false;

  // Validação do 2º Dígito Verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cleanCpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cleanCpf.charAt(10))) return false;

  return true;
};

// Validador oficial de CNPJ (Algoritmo dos dígitos verificadores)
export const isValidCnpj = (cnpj) => {
  if (!cnpj) return false;

  // Remove tudo que não for número
  const cleanCnpj = cnpj.replace(/\D/g, '');

  // CNPJ precisa ter exatamente 14 dígitos
  if (cleanCnpj.length !== 14) return false;

  // Elimina CNPJs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;

  // Validação do 1º Dígito Verificador
  let tamanho = cleanCnpj.length - 2;
  let numeros = cleanCnpj.substring(0, tamanho);
  let digitos = cleanCnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Validação do 2º Dígito Verificador
  tamanho = tamanho + 1;
  numeros = cleanCnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

// Função unificada para facilitar o uso na sua tela de Cadastro
export const isValidDocument = (value, type) => {
  if (type === 'CPF') return isValidCpf(value);
  if (type === 'CNPJ') return isValidCnpj(value);
  return false;
};
