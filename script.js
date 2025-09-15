// Variáveis globais para armazenar resultados
let resultados = {
    doentes: 0,
    hospitalizados: 0, 
    recuperados: 0,
    mortos: 0,
    dias: 0,
    pico: 0,
    totalHospitalizacoes: 0,
    mediaOcupacao: 0,
    diasAcima50: 0,
    diasAcima80: 0,
    historicoHospital: []
};

function executarSimulacao() {
    if (!validarInputs()) {
        return;
    }
    mostrarLoading(true);
    setTimeout(() => {
        calcularSimulacao();
        atualizarInterface();
        mostrarLoading(false);
    }, 500);
}

function validarInputs() {
    const somaDoente = parseFloat(document.getElementById('d1').value) + 
                      parseFloat(document.getElementById('d2').value) + 
                      parseFloat(document.getElementById('d3').value) + 
                      parseFloat(document.getElementById('d4').value);
    
    const somaHospital = parseFloat(document.getElementById('h1').value) + 
                         parseFloat(document.getElementById('h2').value) + 
                         parseFloat(document.getElementById('h3').value) + 
                         parseFloat(document.getElementById('h4').value);

    if (Math.abs(somaDoente - 1) > 0.01 || Math.abs(somaHospital - 1) > 0.01) {
        alert('As probabilidades devem somar 1.0 para cada estado!');
        return false;
    }

    return true;
}

function calcularSimulacao() {
    const populacao = parseInt(document.getElementById('populacao').value);
    
    // Probabilidades dos estados
    const probDoente = [
        parseFloat(document.getElementById('d1').value),  // continua
        parseFloat(document.getElementById('d2').value),  // hospitaliza
        parseFloat(document.getElementById('d3').value),  // recupera
        parseFloat(document.getElementById('d4').value)   // morre
    ];

    const probHospital = [
        parseFloat(document.getElementById('h1').value),  // continua
        parseFloat(document.getElementById('h2').value),  // vira doente
        parseFloat(document.getElementById('h3').value),  // recupera
        parseFloat(document.getElementById('h4').value)   // morre
    ];

    let doentes = populacao;
    let hospitalizados = 0;
    let recuperados = 0;
    let mortos = 0;
    let dia = 0;
    let maxHospitalizados = 0;
    let historicoHospitalizados = [];

    while ((doentes > 0 || hospitalizados > 0) && dia < 500) {
        dia++;
        let novoDoentes = 0;
        let novoHospital = 0;
        let novoRecuperadosD = 0;
        let novoMortosD = 0;

        for (let i = 0; i < doentes; i++) {
            const rand = Math.random();
            
            if (rand < probDoente[3]) {
                novoMortosD++;
            } else if (rand < probDoente[3] + probDoente[2]) {
                novoRecuperadosD++;
            } else if (rand < probDoente[3] + probDoente[2] + probDoente[1]) {
                novoHospital++;
            } else {
                novoDoentes++;
            }
        }

        let novoHospitalizados = 0;
        let hospitalParaDoente = 0;
        let novoRecuperadosH = 0;
        let novoMortosH = 0;

        for (let i = 0; i < hospitalizados; i++) {
            const rand = Math.random();
            
            if (rand < probHospital[3]) {
                novoMortosH++;
            } else if (rand < probHospital[3] + probHospital[2]) {
                novoRecuperadosH++;
            } else if (rand < probHospital[3] + probHospital[2] + probHospital[1]) {
                hospitalParaDoente++;
            } else {
                novoHospitalizados++;
            }
        }


        doentes = novoDoentes + hospitalParaDoente;
        hospitalizados = novoHospitalizados + novoHospital;
        recuperados += novoRecuperadosD + novoRecuperadosH;
        mortos += novoMortosD + novoMortosH;


        if (hospitalizados > maxHospitalizados) {
            maxHospitalizados = hospitalizados;
        }
        historicoHospitalizados.push(hospitalizados);
    }


    const totalHospitalizacoes = historicoHospitalizados.reduce((sum, h) => sum + h, 0);
    const mediaOcupacao = totalHospitalizacoes / historicoHospitalizados.length;
    const diasAcima50 = historicoHospitalizados.filter(h => h > maxHospitalizados * 0.5).length;
    const diasAcima80 = historicoHospitalizados.filter(h => h > maxHospitalizados * 0.8).length;

    resultados = {
        doentes: doentes,
        hospitalizados: hospitalizados,
        recuperados: recuperados,
        mortos: mortos,
        dias: dia,
        pico: maxHospitalizados,
        totalHospitalizacoes: totalHospitalizacoes,
        mediaOcupacao: Math.floor(mediaOcupacao),
        diasAcima50: diasAcima50,
        diasAcima80: diasAcima80,
        historicoHospital: historicoHospitalizados
    };
}

function atualizarInterface() {
    document.getElementById('totalRecuperados').textContent = resultados.recuperados;
    document.getElementById('totalMortos').textContent = resultados.mortos;
    const picoPercent = ((resultados.pico / parseInt(document.getElementById('populacao').value)) * 100);
    document.getElementById('picoPercentual').textContent = picoPercent.toFixed(1) + '%';
    const totalFinal = resultados.recuperados + resultados.mortos;
    const mortalidadePct = totalFinal > 0 ? (resultados.mortos / totalFinal * 100) : 0;


    document.getElementById('mortalidade').textContent = mortalidadePct.toFixed(2) + '%';
    document.getElementById('duracao').textContent = resultados.dias + ' dias';
    document.getElementById('picoHospital').textContent = resultados.pico;


    const leitosRecomendados = Math.floor(resultados.pico * 1.1);
    document.getElementById('leitosRecomendados').textContent = leitosRecomendados;
    document.getElementById('recomendacao').style.display = 'block';

    atualizarEstatisticasHospitalares();

}

function atualizarEstatisticasHospitalares() {

    const eficienciaHospitalar = resultados.pico > 0 ? (resultados.mediaOcupacao / resultados.pico * 100) : 0;
    

    const pct50 = resultados.dias > 0 ? (resultados.diasAcima50 / resultados.dias * 100) : 0;
    const pct80 = resultados.dias > 0 ? (resultados.diasAcima80 / resultados.dias * 100) : 0;

    document.getElementById('totalHospitalizacoes').textContent = resultados.totalHospitalizacoes;
    document.getElementById('mediaOcupacao').textContent = resultados.mediaOcupacao;
    document.getElementById('eficienciaHospitalar').textContent = eficienciaHospitalar.toFixed(1);
    document.getElementById('diasAcima50').textContent = resultados.diasAcima50;
    document.getElementById('pctAcima50').textContent = pct50.toFixed(1);
    document.getElementById('diasAcima80').textContent = resultados.diasAcima80;
    document.getElementById('pctAcima80').textContent = pct80.toFixed(1);
}

function formatarNumero(num) {
    if (num < 1000) return num.toString();
    if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
    return (num / 1000000).toFixed(1) + 'M';
}

function mostrarLoading(mostrar) {
    const btn = document.getElementById('btnSimular');
    const loading = document.getElementById('loading');
    
    if (mostrar) {
        btn.disabled = true;
        btn.textContent = 'Processando...';
        loading.style.display = 'block';
    } else {
        btn.disabled = false;
        btn.textContent = 'Simular';
        loading.style.display = 'none';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.addEventListener('change', function() {
            if (this.value > 1 && this.id !== 'populacao') {
                this.value = 1;
            }
            if (this.value < 0) {
                this.value = 0;
            }
        });
    });
});