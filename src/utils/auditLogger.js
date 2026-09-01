/**
 * MÓDULO DE AUDITORIA E LOGS (REGISTRO DE AÇÕES DO TÉCNICO E SISTEMA)
 */

export function createLogEntry(user, acao, detalhes = {}) {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    usuario_nome: user ? user.nome : 'Sistema',
    usuario_perfil: user ? user.perfil : 'tecnico',
    acao,
    detalhes,
    ip: '189.120.45.12', // IP simulado da rede de Luziânia
    timestamp: new Date().toISOString()
  };
}

export function exportLogsToCSV(logs) {
  if (!logs || logs.length === 0) return;

  const headers = ['ID', 'Data/Hora', 'Usuário', 'Perfil', 'Ação', 'IP', 'Detalhes'];
  const rows = logs.map((l) => [
    l.id,
    new Date(l.timestamp).toLocaleString('pt-BR'),
    `"${l.usuario_nome || ''}"`,
    l.usuario_perfil || '',
    `"${l.acao || ''}"`,
    l.ip || '',
    `"${JSON.stringify(l.detalhes || {}).replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + 
    [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `logs_auditoria_sme_luziania_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
