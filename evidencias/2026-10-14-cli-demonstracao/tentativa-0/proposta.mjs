const predicadosPorEstado = new Map([
    ['todas', () => true],
    ['abertas', (tarefa) => !tarefa.concluida],
    ['concluidas', (tarefa) => tarefa.concluida]
]);
const obterPredicadoEstado = (estado) => {
    const predicado = predicadosPorEstado.get(estado);
    if (predicado === undefined) {
        throw new Error('Estado inválido');
    }
    return predicado;
};
const normalizarTermo = (termo) => {
    if (termo === undefined) {
        return undefined;
    }
    const limpo = termo.trim().toLowerCase();
    return limpo === '' ? undefined : limpo;
};
export const filtrarTarefas = (tarefas, filtro) => {
    const predicadoEstado = obterPredicadoEstado(filtro.estado);
    const termo = normalizarTermo(filtro.termo);
    return tarefas.filter((tarefa) => {
        if (!predicadoEstado(tarefa)) {
            return false;
        }
        if (termo === undefined) {
            return true;
        }
        return tarefa.titulo.toLowerCase().includes(termo);
    });
};
