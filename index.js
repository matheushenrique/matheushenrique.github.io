class ProjetoUsinaSolar {
    constructor() {
        this.carregarConfiguracoes();
        this.dadosMensais = [];
        this.paginaAtual = 1;
        this.itensPorPagina = 24;
        this.graficos = {};
    }
    
    carregarConfiguracoes() {
        // Parâmetros básicos
        this.tarifaInicial = parseFloat(document.getElementById('tarifaInicial').value);
        this.producaoMensalKwh = parseInt(document.getElementById('producaoMensal').value);
        this.reajusteTarifaAnual = parseFloat(document.getElementById('reajusteTarifa').value) / 100;
        this.periodoAnalise = parseInt(document.getElementById('periodoAnalise').value);
        
        // Custos operacionais
        this.custoOperacional1 = parseFloat(document.getElementById('custoOperacional1').value) / 100;
        this.custoOperacional2 = parseFloat(document.getElementById('custoOperacional2').value) / 100;
        this.custoOperacionalPercentual = this.custoOperacional1 + this.custoOperacional2;
        this.impostoPercentual = parseFloat(document.getElementById('imposto').value) / 100;
        
        // Financiamento do sistema
        this.valorSistema = parseFloat(document.getElementById('valorSistema').value);
        this.mesesCarenciaSistema = parseInt(document.getElementById('carenciaSistema').value);
        this.parcelasSistema = parseInt(document.getElementById('numeroParcelasSistema').value);
        this.valorParcelaSistema = parseFloat(document.getElementById('valorParcelaSistema').value);
        this.mesInicioParcelasSistema = this.mesesCarenciaSistema + 1;
        this.mesFimParcelasSistema = this.mesesCarenciaSistema + this.parcelasSistema;
        
        // Financiamento do terreno (opcional)
        this.financiarTerreno = document.getElementById('financiarTerreno').checked;
        this.valorTerreno = parseFloat(document.getElementById('valorTerreno').value);
        this.mesesCarenciaTerreno = parseInt(document.getElementById('carenciaTerreno').value);
        this.parcelasTerreno = parseInt(document.getElementById('numeroParcelasTerreno').value);
        this.valorParcelaTerreno = parseFloat(document.getElementById('valorParcelaTerreno').value);
        this.mesInicioParcelasTerreno = this.mesesCarenciaTerreno + 1;
        this.mesFimParcelasTerreno = this.mesesCarenciaTerreno + this.parcelasTerreno;
        
        // Custos iniciais
        this.investimentoInicial = {
            cercamento: parseFloat(document.getElementById('cercamento').value),
            portao: parseFloat(document.getElementById('portao').value),
            refletores: parseFloat(document.getElementById('refletores').value),
            cameras: parseFloat(document.getElementById('cameras').value),
            irrigacao: parseFloat(document.getElementById('irrigacao').value)
        };
        
        // Custos mensais
        this.custosMensaisBase = {
            internet: parseFloat(document.getElementById('internet').value),
            taxaIluminacao: parseFloat(document.getElementById('taxaIluminacao').value),
            monitoramento: parseFloat(document.getElementById('monitoramento').value),
            agua: parseFloat(document.getElementById('agua').value),
            contadora: parseFloat(document.getElementById('contadora').value)
        };
        
        this.totalInvestimento = this.calcularTotalInvestimento();
        this.totalCustosMensaisBase = this.calcularTotalCustosMensaisBase();
        this.investimentoTotal = this.calcularInvestimentoTotal();
    }
    
    calcularTotalInvestimento() {
        let total = Object.values(this.investimentoInicial).reduce((sum, val) => sum + val, 0);
        
        // Se não financiar o terreno, adiciona o valor do terreno ao investimento inicial
        if (!this.financiarTerreno) {
            total += this.valorTerreno;
        }
        
        return total;
    }
    
    calcularInvestimentoTotal() {
        // Investimento total = Valor do sistema + Valor do terreno + Custos iniciais
        let total = this.valorSistema + this.valorTerreno + Object.values(this.investimentoInicial).reduce((sum, val) => sum + val, 0);
        return total;
    }
    
    calcularTotalCustosMensaisBase() {
        return Object.values(this.custosMensaisBase).reduce((sum, val) => sum + val, 0);
    }
    
    calcularProjecaoMensal() {
        this.carregarConfiguracoes();
        this.dadosMensais = [];
        let fluxoAcumulado = -this.totalInvestimento;
        let paybackAlcancado = false;
        let mesPayback = 0;
        
        for (let mes = 1; mes <= this.periodoAnalise; mes++) {
            const ano = Math.ceil(mes / 12);
            const mesNoAno = ((mes - 1) % 12) + 1;
            
            // Calcula tarifa com reajuste anual
            const anosDecorridos = (mes - 1) / 12;
            const tarifa = this.tarifaInicial * Math.pow(1 + this.reajusteTarifaAnual, anosDecorridos);
            
            // Receita bruta mensal
            const receitaBrutaMensal = this.producaoMensalKwh * tarifa;
            
            // Custo operacional mensal
            const custoOperacionalMensal = receitaBrutaMensal * this.custoOperacionalPercentual;
            
            // Verifica status do financiamento do sistema
            const periodoCarenciaSistema = mes <= this.mesesCarenciaSistema;
            const financiamentoAtivoSistema = mes >= this.mesInicioParcelasSistema && mes <= this.mesFimParcelasSistema;
            
            // Parcela do sistema
            const parcelaSistemaMensal = financiamentoAtivoSistema ? this.valorParcelaSistema : 0;
            
            // Verifica status do financiamento do terreno (se aplicável)
            let financiamentoAtivoTerreno = false;
            let parcelaTerrenoMensal = 0;
            
            if (this.financiarTerreno) {
                financiamentoAtivoTerreno = mes >= this.mesInicioParcelasTerreno && mes <= this.mesFimParcelasTerreno;
                parcelaTerrenoMensal = financiamentoAtivoTerreno ? this.valorParcelaTerreno : 0;
            }
            
            // Custos fixos mensais
            const custosFixosMensais = this.totalCustosMensaisBase;
            
            // Total de parcelas
            const totalParcelasMensal = parcelaSistemaMensal + parcelaTerrenoMensal;
            
            // Rendimento bruto mensal
            const rendimentoBrutoMensal = receitaBrutaMensal - custoOperacionalMensal - custosFixosMensais - totalParcelasMensal;
            
            // Imposto mensal (apenas se houver lucro)
            const impostoMensal = rendimentoBrutoMensal > 0 ? rendimentoBrutoMensal * this.impostoPercentual : 0;
            
            // Lucro líquido mensal
            const lucroLiquidoMensal = rendimentoBrutoMensal - impostoMensal;
            
            // Porcentagem sobre o investimento total
            const porcentagemInvestimento = (lucroLiquidoMensal / this.investimentoTotal) * 100;
            
            // Fluxo de caixa acumulado
            fluxoAcumulado += lucroLiquidoMensal;
            
            // Verifica payback
            if (!paybackAlcancado && fluxoAcumulado >= 0) {
                paybackAlcancado = true;
                mesPayback = mes;
            }
            
            // Determina status
            let status = 'livre';
            if (periodoCarenciaSistema) {
                status = 'carecia';
            } else if (financiamentoAtivoSistema || financiamentoAtivoTerreno) {
                status = 'parcela';
                if (financiamentoAtivoSistema && financiamentoAtivoTerreno) {
                    status = 'terreno';
                }
            }
            
            this.dadosMensais.push({
                mes,
                ano,
                mesNoAno,
                tarifa: this.arredondar(tarifa, 4),
                receitaBrutaMensal: this.arredondar(receitaBrutaMensal, 2),
                custoOperacionalMensal: this.arredondar(custoOperacionalMensal, 2),
                custosFixosMensais: this.arredondar(custosFixosMensais, 2),
                parcelaSistemaMensal: this.arredondar(parcelaSistemaMensal, 2),
                parcelaTerrenoMensal: this.arredondar(parcelaTerrenoMensal, 2),
                totalParcelasMensal: this.arredondar(totalParcelasMensal, 2),
                rendimentoBrutoMensal: this.arredondar(rendimentoBrutoMensal, 2),
                impostoMensal: this.arredondar(impostoMensal, 2),
                lucroLiquidoMensal: this.arredondar(lucroLiquidoMensal, 2),
                porcentagemInvestimento: this.arredondar(porcentagemInvestimento, 3),
                fluxoAcumulado: this.arredondar(fluxoAcumulado, 2),
                periodoCarenciaSistema,
                financiamentoAtivoSistema,
                financiamentoAtivoTerreno,
                status
            });
        }
        
        return {
            dados: this.dadosMensais,
            paybackMes: paybackAlcancado ? mesPayback : null,
            totalMeses: this.periodoAnalise
        };
    }
    
    calcularIndicadores() {
        const lucroTotal = this.dadosMensais.reduce((sum, d) => sum + d.lucroLiquidoMensal, 0);
        const roiPercent = (lucroTotal / this.totalInvestimento) * 100;
        
        // Lucro durante carência
        const lucroDuranteCarencia = this.dadosMensais
            .filter(d => d.periodoCarenciaSistema)
            .reduce((sum, d) => sum + d.lucroLiquidoMensal, 0);
        
        // Lucro após financiamento
        const ultimoMesFinanciamento = Math.max(this.mesFimParcelasSistema, this.mesFimParcelasTerreno);
        const lucroPosFinanciamento = this.dadosMensais
            .filter(d => d.mes > ultimoMesFinanciamento)
            .reduce((sum, d) => sum + d.lucroLiquidoMensal, 0);
        
        // Porcentagem média mensal sobre investimento
        const porcentagemMedia = this.dadosMensais.reduce((sum, d) => sum + d.porcentagemInvestimento, 0) / this.dadosMensais.length;
        
        return {
            investimentoTotal: this.investimentoTotal,
            financiarTerreno: this.financiarTerreno,
            valorParcelaTerreno: this.valorParcelaTerreno,
            roiTotal: this.arredondar(roiPercent, 1),
            lucroTotal: this.arredondar(lucroTotal, 2),
            lucroDuranteCarencia: this.arredondar(lucroDuranteCarencia, 2),
            lucroPosFinanciamento: this.arredondar(lucroPosFinanciamento, 2),
            porcentagemMedia: this.arredondar(porcentagemMedia, 3)
        };
    }
    
    arredondar(valor, casasDecimais) {
        const factor = Math.pow(10, casasDecimais);
        return Math.round(valor * factor) / factor;
    }
    
    formatarMoeda(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    }
    
    formatarNumero(valor, casasDecimais = 2) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: casasDecimais,
            maximumFractionDigits: casasDecimais
        }).format(valor);
    }
    
    formatarPorcentagem(valor, casasDecimais = 3) {
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: casasDecimais,
            maximumFractionDigits: casasDecimais
        }).format(valor) + '%';
    }
}

// Instância global e variáveis
let projeto = new ProjetoUsinaSolar();
let dadosProjecao = null;

// Função para mostrar/ocultar campos do terreno
function toggleFinanciamentoTerreno() {
    const checkbox = document.getElementById('financiarTerreno');
    const camposTerreno = document.getElementById('camposTerreno');
    const cardTerreno = document.getElementById('cardTerreno');
    const thParcelaTerreno = document.getElementById('thParcelaTerreno');
    
    if (checkbox.checked) {
        camposTerreno.style.display = 'block';
        cardTerreno.style.display = 'block';
        thParcelaTerreno.style.display = 'table-cell';
    } else {
        camposTerreno.style.display = 'none';
        cardTerreno.style.display = 'none';
        thParcelaTerreno.style.display = 'none';
    }
    
    calcularProjecao();
}

// Inicialização
function inicializar() {
    calcularProjecao();
    configurarEventos();
}

function configurarEventos() {
    // Eventos para inputs numéricos
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value === '' || this.value < 0) {
                this.value = 0;
            }
            calcularProjecao();
        });
        
        input.addEventListener('input', function() {
            if (this.value === '' || this.value < 0) {
                this.value = 0;
            }
        });
    });
    
    // Evento para checkbox do terreno
    document.getElementById('financiarTerreno').addEventListener('change', toggleFinanciamentoTerreno);
    
    // Evento para select de itens por página
    document.getElementById('itensPorPagina').addEventListener('change', function() {
        projeto.itensPorPagina = parseInt(this.value);
        projeto.paginaAtual = 1;
        atualizarTabela();
    });
}

function calcularProjecao() {
    dadosProjecao = projeto.calcularProjecaoMensal();
    atualizarResumo();
    atualizarTabela();
    atualizarGraficos();
}

function atualizarResumo() {
    const indicadores = projeto.calcularIndicadores();
    const paybackAnos = dadosProjecao.paybackMes ? Math.floor(dadosProjecao.paybackMes / 12) : 0;
    const paybackMeses = dadosProjecao.paybackMes ? dadosProjecao.paybackMes % 12 : 0;
    
    document.getElementById('investimentoTotal').textContent = projeto.formatarMoeda(indicadores.investimentoTotal);
    document.getElementById('payback').textContent = dadosProjecao.paybackMes ? 
        `${paybackAnos} anos e ${paybackMeses} meses` : 'Não alcançado';
    document.getElementById('roi').textContent = `${indicadores.roiTotal}%`;
    document.getElementById('lucroTotal').textContent = projeto.formatarMoeda(indicadores.lucroTotal);
    
    if (indicadores.financiarTerreno) {
        document.getElementById('parcelaTerreno').textContent = projeto.formatarMoeda(indicadores.valorParcelaTerreno);
    }
}

function atualizarTabela() {
    if (!dadosProjecao || !dadosProjecao.dados.length) return;
    
    const tbody = document.getElementById('tabelaBody');
    const inicio = (projeto.paginaAtual - 1) * projeto.itensPorPagina;
    const fim = inicio + projeto.itensPorPagina;
    const dadosPagina = dadosProjecao.dados.slice(inicio, fim);
    
    tbody.innerHTML = dadosPagina.map(dado => `
        <tr>
            <td class="neutral">${dado.mes}</td>
            <td class="neutral">${dado.ano}</td>
            <td class="neutral">${projeto.formatarNumero(dado.tarifa, 4)}</td>
            <td class="positive">${projeto.formatarMoeda(dado.receitaBrutaMensal)}</td>
            <td class="negative">${projeto.formatarMoeda(dado.custoOperacionalMensal)}</td>
            <td class="negative">${projeto.formatarMoeda(dado.custosFixosMensais)}</td>
            <td class="negative">${projeto.formatarMoeda(dado.parcelaSistemaMensal)}</td>
            ${projeto.financiarTerreno ? `
                <td class="negative">${projeto.formatarMoeda(dado.parcelaTerrenoMensal)}</td>
            ` : ''}
            <td class="${dado.rendimentoBrutoMensal >= 0 ? 'positive' : 'negative'}">
                ${projeto.formatarMoeda(dado.rendimentoBrutoMensal)}
            </td>
            <td class="negative">${projeto.formatarMoeda(dado.impostoMensal)}</td>
            <td class="${dado.lucroLiquidoMensal >= 0 ? 'positive' : 'negative'}">
                ${projeto.formatarMoeda(dado.lucroLiquidoMensal)}
            </td>
            <td class="percentage ${dado.porcentagemInvestimento >= 0 ? 'positive' : 'negative'}">
                ${projeto.formatarPorcentagem(dado.porcentagemInvestimento)}
            </td>
            <td class="${dado.fluxoAcumulado >= 0 ? 'positive' : 'negative'}">
                ${projeto.formatarMoeda(dado.fluxoAcumulado)}
            </td>
            <td>
                <span class="status-dot status-${dado.status}"></span>
                ${dado.status === 'carecia' ? 'Carência' : 
                  dado.status === 'parcela' ? 'Parcela' :
                  dado.status === 'terreno' ? 'Terreno' : 'Livre'}
            </td>
        </tr>
    `).join('');
    
    // Atualizar informação de paginação
    const totalPaginas = Math.ceil(dadosProjecao.dados.length / projeto.itensPorPagina);
    document.getElementById('infoPagina').textContent = 
        `Página ${projeto.paginaAtual} de ${totalPaginas}`;
}

function mudarPagina(direcao) {
    if (!dadosProjecao) return;
    
    const totalPaginas = Math.ceil(dadosProjecao.dados.length / projeto.itensPorPagina);
    const novaPagina = projeto.paginaAtual + direcao;
    
    if (novaPagina >= 1 && novaPagina <= totalPaginas) {
        projeto.paginaAtual = novaPagina;
        atualizarTabela();
    }
}

function atualizarGraficos() {
    if (!dadosProjecao || !dadosProjecao.dados.length) return;
    
    const meses = dadosProjecao.dados.map(d => d.mes);
    const lucros = dadosProjecao.dados.map(d => d.lucroLiquidoMensal);
    const fluxoAcumulado = dadosProjecao.dados.map(d => d.fluxoAcumulado);
    const porcentagens = dadosProjecao.dados.map(d => d.porcentagemInvestimento);
    
    // Destruir gráficos existentes
    Object.values(projeto.graficos).forEach(grafico => {
        if (grafico) grafico.destroy();
    });
    
    // Gráfico 1: Lucro Mensal
    projeto.graficos.lucroMensal = new Chart(document.getElementById('graficoLucroMensal'), {
        type: 'bar',
        data: {
            labels: meses.slice(0, 60),
            datasets: [{
                label: 'Lucro Líquido Mensal (R$)',
                data: lucros.slice(0, 60),
                backgroundColor: lucros.slice(0, 60).map(l => l >= 0 ? 'rgba(39, 174, 96, 0.8)' : 'rgba(231, 76, 60, 0.8)'),
                borderColor: lucros.slice(0, 60).map(l => l >= 0 ? '#27ae60' : '#e74c3c'),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: 'Reais (R$)' }
                },
                x: {
                    title: { display: true, text: 'Meses' },
                    ticks: { maxTicksLimit: 12 }
                }
            }
        }
    });
    
    // Gráfico 2: Porcentagem sobre Investimento
    projeto.graficos.porcentagemInvestimento = new Chart(document.getElementById('graficoPorcentagemInvestimento'), {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: '% sobre Investimento Mensal',
                data: porcentagens,
                borderColor: '#2980b9',
                backgroundColor: 'rgba(41, 128, 185, 0.1)',
                borderWidth: 3,
                fill: true,
                pointBackgroundColor: porcentagens.map(p => p >= 0 ? '#27ae60' : '#e74c3c'),
                pointBorderColor: porcentagens.map(p => p >= 0 ? '#219a52' : '#c0392b')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    title: { display: true, text: 'Porcentagem (%)' }
                },
                x: {
                    title: { display: true, text: 'Meses' },
                    ticks: { maxTicksLimit: 10 }
                }
            }
        }
    });
    
    // Gráfico 3: Fluxo Acumulado
    projeto.graficos.fluxoAcumulado = new Chart(document.getElementById('graficoFluxoAcumulado'), {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Fluxo de Caixa Acumulado (R$)',
                data: fluxoAcumulado,
                borderColor: '#9b59b6',
                backgroundColor: 'rgba(155, 89, 182, 0.1)',
                borderWidth: 3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { title: { display: true, text: 'Reais (R$)' } },
                x: { title: { display: true, text: 'Meses' }, ticks: { maxTicksLimit: 10 } }
            }
        }
    });
    
    // Gráfico 4: Composição (mês 18 como exemplo)
    const mesExemplo = Math.min(18, dadosProjecao.dados.length - 1);
    const dadoExemplo = dadosProjecao.dados[mesExemplo];
    
    const labelsComposicao = ['Receita Bruta', 'Custo Operacional', 'Custos Fixos', 'Parcela Sistema'];
    const dadosComposicao = [
        dadoExemplo.receitaBrutaMensal,
        dadoExemplo.custoOperacionalMensal,
        dadoExemplo.custosFixosMensais,
        dadoExemplo.parcelaSistemaMensal
    ];
    
    if (projeto.financiarTerreno) {
        labelsComposicao.push('Parcela Terreno');
        dadosComposicao.push(dadoExemplo.parcelaTerrenoMensal);
    }
    
    labelsComposicao.push('Imposto', 'Lucro Líquido');
    dadosComposicao.push(dadoExemplo.impostoMensal, Math.max(0, dadoExemplo.lucroLiquidoMensal));
    
    projeto.graficos.composicao = new Chart(document.getElementById('graficoComposicao'), {
        type: 'doughnut',
        data: {
            labels: labelsComposicao,
            datasets: [{
                data: dadosComposicao,
                backgroundColor: [
                    '#3498db', '#e74c3c', '#f39c12', '#e67e22', 
                    projeto.financiarTerreno ? '#d35400' : '#9b59b6', 
                    '#9b59b6', '#27ae60'
                ].slice(0, labelsComposicao.length)
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Composição - Mês ${mesExemplo + 1}`
                }
            }
        }
    });
}

function exportarExcel() {
    if (!dadosProjecao) {
        alert('Calcule a projeção primeiro!');
        return;
    }
    
    const wb = XLSX.utils.book_new();
    
    // Dados gerais
    const dadosGerais = [
        ['MICRO USINA SOLAR - RELATÓRIO FINANCEIRO COMPLETO'],
        ['Data', new Date().toLocaleDateString('pt-BR')],
        [''],
        ['PARÂMETROS CONFIGURADOS'],
        ['Tarifa inicial (R$/kWh)', projeto.tarifaInicial],
        ['Produção mensal (kWh)', projeto.producaoMensalKwh],
        ['Reajuste tarifário anual', `${(projeto.reajusteTarifaAnual * 100)}%`],
        ['Custo operacional total', `${(projeto.custoOperacionalPercentual * 100)}%`],
        ['Imposto', `${(projeto.impostoPercentual * 100)}%`],
        ['Período de análise', `${projeto.periodoAnalise} meses`],
        ['Financiar terreno', projeto.financiarTerreno ? 'Sim' : 'Não'],
        [''],
        ['INVESTIMENTO TOTAL'],
        ['Valor do sistema', projeto.formatarMoeda(projeto.valorSistema)],
        ['Valor do terreno', projeto.formatarMoeda(projeto.valorTerreno)],
        ['Custos iniciais', projeto.formatarMoeda(projeto.totalInvestimento - (projeto.financiarTerreno ? 0 : projeto.valorTerreno))],
        ['Total investimento', projeto.formatarMoeda(projeto.investimentoTotal)],
        ['']
    ];
    
    if (projeto.financiarTerreno) {
        dadosGerais.push(
            ['FINANCIAMENTO DO TERRENO'],
            ['Carência', `${projeto.mesesCarenciaTerreno} meses`],
            ['Parcelas', `${projeto.parcelasTerreno}x de ${projeto.formatarMoeda(projeto.valorParcelaTerreno)}`],
            ['']
        );
    }
    
    dadosGerais.push(
        ['FINANCIAMENTO DO SISTEMA'],
        ['Carência', `${projeto.mesesCarenciaSistema} meses`],
        ['Parcelas', `${projeto.parcelasSistema}x de ${projeto.formatarMoeda(projeto.valorParcelaSistema)}`]
    );
    
    const wsDados = XLSX.utils.aoa_to_sheet(dadosGerais);
    XLSX.utils.book_append_sheet(wb, wsDados, "Configurações");
    
    // Dados mensais
    const dadosFormatados = dadosProjecao.dados.map(d => {
        const base = {
            'Mês': d.mes,
            'Ano': d.ano,
            'Tarifa (R$/kWh)': d.tarifa,
            'Receita Bruta (R$)': d.receitaBrutaMensal,
            'Custo Operacional (R$)': d.custoOperacionalMensal,
            'Custos Fixos (R$)': d.custosFixosMensais,
            'Parcela Sistema (R$)': d.parcelaSistemaMensal,
            'Rendimento Bruto (R$)': d.rendimentoBrutoMensal,
            'Imposto (R$)': d.impostoMensal,
            'Lucro Líquido (R$)': d.lucroLiquidoMensal,
            '% sobre Investimento': d.porcentagemInvestimento,
            'Fluxo Acumulado (R$)': d.fluxoAcumulado,
            'Status': d.status === 'carecia' ? 'Carência' : 
                     d.status === 'parcela' ? 'Parcela' :
                     d.status === 'terreno' ? 'Terreno' : 'Livre'
        };
        
        if (projeto.financiarTerreno) {
            base['Parcela Terreno (R$)'] = d.parcelaTerrenoMensal;
        }
        
        return base;
    });
    
    const wsProjecao = XLSX.utils.json_to_sheet(dadosFormatados);
    XLSX.utils.book_append_sheet(wb, wsProjecao, "Projeção Mensal");
    
    // Salvar
    XLSX.writeFile(wb, `usina_solar_${new Date().toISOString().split('T')[0]}.xlsx`);
}

async function exportarPDF() {
    if (!dadosProjecao) {
        alert('Calcule a projeção primeiro!');
        return;
    }
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('RELATÓRIO - MICRO USINA SOLAR', 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 105, 30, { align: 'center' });
    
    // Resumo
    let y = 50;
    doc.setFontSize(16);
    doc.text('RESUMO EXECUTIVO', 20, y);
    y += 10;
    
    doc.setFontSize(10);
    const indicadores = projeto.calcularIndicadores();
    const payback = dadosProjecao.paybackMes ? 
        `${Math.floor(dadosProjecao.paybackMes / 12)} anos e ${dadosProjecao.paybackMes % 12} meses` : 
        'Não alcançado';
    
    const resumo = [
        `Investimento Total: ${projeto.formatarMoeda(indicadores.investimentoTotal)}`,
        `Financiar terreno: ${indicadores.financiarTerreno ? 'Sim' : 'Não'}`,
        `Carência: ${projeto.mesesCarenciaSistema} meses`,
        `Payback: ${payback}`,
        `ROI Total: ${indicadores.roiTotal}%`,
        `Porcentagem média mensal: ${projeto.formatarPorcentagem(indicadores.porcentagemMedia)}`,
        `Lucro Total: ${projeto.formatarMoeda(indicadores.lucroTotal)}`
    ];
    
    if (indicadores.financiarTerreno) {
        resumo.splice(2, 0, `Parcela terreno: ${projeto.formatarMoeda(indicadores.valorParcelaTerreno)}/mês`);
    }
    
    resumo.forEach((linha, index) => {
        doc.text(linha, 20, y + (index * 7));
    });
    
    y += 70;
    
    // Gráfico
    try {
        const canvas = await html2canvas(document.querySelector('.charts-container'));
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        doc.addImage(imgData, 'PNG', 20, y, imgWidth, imgHeight);
    } catch (error) {
        console.error('Erro ao gerar gráfico PDF:', error);
        doc.text('Erro ao gerar gráficos', 20, y);
    }
    
    // Salvar PDF
    doc.save(`usina_solar_${new Date().toISOString().split('T')[0]}.pdf`);
}

function resetarValores() {
    if (confirm('Deseja resetar todos os valores para os padrões originais?')) {
        document.getElementById('tarifaInicial').value = '0.93';
        document.getElementById('producaoMensal').value = '6000';
        document.getElementById('reajusteTarifa').value = '10';
        document.getElementById('periodoAnalise').value = '120';
        
        document.getElementById('custoOperacional1').value = '20';
        document.getElementById('custoOperacional2').value = '12.5';
        document.getElementById('imposto').value = '6';
        
        document.getElementById('valorSistema').value = '120000';
        document.getElementById('carenciaSistema').value = '12';
        document.getElementById('numeroParcelasSistema').value = '60';
        document.getElementById('valorParcelaSistema').value = '3493.08';
        
        // Resetar financiamento do terreno
        document.getElementById('financiarTerreno').checked = false;
        document.getElementById('valorTerreno').value = '50000';
        document.getElementById('carenciaTerreno').value = '12';
        document.getElementById('numeroParcelasTerreno').value = '60';
        document.getElementById('valorParcelaTerreno').value = '1455.45';
        toggleFinanciamentoTerreno();
        
        document.getElementById('cercamento').value = '6000';
        document.getElementById('portao').value = '3000';
        document.getElementById('refletores').value = '200';
        document.getElementById('cameras').value = '800';
        document.getElementById('irrigacao').value = '500';
        
        document.getElementById('internet').value = '100';
        document.getElementById('taxaIluminacao').value = '100';
        document.getElementById('monitoramento').value = '100';
        document.getElementById('agua').value = '50';
        document.getElementById('contadora').value = '300';
        
        calcularProjecao();
    }
}

function toggleConfig() {
    const configGrid = document.getElementById('configGrid');
    const toggleBtn = document.querySelector('.toggle-config');
    
    if (configGrid.style.display === 'none') {
        configGrid.style.display = 'grid';
        toggleBtn.textContent = '⚙️ Ocultar Configurações';
    } else {
        configGrid.style.display = 'none';
        toggleBtn.textContent = '⚙️ Mostrar Configurações';
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', inicializar);