// app.js
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const minutaForm = document.getElementById('minuta-form');
    const timerButton = document.getElementById('btn-timer');
    const totalMinutas = document.getElementById('total-minutas');
    const tempoTotal = document.getElementById('tempo-total');
    const tipoList = document.getElementById('tipo-list');
    const historyBody = document.getElementById('history-body');
    const dateDisplay = document.getElementById('date-display');
    const tempoInput = document.getElementById('tempo');
    
    // Variáveis para controle do cronômetro
    let timerStarted = false;
    let startTime;
    let timerInterval;
    
    // Exibir data atual
    updateDateDisplay();
    
    // Carregar dados salvos
    loadSavedData();
    
    // Event Listeners
    minutaForm.addEventListener('submit', handleFormSubmit);
    timerButton.addEventListener('click', toggleTimer);
    
    // Funções
    function updateDateDisplay() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('pt-BR', options);
    }
    
    function handleFormSubmit(e) {
        e.preventDefault();
        
        // Se o cronômetro estiver ativo, pará-lo e usar o tempo registrado
        if (timerStarted) {
            toggleTimer();
        }
        
        // Obter valores do formulário
        const processo = document.getElementById('processo').value;
        const tipo = document.getElementById('tipo').value;
        const complexidade = document.getElementById('complexidade').value;
        const tempo = parseInt(document.getElementById('tempo').value);
        const observacoes = document.getElementById('observacoes').value;
        
        // Criar objeto com os dados
        const registro = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            processo,
            tipo,
            complexidade,
            tempo,
            observacoes
        };
        
        // Salvar o registro
        saveRegistro(registro);
        
        // Atualizar a interface
        updateStats();
        addRegistroToTable(registro);
        
        // Limpar o formulário
        minutaForm.reset();
    }
    
    function toggleTimer() {
        if (!timerStarted) {
            // Iniciar cronômetro
            startTime = Date.now();
            timerButton.textContent = 'Parar Cronômetro';
            timerButton.classList.add('active');
            
            // Atualizar a cada segundo
            timerInterval = setInterval(updateTimerDisplay, 1000);
            timerStarted = true;
        } else {
            // Parar cronômetro
            clearInterval(timerInterval);
            const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
            tempoInput.value = elapsedMinutes > 0 ? elapsedMinutes : 1;
            
            timerButton.textContent = 'Iniciar Cronômetro';
            timerButton.classList.remove('active');
            timerStarted = false;
        }
    }
    
    function updateTimerDisplay() {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;
        timerButton.textContent = `Cronômetro: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    function saveRegistro(registro) {
        // Obter registros existentes
        let registros = JSON.parse(localStorage.getItem('produtividade-registros')) || [];
        
        // Adicionar novo registro
        registros.push(registro);
        
        // Salvar no localStorage
        localStorage.setItem('produtividade-registros', JSON.stringify(registros));
    }
    
    function loadSavedData() {
        // Carregar registros do localStorage
        const registros = JSON.parse(localStorage.getItem('produtividade-registros')) || [];
        
        // Adicionar registros à tabela
        registros.forEach(registro => {
            addRegistroToTable(registro);
        });
        
        // Atualizar estatísticas
        updateStats();
    }
    
    function updateStats() {
        const registros = JSON.parse(localStorage.getItem('produtividade-registros')) || [];
        
        // Filtrar registros de hoje
        const hoje = new Date().toISOString().split('T')[0];
        const registrosHoje = registros.filter(r => r.timestamp.startsWith(hoje));
        
        // Calcular estatísticas
        const total = registrosHoje.length;
        const tempoTotalMin = registrosHoje.reduce((sum, r) => sum + r.tempo, 0);
        
        // Contar por tipo
        const tipoCount = {
            sentenca: registrosHoje.filter(r => r.tipo === 'sentenca').length,
            despacho: registrosHoje.filter(r => r.tipo === 'despacho').length,
            decisao: registrosHoje.filter(r => r.tipo === 'decisao').length
        };
        
        // Atualizar a interface
        totalMinutas.textContent = total;
        tempoTotal.textContent = `${tempoTotalMin} min`;
        tipoList.innerHTML = `
            <li>Sentenças: ${tipoCount.sentenca}</li>
            <li>Despachos: ${tipoCount.despacho}</li>
            <li>Decisões: ${tipoCount.decisao}</li>
        `;
    }
    
    function addRegistroToTable(registro) {
        const row = document.createElement('tr');
        
        // Formatar data/hora
        const dataHora = new Date(registro.timestamp);
        const dataFormatada = dataHora.toLocaleDateString('pt-BR');
        const horaFormatada = dataHora.toLocaleTimeString('pt-BR');
        
        // Traduzir tipo e complexidade
        const tipoTraduzido = {
            'sentenca': 'Sentença',
            'despacho': 'Despacho',
            'decisao': 'Decisão'
        }[registro.tipo] || registro.tipo;
        
        const complexidadeTraduzida = {
            'baixa': 'Baixa',
            'media': 'Média',
            'alta': 'Alta'
        }[registro.complexidade] || registro.complexidade;
        
        // Preencher células
        row.innerHTML = `
            <td>${dataFormatada} ${horaFormatada}</td>
            <td>${registro.processo}</td>
            <td>${tipoTraduzido}</td>
            <td>${complexidadeTraduzida}</td>
            <td>${registro.tempo} min</td>
            <td>
                <button class="btn-delete" data-id="${registro.id}">Excluir</button>
            </td>
        `;
        
        // Adicionar evento de exclusão
        row.querySelector('.btn-delete').addEventListener('click', function() {
            deleteRegistro(registro.id);
            row.remove();
            updateStats();
        });
        
        // Adicionar à tabela
        historyBody.prepend(row);
    }
    
    function deleteRegistro(id) {
        // Obter registros existentes
        let registros = JSON.parse(localStorage.getItem('produtividade-registros')) || [];
        
        // Filtrar o registro a ser excluído
        registros = registros.filter(r => r.id !== id);
        
        // Salvar no localStorage
        localStorage.setItem('produtividade-registros', JSON.stringify(registros));
    }
});