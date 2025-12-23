
document.addEventListener('DOMContentLoaded', () => {

    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); 
            const targetId = link.getAttribute('data-target');
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            link.classList.add('active');
            document.getElementById(targetId + '-content').classList.add('active');
            
            if (targetId === 'agendamentos') {
                popularPacientesSelect();
                popularProfissionaisSelect();
            }
        });
    });

    carregarPacientes();
    const formPaciente = document.getElementById('formAdicionarPaciente');
    if (formPaciente) {
        formPaciente.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const nome = document.getElementById('nomePaciente').value.trim();
            if (nome) {
                adicionarPacienteNaTela(nome);
                salvarPaciente(nome);
                formPaciente.reset();
            }
        });
    }

    carregarAgendamentos();
    const formAgendamento = document.getElementById('formAgendamento');
    if (formAgendamento) {
        popularPacientesSelect();
        popularProfissionaisSelect();
        formAgendamento.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const agendamento = {
                id: Date.now(),
                paciente: document.getElementById('agendamentoPaciente').value,
                profissional: document.getElementById('agendamentoProfissional').value,
                data: document.getElementById('agendamentoData').value,
                hora: document.getElementById('agendamentoHora').value,
                valor: document.getElementById('agendamentoValor').value
            };
            adicionarAgendamentoNaTabela(agendamento);
            salvarAgendamento(agendamento);
            formAgendamento.reset();
        });
    }

    carregarTransacoes();
    const formTransacao = document.getElementById('formTransacao');
    if(formTransacao) {
        formTransacao.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const transacao = {
                id: Date.now(),
                descricao: document.getElementById('transacaoDescricao').value,
                valor: parseFloat(document.getElementById('transacaoValor').value),
                tipo: document.getElementById('transacaoTipo').value,
                data: document.getElementById('transacaoData').value
            };
            adicionarTransacaoNaTabela(transacao);
            salvarTransacao(transacao);
            atualizarResumo();
            formTransacao.reset();
            document.getElementById('transacaoData').value = new Date().toISOString().slice(0, 10);
        });
        document.getElementById('transacaoData').value = new Date().toISOString().slice(0, 10);
    }

    carregarProfissionais();
    const formProfissional = document.getElementById('formAdicionarProfissional');
    if (formProfissional) {
        formProfissional.addEventListener('submit', (evento) => {
            evento.preventDefault();
            const profissional = {
                nome: document.getElementById('profissionalNome').value.trim(),
                especialidade: document.getElementById('profissionalEspecialidade').value.trim(),
                fotoUrl: document.getElementById('profissionalFotoUrl').value.trim()
            };
            if(profissional.nome && profissional.especialidade){
                adicionarProfissionalNaTela(profissional);
                salvarProfissional(profissional);
                formProfissional.reset();
            }
        });
    }
});

function adicionarPacienteNaTela(nome) { const ul = document.getElementById('listaDeItens'); if (!ul) return; const novoLi = document.createElement('li'); novoLi.textContent = nome; const deleteBtn = document.createElement('button'); deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.onclick = () => excluirPaciente(nome, novoLi); novoLi.appendChild(deleteBtn); ul.appendChild(novoLi); }
function excluirPaciente(nomeParaExcluir, elementoLi) { if (confirm(`Tem certeza que deseja excluir o paciente "${nomeParaExcluir}"?`)) { let pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; pacientes = pacientes.filter(paciente => paciente !== nomeParaExcluir); localStorage.setItem('pacientes', JSON.stringify(pacientes)); elementoLi.remove(); } }
function salvarPaciente(nome) { const pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; if (!pacientes.includes(nome)) { pacientes.push(nome); localStorage.setItem('pacientes', JSON.stringify(pacientes)); } }
function carregarPacientes() { const pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; document.getElementById('listaDeItens').innerHTML = ''; pacientes.forEach(nome => adicionarPacienteNaTela(nome)); }
function filtrarLista() { const input = document.getElementById('caixaDePesquisa'); const filtro = input.value.toUpperCase(); const ul = document.getElementById('listaDeItens'); const li = ul.getElementsByTagName('li'); for (let i = 0; i < li.length; i++) { const textoDoItem = li[i].textContent || li[i].innerText; if (textoDoItem.toUpperCase().indexOf(filtro) > -1) { li[i].style.display = ""; } else { li[i].style.display = "none"; } } }

function adicionarProfissionalNaTela(profissional) { const grid = document.getElementById('profissionais-grid'); if(!grid) return; const card = document.createElement('div'); card.className = 'professional-card'; const fotoUrl = profissional.fotoUrl || 'https://via.placeholder.com/120'; card.innerHTML = `<img src="${fotoUrl}" alt="Foto de ${profissional.nome}"><h3>${profissional.nome}</h3><p>${profissional.especialidade}</p>`; const deleteBtn = document.createElement('button'); deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.onclick = () => excluirProfissional(profissional.nome, card); card.appendChild(deleteBtn); grid.appendChild(card); }
function excluirProfissional(nomeParaExcluir, elementoCard) { if (confirm(`Tem certeza que deseja excluir o profissional "${nomeParaExcluir}"?`)) { let profissionais = JSON.parse(localStorage.getItem('profissionais')) || []; profissionais = profissionais.filter(p => p.nome !== nomeParaExcluir); localStorage.setItem('profissionais', JSON.stringify(profissionais)); elementoCard.remove(); } }
function salvarProfissional(profissional) { const profissionais = JSON.parse(localStorage.getItem('profissionais')) || []; const existe = profissionais.some(p => p.nome === profissional.nome); if (!existe) { profissionais.push(profissional); localStorage.setItem('profissionais', JSON.stringify(profissionais)); } }
function carregarProfissionais() { const profissionais = JSON.parse(localStorage.getItem('profissionais')) || []; document.getElementById('profissionais-grid').innerHTML = ''; profissionais.forEach(p => adicionarProfissionalNaTela(p)); }

function popularPacientesSelect() { const select = document.getElementById('agendamentoPaciente'); if (!select) return; const pacientes = JSON.parse(localStorage.getItem('pacientes')) || []; select.innerHTML = '<option value="">Selecione um Paciente</option>'; pacientes.forEach(nome => { const option = document.createElement('option'); option.value = nome; option.textContent = nome; select.appendChild(option); }); }
function popularProfissionaisSelect() { const select = document.getElementById('agendamentoProfissional'); if (!select) return; const profissionais = JSON.parse(localStorage.getItem('profissionais')) || []; select.innerHTML = '<option value="">Selecione um Profissional</option>'; profissionais.forEach(prof => { const option = document.createElement('option'); option.value = prof.nome; option.textContent = prof.nome; select.appendChild(option); }); }
function adicionarAgendamentoNaTabela(agendamento) { const tabelaBody = document.querySelector('#tabelaAgendamentos tbody'); if (!tabelaBody) return; const novaLinha = document.createElement('tr'); const dataObj = new Date(agendamento.data + 'T00:00:00'); const dataFormatada = dataObj.toLocaleDateString('pt-BR'); novaLinha.innerHTML = `<td>${agendamento.paciente}</td><td>${dataFormatada}</td><td>${agendamento.hora}</td><td>${agendamento.profissional}</td><td>R$ ${parseFloat(agendamento.valor).toFixed(2)}</td><td class="actions-cell"></td>`; const deleteBtn = document.createElement('button'); deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.onclick = () => excluirAgendamento(agendamento.id, novaLinha); novaLinha.querySelector('.actions-cell').appendChild(deleteBtn); tabelaBody.appendChild(novaLinha); }
function excluirAgendamento(idParaExcluir, elementoLinha) { if (confirm('Tem certeza que deseja excluir este agendamento?')) { let agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || []; agendamentos = agendamentos.filter(a => a.id !== idParaExcluir); localStorage.setItem('agendamentos', JSON.stringify(agendamentos)); elementoLinha.remove(); } }
function salvarAgendamento(agendamento) { const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || []; agendamentos.push(agendamento); localStorage.setItem('agendamentos', JSON.stringify(agendamentos)); }
function carregarAgendamentos() { const agendamentos = JSON.parse(localStorage.getItem('agendamentos')) || []; document.querySelector('#tabelaAgendamentos tbody').innerHTML = ''; agendamentos.forEach(agendamento => adicionarAgendamentoNaTabela(agendamento)); }

function formatarMoeda(valor) { return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function atualizarResumo() { const transacoes = JSON.parse(localStorage.getItem('transacoes')) || []; const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((acc, t) => acc + t.valor, 0); const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((acc, t) => acc + t.valor, 0); const saldoTotal = totalEntradas - totalSaidas; document.getElementById('totalEntradas').textContent = formatarMoeda(totalEntradas); document.getElementById('totalSaidas').textContent = formatarMoeda(totalSaidas); document.getElementById('saldoTotal').textContent = formatarMoeda(saldoTotal); }
function adicionarTransacaoNaTabela(transacao) { const tabelaBody = document.querySelector('#tabelaTransacoes tbody'); if(!tabelaBody) return; const novaLinha = document.createElement('tr'); const dataObj = new Date(transacao.data + 'T00:00:00'); const dataFormatada = dataObj.toLocaleDateString('pt-BR'); const valorClasse = transacao.tipo === 'entrada' ? 'valor-entrada' : 'valor-saida'; const tipoTexto = transacao.tipo.charAt(0).toUpperCase() + transacao.tipo.slice(1); novaLinha.innerHTML = `<td>${dataFormatada}</td><td>${transacao.descricao}</td><td class="${valorClasse}">${formatarMoeda(transacao.valor)}</td><td>${tipoTexto}</td><td class="actions-cell"></td>`; const deleteBtn = document.createElement('button'); deleteBtn.className = 'delete-btn'; deleteBtn.innerHTML = '&times;'; deleteBtn.onclick = () => excluirTransacao(transacao.id, novaLinha); novaLinha.querySelector('.actions-cell').appendChild(deleteBtn); tabelaBody.appendChild(novaLinha); }
function excluirTransacao(idParaExcluir, elementoLinha) { if(confirm('Tem certeza que deseja excluir esta transação?')) { let transacoes = JSON.parse(localStorage.getItem('transacoes')) || []; transacoes = transacoes.filter(t => t.id !== idParaExcluir); localStorage.setItem('transacoes', JSON.stringify(transacoes)); elementoLinha.remove(); atualizarResumo(); } } // ATUALIZA O RESUMO APÓS EXCLUIR
function salvarTransacao(transacao) { const transacoes = JSON.parse(localStorage.getItem('transacoes')) || []; transacoes.push(transacao); localStorage.setItem('transacoes', JSON.stringify(transacoes)); }
function carregarTransacoes() { const transacoes = JSON.parse(localStorage.getItem('transacoes')) || []; document.querySelector('#tabelaTransacoes tbody').innerHTML = ''; transacoes.forEach(t => adicionarTransacaoNaTabela(t)); atualizarResumo(); }