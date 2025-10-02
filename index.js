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
    this.tarifaInicial = parseFloat(
      document.getElementById("tarifaInicial").value
    );
    this.producaoMensalKwh = parseInt(
      document.getElementById("producaoMensal").value
    );
    this.reajusteTarifaAnual =
      parseFloat(document.getElementById("reajusteTarifa").value) / 100;
    this.periodoAnalise = parseInt(
      document.getElementById("periodoAnalise").value
    );

    // Custos operacionais
    this.custoOperacional1 =
      parseFloat(document.getElementById("custoOperacional1").value) / 100;
    this.custoOperacional2 =
      parseFloat(document.getElementById("custoOperacional2").value) / 100;
    this.custoOperacionalPercentual =
      this.custoOperacional1 + this.custoOperacional2;
    this.impostoPercentual =
      parseFloat(document.getElementById("imposto").value) / 100;

    // Configurações do sistema
    this.metodoPagamento = document.getElementById("metodoPagamento").value;

    // Custos adicionais
    this.custosAdicionais = {
      construcao: parseFloat(document.getElementById("construcao").value),
      postes: parseFloat(document.getElementById("postes").value),
      padrao: parseFloat(document.getElementById("padrao").value),
      instalacaoEletrica: parseFloat(
        document.getElementById("instalacaoEletrica").value
      ),
      cabeamento: parseFloat(document.getElementById("cabeamento").value),
    };

    // Parcelamento dos custos adicionais
    this.parcelamentoCustosAdicionais =
      parseInt(document.getElementById("parcelamentoCustosAdicionais").value) ||
      1;

    this.valorTotalCustosAdicionais = this.calcularCustosAdicionais();

    // Configurações de pagamento do sistema
    if (this.metodoPagamento === "avista") {
      // À vista - usar o valor total dos custos adicionais
      this.valorFinanciamento = 0;
      this.valorSistema = this.valorTotalCustosAdicionais;
      this.parcelasSistema = 0;
      this.valorParcelaSistema = 0;
      this.mesesCarenciaSistema = 0;
      this.mesInicioParcelasSistema = 0;
      this.mesFimParcelasSistema = 0;
      this.custoTotalCartao = 0;
      this.parcelaSistemaCartao = 0;
    } else if (this.metodoPagamento === "financiamento") {
      // Financiamento bancário
      this.parcelasSistema = parseInt(
        document.getElementById("numeroParcelasSistema").value
      );
      this.valorParcelaSistema = parseFloat(
        document.getElementById("valorParcelaSistema").value
      );
      this.valorFinanciamento = this.parcelasSistema * this.valorParcelaSistema;
      this.valorSistema =
        this.valorFinanciamento + this.valorTotalCustosAdicionais;
      this.mesesCarenciaSistema = parseInt(
        document.getElementById("carenciaSistema").value
      );
      this.mesesAntesProducao = 0;
      this.mesInicioParcelasSistema = this.mesesCarenciaSistema + 1;
      this.mesFimParcelasSistema =
        this.mesesCarenciaSistema + this.parcelasSistema;
      this.custoTotalCartao = 0;
      this.parcelaSistemaCartao = this.valorParcelaSistema;
    } else {
      // Cartão de crédito (default) - SEM CARÊNCIA
      this.parcelasSistema = parseInt(
        document.getElementById("parcelasCartao").value
      );
      this.numeroParticipantes = parseInt(
        document.getElementById("numeroParticipantes").value
      );
      this.valorPorParticipante = parseFloat(
        document.getElementById("valorPorParticipante").value
      );
      this.valorFinanciamento =
        this.parcelasSistema *
        this.numeroParticipantes *
        this.valorPorParticipante;
      this.valorSistema =
        this.valorFinanciamento + this.valorTotalCustosAdicionais;
      this.mesesAntesProducao = parseInt(
        document.getElementById("mesesAntesProducao").value
      );
      this.mesesCarenciaSistema = 0;
      this.mesInicioParcelasSistema = 1;
      this.mesFimParcelasSistema = this.parcelasSistema;
      this.custoTotalCartao = this.valorFinanciamento;
      this.parcelaSistemaCartao =
        this.valorPorParticipante * this.numeroParticipantes;
    }

    // Financiamento do terreno (opcional)
    this.financiarTerreno = document.getElementById("financiarTerreno").checked;

    // Capturar valor de entrada
    this.entradaTerreno =
      parseFloat(document.getElementById("entradaTerreno").value) || 0;
    this.parcelasTerreno =
      parseInt(document.getElementById("numeroParcelasTerreno").value) || 0;
    this.valorParcelaTerreno =
      parseFloat(document.getElementById("valorParcelaTerreno").value) || 0;

    // Calcular valor total do terreno (entrada + parcelas)
    this.valorTerreno =
      this.entradaTerreno + this.parcelasTerreno * this.valorParcelaTerreno;

    this.mesesCarenciaTerreno =
      parseInt(document.getElementById("carenciaTerreno").value) || 0;

    // Custos iniciais
    this.investimentoInicial = {
      cercamento: parseFloat(document.getElementById("cercamento").value),
      portao: parseFloat(document.getElementById("portao").value),
      refletores: parseFloat(document.getElementById("refletores").value),
      cameras: parseFloat(document.getElementById("cameras").value),
      irrigacao: parseFloat(document.getElementById("irrigacao").value),
    };

    // Parcelamento dos custos iniciais
    this.parcelamentoCustosIniciais =
      parseInt(document.getElementById("parcelamentoCustosIniciais").value) ||
      1;

    this.valorTotalCustosIniciais = this.calcularCustosIniciais();

    // Custos mensais
    this.custosMensaisBase = {
      internet: parseFloat(document.getElementById("internet").value),
      taxaIluminacao: parseFloat(
        document.getElementById("taxaIluminacao").value
      ),
      monitoramento: parseFloat(document.getElementById("monitoramento").value),
      agua: parseFloat(document.getElementById("agua").value),
      contadora: parseFloat(document.getElementById("contadora").value),
    };

    this.totalInvestimento = this.calcularTotalInvestimento();
    this.totalCustosMensaisBase = this.calcularTotalCustosMensaisBase();
    this.investimentoTotal = this.calcularInvestimentoTotal();

    // Atualizar os campos calculados
    this.atualizarValoresCalculados();
  }

  calcularCustosAdicionais() {
    return Object.values(this.custosAdicionais).reduce(
      (sum, val) => sum + val,
      0
    );
  }

  calcularCustosIniciais() {
    return Object.values(this.investimentoInicial).reduce(
      (sum, val) => sum + val,
      0
    );
  }

  calcularTotalInvestimento() {
    let total = 0;
    total += this.valorTotalCustosIniciais;
    total += this.valorTotalCustosAdicionais;
    total += this.valorFinanciamento;
    if (!this.financiarTerreno) {
      total += this.valorTerreno;
    }
    return total;
  }

  calcularInvestimentoTotal() {
    let total =
      this.valorFinanciamento +
      this.valorTotalCustosAdicionais +
      this.valorTotalCustosIniciais +
      this.valorTerreno;
    return total;
  }

  calcularTotalCustosMensaisBase() {
    return Object.values(this.custosMensaisBase).reduce(
      (sum, val) => sum + val,
      0
    );
  }

  atualizarValoresCalculados() {
    const valorTotalSistemaElement =
      document.getElementById("valorTotalSistema");
    valorTotalSistemaElement.textContent = this.formatarMoeda(
      this.valorTotalCustosAdicionais
    );

    const valorTerrenoElement = document.getElementById(
      "valorTerrenoCalculado"
    );
    valorTerrenoElement.textContent = this.formatarMoeda(this.valorTerreno);

    const custoTotalCartaoElement = document.getElementById("custoTotalCartao");
    custoTotalCartaoElement.textContent = this.formatarMoeda(
      this.custoTotalCartao
    );

    const parcelaSistemaCartaoElement = document.getElementById(
      "parcelaSistemaCartao"
    );
    parcelaSistemaCartaoElement.textContent = this.formatarMoeda(
      this.parcelaSistemaCartao
    );

    const custoTotalCartaoResumoElement = document.getElementById(
      "custoTotalCartaoResumo"
    );
    custoTotalCartaoResumoElement.textContent = this.formatarMoeda(
      this.custoTotalCartao
    );

    const investimentoTotalElement =
      document.getElementById("investimentoTotal");
    investimentoTotalElement.textContent = this.formatarMoeda(
      this.investimentoTotal
    );

    const valorTotalCustosIniciaisElement = document.getElementById(
      "valorTotalCustosIniciais"
    );
    valorTotalCustosIniciaisElement.textContent = this.formatarMoeda(
      this.valorTotalCustosIniciais
    );

    const parcelaMensalCustosIniciaisElement = document.getElementById(
      "parcelaMensalCustosIniciais"
    );
    const parcelaMensal =
      this.valorTotalCustosIniciais / this.parcelamentoCustosIniciais;
    parcelaMensalCustosIniciaisElement.textContent =
      this.formatarMoeda(parcelaMensal);
  }

  calcularProjecaoMensal() {
    this.carregarConfiguracoes();
    this.dadosMensais = [];
    let fluxoAcumulado = 0;
    let paybackAlcancado = false;
    let mesPayback = 0;

    const mesesAnterioresProducao =
      this.metodoPagamento === "cartao" ? this.mesesAntesProducao : 0;
    const mesInicioProducao = 1;

    // Calcular parcelas dos custos adicionais e iniciais
    const valorParcelaCustosAdicionais =
      this.valorTotalCustosAdicionais / this.parcelamentoCustosAdicionais;
    const valorParcelaCustosIniciais =
      this.valorTotalCustosIniciais / this.parcelamentoCustosIniciais;

    // Determinar o mês de início das parcelas dos custos iniciais e adicionais
    let mesInicioCustosIniciais = 1 - mesesAnterioresProducao;
    let mesInicioCustosAdicionais = 1 - mesesAnterioresProducao;

    // CORREÇÃO: Calcular início das parcelas do terreno para coincidir com custos iniciais
    let mesInicioParcelasTerreno = mesInicioCustosIniciais;
    if (this.financiarTerreno && this.entradaTerreno > 0) {
      // Se há entrada, as parcelas começam uma linha após os custos iniciais
      mesInicioParcelasTerreno = mesInicioCustosIniciais + 1;
    }

    // Aplicar carência do terreno
    mesInicioParcelasTerreno += this.mesesCarenciaTerreno;

    const mesFimParcelasTerreno =
      mesInicioParcelasTerreno + this.parcelasTerreno - 1;

    // Calcular o total de meses (incluindo meses anteriores)
    const totalMeses = this.periodoAnalise + mesesAnterioresProducao;

    for (
      let mes = 1 - mesesAnterioresProducao;
      mes <= this.periodoAnalise;
      mes++
    ) {
      const ano = mes <= 0 ? 0 : Math.ceil(mes / 12);
      const mesNoAno = mes <= 0 ? mes : ((mes - 1) % 12) + 1;

      // Calcula tarifa com reajuste anual (só aplica após início da produção)
      const anosDecorridos = mes < 1 ? 0 : (mes - 1) / 12;
      const tarifa =
        this.tarifaInicial *
        Math.pow(1 + this.reajusteTarifaAnual, anosDecorridos);

      // Receita bruta mensal (ZERO durante meses anteriores à produção)
      let receitaBrutaMensal = 0;
      if (mes >= 1) {
        receitaBrutaMensal = this.producaoMensalKwh * tarifa;
      }

      // Custos operacionais (percentual da receita - ZERO se não há receita)
      const custoOperacionalMensal =
        receitaBrutaMensal * this.custoOperacionalPercentual;

      // Custos fixos mensais (só existem APÓS o início da produção)
      let custosFixosMensais = 0;
      if (mes >= 1) {
        custosFixosMensais = this.totalCustosMensaisBase;
      }

      // Parcela do sistema
      let parcelaSistema = 0;
      if (this.metodoPagamento !== "avista") {
        if (this.metodoPagamento === "cartao") {
          // Cartão de crédito: SEM carência, parcelas começam no período de pré-produção
          const mesInicioParcelas = 1 - mesesAnterioresProducao;
          if (mes >= mesInicioParcelas && mes <= this.parcelasSistema) {
            parcelaSistema =
              this.valorPorParticipante * this.numeroParticipantes;
          }
        } else {
          // Financiamento bancário: COM carência
          if (
            mes >= this.mesInicioParcelasSistema &&
            mes <= this.mesFimParcelasSistema
          ) {
            parcelaSistema = this.valorParcelaSistema;
          }
        }
      }

      // Parcelas dos custos adicionais (começam durante o período de pré-produção)
      let parcelaCustosAdicionais = 0;
      if (
        mes >= mesInicioCustosAdicionais &&
        mes < mesInicioCustosAdicionais + this.parcelamentoCustosAdicionais
      ) {
        parcelaCustosAdicionais = valorParcelaCustosAdicionais;
      }

      // Parcelas dos custos iniciais (começam durante o período de pré-produção)
      let parcelaCustosIniciais = 0;
      if (
        mes >= mesInicioCustosIniciais &&
        mes < mesInicioCustosIniciais + this.parcelamentoCustosIniciais
      ) {
        parcelaCustosIniciais = valorParcelaCustosIniciais;
      }

      // CORREÇÃO: Parcela do terreno - entrada na primeira linha, parcelas alinhadas com custos iniciais
      let parcelaTerreno = 0;
      if (this.financiarTerreno) {
        // Entrada na primeira linha (primeiro mês de pré-produção)
        if (mes === 1 - mesesAnterioresProducao && this.entradaTerreno > 0) {
          parcelaTerreno = this.entradaTerreno;
        }
        // Parcelas normais do terreno (alinhadas com custos iniciais, exceto quando há entrada)
        else if (
          mes >= mesInicioParcelasTerreno &&
          mes <= mesFimParcelasTerreno
        ) {
          parcelaTerreno = this.valorParcelaTerreno;
        }
      }

      // Rendimento bruto
      const rendimentoBruto =
        receitaBrutaMensal -
        custoOperacionalMensal -
        custosFixosMensais -
        parcelaSistema -
        parcelaCustosAdicionais -
        parcelaCustosIniciais -
        parcelaTerreno;

      // Imposto (sobre o rendimento bruto, se positivo)
      let imposto = 0;
      if (rendimentoBruto > 0 && mes >= 1) {
        imposto = rendimentoBruto * this.impostoPercentual;
      }

      // Lucro líquido
      const lucroLiquido = rendimentoBruto - imposto;

      // Porcentagem sobre investimento
      const porcentagemInvestimento =
        this.investimentoTotal > 0
          ? (lucroLiquido / this.investimentoTotal) * 100
          : 0;

      // Fluxo acumulado
      fluxoAcumulado += lucroLiquido;

      // Verifica payback (apenas a partir do mês 1)
      if (mes >= 1 && !paybackAlcancado && fluxoAcumulado >= 0) {
        paybackAlcancado = true;
        mesPayback = mes;
      }

      // Status
      let status = "";
      if (this.metodoPagamento !== "avista") {
        if (this.metodoPagamento === "cartao") {
          if (mes < 1) {
            status =
              '<span class="status-dot status-carecia"></span>Pré-Produção';
          } else if (mes <= this.parcelasSistema) {
            status =
              '<span class="status-dot status-parcela"></span>Parcela + Produção';
          } else {
            status = '<span class="status-dot status-livre"></span>Produção';
          }
        } else {
          if (mes < this.mesInicioParcelasSistema) {
            status = '<span class="status-dot status-carecia"></span>Carência';
          } else if (mes <= this.mesFimParcelasSistema) {
            status = '<span class="status-dot status-parcela"></span>Parcela';
          } else {
            status = '<span class="status-dot status-livre"></span>Livre';
          }
        }
      } else {
        if (mes < 1) {
          status =
            '<span class="status-dot status-carecia"></span>Pré-Produção';
        } else {
          status = '<span class="status-dot status-livre"></span>Produção';
        }
      }

      // Status específico para financiamento do terreno
      if (this.financiarTerreno) {
        if (mes === 1 - mesesAnterioresProducao && this.entradaTerreno > 0) {
          status +=
            ' <span class="status-dot status-terreno"></span>Entrada Terreno';
        } else if (mes < mesInicioParcelasTerreno) {
          status +=
            ' <span class="status-dot status-carecia"></span>Carência Terreno';
        } else if (mes <= mesFimParcelasTerreno) {
          status +=
            ' <span class="status-dot status-terreno"></span>Parcela Terreno';
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
        parcelaCustosIniciais,
        parcelaCustosAdicionais,
        parcelaSistema,
        parcelaTerreno,
        rendimentoBruto,
        imposto,
        lucroLiquido,
        porcentagemAccumulado: 0,
        porcentagemInvestimento,
        fluxoAcumulado,
        status,
      });
    }

    this.atualizarResumo(fluxoAcumulado, mesPayback);
    return this.dadosMensais;
  }

  atualizarResumo(fluxoAcumulado, mesPayback) {
    const paybackElement = document.getElementById("payback");
    const roiElement = document.getElementById("roi");
    const parcelaTerrenoElement = document.getElementById("parcelaTerreno");
    const lucroTotalElement = document.getElementById("lucroTotal");
    const investimentoTotalElement =
      document.getElementById("investimentoTotal");
    const cardCartaoElement = document.getElementById("cardCartao");

    investimentoTotalElement.textContent = this.formatarMoeda(
      this.investimentoTotal
    );

    // Formatar valores
    lucroTotalElement.textContent = this.formatarMoeda(fluxoAcumulado);

    // Calcular ROI
    const roi = ((fluxoAcumulado / this.investimentoTotal) * 100).toFixed(1);
    roiElement.textContent = `${roi}%`;

    // Payback
    if (mesPayback > 0) {
      const anosPayback = Math.floor(mesPayback / 12);
      const mesesPayback = mesPayback % 12;
      let paybackText = "";
      if (anosPayback > 0) {
        paybackText += `${anosPayback} ano${anosPayback > 1 ? "s" : ""}`;
      }
      if (mesesPayback > 0) {
        paybackText += `${paybackText ? " e " : ""}${mesesPayback} mês${
          mesesPayback > 1 ? "es" : ""
        }`;
      }
      paybackElement.textContent = paybackText;
    } else {
      paybackElement.textContent = "Não alcançado";
    }

    // Parcela do terreno
    if (this.financiarTerreno) {
      parcelaTerrenoElement.textContent = this.formatarMoeda(
        this.valorParcelaTerreno
      );
    }

    // Mostrar/ocultar card do cartão
    if (this.metodoPagamento === "cartao") {
      cardCartaoElement.style.display = "block";
    } else {
      cardCartaoElement.style.display = "none";
    }
  }

  formatarMoeda(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  formatarNumero(valor, casasDecimais = 2) {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: casasDecimais,
      maximumFractionDigits: casasDecimais,
    }).format(valor);
  }

  atualizarTabela() {
    const tabelaBody = document.getElementById("tabelaBody");
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    const dadosPagina = this.dadosMensais.slice(inicio, fim);

    tabelaBody.innerHTML = "";

    dadosPagina.forEach((dado) => {
      const tr = document.createElement("tr");

      // Formatar mês negativo de forma especial
      const mesFormatado = dado.mes < 1 ? `Mês ${dado.mes}` : dado.mes;
      const anoFormatado = dado.ano === 0 ? "Pré" : dado.ano;

      tr.innerHTML = `
                <td>${mesFormatado}</td>
                <td>${anoFormatado}</td>
                <td>${
                  dado.mes < 1 ? "-" : this.formatarNumero(dado.tarifa, 4)
                }</td>
                <td class="${
                  dado.receitaBrutaMensal > 0 ? "positive" : "neutral"
                }">${
        dado.mes < 1 ? "-" : this.formatarMoeda(dado.receitaBrutaMensal)
      }</td>
                <td class="${
                  dado.custoOperacionalMensal > 0 ? "negative" : "neutral"
                }">${
        dado.mes < 1 ? "-" : this.formatarMoeda(dado.custoOperacionalMensal)
      }</td>
                <td class="${
                  dado.custosFixosMensais > 0 ? "negative" : "neutral"
                }">${
        dado.mes < 1 ? "-" : this.formatarMoeda(dado.custosFixosMensais)
      }</td>
                <td class="${
                  dado.parcelaCustosIniciais > 0 ? "negative" : "neutral"
                }">${this.formatarMoeda(dado.parcelaCustosIniciais)}</td>
                <td class="${
                  dado.parcelaCustosAdicionais > 0 ? "negative" : "neutral"
                }">${this.formatarMoeda(dado.parcelaCustosAdicionais)}</td>
                <td class="${
                  dado.parcelaSistema > 0 ? "negative" : "neutral"
                }">${this.formatarMoeda(dado.parcelaSistema)}</td>
                ${
                  this.financiarTerreno
                    ? `<td class="${
                        dado.parcelaTerreno > 0 ? "negative" : "neutral"
                      }">${this.formatarMoeda(dado.parcelaTerreno)}</td>`
                    : ""
                }
                <td class="${
                  dado.rendimentoBruto >= 0 ? "positive" : "negative"
                }">${this.formatarMoeda(dado.rendimentoBruto)}</td>
                <td class="${dado.imposto > 0 ? "negative" : "neutral"}">${
        dado.mes < 1 ? "-" : this.formatarMoeda(dado.imposto)
      }</td>
                <td class="${
                  dado.lucroLiquido >= 0 ? "positive" : "negative"
                }">${this.formatarMoeda(dado.lucroLiquido)}</td>
                <td class="percentage">${
                  dado.mes < 1
                    ? "-"
                    : this.formatarNumero(dado.porcentagemInvestimento, 2)
                }%</td>
                <td class="${
                  dado.fluxoAcumulado >= 0 ? "positive" : "negative"
                }">${this.formatarMoeda(dado.fluxoAcumulado)}</td>
                <td>${dado.status}</td>
            `;

      tabelaBody.appendChild(tr);
    });

    // Atualizar informações da paginação
    const totalPaginas = Math.ceil(
      this.dadosMensais.length / this.itensPorPagina
    );
    document.getElementById(
      "infoPagina"
    ).textContent = `Página ${this.paginaAtual} de ${totalPaginas}`;
  }

  criarGraficos() {
    const ctxLucroMensal = document
      .getElementById("graficoLucroMensal")
      .getContext("2d");
    const ctxPorcentagem = document
      .getElementById("graficoPorcentagemInvestimento")
      .getContext("2d");
    const ctxFluxoAcumulado = document
      .getElementById("graficoFluxoAcumulado")
      .getContext("2d");
    const ctxComposicao = document
      .getElementById("graficoComposicao")
      .getContext("2d");

    // Destruir gráficos existentes
    Object.values(this.graficos).forEach((grafico) => {
      if (grafico) grafico.destroy();
    });

    // Dados para os gráficos
    const meses = this.dadosMensais.map((d) => `Mês ${d.mes}`);
    const lucrosMensais = this.dadosMensais.map((d) => d.lucroLiquido);
    const porcentagensInvestimento = this.dadosMensais.map(
      (d) => d.porcentagemInvestimento
    );
    const fluxosAcumulados = this.dadosMensais.map((d) => d.fluxoAcumulado);

    // Gráfico de Lucro Mensal
    this.graficos.lucroMensal = new Chart(ctxLucroMensal, {
      type: "line",
      data: {
        labels: meses,
        datasets: [
          {
            label: "Lucro Líquido Mensal (R$)",
            data: lucrosMensais,
            borderColor: "#27ae60",
            backgroundColor: "rgba(39, 174, 96, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Evolução do Lucro Mensal",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "R$ " + value.toLocaleString("pt-BR");
              },
            },
          },
        },
      },
    });

    // Gráfico de Porcentagem sobre Investimento
    this.graficos.porcentagemInvestimento = new Chart(ctxPorcentagem, {
      type: "bar",
      data: {
        labels: meses,
        datasets: [
          {
            label: "% sobre Investimento",
            data: porcentagensInvestimento,
            backgroundColor: "rgba(52, 152, 219, 0.6)",
            borderColor: "#3498db",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Porcentagem Mensal sobre Investimento",
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
          },
        },
      },
    });

    // Gráfico de Fluxo de Caixa Acumulado
    this.graficos.fluxoAcumulado = new Chart(ctxFluxoAcumulado, {
      type: "line",
      data: {
        labels: meses,
        datasets: [
          {
            label: "Fluxo de Caixa Acumulado (R$)",
            data: fluxosAcumulados,
            borderColor: "#e67e22",
            backgroundColor: "rgba(230, 126, 34, 0.1)",
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Fluxo de Caixa Acumulado",
          },
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return "R$ " + value.toLocaleString("pt-BR");
              },
            },
          },
        },
      },
    });

    // Gráfico de Composição Financeira (último ano)
    const ultimoAno = this.dadosMensais.slice(-12);
    const receitas = ultimoAno.reduce(
      (sum, d) => sum + d.receitaBrutaMensal,
      0
    );
    const custosOperacionais = ultimoAno.reduce(
      (sum, d) => sum + d.custoOperacionalMensal,
      0
    );
    const custosFixos = ultimoAno.reduce(
      (sum, d) => sum + d.custosFixosMensais,
      0
    );
    const parcelasSistema = ultimoAno.reduce(
      (sum, d) => sum + d.parcelaSistema,
      0
    );
    const parcelasTerreno = ultimoAno.reduce(
      (sum, d) => sum + d.parcelaTerreno,
      0
    );
    const impostos = ultimoAno.reduce((sum, d) => sum + d.imposto, 0);
    const lucro = ultimoAno.reduce((sum, d) => sum + d.lucroLiquido, 0);

    this.graficos.composicao = new Chart(ctxComposicao, {
      type: "doughnut",
      data: {
        labels: [
          "Receitas",
          "Custos Operacionais",
          "Custos Fixos",
          "Parcelas Sistema",
          "Parcelas Terreno",
          "Impostos",
          "Lucro Líquido",
        ],
        datasets: [
          {
            data: [
              receitas,
              custosOperacionais,
              custosFixos,
              parcelasSistema,
              parcelasTerreno,
              impostos,
              lucro,
            ],
            backgroundColor: [
              "#27ae60",
              "#e74c3c",
              "#e67e22",
              "#9b59b6",
              "#d35400",
              "#f39c12",
              "#2ecc71",
            ],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: "Composição Financeira (Último Ano)",
          },
          legend: {
            position: "bottom",
          },
        },
      },
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

function toggleMetodoPagamento() {
  const metodo = document.getElementById("metodoPagamento").value;
  const camposFinanciamento = document.getElementById("camposFinanciamento");
  const camposCartao = document.getElementById("camposCartao");

  if (metodo === "financiamento") {
    camposFinanciamento.style.display = "block";
    camposCartao.style.display = "none";
  } else if (metodo === "cartao") {
    camposFinanciamento.style.display = "none";
    camposCartao.style.display = "block";
  } else {
    // À vista - esconder ambos
    camposFinanciamento.style.display = "none";
    camposCartao.style.display = "none";
  }

  calcularValorSistema();
}

function calcularCustosAdicionais() {
  const construcao =
    parseFloat(document.getElementById("construcao").value) || 0;
  const postes = parseFloat(document.getElementById("postes").value) || 0;
  const padrao = parseFloat(document.getElementById("padrao").value) || 0;
  const instalacaoEletrica =
    parseFloat(document.getElementById("instalacaoEletrica").value) || 0;
  const cabeamento =
    parseFloat(document.getElementById("cabeamento").value) || 0;

  const valorTotal =
    construcao + postes + padrao + instalacaoEletrica + cabeamento;

  // Atualizar o campo de valor total dos custos adicionais
  document.getElementById("valorTotalSistema").textContent =
    projeto.formatarMoeda(valorTotal);

  return valorTotal;
}

function calcularValorSistema() {
  const metodo = document.getElementById("metodoPagamento").value;

  if (metodo === "avista") {
    // À vista - usar o valor total dos custos adicionais
    projeto.valorSistema = calcularCustosAdicionais();
  } else if (metodo === "financiamento") {
    // Financiamento bancário
    const parcelas =
      parseInt(document.getElementById("numeroParcelasSistema").value) || 0;
    const valorParcela =
      parseFloat(document.getElementById("valorParcelaSistema").value) || 0;
    projeto.valorSistema = parcelas * valorParcela;
  } else {
    // Cartão de crédito
    const parcelas =
      parseInt(document.getElementById("parcelasCartao").value) || 0;
    const participantes =
      parseInt(document.getElementById("numeroParticipantes").value) || 1;
    const valorParticipante =
      parseFloat(document.getElementById("valorPorParticipante").value) || 0;
    projeto.valorSistema = parcelas * participantes * valorParticipante;
  }

  // Recalcular projeção
  calcularProjecao();
}

function calcularValorTerreno() {
  // Calcular valor do terreno automaticamente
  const entrada =
    parseFloat(document.getElementById("entradaTerreno").value) || 0;
  const parcelas =
    parseInt(document.getElementById("numeroParcelasTerreno").value) || 0;
  const valorParcela =
    parseFloat(document.getElementById("valorParcelaTerreno").value) || 0;
  const valorTerreno = entrada + parcelas * valorParcela;

  // Atualizar o campo de valor total do terreno
  document.getElementById("valorTerrenoCalculado").textContent =
    projeto.formatarMoeda(valorTerreno);

  // Recalcular projeção
  calcularProjecao();
}

function toggleFinanciamentoTerreno() {
  const checkbox = document.getElementById("financiarTerreno");
  const camposTerreno = document.getElementById("camposTerreno");
  const cardTerreno = document.getElementById("cardTerreno");
  const thParcelaTerreno = document.getElementById("thParcelaTerreno");

  if (checkbox.checked) {
    camposTerreno.style.display = "block";
    cardTerreno.style.display = "block";
    thParcelaTerreno.style.display = "table-cell";
  } else {
    camposTerreno.style.display = "none";
    cardTerreno.style.display = "none";
    thParcelaTerreno.style.display = "none";
  }

  calcularProjecao();
}

function mudarPagina(direcao) {
  const totalPaginas = Math.ceil(
    projeto.dadosMensais.length / projeto.itensPorPagina
  );
  projeto.paginaAtual += direcao;

  if (projeto.paginaAtual < 1) projeto.paginaAtual = 1;
  if (projeto.paginaAtual > totalPaginas) projeto.paginaAtual = totalPaginas;

  projeto.atualizarTabela();
}

function toggleConfig() {
  const configGrid = document.getElementById("configGrid");
  const toggleButton = document.querySelector(".toggle-config");

  if (configGrid.style.display === "none") {
    configGrid.style.display = "grid";
    toggleButton.textContent = "⚙️ Ocultar Configurações";
  } else {
    configGrid.style.display = "none";
    toggleButton.textContent = "⚙️ Mostrar Configurações";
  }
}

function resetarValores() {
  if (confirm("Deseja resetar todos os valores para os padrões originais?")) {
    document.getElementById("tarifaInicial").value = "0.93";
    document.getElementById("producaoMensal").value = "6000";
    document.getElementById("reajusteTarifa").value = "10";
    document.getElementById("periodoAnalise").value = "300";

    document.getElementById("custoOperacional1").value = "20";
    document.getElementById("custoOperacional2").value = "12.5";
    document.getElementById("imposto").value = "6";

    // Resetar método de pagamento do sistema (cartão como default)
    document.getElementById("metodoPagamento").value = "cartao";
    document.getElementById("carenciaSistema").value = "12";
    document.getElementById("numeroParcelasSistema").value = "60";
    document.getElementById("valorParcelaSistema").value = "3493.08";
    document.getElementById("parcelasCartao").value = "12";
    document.getElementById("numeroParticipantes").value = "5";
    document.getElementById("valorPorParticipante").value = "838.34";
    document.getElementById("mesesAntesProducao").value = "3";

    // Resetar custos adicionais com novos valores
    document.getElementById("construcao").value = "17000";
    document.getElementById("postes").value = "1200";
    document.getElementById("padrao").value = "800";
    document.getElementById("instalacaoEletrica").value = "12600";
    document.getElementById("cabeamento").value = "4000";

    // Resetar financiamento do terreno (valores zero)
    document.getElementById("financiarTerreno").checked = false;
    document.getElementById("entradaTerreno").value = "0";
    document.getElementById("carenciaTerreno").value = "0";
    document.getElementById("numeroParcelasTerreno").value = "0";
    document.getElementById("valorParcelaTerreno").value = "0";

    // Resetar custos iniciais
    document.getElementById("cercamento").value = "6000";
    document.getElementById("portao").value = "3000";
    document.getElementById("refletores").value = "200";
    document.getElementById("cameras").value = "800";
    document.getElementById("irrigacao").value = "500";
    document.getElementById("parcelamentoCustosIniciais").value = "1";

    document.getElementById("internet").value = "100";
    document.getElementById("taxaIluminacao").value = "100";
    document.getElementById("monitoramento").value = "100";
    document.getElementById("agua").value = "50";
    document.getElementById("contadora").value = "300";

    // Chamar toggle para atualizar a interface
    toggleMetodoPagamento();
    toggleFinanciamentoTerreno();

    calcularProjecao();
  }
}

function exportarExcel() {
  try {
    // Preparar dados para exportação
    const dadosExportacao = projeto.dadosMensais.map((dado) => ({
      Mês: dado.mes,
      Ano: dado.ano,
      "Tarifa (R$/kWh)": dado.tarifa,
      "Receita (R$)": dado.receitaBrutaMensal,
      "Custo Operacional (R$)": dado.custoOperacionalMensal,
      "Custos Fixos (R$)": dado.custosFixosMensais,
      "Custos Iniciais (R$)": dado.parcelaCustosIniciais,
      "Custos Adicionais (R$)": dado.parcelaCustosAdicionais,
      "Parcela Sistema (R$)": dado.parcelaSistema,
      "Parcela Terreno (R$)": dado.parcelaTerreno,
      "Rendimento Bruto (R$)": dado.rendimentoBruto,
      "Imposto (R$)": dado.imposto,
      "Lucro Líquido (R$)": dado.lucroLiquido,
      "% sobre Investimento": dado.porcentagemInvestimento,
      "Fluxo Acumulado (R$)": dado.fluxoAcumulado,
      Status: dado.status.replace(/<[^>]*>/g, ""),
    }));

    // Criar worksheet
    const ws = XLSX.utils.json_to_sheet(dadosExportacao);

    // Criar workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Projeção Usina Solar");

    // Exportar
    XLSX.writeFile(wb, "projecao_usina_solar.xlsx");
  } catch (error) {
    alert("Erro ao exportar Excel: " + error.message);
  }
}

function exportarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título
    doc.setFontSize(20);
    doc.text("Relatório - Projeção Usina Solar", 20, 20);

    // Data de geração
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 20, 30);

    // Resumo
    doc.setFontSize(14);
    doc.text("Resumo do Projeto", 20, 45);

    doc.setFontSize(10);
    let yPos = 55;
    doc.text(
      `Investimento Total: ${
        document.getElementById("investimentoTotal").textContent
      }`,
      20,
      yPos
    );
    yPos += 7;
    doc.text(
      `Payback: ${document.getElementById("payback").textContent}`,
      20,
      yPos
    );
    yPos += 7;
    doc.text(
      `ROI Total: ${document.getElementById("roi").textContent}`,
      20,
      yPos
    );
    yPos += 7;
    doc.text(
      `Lucro Total: ${document.getElementById("lucroTotal").textContent}`,
      20,
      yPos
    );

    // Adicionar informações do cartão se aplicável
    if (projeto.metodoPagamento === "cartao") {
      yPos += 7;
      doc.text(
        `Custo Total Cartão: ${
          document.getElementById("custoTotalCartaoResumo").textContent
        }`,
        20,
        yPos
      );
    }

    // Adicionar gráficos (simplificado)
    yPos += 15;
    doc.setFontSize(12);
    doc.text("Observação: Para dados completos, exporte para Excel.", 20, yPos);

    // Salvar PDF
    doc.save("relatorio_usina_solar.pdf");
  } catch (error) {
    alert("Erro ao gerar PDF: " + error.message);
  }
}

// Inicialização
document.addEventListener("DOMContentLoaded", function () {
  // Configurar evento de mudança no número de itens por página
  document
    .getElementById("itensPorPagina")
    .addEventListener("change", function () {
      projeto.itensPorPagina = parseInt(this.value);
      projeto.paginaAtual = 1;
      projeto.atualizarTabela();
    });

  // Configurar eventos para campos do sistema
  document
    .getElementById("numeroParcelasSistema")
    .addEventListener("change", calcularValorSistema);
  document
    .getElementById("valorParcelaSistema")
    .addEventListener("change", calcularValorSistema);
  document
    .getElementById("carenciaSistema")
    .addEventListener("change", calcularProjecao);

  // Configurar eventos para cartão de crédito
  document
    .getElementById("parcelasCartao")
    .addEventListener("change", calcularValorSistema);
  document
    .getElementById("numeroParticipantes")
    .addEventListener("change", calcularValorSistema);
  document
    .getElementById("valorPorParticipante")
    .addEventListener("change", calcularValorSistema);
  document
    .getElementById("mesesAntesProducao")
    .addEventListener("change", calcularProjecao);

  // Event listener para método de pagamento
  document
    .getElementById("metodoPagamento")
    .addEventListener("change", toggleMetodoPagamento);

  // Configurar eventos para campos do terreno
  document
    .getElementById("entradaTerreno")
    .addEventListener("change", calcularValorTerreno);
  document
    .getElementById("numeroParcelasTerreno")
    .addEventListener("change", calcularValorTerreno);
  document
    .getElementById("valorParcelaTerreno")
    .addEventListener("change", calcularValorTerreno);
  document
    .getElementById("carenciaTerreno")
    .addEventListener("change", calcularProjecao);

  // Configurar eventos para custos iniciais
  document
    .querySelectorAll(
      "#cercamento, #portao, #refletores, #cameras, #irrigacao, #parcelamentoCustosIniciais"
    )
    .forEach((input) => {
      input.addEventListener("change", function () {
        projeto.valorTotalCustosIniciais = projeto.calcularCustosIniciais();
        projeto.atualizarValoresCalculados();
        calcularProjecao();
      });
    });

  // Novos event listeners para custos adicionais
  document
    .querySelectorAll(
      "#construcao, #postes, #padrao, #instalacaoEletrica, #cabeamento, #parcelamentoCustosAdicionais"
    )
    .forEach((input) => {
      input.addEventListener("change", function () {
        calcularCustosAdicionais();
        calcularProjecao();
      });
    });

  // Inicializar o estado dos campos
  toggleMetodoPagamento();
  toggleFinanciamentoTerreno();

  // Calcular projeção inicial
  calcularProjecao();
});

// Configurar eventos de input para cálculos automáticos
document.querySelectorAll("input").forEach((input) => {
  if (!input.id.includes("Parcela") && !input.id.includes("numeroParcelas")) {
    input.addEventListener("change", calcularProjecao);
  }
});
