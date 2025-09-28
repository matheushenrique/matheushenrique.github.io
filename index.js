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
        
        // Financiamento do sistema - calculado automaticamente
        this.parcelasSistema = parseInt(document.getElementById('numeroParcelasSistema').value);
        this.valorParcelaSistema = parseFloat(document.getElementById('valorParcelaSistema').value);
        this.valorSistema = this.parcelasSistema * this.valorParcelaSistema;
        
        this.mesesCarenciaSistema = parseInt(document.getElementById('carenciaSistema').value);
        this.mesInicioParcelasSistema = this.mesesCarenciaSistema + 1;
        this.mesFimParcelasSistema = this.mesesCarenciaSistema + this.parcelasSistema;
        
        // Financiamento do terreno (opcional) - calculado automaticamente
        this.financiarTerreno = document.getElementById('financiarTerreno').checked;
        this.parcelasTerreno = parseInt(document.getElementById('numeroParcelasTerreno').value);
        this.valorParcelaTerreno = parseFloat(document.getElementById('valorParcelaTerreno').value);
        this.valorTerreno = this.parcelasTerreno * this.valorParcelaTerreno;
        
        this.mesesCarenciaTerreno = parseInt(document.getElementById('carenciaTerreno').value);
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
        
        // Atualizar os campos calculados
        this.atualizarValoresCalculados();
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
    
    atualizarValoresCalculados() {
        // Atualizar valor do sistema calculado
        const valorSistemaElement = document.getElementById('valorSistemaCalculado');
        valorSistemaElement.textContent = this.formatarMoeda(this.valorSistema);
        
        // Atualizar valor do terreno calculado
        const valorTerrenoElement = document.getElementById('valorTerrenoCalculado');
        valorTerrenoElement.textContent = this.formatarMoeda(this.valorTerreno);
        
        // Atualizar investimento total
        const investimentoTotalElement = document.getElementById('investimentoTotal');
        investimentoTotalElement.textContent = this.formatarMoeda(this.investimentoTotal);
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
            
            // Custos operacionais (percentual da receita)
            const custoOperacionalMensal = receitaBrutaMensal * this.custoOperacionalPercentual;
            
            // Custos fixos mensais
            const custosFixosMensais = this.totalCustosMensaisBase;
            
            // Parcela do sistema
            let parcelaSistema = 0;
            if (mes >= this.mesInicioParcelasSistema && mes <= this.mesFimParcelasSistema) {
                parcelaSistema = this.valorParcelaSistema;
            }
            
            // Parcela do terreno (se financiado)
            let parcelaTerreno = 0;
            if (this.financiarTerreno && mes >= this.mesInicioParcelasTerreno && mes <= this.mesFimParcelasTerreno) {
                parcelaTerreno = this.valorParcelaTerreno;
            }
            
            // Rendimento bruto
            const rendimentoBruto = receitaBrutaMensal - custoOperacionalMensal - custosFixosMensais - parcelaSistema - parcelaTerreno;
            
            // Imposto (sobre o rendimento bruto, se positivo)
            let imposto = 0;
            if (rendimentoBruto > 0) {
                imposto = rendimentoBruto * this.impostoPercentual;
            }
            
            // Lucro líquido
            const lucroLiquido = rendimentoBruto - imposto;
            
            // Porcentagem sobre investimento
            const porcentagemInvestimento = this.investimentoTotal > 0 ? (lucroLiquido / this.investimentoTotal) * 100 : 0;
            
            // Fluxo acumulado
            fluxoAcumulado += lucroLiquido;
            
            // Verifica payback
            if (!paybackAlcancado && fluxoAcumulado >= 0) {
                paybackAlcancado = true;
                mesPayback = mes;
            }
            
            // Status
            let status = '';
            if (mes < this.mesInicioParcelasSistema) {
                status = '<span class="status-dot status-carecia"></span>Carência';
            } else if (mes <= this.mesFimParcelasSistema) {
                status = '<span class="status-dot status-parcela"></span>Parcela';
            } else {
                status = '<span class="status-dot status-livre"></span>Livre';
            }
            
            if (this.financiarTerreno) {
                if (mes < this.mesInicioParcelasTerreno) {
                    status += ' <span class="status-dot status-carecia"></span>Carência Terreno';
                } else if (mes <= this.mesFimParcelasTerreno) {
                    status += ' <span class="status-dot status-terreno"></span>Parcela Terreno';
                }
            }
            
            this.dadosMensais.push({
                mes,
                ano,
                mesNoAno,
                tarifa,
                receitaBrutaMensal,
                custoOperacionalMensal,
                custosFixosMensais,
                parcelaSistema,
                parcelaTerreno,
                rendimentoBruto,
                imposto,
                lucroLiquido,
                porcentagemInvestimento,
                fluxoAcumulado,
                status
            });
        }
        
        this.atualizarResumo(fluxoAcumulado, mesPayback);
        return this.dadosMensais;
    }
    
    atualizarResumo(fluxoAcumulado, mesPayback) {
        const paybackElement = document.getElementById('payback');
        const roiElement = document.getElementById('roi');
        const parcelaTerrenoElement = document.getElementById('parcelaTerreno');
        const lucroTotalElement = document.getElementById('lucroTotal');
        const investimentoTotalElement = document.getElementById('investimentoTotal');
        investimentoTotalElement.textContent = this.formatarMoeda(this.investimentoTotal);
        
        // Formatar valores
        lucroTotalElement.textContent = this.formatarMoeda(fluxoAcumulado);
        
        // Calcular ROI
        const roi = ((fluxoAcumulado / this.investimentoTotal) * 100).toFixed(1);
        roiElement.textContent = `${roi}%`;
        
        // Payback
        if (mesPayback > 0) {
            const anosPayback = Math.floor(mesPayback / 12);
            const mesesPayback = mesPayback % 12;
            let paybackText = '';
            if (anosPayback > 0) {
                paybackText += `${anosPayback} ano${anosPayback > 1 ? 's' : ''}`;
            }
            if (mesesPayback > 0) {
                paybackText += `${paybackText ? ' e ' : ''}${mesesPayback} mês${mesesPayback > 1 ? 'es' : ''}`;
            }
            paybackElement.textContent = paybackText;
        } else {
            paybackElement.textContent = 'Não alcançado';
        }
        
        // Parcela do terreno
        if (this.financiarTerreno) {
            parcelaTerrenoElement.textContent = this.formatarMoeda(this.valorParcelaTerreno);
        }
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
    
    atualizarTabela() {
        const tabelaBody = document.getElementById('tabelaBody');
        const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
        const fim = inicio + this.itensPorPagina;
        const dadosPagina = this.dadosMensais.slice(inicio, fim);
        
        tabelaBody.innerHTML = '';
        
        dadosPagina.forEach(dado => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${dado.mes}</td>
                <td>${dado.ano}</td>
                <td>${this.formatarNumero(dado.tarifa, 4)}</td>
                <td class="positive">${this.formatarMoeda(dado.receitaBrutaMensal)}</td>
                <td class="negative">${this.formatarMoeda(dado.custoOperacionalMensal)}</td>
                <td class="negative">${this.formatarMoeda(dado.custosFixosMensais)}</td>
                <td class="negative">${this.formatarMoeda(dado.parcelaSistema)}</td>
                ${this.financiarTerreno ? `<td class="negative">${this.formatarMoeda(dado.parcelaTerreno)}</td>` : ''}
                <td class="${dado.rendimentoBruto >= 0 ? 'positive' : 'negative'}">${this.formatarMoeda(dado.rendimentoBruto)}</td>
                <td class="negative">${this.formatarMoeda(dado.imposto)}</td>
                <td class="${dado.lucroLiquido >= 0 ? 'positive' : 'negative'}">${this.formatarMoeda(dado.lucroLiquido)}</td>
                <td class="percentage">${this.formatarNumero(dado.porcentagemInvestimento, 2)}%</td>
                <td class="${dado.fluxoAcumulado >= 0 ? 'positive' : 'negative'}">${this.formatarMoeda(dado.fluxoAcumulado)}</td>
                <td>${dado.status}</td>
            `;
            
            tabelaBody.appendChild(tr);
        });
        
        // Atualizar informações da paginação
        const totalPaginas = Math.ceil(this.dadosMensais.length / this.itensPorPagina);
        document.getElementById('infoPagina').textContent = `Página ${this.paginaAtual} de ${totalPaginas}`;
    }
    
    criarGraficos() {
        const ctxLucroMensal = document.getElementById('graficoLucroMensal').getContext('2d');
        const ctxPorcentagem = document.getElementById('graficoPorcentagemInvestimento').getContext('2d');
        const ctxFluxoAcumulado = document.getElementById('graficoFluxoAcumulado').getContext('2d');
        const ctxComposicao = document.getElementById('graficoComposicao').getContext('2d');
        
        // Destruir gráficos existentes
        Object.values(this.graficos).forEach(grafico => {
            if (grafico) grafico.destroy();
        });
        
        // Dados para os gráficos
        const meses = this.dadosMensais.map(d => `Mês ${d.mes}`);
        const lucrosMensais = this.dadosMensais.map(d => d.lucroLiquido);
        const porcentagensInvestimento = this.dadosMensais.map(d => d.porcentagemInvestimento);
        const fluxosAcumulados = this.dadosMensais.map(d => d.fluxoAcumulado);
        
        // Gráfico de Lucro Mensal
        this.graficos.lucroMensal = new Chart(ctxLucroMensal, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Lucro Líquido Mensal (R$)',
                    data: lucrosMensais,
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução do Lucro Mensal'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de Porcentagem sobre Investimento
        this.graficos.porcentagemInvestimento = new Chart(ctxPorcentagem, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: [{
                    label: '% sobre Investimento',
                    data: porcentagensInvestimento,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: '#3498db',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Porcentagem Mensal sobre Investimento'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de Fluxo de Caixa Acumulado
        this.graficos.fluxoAcumulado = new Chart(ctxFluxoAcumulado, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Fluxo de Caixa Acumulado (R$)',
                    data: fluxosAcumulados,
                    borderColor: '#e67e22',
                    backgroundColor: 'rgba(230, 126, 34, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Fluxo de Caixa Acumulado'
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
        
        // Gráfico de Composição Financeira (último ano)
        const ultimoAno = this.dadosMensais.slice(-12);
        const receitas = ultimoAno.reduce((sum, d) => sum + d.receitaBrutaMensal, 0);
        const custosOperacionais = ultimoAno.reduce((sum, d) => sum + d.custoOperacionalMensal, 0);
        const custosFixos = ultimoAno.reduce((sum, d) => sum + d.custosFixosMensais, 0);
        const parcelasSistema = ultimoAno.reduce((sum, d) => sum + d.parcelaSistema, 0);
        const parcelasTerreno = ultimoAno.reduce((sum, d) => sum + d.parcelaTerreno, 0);
        const impostos = ultimoAno.reduce((sum, d) => sum + d.imposto, 0);
        const lucro = ultimoAno.reduce((sum, d) => sum + d.lucroLiquido, 0);
        
        this.graficos.composicao = new Chart(ctxComposicao, {
            type: 'doughnut',
            data: {
                labels: ['Receitas', 'Custos Operacionais', 'Custos Fixos', 'Parcelas Sistema', 'Parcelas Terreno', 'Impostos', 'Lucro Líquido'],
                datasets: [{
                    data: [receitas, custosOperacionais, custosFixos, parcelasSistema, parcelasTerreno, impostos, lucro],
                    backgroundColor: [
                        '#27ae60',
                        '#e74c3c',
                        '#e67e22',
                        '#9b59b6',
                        '#d35400',
                        '#f39c12',
                        '#2ecc71'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Composição Financeira (Último Ano)'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// Instância global do projeto
let projeto = new ProjetoUsinaSolar();

// Funções globais
function calcularProjecao() {
    projeto.carregarConfiguracoes();
    projeto.calcularProjecaoMensal();
    projeto.atualizarTabela();
    projeto.criarGraficos();
}

function calcularValorSistema() {
    // Calcular valor do sistema automaticamente
    const parcelas = parseInt(document.getElementById('numeroParcelasSistema').value) || 0;
    const valorParcela = parseFloat(document.getElementById('valorParcelaSistema').value) || 0;
    const valorSistema = parcelas * valorParcela;
    
    // Recalcular projeção
    calcularProjecao();
}

function calcularValorTerreno() {
    // Calcular valor do terreno automaticamente
    const parcelas = parseInt(document.getElementById('numeroParcelasTerreno').value) || 0;
    const valorParcela = parseFloat(document.getElementById('valorParcelaTerreno').value) || 0;
    const valorTerreno = parcelas * valorParcela;
    
    // Recalcular projeção
    calcularProjecao();
}

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

function mudarPagina(direcao) {
    const totalPaginas = Math.ceil(projeto.dadosMensais.length / projeto.itensPorPagina);
    projeto.paginaAtual += direcao;
    
    if (projeto.paginaAtual < 1) projeto.paginaAtual = 1;
    if (projeto.paginaAtual > totalPaginas) projeto.paginaAtual = totalPaginas;
    
    projeto.atualizarTabela();
}

function toggleConfig() {
    const configGrid = document.getElementById('configGrid');
    const toggleButton = document.querySelector('.toggle-config');
    
    if (configGrid.style.display === 'none') {
        configGrid.style.display = 'grid';
        toggleButton.textContent = '⚙️ Ocultar Configurações';
    } else {
        configGrid.style.display = 'none';
        toggleButton.textContent = '⚙️ Mostrar Configurações';
    }
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
        
        // Resetar financiamento do sistema
        document.getElementById('carenciaSistema').value = '12';
        document.getElementById('numeroParcelasSistema').value = '60';
        document.getElementById('valorParcelaSistema').value = '3493.08';
        
        // Resetar financiamento do terreno
        document.getElementById('financiarTerreno').checked = false;
        document.getElementById('carenciaTerreno').value = '12';
        document.getElementById('numeroParcelasTerreno').value = '60';
        document.getElementById('valorParcelaTerreno').value = '1455.45';
        
        // Chamar toggle para atualizar a interface
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

function exportarExcel() {
    try {
        // Preparar dados para exportação
        const dadosExportacao = projeto.dadosMensais.map(dado => ({
            'Mês': dado.mes,
            'Ano': dado.ano,
            'Tarifa (R$/kWh)': dado.tarifa,
            'Receita (R$)': dado.receitaBrutaMensal,
            'Custo Operacional (R$)': dado.custoOperacionalMensal,
            'Custos Fixos (R$)': dado.custosFixosMensais,
            'Parcela Sistema (R$)': dado.parcelaSistema,
            'Parcela Terreno (R$)': dado.parcelaTerreno,
            'Rendimento Bruto (R$)': dado.rendimentoBruto,
            'Imposto (R$)': dado.imposto,
            'Lucro Líquido (R$)': dado.lucroLiquido,
            '% sobre Investimento': dado.porcentagemInvestimento,
            'Fluxo Acumulado (R$)': dado.fluxoAcumulado,
            'Status': dado.status.replace(/<[^>]*>/g, '') // Remove tags HTML
        }));
        
        // Criar worksheet
        const ws = XLSX.utils.json_to_sheet(dadosExportacao);
        
        // Criar workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Projeção Usina Solar');
        
        // Exportar
        XLSX.writeFile(wb, 'projecao_usina_solar.xlsx');
    } catch (error) {
        alert('Erro ao exportar Excel: ' + error.message);
    }
}

function exportarPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Título
        doc.setFontSize(20);
        doc.text('Relatório - Projeção Usina Solar', 20, 20);
        
        // Data de geração
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);
        
        // Resumo
        doc.setFontSize(14);
        doc.text('Resumo do Projeto', 20, 45);
        
        doc.setFontSize(10);
        let yPos = 55;
        doc.text(`Investimento Total: ${document.getElementById('investimentoTotal').textContent}`, 20, yPos);
        yPos += 7;
        doc.text(`Payback: ${document.getElementById('payback').textContent}`, 20, yPos);
        yPos += 7;
        doc.text(`ROI Total: ${document.getElementById('roi').textContent}`, 20, yPos);
        yPos += 7;
        doc.text(`Lucro Total: ${document.getElementById('lucroTotal').textContent}`, 20, yPos);
        
        // Adicionar gráficos (simplificado)
        yPos += 15;
        doc.setFontSize(12);
        doc.text('Observação: Para dados completos, exporte para Excel.', 20, yPos);
        
        // Salvar PDF
        doc.save('relatorio_usina_solar.pdf');
    } catch (error) {
        alert('Erro ao gerar PDF: ' + error.message);
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    // Configurar evento de mudança no número de itens por página
    document.getElementById('itensPorPagina').addEventListener('change', function() {
        projeto.itensPorPagina = parseInt(this.value);
        projeto.paginaAtual = 1;
        projeto.atualizarTabela();
    });
    
    // Configurar eventos para campos do sistema
    document.getElementById('numeroParcelasSistema').addEventListener('change', calcularValorSistema);
    document.getElementById('valorParcelaSistema').addEventListener('change', calcularValorSistema);
    document.getElementById('carenciaSistema').addEventListener('change', calcularProjecao);
    
    // Configurar eventos para campos do terreno
    document.getElementById('numeroParcelasTerreno').addEventListener('change', calcularValorTerreno);
    document.getElementById('valorParcelaTerreno').addEventListener('change', calcularValorTerreno);
    document.getElementById('carenciaTerreno').addEventListener('change', calcularProjecao);
    
    // Configurar eventos para outros campos que afetam o investimento total
    document.querySelectorAll('#cercamento, #portao, #refletores, #cameras, #irrigacao').forEach(input => {
        input.addEventListener('change', calcularProjecao);
    });
    
    // Calcular projeção inicial
    calcularProjecao();
});

// Configurar eventos de input para cálculos automáticos
document.querySelectorAll('input').forEach(input => {
    if (!input.id.includes('Parcela') && !input.id.includes('numeroParcelas')) {
        input.addEventListener('change', calcularProjecao);
    }
});