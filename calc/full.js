///////////////////////////////
// FULL
///////////////////////////////

var carga_full, carga_manual_full, contas_full, handle_check_full, play_full, carga_nova;

carga_full = 0;
ganho_ponto = 0;

carga_manual_full = "null";

handle_check_full = function() {
    var estado;
    estado = $("#check_load_full").is(':checked');
    if (!estado) {
        $("#carga_tag_full").html("Carga (&Omega;): " + carga_full.toFixed(2) + " <input id='check_load_full' type='checkbox' onclick='handle_check_full()'>");
    } else {
        $("#carga_tag_full").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_full + "' id='carga_manual_full' onkeydown='if (event.keyCode == 13) play_full()'> <input id='check_load_full' type='checkbox' checked='true' onclick='handle_check_full()'>");
    }
};

contas_full = function(entrada_full, saida_full, frequencia_full, potencia_full, delta_i, delta_v) {
    this.q = saida_full / entrada_full_;
    this.D = saida_full / entrada_full;
    this.T = 1 / (frequencia_full * 1000);
    this.T_ = 1 / (frequencia_full_ * 1000);

    this.ton = this.T_ * this.D;
    this.ton_ = this.T_ * this.D;

    this.Io = potencia_full / saida_full;
    this.Lo = (entrada_full_*trafo-saida_full)*this.ton/((delta_i / 100) * this.Io);
    this.delta_i = delta_i;
    this.capacitancia = entrada_full / (31 * this.Lo * frequencia_full * 1000 * frequencia_full * 1000 * delta_v / 100 * saida_full);
    this.Lcri = (entrada_full_*trafo-saida_full)*this.ton/(2*this.Io);
    this.Ilmed = ((entrada_full - saida_full) * this.q) / frequencia_full * 1000 * 2 * this.Lo;
    this.critico = trafo*(-this.D * this.D+(this.D/2));
    this.Iocrit = ((delta_i / 100) * this.Io)/2;
    carga_full = saida_full * saida_full / potencia_full;
};

play_full = function() {
    var i3_plot, si, t, step_plot, j, Ggo, Gdo, wo, Q, funcao, D, full, carga_ponto, cond, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, denominador, entrada_full, f_plot, fase, frequencia_full, g_plot, ganho_ponto, i1_plot, i2_plot, imaginaria, k, options, pico, plot, ponto, potencia_full, real, saida, saida_full, tcorte, tensao_saida_full, v_carga;

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

//ganho_ponto = parseFloat($("#ganho_full").text());
//k_ponto = parseFloat($("#k_full").text());

entrada_full = parseFloat($("#entrada_full").val()) * 2 * parseFloat($("#trafo_full").val());
entrada_full_ = parseFloat($("#entrada_full").val());

trafo = parseFloat($("#trafo_full").val());

saida_full = parseFloat($("#saida_full").val());
frequencia_full = 2*parseFloat($("#frequencia_full").val());
frequencia_full_ = parseFloat($("#frequencia_full").val());

potencia_full = parseFloat($("#potencia_full").val());
delta_v = parseFloat($("#delta_v_full").val());
delta_i = parseFloat($("#delta_i_full").val());

if((saida_full / entrada_full)>0.5) {
    alert('Razão cíclica deve ser menor que 0.5!')
    return false;
}

///////////////////////////////
// MODO DE CONDUÇÃO
///////////////////////////////

full = new contas_full(entrada_full, saida_full, frequencia_full, potencia_full, delta_i, delta_v);
if ($("#check_load_full").is(':checked')) {
    carga_full = parseFloat($("#carga_manual_full").val());
    full.Io = saida_full / carga_full;
    carga_manual_full = carga_full;
}
k = (full.Io * full.Lo) / (entrada_full_ * full.T_);

///////////////////////////////
// CONTÍNUO
///////////////////////////////

if (k > full.critico) {
    $("#modo_conducao_full").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_full').show()
    cond = "cont";
    $("#potencia_atual_full").hide();
    $("#tensao_atual_full").html("<br>");
    $("#potencia_atual_full").hide();
    saida = saida_full;
    if ($("#check_load_full").is(':checked')) {
        $("#potencia_atual_full").show();
        $("#potencia_atual_full").html("Po* (W): " + (saida * full.Io).toFixed(2));
    }
} 

///////////////////////////////
// CRÍTICO
///////////////////////////////

else if (full.critico === k) {
    $("#modo_conducao_full").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = full.critico;
    saida = saida_full;
    $("#potencia_atual_full").show();
    $("#potencia_atual_full").html("Po* (W): " + (saida * full.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUO
///////////////////////////////

else {
    $("#modo_conducao_full").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_full').hide()

    cond = "desc";

    ganho_ponto=0;
    i=0;
    while (i < full.critico) {
        ganho = (trafo*full.D*full.D)/(full.D*full.D+(i/trafo));
        carga_nova=((full.Lo * ganho) / (i * full.T_)).toFixed(1);
        var diff = Math.abs( (carga_nova) - carga_full );
        if( diff < 5 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }

    saida = parseFloat((ganho_ponto * entrada_full_).toFixed(1));
    full.Io = saida / carga_full;
//    k = (full.Io * full.Lo) / (entrada_full_ * full.T_);

    $("#tensao_atual_full").html("Vo* (V): " + saida);
    $("#potencia_atual_full").show();
    $("#potencia_atual_full").html("Po* (W): " + (saida * full.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_full").html("Capacitância (uF): " + (full.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_full").html("Ganho Estático: " + (saida / entrada_full_).toFixed(2));
$("#duty_tag_full").html("Razão Cíclica: " + full.D.toFixed(2));
$("#indutancia_critica_full").html("Indut. Crítica (uH): " + (full.Lcri * 1000000).toFixed(2));
$("#io_param_full").html("k (param.): " + k.toFixed(2));
$("#io_critica_full").html("I<sub>o</sub> crítica (A): " + full.Iocrit.toFixed(3));
$("#io_full").html("I<sub>o</sub> (A): " + full.Io.toFixed(2));
$("#indutancia_tag_full").html("Indutância (uH): " + (full.Lo * 1000000).toFixed(2));
handle_check_full();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * full.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_full * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_full = $("#tensao_saida_full");
options = {
    xaxis: {
        ticks: 4,
        zoomRange: [0.0001, 5 * full.T],
        panRange: [0, 5 * full.T]
    },
    yaxis: {
        zoomRange: [1.1 * saida_full / 100 * delta_v, 1.3 * saida],
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

plot = $.plot(tensao_saida_full, data, options);

textox('Tempo (s)','#tensao_saida_full');
textoy('Tensão (V)','#tensao_saida_full');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////

d1_plot = [];
d2_plot = [];
d3_plot = [];
i = 0;
while (i < (1+(2/trafo))/8) {
    d1_plot.push([i, trafo*(1 + Math.sqrt(1 - (16 * i / trafo))) / 2]);
    i += 0.00002;
}
i = 0;
while (i < (1+(2/trafo))/8) {
    d1_plot.push([i, trafo*(1 - Math.sqrt(1 - (16 * i / trafo))) / 2]);
    i += 0.00002;
}
i = 0;
while (i < full.critico) {
    d2_plot.push([i, (trafo*full.D*full.D)/(full.D*full.D+(i/trafo))]);
    i += 0.0005;
}
i = full.critico;
while (i < 0.6) {
    d2_plot.push([i, full.q]);
    i += 0.0005;
}
if (k > 0.5) {
    k = 0.5;
}

if (cond === "cont") {
    d3_plot = [[k, full.q - 0.02], [k, full.q + 0.02]];
}
else {
    d3_plot = [[k,  (trafo*full.D*full.D)/(full.D*full.D+(k/trafo)) - 0.02], [k, (trafo*full.D*full.D)/(full.D*full.D+(k/trafo)) + 0.02]];
}

$.plot($("#grafico_operacao_full"), [
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
        max: trafo,
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
$("#grafico_operacao_full").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            if (pos.x > 0 && pos.x < 1 && pos.y > 0 && pos.y < trafo) {
                $("#valor_k_full").html("k = " + pos.x.toFixed(2));
                if (pos.x > (full.critico)) {
                    $("#valor_ganho_full").html("Ganho Estático = " + full.q.toFixed(2));
                    $("#continha_full").html("CONTÍNUO");
                    $("#valor_vo_full").html("Vo (V) = " + (entrada_full_ * full.q).toFixed(2));
                    carga_nova=((full.Lo * item.datapoint[1]) / (item.datapoint[0] * full.T_)).toFixed(2);
                    $("#valor_novo_carga_full").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_full").html("Io (A) = " + ((pos.y * entrada_full_) / carga_nova).toFixed(2));
                } else {
                    $("#valor_ganho_full").html("Ganho Estático = " + pos.y.toFixed(2));
                    $("#continha_full").html("DESCONTÍNUO");
                    $("#valor_vo_full").html("Vo (V) = " + (pos.y * entrada_full_).toFixed(2));
                    carga_nova=((full.Lo * item.datapoint[1]) / (item.datapoint[0] * full.T_)).toFixed(2);
                    $("#valor_novo_carga_full").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_full").html("Io (A) = " + ((pos.y * entrada_full_) / carga_nova).toFixed(2));
                }
            }
        }
    }
});

$("#grafico_operacao_full").bind("plotclick", function (event, pos, item) {
if ($("#check_load_full").is(':checked')) {
    $("#carga_manual_full").val(carga_nova);
} else {
    $("#check_load_full").prop('checked', true);
    handle_check_full();
    $("#carga_manual_full").val(carga_nova);
}
});

textox('Corrente Parametrizada','#grafico_operacao_full');
textoy('Ganho','#grafico_operacao_full');

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
    varia_corrente = (((entrada_full_*trafo - saida) / full.Lo) * full.ton)/2;

    var varia_corrente_;
    varia_corrente_ = (((entrada_full_*trafo - saida) / full.Lo) * full.ton*trafo)/2;

        // indutor
        i1_plot = [[0, full.Io - varia_corrente], [full.ton, full.Io + varia_corrente],
        [full.T, full.Io - varia_corrente], [full.T + full.ton, full.Io + varia_corrente],
        [2 * full.T, full.Io - varia_corrente], [2 * full.T + full.ton, full.Io + varia_corrente],
        [3 * full.T, full.Io - varia_corrente], [3 * full.T + full.ton, full.Io + varia_corrente]];

        // chave
        i2_plot = [[0, full.Io*trafo - varia_corrente_], [full.ton, full.Io*trafo + varia_corrente_], [full.ton, 0],
        [full.T_, 0], [full.T_, full.Io*trafo - varia_corrente_], [full.T_ + full.ton, full.Io*trafo + varia_corrente_], [full.T_ + full.ton, 0],
        [2 * full.T_, 0], [2 * full.T_, full.Io*trafo - varia_corrente_], [2 * full.T_ + full.ton, full.Io*trafo + varia_corrente_], [2 * full.T_ + full.ton, 0],
        [3 * full.T_, 0], [3 * full.T_, full.Io*trafo - varia_corrente_], [3 * full.T_ + full.ton, full.Io*trafo + varia_corrente_]];

        i2_plot_ = [[0, 0], [0+(full.T_/2), 0], [0+(full.T_/2), full.Io*trafo - varia_corrente_], [full.ton +(full.T_/2), full.Io*trafo + varia_corrente_], [full.ton +(full.T_/2), 0],
        [full.T_ +(full.T_/2), 0], [full.T_ +(full.T_/2), full.Io*trafo - varia_corrente_], [full.T_ + full.ton +(full.T_/2), full.Io*trafo + varia_corrente_], [full.T_ + full.ton +(full.T_/2), 0],
        [2 * full.T_ +(full.T_/2), 0], [2 * full.T_ +(full.T_/2), full.Io*trafo - varia_corrente_], [2 * full.T_ + full.ton +(full.T_/2), full.Io*trafo + varia_corrente_], [2 * full.T_ + full.ton +(full.T_/2), 0],
        [3 * full.T_ + full.ton, 0]];

        // diodo
        i3_plot = [[0, full.Io - varia_corrente], [full.ton, full.Io + varia_corrente], [full.ton, full.Io/2 + varia_corrente/2], [0 +(full.T_/2), full.Io/2 - varia_corrente/2], [0 +(full.T_/2), 0], [full.ton +(full.T_/2), 0], [full.ton +(full.T_/2), full.Io/2 + varia_corrente/2],
        [full.T_, full.Io/2 - varia_corrente/2], [full.T_, full.Io - varia_corrente], [full.T_ + full.ton, full.Io + varia_corrente], [full.T_ + full.ton, full.Io/2 + varia_corrente/2], [full.T_ +(full.T_/2), full.Io/2 - varia_corrente/2], [full.T_ +(full.T_/2), 0], [full.T_ + full.ton +(full.T_/2), 0], [full.T_ + full.ton +(full.T_/2), full.Io/2 + varia_corrente/2],
        [2 * full.T_, full.Io/2 - varia_corrente/2], [2 * full.T_, full.Io - varia_corrente], [2 * full.T_ + full.ton, full.Io + varia_corrente], [2 * full.T_ + full.ton, full.Io/2 + varia_corrente/2],
        [2 * full.T_ +(full.T_/2), full.Io/2 - varia_corrente/2], [2 * full.T_ +(full.T_/2), 0], [2 * full.T_ + full.ton +(full.T_/2), 0], [2 * full.T_ + full.ton +(full.T_/2), full.Io/2 + varia_corrente/2],
        [3 * full.T_, full.Io/2 - varia_corrente/2], [3 * full.T_, full.Io - varia_corrente], [3 * full.T_ + full.ton, full.Io + varia_corrente]];

        i3_plot_ = [[0, 0], [full.ton, 0], [full.ton, full.Io/2 + varia_corrente/2], [0+(full.T_/2), full.Io/2 - varia_corrente/2], [0+(full.T_/2), full.Io - varia_corrente], [full.ton+(full.T_/2), full.Io + varia_corrente], [full.ton+(full.T_/2), full.Io/2 + varia_corrente/2],
        [0 +full.T_, full.Io/2 - varia_corrente/2], [0 +full.T_, 0], [full.ton +full.T_, 0], [full.ton +full.T_, full.Io/2 + varia_corrente/2], [full.T_+(full.T_/2), full.Io/2 - varia_corrente/2],
        [full.T_+(full.T_/2), full.Io - varia_corrente], [full.T_+(full.T_/2) + full.ton, full.Io + varia_corrente], [full.T_ + full.ton+(full.T_/2), full.Io/2 + varia_corrente/2],
        [full.T_ +full.T_, full.Io/2 - varia_corrente/2], [full.T_ +full.T_, 0], [full.T_ + full.ton +full.T_, 0], [full.T_ + full.ton +full.T_, full.Io/2 + varia_corrente/2],
        [2 * full.T_+(full.T_/2), full.Io/2 - varia_corrente/2], [2 * full.T_+(full.T_/2), full.Io - varia_corrente], [2 * full.T_ + full.ton+(full.T_/2), full.Io + varia_corrente], [2 * full.T_ + full.ton+(full.T_/2), full.Io/2 + varia_corrente/2],
        [2 * full.T_ +full.T_, full.Io/2 - varia_corrente/2], [2 * full.T_ +full.T_, 0], [2 * full.T_ + full.ton +full.T_, 0]];

        // diodo
        t1_plot_ = [[0, entrada_full*2], [full.ton, entrada_full*2], [full.ton, 0],
        [full.T_, 0], [full.T_, entrada_full*2], [full.T_ + full.ton, entrada_full*2], [full.T_ + full.ton, 0],
        [2 * full.T_, 0], [2 * full.T_, entrada_full*2], [2 * full.T_ + full.ton, entrada_full*2], [2 * full.T_ + full.ton, 0],
        [3 * full.T_, 0], [3 * full.T_, entrada_full*2], [3 * full.T_ + full.ton, entrada_full*2]];

        t1_plot = [[0, 0], [full.ton, 0], [0+(full.T_/2), 0], [0+(full.T_/2), entrada_full*2], [full.ton+(full.T_/2), entrada_full*2], [full.ton+(full.T_/2), 0],
        [full.T_+(full.T_/2), 0], [full.T_+(full.T_/2), entrada_full*2], [full.T_+(full.T_/2) + full.ton, entrada_full*2], [full.T_+(full.T_/2) + full.ton, 0],
        [2 * full.T_+(full.T_/2), 0], [2 * full.T_+(full.T_/2), entrada_full*2], [2 * full.T_+(full.T_/2) + full.ton, entrada_full*2], [2 * full.T_ + full.ton+(full.T_/2), 0],
        [3 * full.T_, 0]];

        // chave
        t2_plot = [[0, 0], [full.ton_, 0], [full.ton_, entrada_full_/2], [(full.T_/2), entrada_full_/2], [(full.T_/2), entrada_full_], [full.ton_+(full.T_/2), entrada_full_], [full.ton_+(full.T_/2), entrada_full_/2],
        [full.T_, entrada_full_/2], [full.T_, 0], [full.T_ + full.ton_, 0], [full.T_ + full.ton_, entrada_full_/2], [full.T_+(full.T_/2), entrada_full_/2], [full.T_+(full.T_/2), entrada_full_], [full.T_ + full.ton_+(full.T_/2), entrada_full_], [full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [2 * full.T_, entrada_full_/2], [2 * full.T_, 0], [2 * full.T_ + full.ton_, 0], [2 * full.T_ + full.ton_, entrada_full_/2], [2 * full.T_+(full.T_/2), entrada_full_/2], [2 * full.T_+(full.T_/2), entrada_full_], [2 * full.T_ + full.ton_+(full.T_/2), entrada_full_], [2 * full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [3 * full.T_, entrada_full_/2], [3 * full.T_, 0], [3 * full.T_ + full.ton_, 0]];

        t2_plot_ = [[0, entrada_full_], [full.ton_, entrada_full_], [full.ton_, entrada_full_/2], [(full.T_/2), entrada_full_/2], [(full.T_/2), 0], [full.ton_+(full.T_/2), 0], [full.ton_+(full.T_/2), entrada_full_/2],
        [full.T_, entrada_full_/2], [full.T_, entrada_full_], [full.T_ + full.ton_, entrada_full_], [full.T_ + full.ton_, entrada_full_/2], [full.T_+(full.T_/2), entrada_full_/2], [full.T_+(full.T_/2), 0], [full.T_ + full.ton_+(full.T_/2), 0], [full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [2 * full.T_, entrada_full_/2], [2 * full.T_, entrada_full_], [2 * full.T_ + full.ton_, entrada_full_], [2 * full.T_ + full.ton_, entrada_full_/2],
        [2 * full.T_+(full.T_/2), entrada_full_/2], [2 * full.T_+(full.T_/2), 0], [2 * full.T_ + full.ton_+(full.T_/2), 0], [2 * full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [3 * full.T_, entrada_full_/2], [3 * full.T_, entrada_full_], [3 * full.T_ + full.ton_, entrada_full_]];

        // indutor
        t3_plot = [[0, entrada_full_*trafo-saida], [full.ton, entrada_full_*trafo-saida], [full.ton, -saida],
        [full.T, -saida], [full.T, entrada_full_*trafo-saida], [full.T + full.ton, entrada_full_*trafo-saida], [full.T + full.ton, -saida],
        [2 * full.T, -saida], [2 * full.T, entrada_full_*trafo-saida], [2 * full.T + full.ton, entrada_full_*trafo-saida], [2 * full.T + full.ton, -saida],
        [3 * full.T, -saida], [3 * full.T, entrada_full_*trafo-saida], [3 * full.T + full.ton, entrada_full_*trafo-saida]];
    } 
    else {
        pico = ((entrada_full - saida) / full.Lo) * full.ton;
        pico_ = ((entrada_full - saida) / full.Lo) * full.ton*trafo;

        tcorte = full.ton+(full.ton*((entrada_full)-saida))/saida;
        tcorte=tcorte/2;
        // indutor    
        i1_plot = [[0, 0], [full.ton, pico], [tcorte, 0],
        [full.T, 0], [full.ton + full.T, pico], [tcorte + full.T, 0],
        [full.T * 2, 0], [full.ton + full.T * 2, pico], [tcorte + full.T * 2, 0],
        [full.T * 3, 0], [full.ton + full.T * 3, pico]];

        // chave
        i2_plot = [[0, 0], [full.ton, pico_], [full.ton, 0], [tcorte, 0],
        [full.T_, 0], [full.ton + full.T_, pico_], [full.ton + full.T_, 0], [tcorte + full.T_, 0],
        [full.T_ * 2, 0], [full.ton + full.T_ * 2, pico_], [full.ton + full.T_ * 2, 0], [tcorte + full.T_ * 2, 0],
        [full.T_ * 3, 0], [full.ton + full.T_ * 3, pico_]];

        i2_plot_ = [[0, 0], [0+(full.T_/2), 0], [full.ton + (full.T_/2), pico_], [full.ton + (full.T_/2), 0], [tcorte, 0],
        [full.T_ + (full.T_/2), 0], [full.ton + full.T_ + (full.T_/2), pico_], [full.ton + full.T_ + (full.T_/2), 0], [tcorte + full.T_ + (full.T_/2), 0],
        [full.T_ * 2 + (full.T_/2), 0], [full.ton + full.T_ * 2 + (full.T_/2), pico_], [full.ton + full.T_ * 2 + (full.T_/2), 0], [tcorte + full.T_ * 2 + (full.T_/2), 0], [full.T_ * 3, 0]];

        // diodo
        i3_plot = [[0, 0], [full.ton, pico], [full.ton, pico/2], [tcorte, 0], [full.ton+(full.T_/2), 0], [full.ton+(full.T_/2), pico/2], [tcorte+(full.T_/2), 0], [full.T_, 0], [full.ton + full.T_, pico], [full.ton + full.T_, pico/2],
        [tcorte + full.T_, 0], [full.ton + full.T_+(full.T_/2), 0], [full.ton + full.T_+(full.T_/2), pico/2], [tcorte + full.T_+(full.T_/2), 0],
        [full.T_ * 2, 0], [full.ton + full.T_ * 2, pico], [full.ton + full.T_ * 2, pico/2],
        [tcorte + full.T_ * 2, 0], [full.ton + full.T_ * 2+(full.T_/2), 0], [full.ton + full.T_ * 2+(full.T_/2), pico/2], [tcorte + full.T_ * 2+(full.T_/2), 0], [full.T_ * 3, 0]];

        i3_plot_ = [[0, 0], [full.ton, 0], [full.ton, pico/2], [tcorte, 0], [0+(full.T_/2), 0],
        [full.ton+(full.T_/2), pico], [full.ton+(full.T_/2), pico/2], [tcorte+(full.T_/2), 0],
        [full.ton + full.T_, 0], [full.ton + full.T_, pico/2], [tcorte + full.T_, 0],[full.T_+(full.T_/2), 0], [full.ton + full.T_+(full.T_/2), pico], [full.ton + full.T_+(full.T_/2), pico/2], [tcorte + full.T_+(full.T_/2), 0],
        [full.ton + full.T_ * 2, 0], [full.ton + full.T_ * 2, pico/2], [tcorte + full.T_ * 2, 0],
        [full.T_ * 2+(full.T_/2), 0], [full.ton + full.T_ * 2+(full.T_/2), pico], [full.ton + full.T_ * 2+(full.T_/2), pico/2], [tcorte + full.T_ * 2+(full.T_/2), 0], [full.T_ * 3, 0]];

        // diodo
        t1_plot_ = [[0, entrada_full], [full.ton, entrada_full], [full.ton, 0], [tcorte, 0], [tcorte, saida], [0+(full.T_/2), saida], [0+(full.T_/2), 0], [tcorte+(full.T_/2), 0], [tcorte+(full.T_/2), saida],
        [full.T_, saida], [full.T_, entrada_full], [full.ton + full.T_, entrada_full], [full.ton + full.T_, 0], [tcorte + full.T_, 0], [tcorte + full.T_, saida], [full.T_+(full.T_/2), saida], [full.T_+(full.T_/2), 0], [tcorte + full.T_+(full.T_/2), 0], [tcorte + full.T_+(full.T_/2), saida], 
        [full.T_ * 2, saida], [full.T_ * 2, entrada_full], [full.T_ * 2, entrada_full], [full.ton + full.T_ * 2, entrada_full], [full.ton + full.T_ * 2, 0], [tcorte + full.T_ * 2, 0], [tcorte + full.T_ * 2, saida], [full.T_ * 2+(full.T_/2), saida], [full.T_ * 2+(full.T_/2), 0], [tcorte + full.T_ * 2+(full.T_/2), 0], [tcorte + full.T_ * 2+(full.T_/2), saida],
        [full.T_ * 3, saida]];

        t1_plot = [[0, 0], [full.ton, 0], [full.ton, 0], [tcorte, 0], [tcorte, saida], [0+(full.T_/2), saida], [0+(full.T_/2), entrada_full], [full.ton+(full.T_/2), entrada_full], [full.ton+(full.T_/2), 0], [tcorte+(full.T_/2), 0], [tcorte+(full.T_/2), saida],
        [full.T_, saida], [full.T_, 0], [full.ton + full.T_, 0], [full.ton + full.T_, 0], [tcorte + full.T_, 0], [tcorte + full.T_, saida], [full.T_+(full.T_/2), saida], [full.T_+(full.T_/2), entrada_full], [full.ton + full.T_+(full.T_/2), entrada_full], [full.ton + full.T_+(full.T_/2), 0], [tcorte + full.T_+(full.T_/2), 0], [tcorte + full.T_+(full.T_/2), saida], 
        [full.T_ * 2, saida], [full.T_ * 2, saida],  [full.T_ * 2, 0], [full.ton + full.T_ * 2, 0], [full.ton + full.T_ * 2, 0], [tcorte + full.T_ * 2, 0], [tcorte + full.T_ * 2, saida], [full.T_ * 2+(full.T_/2), saida], [full.T_ * 2+(full.T_/2), entrada_full], [full.ton + full.T_ * 2+(full.T_/2), entrada_full], [full.ton + full.T_ * 2+(full.T_/2), 0], [tcorte + full.T_ * 2+(full.T_/2), 0], [tcorte + full.T_ * 2+(full.T_/2), saida],
        [full.T_ * 3, saida]];

        // chave
        t2_plot = [[0, 0], [full.ton_, 0], [full.ton_, entrada_full_/2], [(full.T_/2), entrada_full_/2], [(full.T_/2), entrada_full_], [full.ton_+(full.T_/2), entrada_full_],
        [full.ton_+(full.T_/2), entrada_full_/2], [full.T_, entrada_full_/2], [full.T_, 0], [full.T_ + full.ton_, 0], [full.T_ + full.ton_, entrada_full_/2],
        [full.T_+(full.T_/2), entrada_full_/2], [full.T_+(full.T_/2), entrada_full_], [full.T_ + full.ton_+(full.T_/2), entrada_full_], [full.T_ + full.ton_+(full.T_/2), entrada_full_/2], [2 * full.T_, entrada_full_/2],
        [2 * full.T_, 0], [2 * full.T_ + full.ton_, 0], [2 * full.T_ + full.ton_, entrada_full_/2],
        [2 * full.T_+(full.T_/2), entrada_full_/2], [2 * full.T_+(full.T_/2), entrada_full_], [2 * full.T_ + full.ton_+(full.T_/2), entrada_full_], [2 * full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [3 * full.T_, entrada_full_/2], [3 * full.T_, 0], [3 * full.T_ + full.ton_, 0]];

        t2_plot_ = [[0, entrada_full_/2], [(full.T_/2), entrada_full_/2], [(full.T_/2), 0], [full.ton_+(full.T_/2), 0], [full.ton_+(full.T_/2), entrada_full_/2],
        [full.T_, entrada_full_/2], [full.T_, entrada_full_], [full.T_ + full.ton_, entrada_full_], [full.T_ + full.ton_, entrada_full_/2],
        [full.T_+(full.T_/2), entrada_full_/2], [full.T_+(full.T_/2), 0], [full.T_ + full.ton_+(full.T_/2), 0], [full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [2 * full.T_, entrada_full_/2], [2 * full.T_, entrada_full_], [2 * full.T_ + full.ton_, entrada_full_], [2 * full.T_ + full.ton_, entrada_full_/2],
        [2 * full.T_+(full.T_/2), entrada_full_/2], [2 * full.T_+(full.T_/2), 0], [2 * full.T_ + full.ton_+(full.T_/2), 0], [2 * full.T_ + full.ton_+(full.T_/2), entrada_full_/2],
        [3 * full.T_ + full.ton_, entrada_full_/2]];
        // indutor
        t3_plot = [[0, entrada_full_*trafo-saida], [full.ton, entrada_full_*trafo-saida], [full.ton, -saida], [tcorte, -saida], [tcorte, 0], [full.T, 0], [full.T, entrada_full_*trafo-saida], [full.ton + full.T, entrada_full_*trafo-saida], [full.ton + full.T, -saida], [tcorte + full.T, -saida], [tcorte + full.T, 0], [full.T * 2, 0], [full.T * 2, entrada_full_*trafo-saida], [full.ton + full.T * 2, entrada_full_*trafo-saida], [full.ton + full.T * 2, -saida], [tcorte + full.T * 2, -saida], [tcorte + full.T * 2, 0], [full.T * 3, 0], [full.T * 3, entrada_full_*trafo-saida], [full.ton + full.T * 3, entrada_full_*trafo-saida]];
    }
    $.plot($("#corrente_indutor_full"), [
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

    textox('Tempo (s)','#corrente_indutor_full');
    textoy('Corrente (A)','#corrente_indutor_full');

    $.plot($("#tensao_indutor_full"), [
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

    textox('Tempo (s)','#tensao_indutor_full');
    textoy('Tensão (V)','#tensao_indutor_full');

    var datasetsDiodosA = {
        "Diodo1Afull": {
            color: 6,
            label: "Corrente Diodo 1",
            data: i3_plot
        }, "Diodo2Afull":
        {
            color: 12,
            label: "Corrente Diodo 2",
            data: i3_plot_
        }};
        var choiceContainerDiodosA = $("#choicesDiodosA_full");
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
                $.plot("#corrente_diodo_full", data, {
                    yaxis: {
                        min: 0
                    }
                });
                textox('Tempo (s)','#corrente_diodo_full');
                textoy('Corrente (A)','#corrente_diodo_full');
            }
        }

        plotAccordingToChoicesDiodosA();

        var datasetsDiodosV = {
            "Diodo1Vfull": {
                color: 6,
                label: "Tensão Diodo 1",
                data: t1_plot
            }, "Diodo2Vfull":
            {
                color: 12,
                label: "Tensão Diodo 2",
                data: t1_plot_
            }};
            var choiceContainerDiodosV = $("#choicesDiodosV_full");
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
                    $.plot("#tensao_diodo_full", data, {
                        yaxis: {
                            min: 0
                        }
                    });
                    textox('Tempo (s)','#tensao_diodo_full');
                    textoy('Tensão (V)','#tensao_diodo_full');
                }
            }

            plotAccordingToChoicesDiodosV();

            var datasetsChavesA = {
                "Chave1Afull": {
                    color: 6,
                    label: "Corrente Chave 1",
                    data: i2_plot
                }, "Chave2Afull":
                {
                    color: 12,
                    label: "Corrente Chave 2",
                    data: i2_plot_
                }};
                var choiceContainerChavesA = $("#choicesChavesA_full");
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
                        $.plot("#corrente_chave_full", data, {
                            yaxis: {
                                min: 0
                            }
                        });
                        textox('Tempo (s)','#corrente_chave_full');
                        textoy('Corrente (A)','#corrente_chave_full');
                    }
                }

                plotAccordingToChoicesChavesA();

                var datasetsChavesV = {
                    "Chave1Vfull": {
                        color: 6,
                        label: "Tensão Chave 1",
                        data: t2_plot
                    }, "Chave2Vfull":
                    {
                        color: 12,
                        label: "Tensão Chave 2",
                        data: t2_plot_
                    }};
                    var choiceContainerChavesV = $("#choicesChavesV_full");
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
                            $.plot("#tensao_chave_full", data, {
                                yaxis: {
                                    min: 0
                                }
                            });
                            textox('Tempo (s)','#tensao_chave_full');
                            textoy('Tensão (V)','#tensao_chave_full');
                        }
                    }

                    plotAccordingToChoicesChavesV();

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=saida_full / entrada_full;
    Gdo=saida_full/full.D;
    wo=1/Math.sqrt(full.Lo*full.capacitancia);
    Q=carga_full*Math.sqrt(full.capacitancia/full.Lo);
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
    $.plot($("#diagrama_bode_full"), [
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
    $.plot($("#diagrama_fase_full"), [
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

    textox('Frequência (Hz)','#diagrama_bode_full');
    textoy('Ganho (V)','#diagrama_bode_full');

    textox('Frequência (Hz)','#diagrama_fase_full');
    textoy('Ângulo (°)','#diagrama_fase_full');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////
step_plot = [];

t=0;
if (si > 1) {
    while (t < 5*((3*si)/wo)) {
        step_plot.push([t, entrada_full * Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
        t+=((5*((3*si)/wo))/100);
    }
}
else {
    while (t < 4.6/(si*wo)) {
        step_plot.push([t, entrada_full * Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
        t+=((5*((3*si)/wo))/100);
    }
}

$.plot($("#resposta_degrau_full"), [
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

textox('Tempo (s)','#resposta_degrau_full');
textoy('Tensão (V)','#resposta_degrau_full');

$("#resposta_degrau_full").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            $("#valor_tensao_step_full").html("Vo (V) =  " + pos.y.toFixed(2));
            $("#valor_tempo_step_full").html("t (s) = " + pos.x.toFixed(6));
        }
    }
});
}

if (carga_manual_full = "null") {
    carga_manual_full = carga_full.toFixed(2);
}

};