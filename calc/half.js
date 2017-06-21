///////////////////////////////
// HALF
///////////////////////////////

var carga_half, carga_manual_half, contas_half, handle_check_half, play_half, carga_nova;

carga_half = 0;

carga_manual_half = "null";

handle_check_half = function() {
    var estado;
    estado = $("#check_load_half").is(':checked');
    if (!estado) {
        $("#carga_tag_half").html("Carga (&Omega;): " + carga_half.toFixed(2) + " <input id='check_load_half' type='checkbox' onclick='handle_check_half()'>");
    } else {
        $("#carga_tag_half").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_half + "' id='carga_manual_half' onkeydown='if (event.keyCode == 13) play_half()'> <input id='check_load_half' type='checkbox' checked='true' onclick='handle_check_half()'>");
    }
};

contas_half = function(entrada_half, saida_half, frequencia_half, potencia_half, delta_i, delta_v) {
    this.q = saida_half / entrada_half_;
    this.D = saida_half / entrada_half;
    this.T = 1 / (frequencia_half * 1000);
    this.T_ = 1 / (frequencia_half_ * 1000);

    this.ton = this.T_ * this.D;
    this.ton_ = this.T_ * this.D;

    this.Io = potencia_half / saida_half;
    this.Lo = ((entrada_half_*trafo/2)-saida_half)*this.ton/((delta_i / 100) * this.Io);
    this.delta_i = delta_i;
    this.capacitancia = entrada_half / (31 * this.Lo * frequencia_half * 1000 * frequencia_half * 1000 * delta_v / 100 * saida_half);
    this.Lcri = ((entrada_half_*trafo/2)-saida_half)*this.ton/(2*this.Io);
    this.Ilmed = ((entrada_half - saida_half) * this.q) / frequencia_half * 1000 * 2 * this.Lo;
    this.critico = trafo*(-this.D * this.D+(this.D/2))/2;
    this.Iocrit = ((delta_i / 100) * this.Io)/2;
    carga_half = saida_half * saida_half / potencia_half;
};

play_half = function() {
    var i3_plot, si, t, step_plot, j, Ggo, Gdo, wo, Q, funcao, D, half, carga_ponto, cond, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, denominador, entrada_half, f_plot, fase, frequencia_half, g_plot, ganho_ponto, i1_plot, i2_plot, imaginaria, k, options, pico, plot, ponto, potencia_half, real, saida, saida_half, tcorte, tensao_saida_half, v_carga;

///////////////////////////////
// CHAMA O TEMPO
///////////////////////////////

$("#teste").css('width', "0%");
setTimeout((function() {
    $("#teste1").css('display', "none");
}), 300);
setTimeout((function() {
    $("#teste").css('width', "100%");
}), 0);
$("#teste1").css('display', "block");
grava_cookies();

///////////////////////////////
// LÊ VARIÁVEIS
///////////////////////////////

entrada_half = parseFloat($("#entrada_half").val()) * parseFloat($("#trafo_half").val());
entrada_half_ = parseFloat($("#entrada_half").val());

trafo = parseFloat($("#trafo_half").val());

saida_half = parseFloat($("#saida_half").val());
frequencia_half = 2*parseFloat($("#frequencia_half").val());
frequencia_half_ = parseFloat($("#frequencia_half").val());

potencia_half = parseFloat($("#potencia_half").val());
delta_v = parseFloat($("#delta_v_half").val());
delta_i = parseFloat($("#delta_i_half").val());

if((saida_half / entrada_half)>0.5) {
    alert('Razão cíclica deve ser menor que 0.5!')
    return false;
}

///////////////////////////////
// MODO DE CONDUÇÃO
///////////////////////////////

half = new contas_half(entrada_half, saida_half, frequencia_half, potencia_half, delta_i, delta_v);
//  k = (half.Io * half.Lo) / (entrada_half * half.T);
if ($("#check_load_half").is(':checked')) {
    carga_half = parseFloat($("#carga_manual_half").val());
    half.Io = saida_half / carga_half;
    carga_manual_half = carga_half;
}
k = (half.Io * half.Lo) / (entrada_half_ * half.T_);

///////////////////////////////
// CONTÍNUO
///////////////////////////////

if (k > half.critico) {
    $("#modo_conducao_half").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_half').show()
    cond = "cont";
    $("#potencia_atual_half").hide();
    $("#tensao_atual_half").html("<br>");
    $("#potencia_atual_half").hide();
    saida = saida_half;
    if ($("#check_load_half").is(':checked')) {
        $("#potencia_atual_half").show();
        $("#potencia_atual_half").html("Po* (W): " + (saida * half.Io).toFixed(2));
    }
} 

///////////////////////////////
// CRÍTICO
///////////////////////////////

else if (k === half.critico) {
    $("#modo_conducao_half").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = half.critico;
    saida = saida_half;
    $("#potencia_atual_half").show();
    $("#potencia_atual_half").html("Po* (W): " + (saida * half.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUO
///////////////////////////////

else {
    $("#modo_conducao_half").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_half').hide()

    cond = "desc";
    ganho_ponto=0;
    i=0;
    while (i < half.critico) {
        ganho = (trafo*half.D*half.D/2)/(half.D*half.D+(2*i/trafo));
        carga_nova=((half.Lo * ganho) / (i * half.T_)).toFixed(1);
        var diff = Math.abs( (carga_nova) - carga_half );
        if( diff < 1 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }

    saida = parseFloat((ganho_ponto * entrada_half_).toFixed(1));
    half.Io = saida / carga_half;
    $("#tensao_atual_half").html("Vo* (V): " + saida);
    $("#potencia_atual_half").show();
    $("#potencia_atual_half").html("Po* (W): " + (saida * half.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_half").html("Capacitância (uF): " + (half.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_half").html("Ganho Estático: " + (saida / entrada_half_).toFixed(2));
$("#duty_tag_half").html("Razão Cíclica: " + half.D.toFixed(2));
$("#indutancia_critica_half").html("Indut. Crítica (uH): " + (half.Lcri * 1000000).toFixed(2));
$("#io_param_half").html("k (param.): " + k.toFixed(2));
$("#io_critica_half").html("I<sub>o</sub> crítica (A): " + half.Iocrit.toFixed(3));
$("#io_half").html("I<sub>o</sub> (A): " + half.Io.toFixed(2));
$("#indutancia_tag_half").html("Indutância (uH): " + (half.Lo * 1000000).toFixed(2));
handle_check_half();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * half.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_half * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_half = $("#tensao_saida_half");
options = {
    xaxis: {
        ticks: 4,
        zoomRange: [0.0001, 5 * half.T],
        panRange: [0, 5 * half.T]
    },
    yaxis: {
        zoomRange: [1.1 * saida_half / 100 * delta_v, 1.3 * saida],
        panRange: [0, 1.2 * saida],
        min: 0,
        max: 1.2 * saida,
    },
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true
    }
};

plot = $.plot(tensao_saida_half, data, options);

textox('Tempo (s)','#tensao_saida_half');
textoy('Tensão (V)','#tensao_saida_half');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////

d1_plot = [];
d2_plot = [];
d3_plot = [];
i = 0;
while (i < (1+(4/trafo))/8) {
    d1_plot.push([i, trafo*(1 + Math.sqrt(1 - (32 * i / trafo))) / 4]);
    i += 0.00002;
}
i = 0;
while (i < (1+(4/trafo))/8) {
    d1_plot.push([i, trafo*(1 - Math.sqrt(1 - (32 * i / trafo))) / 4]);
    i += 0.00002;
}
i = 0;
while (i < half.critico) {
    d2_plot.push([i, (trafo*half.D*half.D/2)/(half.D*half.D+(2*i/trafo))]);
    i += 0.0005;
}
i = half.critico;
while (i < 0.6) {
    d2_plot.push([i, half.q]);
    i += 0.001;
}
if (k > 0.5) {
    k = 0.5;
}

if (cond === "cont") {
    d3_plot = [[k, half.q - trafo/100], [k, half.q + trafo/100]];
}
else {
    d3_plot = [[k,  (trafo*half.D*half.D/2)/(half.D*half.D+(2*k/trafo)) - trafo/100], [k, (trafo*half.D*half.D/2)/(half.D*half.D+(2*k/trafo)) + trafo/100]];
}

$.plot($("#grafico_operacao_half"), [
{
    label: "Curva Crítica",
    data: d1_plot
}, {
    label: "Curva Operação",
    color: 6,
    data: d2_plot
}, {
    label: "Ponto Operação",
    data: d3_plot,
    color: 2,
}
], {
    yaxis: {
        max: trafo/2,
        min: 0
    },
    xaxis: {
        ticks: 4,
        max: 0.5
    },
    grid: {
        hoverable: true,
        clickable: true
    }
});
$("#grafico_operacao_half").bind("plothover", function(event, pos, item) {
    var critico, previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            if (pos.x > 0 && pos.x < 1 && pos.y > 0 && pos.y < trafo/2) {
                $("#valor_k_half").html("k = " + pos.x.toFixed(2));
                if (pos.x > (half.critico)) {
                    $("#valor_ganho_half").html("Ganho Estático = " + half.q.toFixed(2));
                    $("#continha_half").html("CONTÍNUO");
                    $("#valor_vo_half").html("Vo (V) = " + (entrada_half * half.D).toFixed(2));
                    carga_nova = ((half.Lo * item.datapoint[1]) / (item.datapoint[0] * half.T_)).toFixed(2);
                    $("#valor_novo_carga_half").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_half").html("Io (A) = " + ((item.datapoint[1] * entrada_half_) / carga_nova).toFixed(2));
                } else {
                    $("#valor_ganho_half").html("Ganho Estático = " + pos.y.toFixed(2));
                    $("#continha_half").html("DESCONTÍNUO");
                    $("#valor_vo_half").html("Vo (V) = " + (item.datapoint[1] * entrada_half_).toFixed(2));
                carga_nova=((half.Lo * item.datapoint[1]) / (item.datapoint[0] * half.T_)).toFixed(2);
                $("#valor_novo_carga_half").html("Carga (&Omega;) = " + carga_nova);
                $("#valor_io_novo_half").html("Io (A) = " + ((item.datapoint[1] * entrada_half_) / carga_nova).toFixed(2));
            }
        }
    }
}
});

$("#grafico_operacao_half").bind("plotclick", function (event, pos, item) {

if ($("#check_load_half").is(':checked')) {
    $("#carga_manual_half").val(carga_nova);
} else {
    $("#check_load_half").prop('checked', true);
    handle_check_half();
    $("#carga_manual_half").val(carga_nova);
}
});

textox('Corrente Parametrizada','#grafico_operacao_half');
textoy('Ganho','#grafico_operacao_half');

///////////////////////////////
// PLOT DAS CORRENTES E TENSÕES
///////////////////////////////

i1_plot = [];
i2_plot = [];
i3_plot = [];
t1_plot = [];
t2_plot = [];
t3_plot = [];

if (cond === "cont") {
    var varia_corrente;
    varia_corrente = (((entrada_half_/2*trafo - saida) / half.Lo) * half.ton)/2;

    var varia_corrente_;
    varia_corrente_ = (((entrada_half_/2*trafo - saida) / half.Lo) * half.ton * trafo)/2;

        // indutor
        i1_plot = [[0, half.Io - varia_corrente], [half.ton_, half.Io + varia_corrente],
        [half.T, half.Io - varia_corrente], [half.T + half.ton_, half.Io + varia_corrente],
        [2 * half.T, half.Io - varia_corrente], [2 * half.T + half.ton_, half.Io + varia_corrente],
        [3 * half.T, half.Io - varia_corrente], [3 * half.T + half.ton_, half.Io + varia_corrente]];

        // chave
        i2_plot = [[0, half.Io*trafo - varia_corrente_], [half.ton, half.Io*trafo + varia_corrente_], [half.ton, 0],
        [half.T_, 0], [half.T_, half.Io*trafo - varia_corrente_], [half.T_ + half.ton, half.Io*trafo + varia_corrente_], [half.T_ + half.ton, 0],
        [2 * half.T_, 0], [2 * half.T_, half.Io*trafo - varia_corrente_], [2 * half.T_ + half.ton, half.Io*trafo + varia_corrente_], [2 * half.T_ + half.ton, 0],
        [3 * half.T_, 0], [3 * half.T_, half.Io*trafo - varia_corrente_], [3 * half.T_ + half.ton, half.Io*trafo + varia_corrente_]];

        i2_plot_ = [[0, 0], [0+(half.T_/2), 0], [0+(half.T_/2), half.Io*trafo - varia_corrente_], [half.ton +(half.T_/2), half.Io*trafo + varia_corrente_], [half.ton +(half.T_/2), 0],
        [half.T_ +(half.T_/2), 0], [half.T_ +(half.T_/2), half.Io*trafo - varia_corrente_], [half.T_ + half.ton +(half.T_/2), half.Io*trafo + varia_corrente_], [half.T_ + half.ton +(half.T_/2), 0],
        [2 * half.T_ +(half.T_/2), 0], [2 * half.T_ +(half.T_/2), half.Io*trafo - varia_corrente_], [2 * half.T_ + half.ton +(half.T_/2), half.Io*trafo + varia_corrente_], [2 * half.T_ + half.ton +(half.T_/2), 0],
        [3 * half.T_ + half.ton, 0]];

        // diodo
        i3_plot = [[0, half.Io - varia_corrente], [half.ton, half.Io + varia_corrente], [half.ton, half.Io/2 + varia_corrente/2], [0 +(half.T_/2), half.Io/2 - varia_corrente/2], [0 +(half.T_/2), 0], [half.ton +(half.T_/2), 0], [half.ton +(half.T_/2), half.Io/2 + varia_corrente/2],
        [half.T_, half.Io/2 - varia_corrente/2], [half.T_, half.Io - varia_corrente], [half.T_ + half.ton, half.Io + varia_corrente], [half.T_ + half.ton, half.Io/2 + varia_corrente/2], [half.T_ +(half.T_/2), half.Io/2 - varia_corrente/2], [half.T_ +(half.T_/2), 0], [half.T_ + half.ton +(half.T_/2), 0], [half.T_ + half.ton +(half.T_/2), half.Io/2 + varia_corrente/2],
        [2 * half.T_, half.Io/2 - varia_corrente/2], [2 * half.T_, half.Io - varia_corrente], [2 * half.T_ + half.ton, half.Io + varia_corrente], [2 * half.T_ + half.ton, half.Io/2 + varia_corrente/2], [2 * half.T_ +(half.T_/2), half.Io/2 - varia_corrente/2], [2 * half.T_ +(half.T_/2), 0], [2 * half.T_ + half.ton +(half.T_/2), 0], [2 * half.T_ + half.ton +(half.T_/2), half.Io/2 + varia_corrente/2],
        [3 * half.T_, half.Io/2 - varia_corrente/2], [3 * half.T_, half.Io - varia_corrente], [3 * half.T_ + half.ton, half.Io + varia_corrente]];

        i3_plot_ = [[0, 0], [half.ton, 0], [half.ton, half.Io/2 + varia_corrente/2], [0+(half.T_/2), half.Io/2 - varia_corrente/2], [0+(half.T_/2), half.Io - varia_corrente], [half.ton+(half.T_/2), half.Io + varia_corrente], [half.ton+(half.T_/2), half.Io/2 + varia_corrente/2],
        [half.T_, half.Io/2 - varia_corrente/2], [half.T_, 0], [half.ton +half.T_, 0], [half.ton +half.T_, half.Io/2 + varia_corrente/2], [half.T_+(half.T_/2), half.Io/2 - varia_corrente/2],
        [half.T_+(half.T_/2), half.Io - varia_corrente], [half.T_+(half.T_/2) + half.ton, half.Io + varia_corrente], [half.T_ + half.ton+(half.T_/2), half.Io/2 + varia_corrente/2],
        [half.T_ +half.T_, half.Io/2 - varia_corrente/2], [half.T_ +half.T_, 0], [half.T_ + half.ton +half.T_, 0], [half.T_ + half.ton +half.T_, half.Io/2 + varia_corrente/2],
        [2 * half.T_+(half.T_/2), half.Io/2 - varia_corrente/2], [2 * half.T_+(half.T_/2), half.Io - varia_corrente], [2 * half.T_ + half.ton+(half.T_/2), half.Io + varia_corrente], [2 * half.T_ + half.ton+(half.T_/2), half.Io/2 + varia_corrente/2],
        [2 * half.T_ +half.T_, half.Io/2 - varia_corrente/2], [2 * half.T_ +half.T_, 0], [2 * half.T_ + half.ton +half.T_, 0]];

        // diodo
        t1_plot_ = [[0, entrada_half], [half.ton, entrada_half], [half.ton, 0],
        [half.T_, 0], [half.T_, entrada_half], [half.T_ + half.ton, entrada_half], [half.T_ + half.ton, 0],
        [2 * half.T_, 0], [2 * half.T_, entrada_half], [2 * half.T_ + half.ton, entrada_half], [2 * half.T_ + half.ton, 0],
        [3 * half.T_, 0], [3 * half.T_, entrada_half], [3 * half.T_ + half.ton, entrada_half]];

        t1_plot = [[0, 0], [half.ton, 0], [0+(half.T_/2), 0], [0+(half.T_/2), entrada_half], [half.ton+(half.T_/2), entrada_half], [half.ton+(half.T_/2), 0],
        [half.T_+(half.T_/2), 0], [half.T_+(half.T_/2), entrada_half], [half.T_+(half.T_/2) + half.ton, entrada_half], [half.T_+(half.T_/2) + half.ton, 0],
        [2 * half.T_+(half.T_/2), 0], [2 * half.T_+(half.T_/2), entrada_half], [2 * half.T_+(half.T_/2) + half.ton, entrada_half], [2 * half.T_ + half.ton+(half.T_/2), 0],
        [3 * half.T_, 0]];

        // chave
        t2_plot = [[0, 0], [half.ton_, 0], [half.ton_, entrada_half_/2], [(half.T_/2), entrada_half_/2], [(half.T_/2), entrada_half_], [half.ton_+(half.T_/2), entrada_half_], [half.ton_+(half.T_/2), entrada_half_/2],
        [half.T_, entrada_half_/2], [half.T_, 0], [half.T_ + half.ton_, 0], [half.T_ + half.ton_, entrada_half_/2], [half.T_+(half.T_/2), entrada_half_/2], [half.T_+(half.T_/2), entrada_half_], [half.T_ + half.ton_+(half.T_/2), entrada_half_], [half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [2 * half.T_, entrada_half_/2], [2 * half.T_, 0], [2 * half.T_ + half.ton_, 0], [2 * half.T_ + half.ton_, entrada_half_/2], [2 * half.T_+(half.T_/2), entrada_half_/2], [2 * half.T_+(half.T_/2), entrada_half_], [2 * half.T_ + half.ton_+(half.T_/2), entrada_half_], [2 * half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [3 * half.T_, entrada_half_/2], [3 * half.T_, 0]];

        t2_plot_ = [[0, entrada_half_], [half.ton_, entrada_half_], [half.ton_, entrada_half_/2], [(half.T_/2), entrada_half_/2], [(half.T_/2), 0], [half.ton_+(half.T_/2), 0], [half.ton_+(half.T_/2), entrada_half_/2],
        [half.T_, entrada_half_/2], [half.T_, entrada_half_], [half.T_ + half.ton_, entrada_half_], [half.T_ + half.ton_, entrada_half_/2], [half.T_+(half.T_/2), entrada_half_/2], [half.T_+(half.T_/2), 0], [half.T_ + half.ton_+(half.T_/2), 0], [half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [2 * half.T_, entrada_half_/2], [2 * half.T_, entrada_half_], [2 * half.T_ + half.ton_, entrada_half_], [2 * half.T_ + half.ton_, entrada_half_/2], [2 * half.T_+(half.T_/2), entrada_half_/2], [2 * half.T_+(half.T_/2), 0], [2 * half.T_ + half.ton_+(half.T_/2), 0], [2 * half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [3 * half.T_, entrada_half_/2]];

        // indutor
        t3_plot = [[0, entrada_half-saida], [half.ton, entrada_half-saida], [half.ton, -saida], [half.T, -saida], [half.T, entrada_half-saida], [half.T + half.ton, entrada_half-saida], [half.T + half.ton, -saida], [2 * half.T, -saida], [2 * half.T, entrada_half-saida], [2 * half.T + half.ton, entrada_half-saida], [2 * half.T + half.ton, -saida], [3 * half.T, -saida], [3 * half.T, entrada_half-saida], [3 * half.T + half.ton, entrada_half-saida]];
    } 
    else {
        pico = ((entrada_half - saida) / half.Lo) * half.ton;
        pico_ = ((entrada_half - saida) / half.Lo) * half.ton*trafo;

        tcorte = half.ton+(half.ton*((entrada_half)-saida))/saida;
        tcorte=tcorte/2;
        // indutor
        i1_plot = [[0, 0], [half.ton_, pico], [tcorte, 0],
        [half.T, 0], [half.ton_ + half.T, pico], [tcorte + half.T, 0], [half.T * 2, 0],
        [half.ton_ + half.T * 2, pico], [tcorte + half.T * 2, 0], [half.T * 3, 0],
        [half.ton_ + half.T * 3, pico]];

        // chave
        i2_plot = [[0, 0], [half.ton, pico_], [half.ton, 0], [tcorte, 0],
        [half.T_, 0], [half.ton + half.T_, pico_], [half.ton + half.T_, 0], [tcorte + half.T_, 0],
        [half.T_ * 2, 0], [half.ton + half.T_ * 2, pico_], [half.ton + half.T_ * 2, 0],
        [half.T_ * 3, 0], [half.ton + half.T_ * 3, pico_]];

        i2_plot_ = [[0, 0], [0+(half.T_/2), 0], [half.ton + (half.T_/2), pico_], [half.ton + (half.T_/2), 0], [tcorte, 0],
        [half.T_ + (half.T_/2), 0], [half.ton + half.T_ + (half.T_/2), pico_], [half.ton + half.T_ + (half.T_/2), 0], [tcorte + half.T_ + (half.T_/2), 0],
        [half.T_ * 2 + (half.T_/2), 0], [half.ton + half.T_ * 2 + (half.T_/2), pico_], [half.ton + half.T_ * 2 + (half.T_/2), 0],
        [half.T_ * 3, 0]];

        // diodo
        i3_plot = [[0, 0], [half.ton, pico], [half.ton, pico/2], [tcorte, 0], [half.ton+(half.T_/2), 0], [half.ton+(half.T_/2), pico/2], [tcorte+(half.T_/2), 0],
        [half.T_, 0], [half.ton + half.T_, pico], [half.ton + half.T_, pico/2], [tcorte + half.T_, 0], [half.ton + half.T_+(half.T_/2), 0], [half.ton + half.T_+(half.T_/2), pico/2], [tcorte + half.T_+(half.T_/2), 0],
        [half.T_ * 2, 0], [half.ton + half.T_ * 2, pico], [half.ton + half.T_ * 2, pico/2], [tcorte + half.T_ * 2, 0], [half.ton + half.T_ * 2+(half.T_/2), 0], [half.ton + half.T_ * 2+(half.T_/2), pico/2], [tcorte + half.T_ * 2+(half.T_/2), 0],
        [half.T_ * 3, 0]];

        i3_plot_ = [[0, 0], [half.ton, 0], [half.ton, pico/2], [tcorte, 0], [0+(half.T_/2), 0], [half.ton+(half.T_/2), pico], [half.ton+(half.T_/2), pico/2], [tcorte+(half.T_/2), 0],
        [half.ton + half.T_, 0], [half.ton + half.T_, pico/2], [tcorte + half.T_, 0],[half.T_+(half.T_/2), 0], [half.ton + half.T_+(half.T_/2), pico], [half.ton + half.T_+(half.T_/2), pico/2], [tcorte + half.T_+(half.T_/2), 0],
        [half.ton + half.T_ * 2, 0], [half.ton + half.T_ * 2, pico/2], [tcorte + half.T_ * 2, 0], [half.T_ * 2+(half.T_/2), 0], [half.ton + half.T_ * 2+(half.T_/2), pico], [half.ton + half.T_ * 2+(half.T_/2), pico/2], [tcorte + half.T_ * 2+(half.T_/2), 0],
        [half.T_ * 3, 0]];

        // diodo
        t1_plot_ = [[0, entrada_half], [half.ton, entrada_half], [half.ton, 0], [tcorte, 0], [tcorte, saida], [0+(half.T_/2), saida], [0+(half.T_/2), 0], [tcorte+(half.T_/2), 0], [tcorte+(half.T_/2), saida],
        [half.T_, saida], [half.T_, entrada_half], [half.ton + half.T_, entrada_half], [half.ton + half.T_, 0], [tcorte + half.T_, 0], [tcorte + half.T_, saida], [half.T_+(half.T_/2), saida], [half.T_+(half.T_/2), 0], [tcorte + half.T_+(half.T_/2), 0], [tcorte + half.T_+(half.T_/2), saida], 
        [half.T_ * 2, saida], [half.T_ * 2, entrada_half], [half.T_ * 2, entrada_half], [half.ton + half.T_ * 2, entrada_half], [half.ton + half.T_ * 2, 0], [tcorte + half.T_ * 2, 0], [tcorte + half.T_ * 2, saida], [half.T_ * 2+(half.T_/2), saida], [half.T_ * 2+(half.T_/2), 0], [tcorte + half.T_ * 2+(half.T_/2), 0], [tcorte + half.T_ * 2+(half.T_/2), saida],
        [half.T_ * 3, saida]];

        t1_plot = [[0, 0], [half.ton, 0], [half.ton, 0], [tcorte, 0], [tcorte, saida], [0+(half.T_/2), saida], [0+(half.T_/2), entrada_half], [half.ton+(half.T_/2), entrada_half], [half.ton+(half.T_/2), 0], [tcorte+(half.T_/2), 0], [tcorte+(half.T_/2), saida],
        [half.T_, saida], [half.T_, 0], [half.ton + half.T_, 0], [half.ton + half.T_, 0], [tcorte + half.T_, 0], [tcorte + half.T_, saida], [half.T_+(half.T_/2), saida], [half.T_+(half.T_/2), entrada_half], [half.ton + half.T_+(half.T_/2), entrada_half], [half.ton + half.T_+(half.T_/2), 0], [tcorte + half.T_+(half.T_/2), 0], [tcorte + half.T_+(half.T_/2), saida], 
        [half.T_ * 2, saida], [half.T_ * 2, saida],  [half.T_ * 2, 0], [half.ton + half.T_ * 2, 0], [half.ton + half.T_ * 2, 0], [tcorte + half.T_ * 2, 0], [tcorte + half.T_ * 2, saida], [half.T_ * 2+(half.T_/2), saida], [half.T_ * 2+(half.T_/2), entrada_half], [half.ton + half.T_ * 2+(half.T_/2), entrada_half], [half.ton + half.T_ * 2+(half.T_/2), 0], [tcorte + half.T_ * 2+(half.T_/2), 0], [tcorte + half.T_ * 2+(half.T_/2), saida],
        [half.T_ * 3, saida]];

        // chave
        t2_plot = [[0, 0], [half.ton_, 0], [half.ton_, entrada_half_/2], [(half.T_/2), entrada_half_/2], [(half.T_/2), entrada_half_], [half.ton_+(half.T_/2), entrada_half_], [half.ton_+(half.T_/2), entrada_half_/2],
        [half.T_, entrada_half_/2], [half.T_, 0], [half.T_ + half.ton_, 0], [half.T_ + half.ton_, entrada_half_/2], [half.T_+(half.T_/2), entrada_half_/2], [half.T_+(half.T_/2), entrada_half_], [half.T_ + half.ton_+(half.T_/2), entrada_half_], [half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [2 * half.T_, entrada_half_/2], [2 * half.T_, 0], [2 * half.T_ + half.ton_, 0], [2 * half.T_ + half.ton_, entrada_half_/2], [2 * half.T_+(half.T_/2), entrada_half_/2], [2 * half.T_+(half.T_/2), entrada_half_], [2 * half.T_ + half.ton_+(half.T_/2), entrada_half_], [2 * half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [3 * half.T_, entrada_half_/2], [3 * half.T_, 0], [3 * half.T_ + half.ton_, 0]];

        t2_plot_ = [[0, entrada_half_/2], [(half.T_/2), entrada_half_/2], [(half.T_/2), 0], [half.ton_+(half.T_/2), 0], [half.ton_+(half.T_/2), entrada_half_/2],
        [half.T_, entrada_half_/2], [half.T_, entrada_half_], [half.T_ + half.ton_, entrada_half_], [half.T_ + half.ton_, entrada_half_/2], [half.T_+(half.T_/2), entrada_half_/2], [half.T_+(half.T_/2), 0], [half.T_ + half.ton_+(half.T_/2), 0], [half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [2 * half.T_, entrada_half_/2], [2 * half.T_, entrada_half_], [2 * half.T_ + half.ton_, entrada_half_], [2 * half.T_ + half.ton_, entrada_half_/2],
        [2 * half.T_+(half.T_/2), entrada_half_/2], [2 * half.T_+(half.T_/2), 0], [2 * half.T_ + half.ton_+(half.T_/2), 0], [2 * half.T_ + half.ton_+(half.T_/2), entrada_half_/2],
        [3 * half.T_ + half.ton_, entrada_half_/2]];

        // indutor
        t3_plot = [[0, entrada_half-saida], [half.ton, entrada_half-saida], [half.ton, -saida], [tcorte, -saida], [tcorte, 0], [half.T, 0], [half.T, entrada_half-saida], [half.ton + half.T, entrada_half-saida], [half.ton + half.T, -saida], [tcorte + half.T, -saida], [tcorte + half.T, 0], [half.T * 2, 0], [half.T * 2, entrada_half-saida], [half.ton + half.T * 2, entrada_half-saida], [half.ton + half.T * 2, -saida], [tcorte + half.T * 2, -saida], [tcorte + half.T * 2, 0], [half.T * 3, 0], [half.T * 3, entrada_half-saida], [half.ton + half.T * 3, entrada_half-saida]];
    }
    $.plot($("#corrente_indutor_half"), [
    {
        color: 6,
        label: "Corrente Indutor",
        data: i1_plot
    },
    ], {
        yaxis: {
            min: 0
        }
    });

    textox('Tempo (s)','#corrente_indutor_half');
    textoy('Corrente (A)','#corrente_indutor_half');

    $.plot($("#tensao_indutor_half"), [
    {
        color: 0,
        label: "Tensão Indutor",
        data: t3_plot
    },
    ], {
        yaxis: {
//      min: -50
}
});

    textox('Tempo (s)','#tensao_indutor_half');
    textoy('Tensão (V)','#tensao_indutor_half');

    var datasetsDiodosA = {
        "Diodo1Ahalf": {
            color: 6,
            label: "Corrente Diodo 1",
            data: i3_plot
        }, "Diodo2Ahalf":
        {
            color: 12,
            label: "Corrente Diodo 2",
            data: i3_plot_
        }};
        var choiceContainerDiodosA = $("#choicesDiodosA_half");
        choiceContainerDiodosA.html("")
        $.each(datasetsDiodosA, function(key, val) {
            choiceContainerDiodosA.append("<input type='checkbox' name='" + key +
                "' checked='checked' id='id" + key + "'></input>" +
                "<label for='id" + key + "'>"
                + val.label + "&nbsp;</label>");
        });

        choiceContainerDiodosA.find("input").click(plotAccordingToChoicesDiodosA);

        function plotAccordingToChoicesDiodosA() {

            var data = [];

            choiceContainerDiodosA.find("input:checked").each(function () {
                var key = $(this).attr("name");
                if (key && datasetsDiodosA[key]) {
                    data.push(datasetsDiodosA[key]);
                }
            });

            if (data.length > 0) {
                $.plot("#corrente_diodo_half", data, {
                    yaxis: {
                        min: 0
                    }
                });
                textox('Tempo (s)','#corrente_diodo_half');
                textoy('Corrente (A)','#corrente_diodo_half');
            }
        }

        plotAccordingToChoicesDiodosA();

        var datasetsDiodosV = {
            "Diodo1Vhalf": {
                color: 6,
                label: "Tensão Diodo 1",
                data: t1_plot
            }, "Diodo2Vhalf":
            {
                color: 12,
                label: "Tensão Diodo 2",
                data: t1_plot_
            }};
            var choiceContainerDiodosV = $("#choicesDiodosV_half");
            choiceContainerDiodosV.html("")
            $.each(datasetsDiodosV, function(key, val) {
                choiceContainerDiodosV.append("<input type='checkbox' name='" + key +
                    "' checked='checked' id='id" + key + "'></input>" +
                    "<label for='id" + key + "'>"
                    + val.label + "&nbsp;</label>");
            });

            choiceContainerDiodosV.find("input").click(plotAccordingToChoicesDiodosV);

            function plotAccordingToChoicesDiodosV() {

                var data = [];

                choiceContainerDiodosV.find("input:checked").each(function () {
                    var key = $(this).attr("name");
                    if (key && datasetsDiodosV[key]) {
                        data.push(datasetsDiodosV[key]);
                    }
                });

                if (data.length > 0) {
                    $.plot("#tensao_diodo_half", data, {
                        yaxis: {
                            min: 0
                        }
                    });
                    textox('Tempo (s)','#tensao_diodo_half');
                    textoy('Tensão (V)','#tensao_diodo_half');
                }
            }

            plotAccordingToChoicesDiodosV();

            var datasetsChavesA = {
                "Chave1Ahalf": {
                    color: 6,
                    label: "Corrente Chave 1",
                    data: i2_plot
                }, "Chave2Ahalf":
                {
                    color: 12,
                    label: "Corrente Chave 2",
                    data: i2_plot_
                }};
                var choiceContainerChavesA = $("#choicesChavesA_half");
                choiceContainerChavesA.html("")
                $.each(datasetsChavesA, function(key, val) {
                    choiceContainerChavesA.append("<input type='checkbox' name='" + key +
                        "' checked='checked' id='id" + key + "'></input>" +
                        "<label for='id" + key + "'>"
                        + val.label + "&nbsp;</label>");
                });

                choiceContainerChavesA.find("input").click(plotAccordingToChoicesChavesA);

                function plotAccordingToChoicesChavesA() {

                    var data = [];

                    choiceContainerChavesA.find("input:checked").each(function () {
                        var key = $(this).attr("name");
                        if (key && datasetsChavesA[key]) {
                            data.push(datasetsChavesA[key]);
                        }
                    });

                    if (data.length > 0) {
                        $.plot("#corrente_chave_half", data, {
                            yaxis: {
                                min: 0
                            }
                        });
                        textox('Tempo (s)','#corrente_chave_half');
                        textoy('Corrente (A)','#corrente_chave_half');
                    }
                }

                plotAccordingToChoicesChavesA();

                var datasetsChavesV = {
                    "Chave1Vhalf": {
                        color: 6,
                        label: "Tensão Chave 1",
                        data: t2_plot
                    }, "Chave2Vhalf":
                    {
                        color: 12,
                        label: "Tensão Chave 2",
                        data: t2_plot_
                    }};
                    var choiceContainerChavesV = $("#choicesChavesV_half");
                    choiceContainerChavesV.html("")
                    $.each(datasetsChavesV, function(key, val) {
                        choiceContainerChavesV.append("<input type='checkbox' name='" + key +
                            "' checked='checked' id='id" + key + "'></input>" +
                            "<label for='id" + key + "'>"
                            + val.label + "&nbsp;</label>");
                    });

                    choiceContainerChavesV.find("input").click(plotAccordingToChoicesChavesV);

                    function plotAccordingToChoicesChavesV() {

                        var data = [];

                        choiceContainerChavesV.find("input:checked").each(function () {
                            var key = $(this).attr("name");
                            if (key && datasetsChavesV[key]) {
                                data.push(datasetsChavesV[key]);
                            }
                        });

                        if (data.length > 0) {
                            $.plot("#tensao_chave_half", data, {
                                yaxis: {
                                    min: 0
                                }
                            });
                            textox('Tempo (s)','#tensao_chave_half');
                            textoy('Tensão (V)','#tensao_chave_half');
                        }
                    }

                    plotAccordingToChoicesChavesV();

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=saida_half / entrada_half;
    Gdo=saida_half/half.D;
    wo=1/Math.sqrt(half.Lo*half.capacitancia);
    Q=carga_half*Math.sqrt(half.capacitancia/half.Lo);
    si = 1/(2*Q);

    j = 100;
    while (j < 1000000) {
        g_plot.push([j, 20 * Math.log((Gdo/(Math.sqrt(( (1-(j/wo)*(j/wo))*(1-(j/wo)*(j/wo)) ) + ( (1/(Q*Q))*((j/wo)*(j/wo)) )))))/Math.log(10) ]);
        fase = (180 / Math.PI) * Math.atan( ( (1/(Q))*(j/wo)) / ( (1-(j/wo)*(j/wo)) ));
        if (fase < 0) {
            fase = fase + 180;
        }
        f_plot.push([j, -fase]);
        j += 100;
    }
    $.plot($("#diagrama_bode_half"), [
    {
        color: 2,
        label: "Diagrama de Ganho",
        data: g_plot
    }
    ], {
        xaxis: {
            ticks: [100,1000,10000,100000],
            transform:  function(v) {return Math.log(v);} , tickDecimals: 1 ,
            tickFormatter: function (v, axis) {return "10" + (Math.round( Math.log(v)/Math.LN10)).toString().sup();}
        },
        yaxis: {
            ticks: 4
        }
    });
    $.plot($("#diagrama_fase_half"), [
    {
        color: 2,
        label: "Diagrama de Fase",
        data: f_plot
    }
    ], {
        xaxis: {
            ticks: [100,1000,10000,100000],
            transform:  function(v) {return Math.log(v);} , tickDecimals: 1 ,
            tickFormatter: function (v, axis) {return "10" + (Math.round( Math.log(v)/Math.LN10)).toString().sup();}
        }
    });

    textox('Frequência (Hz)','#diagrama_bode_half');
    textoy('Ganho (V)','#diagrama_bode_half');

    textox('Frequência (Hz)','#diagrama_fase_half');
    textoy('Ângulo (°)','#diagrama_fase_half');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////
step_plot = [];

t=0;
if (si > 1) {
    while (t < 5*((3*si)/wo)) {
        step_plot.push([t, entrada_half * Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
        t+=((5*((3*si)/wo))/100);
    }
}
else {
    while (t < 4.6/(si*wo)) {
        step_plot.push([t, entrada_half * Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
        t+=((5*((3*si)/wo))/100);
    }
}

$.plot($("#resposta_degrau_half"), [
{
    color: 3,
    label: "Resposta ao Degrau",
    data: step_plot
}
], {
    xaxis: {
        min: 0
    },
    yaxis: {
        min: 0
    },
    grid: {
        hoverable: true,
        clickable: true
    }

});

textox('Tempo (s)','#resposta_degrau_half');
textoy('Tensão (V)','#resposta_degrau_half');

$("#resposta_degrau_half").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            $("#valor_tensao_step_half").html("Vo (V) =  " + pos.y.toFixed(2));
            $("#valor_tempo_step_half").html("t (s) = " + pos.x.toFixed(6));
        }
    }
});
}

if (carga_manual_half === "null") {
    carga_manual_half = carga_half.toFixed(2);
}

};