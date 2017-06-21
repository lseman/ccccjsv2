///////////////////////////////
// PUSHPULL
///////////////////////////////

var carga_pushpull, carga_manual_pushpull, contas_pushpull, handle_check_pushpull, play_pushpull, carga_nova;

carga_pushpull = 0;

carga_manual_pushpull = "null";

handle_check_pushpull = function() {
    var estado;
    estado = $("#check_load_pushpull").is(':checked');
    if (!estado) {
        $("#carga_tag_pushpull").html("Carga (&Omega;): " + carga_pushpull.toFixed(2) + " <input id='check_load_pushpull' type='checkbox' onclick='handle_check_pushpull()'>");
    } else {
        $("#carga_tag_pushpull").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_pushpull + "' id='carga_manual_pushpull' onkeydown='if (event.keyCode == 13) play_pushpull()'> <input id='check_load_pushpull' type='checkbox' checked='true' onclick='handle_check_pushpull()'>");
    }
};

contas_pushpull = function(entrada_pushpull, saida_pushpull, frequencia_pushpull, potencia_pushpull, delta_i, delta_v) {
    this.q = saida_pushpull / entrada_pushpull_;
    this.D = saida_pushpull / entrada_pushpull;
    this.T = 1 / (frequencia_pushpull * 1000);
    this.T_ = 1 / (frequencia_pushpull_ * 1000);
    this.ton = this.T_ * this.D;
    this.ton_ = this.T_* this.D;

    this.Io = potencia_pushpull / saida_pushpull;
    this.Lo = (entrada_pushpull_*trafo-saida_pushpull)*this.ton/((delta_i / 100) * this.Io);
    this.delta_i = delta_i;
    this.capacitancia = entrada_pushpull / (31 * this.Lo * frequencia_pushpull * 1000 * frequencia_pushpull * 1000 * delta_v / 100 * saida_pushpull);
    this.Lcri = (entrada_pushpull_*trafo-saida_pushpull)*this.ton/(2*this.Io);
    this.Ilmed = ((entrada_pushpull - saida_pushpull) * this.q) / frequencia_pushpull * 1000 * 2 * this.Lo;
    this.critico = trafo*(-this.D * this.D+(this.D/2));
    this.Iocrit = ((delta_i / 100) * this.Io)/2;
    carga_pushpull = saida_pushpull * saida_pushpull / potencia_pushpull;
};

play_pushpull = function() {
    var i3_plot, si, t, step_plot, j, Ggo, Gdo, wo, Q, funcao, D, pushpull, carga_ponto, cond, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, denominador, entrada_pushpull, f_plot, fase, frequencia_pushpull, g_plot, ganho_ponto, i1_plot, i2_plot, imaginaria, k, options, pico, plot, ponto, potencia_pushpull, real, saida, saida_pushpull, tcorte, tensao_saida_pushpull, v_carga;

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

//ganho_ponto = parseFloat($("#ganho_pushpull").text());
//k_ponto = parseFloat($("#k_pushpull").text());

entrada_pushpull = parseFloat($("#entrada_pushpull").val()) * 2 * parseFloat($("#trafo_pushpull").val());
entrada_pushpull_ = parseFloat($("#entrada_pushpull").val());

trafo = parseFloat($("#trafo_pushpull").val());

saida_pushpull = parseFloat($("#saida_pushpull").val());
frequencia_pushpull = 2*parseFloat($("#frequencia_pushpull").val());
frequencia_pushpull_ = parseFloat($("#frequencia_pushpull").val());

potencia_pushpull = parseFloat($("#potencia_pushpull").val());
delta_v = parseFloat($("#delta_v_pushpull").val());
delta_i = parseFloat($("#delta_i_pushpull").val());

if((saida_pushpull / entrada_pushpull)>0.5) {
    alert('Razão cíclica deve ser menor que 0.5!')
    return false;
}

///////////////////////////////
// MODO DE CONDUÇÃO
///////////////////////////////

pushpull = new contas_pushpull(entrada_pushpull, saida_pushpull, frequencia_pushpull, potencia_pushpull, delta_i, delta_v);
//  k = (pushpull.Io * pushpull.Lo) / (entrada_pushpull * pushpull.T);
if ($("#check_load_pushpull").is(':checked')) {
    carga_pushpull = parseFloat($("#carga_manual_pushpull").val());
    pushpull.Io = saida_pushpull / carga_pushpull;
    carga_manual_pushpull = carga_pushpull;
//    k = (pushpull.Io * pushpull.Lo) / (entrada_pushpull * pushpull.T);
}
k = (pushpull.Io * pushpull.Lo) / (entrada_pushpull_ * pushpull.T_);

///////////////////////////////
// CONTÍNUO
///////////////////////////////

if (k > pushpull.critico) {
    $("#modo_conducao_pushpull").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_pushpull').show()
    cond = "cont";
    $("#potencia_atual_pushpull").hide();
//    k = (pushpull.Io * pushpull.Lo) / (entrada_pushpull * pushpull.T);
//    D = pushpull.q;
//    $("#tensao_atual_pushpull").hide();
$("#tensao_atual_pushpull").html("<br>");
$("#potencia_atual_pushpull").hide();
saida = saida_pushpull;
if ($("#check_load_pushpull").is(':checked')) {
    $("#potencia_atual_pushpull").show();
    $("#potencia_atual_pushpull").html("Po* (W): " + (saida * pushpull.Io).toFixed(2));
}
} 

///////////////////////////////
// CRÍTICO
///////////////////////////////

else if (pushpull.critico === k) {
    $("#modo_conducao_pushpull").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = ((pushpull.q * pushpull.q) / 2) * ((1 / pushpull.q) - 1);
    saida = saida_pushpull;
$("#potencia_atual_pushpull").show();
$("#potencia_atual_pushpull").html("Po* (W): " + (saida * pushpull.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUO
///////////////////////////////

else {
    $("#modo_conducao_pushpull").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_pushpull').hide()

    cond = "desc";
//    ganho_ponto=(trafo*pushpull.D*pushpull.D)/(pushpull.D*pushpull.D+(k/trafo));
 
    ganho_ponto=0;
    i=0;
    while (i < pushpull.critico) {
        ganho = (trafo*pushpull.D*pushpull.D)/(pushpull.D*pushpull.D+(i/trafo));
        carga_nova=((pushpull.Lo * ganho) / (i * pushpull.T_)).toFixed(1);
        var diff = Math.abs( (carga_nova) - carga_pushpull );
        if( diff < 5 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }

    saida = parseFloat((ganho_ponto * entrada_pushpull_).toFixed(1));
    pushpull.Io = saida / carga_pushpull;
    $("#tensao_atual_pushpull").html("Vo* (V): " + saida);
    $("#potencia_atual_pushpull").show();
    $("#potencia_atual_pushpull").html("Po* (W): " + (saida * pushpull.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_pushpull").html("Capacitância (uF): " + (pushpull.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_pushpull").html("Ganho Estático: " + (saida / entrada_pushpull_).toFixed(2));
$("#duty_tag_pushpull").html("Razão Cíclica: " + pushpull.D.toFixed(2));
$("#indutancia_critica_pushpull").html("Indut. Crítica (uH): " + (pushpull.Lcri * 1000000).toFixed(2));
$("#io_param_pushpull").html("k (param.): " + k.toFixed(2));
$("#io_critica_pushpull").html("I<sub>o</sub> crítica (A): " + pushpull.Iocrit.toFixed(3));
$("#io_pushpull").html("I<sub>o</sub> (A): " + pushpull.Io.toFixed(2));
$("#indutancia_tag_pushpull").html("Indutância (uH): " + (pushpull.Lo * 1000000).toFixed(2));
handle_check_pushpull();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * pushpull.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_pushpull * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_pushpull = $("#tensao_saida_pushpull");
options = {
    xaxis: {
        ticks: 4,
        zoomRange: [0.0001, 5 * pushpull.T],
        panRange: [0, 5 * pushpull.T]
    },
    yaxis: {
        zoomRange: [1.1 * saida_pushpull / 100 * delta_v, 1.3 * saida],
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

plot = $.plot(tensao_saida_pushpull, data, options);

textox('Tempo (s)','#tensao_saida_pushpull');
textoy('Tensão (V)','#tensao_saida_pushpull');

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
while (i < pushpull.critico) {
    d2_plot.push([i, (trafo*pushpull.D*pushpull.D)/(pushpull.D*pushpull.D+(i/trafo))]);
    i += 0.0005;
}
i = pushpull.critico;
while (i < 0.6) {
    d2_plot.push([i, pushpull.q]);
    i += 0.01;
}
if (k > 0.5) {
    k = 0.5;
}

if (cond === "cont") {
    d3_plot = [[k, pushpull.q - 0.02], [k, pushpull.q + 0.02]];
}
else {
    d3_plot = [[k,  (trafo*pushpull.D*pushpull.D)/(pushpull.D*pushpull.D+(k/trafo)) - 0.02], [k, (trafo*pushpull.D*pushpull.D)/(pushpull.D*pushpull.D+(k/trafo)) + 0.02]];
}

$.plot($("#grafico_operacao_pushpull"), [
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
$("#grafico_operacao_pushpull").bind("plothover", function(event, pos, item) {
    var critico, previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            if (pos.x > 0 && pos.x < 1 && pos.y > 0 && pos.y < trafo) {
                $("#valor_k_pushpull").html("k = " + pos.x.toFixed(2));
                if (pos.x > (pushpull.critico)) {
                    $("#valor_ganho_pushpull").html("Ganho Estático = " + pushpull.q.toFixed(2));
                    $("#continha_pushpull").html("CONTÍNUO");
                    $("#valor_vo_pushpull").html("Vo (V) = " + (entrada_pushpull * pushpull.q).toFixed(2));
                    carga_nova=((pushpull.Lo * item.datapoint[1]) / (item.datapoint[0] * pushpull.T_)).toFixed(2);
                    $("#valor_novo_carga_pushpull").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_pushpull").html("Io (A) = " + ((pos.y * entrada_pushpull) / carga_nova).toFixed(2));
                } else {
                    $("#valor_ganho_pushpull").html("Ganho Estático = " + pos.y.toFixed(2));
                    $("#continha_pushpull").html("DESCONTÍNUO");
                    $("#valor_vo_pushpull").html("Vo (V) = " + (pos.y * entrada_pushpull_).toFixed(2));
                    carga_nova=((pushpull.Lo * item.datapoint[1]) / (item.datapoint[0] * pushpull.T_)).toFixed(2);
                    $("#valor_novo_carga_pushpull").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_pushpull").html("Io (A) = " + ((pos.y * entrada_pushpull_) / carga_nova).toFixed(2));
                }
            }
        }
    }
});

$("#grafico_operacao_pushpull").bind("plotclick", function (event, pos, item) {
//    carga_nova = Math.round(carga_nova);

if (item && (item.series.label === "Curva Operação")) {
    $("#ganho_pushpull").html((pos.y));
    $("#k_pushpull").html((pos.x));

    if ($("#check_load_pushpull").is(':checked')) {
        $("#carga_manual_pushpull").val(carga_nova);
    } else {
        $("#check_load_pushpull").prop('checked', true);
        handle_check_pushpull();
        $("#carga_manual_pushpull").val(carga_nova);
    }
}});

textox('Corrente Parametrizada','#grafico_operacao_pushpull');
textoy('Ganho','#grafico_operacao_pushpull');

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
    varia_corrente = (((entrada_pushpull_*trafo - saida) / pushpull.Lo) * pushpull.ton)/2;

    var varia_corrente_;
    varia_corrente_ = (((entrada_pushpull_*trafo - saida) / pushpull.Lo) * pushpull.ton*trafo)/2;

        // indutor
        i1_plot = [[0, pushpull.Io - varia_corrente], [pushpull.ton, pushpull.Io + varia_corrente],
        [pushpull.T, pushpull.Io - varia_corrente], [pushpull.T + pushpull.ton, pushpull.Io + varia_corrente],
        [2 * pushpull.T, pushpull.Io - varia_corrente], [2 * pushpull.T + pushpull.ton, pushpull.Io + varia_corrente],
        [3 * pushpull.T, pushpull.Io - varia_corrente], [3 * pushpull.T + pushpull.ton, pushpull.Io + varia_corrente]];

        // chave
        i2_plot = [[0, pushpull.Io*trafo - varia_corrente_], [pushpull.ton, pushpull.Io*trafo + varia_corrente_], [pushpull.ton, 0],
        [pushpull.T_, 0], [pushpull.T_, pushpull.Io*trafo - varia_corrente_], [pushpull.T_ + pushpull.ton, pushpull.Io*trafo + varia_corrente_], [pushpull.T_ + pushpull.ton, 0],
        [2 * pushpull.T_, 0], [2 * pushpull.T_, pushpull.Io*trafo - varia_corrente_], [2 * pushpull.T_ + pushpull.ton, pushpull.Io*trafo + varia_corrente_], [2 * pushpull.T_ + pushpull.ton, 0],
        [3 * pushpull.T_, 0], [3 * pushpull.T_, pushpull.Io*trafo - varia_corrente_], [3 * pushpull.T_ + pushpull.ton, pushpull.Io*trafo + varia_corrente_]];

        i2_plot_ = [[0, 0], [0+(pushpull.T_/2), 0], [0+(pushpull.T_/2), pushpull.Io*trafo - varia_corrente_], [pushpull.ton +(pushpull.T_/2), pushpull.Io*trafo + varia_corrente_], [pushpull.ton +(pushpull.T_/2), 0],
        [pushpull.T_ +(pushpull.T_/2), 0], [pushpull.T_ +(pushpull.T_/2), pushpull.Io*trafo - varia_corrente_], [pushpull.T_ + pushpull.ton +(pushpull.T_/2), pushpull.Io*trafo + varia_corrente_], [pushpull.T_ + pushpull.ton +(pushpull.T_/2), 0],
        [2 * pushpull.T_ +(pushpull.T_/2), 0], [2 * pushpull.T_ +(pushpull.T_/2), pushpull.Io*trafo - varia_corrente_], [2 * pushpull.T_ + pushpull.ton +(pushpull.T_/2), pushpull.Io*trafo + varia_corrente_], [2 * pushpull.T_ + pushpull.ton +(pushpull.T_/2), 0],
        [3 * pushpull.T_ + pushpull.ton, 0]];

        // diodo
        i3_plot = [[0, pushpull.Io - varia_corrente], [pushpull.ton, pushpull.Io + varia_corrente], [pushpull.ton, pushpull.Io/2 + varia_corrente/2], [0 +(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2], [0 +(pushpull.T_/2), 0], [pushpull.ton +(pushpull.T_/2), 0], [pushpull.ton +(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [pushpull.T_, pushpull.Io/2 - varia_corrente/2], [pushpull.T_, pushpull.Io - varia_corrente], [pushpull.T_ + pushpull.ton, pushpull.Io + varia_corrente], [pushpull.T_ + pushpull.ton, pushpull.Io/2 + varia_corrente/2],
        [pushpull.T_ +(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2], [pushpull.T_ +(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton +(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton +(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [2 * pushpull.T_, pushpull.Io/2 - varia_corrente/2], [2 * pushpull.T_, pushpull.Io - varia_corrente], [2 * pushpull.T_ + pushpull.ton, pushpull.Io + varia_corrente], [2 * pushpull.T_ + pushpull.ton, pushpull.Io/2 + varia_corrente/2],
        [2 * pushpull.T_ +(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2], [2 * pushpull.T_ +(pushpull.T_/2), 0], [2 * pushpull.T_ + pushpull.ton +(pushpull.T_/2), 0], [2 * pushpull.T_ + pushpull.ton +(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [3 * pushpull.T_, pushpull.Io/2 - varia_corrente/2], [3 * pushpull.T_, pushpull.Io - varia_corrente], [3 * pushpull.T_ + pushpull.ton, pushpull.Io + varia_corrente]];

        i3_plot_ = [[0, 0], [pushpull.ton, 0], [pushpull.ton, pushpull.Io/2 + varia_corrente/2], [0+(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2],
        [0+(pushpull.T_/2), pushpull.Io - varia_corrente], [pushpull.ton+(pushpull.T_/2), pushpull.Io + varia_corrente], [pushpull.ton+(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [0 +(pushpull.T_/2)+(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2], [0 +(pushpull.T_/2)+(pushpull.T_/2), 0], [pushpull.ton +(pushpull.T_/2)+(pushpull.T_/2), 0], [pushpull.ton +(pushpull.T_/2)+(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2], [pushpull.T_+(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2],
        [pushpull.T_+(pushpull.T_/2), pushpull.Io - varia_corrente], [pushpull.T_+(pushpull.T_/2) + pushpull.ton, pushpull.Io + varia_corrente], [pushpull.T_ + pushpull.ton+(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [pushpull.T_ +(pushpull.T_/2)+(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2], [pushpull.T_ +(pushpull.T_/2)+(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton +(pushpull.T_/2)+(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton +(pushpull.T_/2)+(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [2 * pushpull.T_+(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2], [2 * pushpull.T_+(pushpull.T_/2), pushpull.Io - varia_corrente], [2 * pushpull.T_ + pushpull.ton+(pushpull.T_/2), pushpull.Io + varia_corrente], [2 * pushpull.T_ + pushpull.ton+(pushpull.T_/2), pushpull.Io/2 + varia_corrente/2],
        [2 * pushpull.T_ +(pushpull.T_/2)+(pushpull.T_/2), pushpull.Io/2 - varia_corrente/2],
        [2 * pushpull.T_ +pushpull.T_, 0], [2 * pushpull.T_ + pushpull.ton +(pushpull.T_/2)+(pushpull.T_/2), 0]];

        // diodo
        t1_plot_ = [[0, entrada_pushpull*2], [pushpull.ton, entrada_pushpull*2], [pushpull.ton, 0], [pushpull.T_, 0], [pushpull.T_, entrada_pushpull*2], [pushpull.T_ + pushpull.ton, entrada_pushpull*2], [pushpull.T_ + pushpull.ton, 0], [2 * pushpull.T_, 0], [2 * pushpull.T_, entrada_pushpull*2], [2 * pushpull.T_ + pushpull.ton, entrada_pushpull*2], [2 * pushpull.T_ + pushpull.ton, 0], [3 * pushpull.T_, 0], [3 * pushpull.T_, entrada_pushpull*2], [3 * pushpull.T_ + pushpull.ton, entrada_pushpull*2]];

        t1_plot = [[0, 0], [pushpull.ton, 0], [0+(pushpull.T_/2), 0], [0+(pushpull.T_/2), entrada_pushpull*2], [pushpull.ton+(pushpull.T_/2), entrada_pushpull*2], [pushpull.ton+(pushpull.T_/2), 0],
        [pushpull.T_+(pushpull.T_/2), 0], [pushpull.T_+(pushpull.T_/2), entrada_pushpull*2], [pushpull.T_+(pushpull.T_/2) + pushpull.ton, entrada_pushpull*2], [pushpull.T_+(pushpull.T_/2) + pushpull.ton, 0],
        [2 * pushpull.T_+(pushpull.T_/2), 0], [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull*2], [2 * pushpull.T_+(pushpull.T_/2) + pushpull.ton, entrada_pushpull*2], [2 * pushpull.T_ + pushpull.ton+(pushpull.T_/2), 0],
        [3 * pushpull.T_, 0]];

        // chave
        t2_plot = [[0, 0], [pushpull.ton_, 0], [pushpull.ton_, entrada_pushpull_], [(pushpull.T_/2), entrada_pushpull_], [(pushpull.T_/2), entrada_pushpull_*2], [pushpull.ton_+(pushpull.T_/2), entrada_pushpull_*2], [pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [pushpull.T_, entrada_pushpull_], [pushpull.T_, 0], [pushpull.T_ + pushpull.ton_, 0], [pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [pushpull.T_+(pushpull.T_/2), entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_], [2 * pushpull.T_, entrada_pushpull_],
        [2 * pushpull.T_, 0], [2 * pushpull.T_ + pushpull.ton_, 0], [2 * pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [3 * pushpull.T_, entrada_pushpull_], [3 * pushpull.T_, 0], [3 * pushpull.T_ + pushpull.ton_, 0]];

        t2_plot_ = [[0, entrada_pushpull_*2], [pushpull.ton_, entrada_pushpull_*2], [pushpull.ton_, entrada_pushpull_], [(pushpull.T_/2), entrada_pushpull_], [(pushpull.T_/2), 0], [pushpull.ton_+(pushpull.T_/2), 0], [pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [pushpull.T_, entrada_pushpull_], [pushpull.T_, entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_, entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [pushpull.T_+(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [2 * pushpull.T_, entrada_pushpull_], [2 * pushpull.T_, entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_, entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [2 * pushpull.T_+(pushpull.T_/2), 0], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), 0], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [3 * pushpull.T_, entrada_pushpull_], [3 * pushpull.T_, entrada_pushpull_*2], [3 * pushpull.T_ + pushpull.ton_, entrada_pushpull_*2]];

        // indutor
        t3_plot = [[0, entrada_pushpull_*trafo-saida], [pushpull.ton, entrada_pushpull_*trafo-saida], [pushpull.ton, -saida],
        [pushpull.T, -saida], [pushpull.T, entrada_pushpull_*trafo-saida], [pushpull.T + pushpull.ton, entrada_pushpull_*trafo-saida], [pushpull.T + pushpull.ton, -saida],
        [2 * pushpull.T, -saida], [2 * pushpull.T, entrada_pushpull_*trafo-saida], [2 * pushpull.T + pushpull.ton, entrada_pushpull_*trafo-saida], [2 * pushpull.T + pushpull.ton, -saida],
        [3 * pushpull.T, -saida], [3 * pushpull.T, entrada_pushpull_*trafo-saida], [3 * pushpull.T + pushpull.ton, entrada_pushpull_*trafo-saida]];
    } 
    else {
        pico = ((entrada_pushpull - saida) / pushpull.Lo) * pushpull.ton;
        pico_ = ((entrada_pushpull - saida) / pushpull.Lo) * pushpull.ton*trafo;

        tcorte = pushpull.ton+(pushpull.ton*((entrada_pushpull)-saida))/saida;
        tcorte=tcorte/2;

        // indutor    
        i1_plot = [[0, 0], [pushpull.ton, pico], [tcorte, 0], [pushpull.T, 0], [pushpull.ton + pushpull.T, pico], [tcorte + pushpull.T, 0],
        [pushpull.T * 2, 0], [pushpull.ton + pushpull.T * 2, pico], [tcorte + pushpull.T * 2, 0],
        [pushpull.T * 3, 0], [pushpull.ton + pushpull.T * 3, pico]];

        // chave
        i2_plot = [[0, 0], [pushpull.ton, pico_], [pushpull.ton, 0], [tcorte, 0],
        [pushpull.T_, 0], [pushpull.ton + pushpull.T_, pico_], [pushpull.ton + pushpull.T_, 0], [tcorte + pushpull.T_, 0],
        [pushpull.T_ * 2, 0], [pushpull.ton + pushpull.T_ * 2, pico_], [pushpull.ton + pushpull.T_ * 2, 0], [tcorte + pushpull.T_ * 2, 0],
        [pushpull.T_ * 3, 0], [pushpull.ton + pushpull.T_ * 3, pico_]];

        i2_plot_ = [[0, 0], [0+(pushpull.T_/2), 0], [pushpull.ton + (pushpull.T_/2), pico_], [pushpull.ton + (pushpull.T_/2), 0], [tcorte, 0],
        [pushpull.T_ + (pushpull.T_/2), 0], [pushpull.ton + pushpull.T_ + (pushpull.T_/2), pico_], [pushpull.ton + pushpull.T_ + (pushpull.T_/2), 0], [tcorte + pushpull.T_ + (pushpull.T_/2), 0],
        [pushpull.T_ * 2 + (pushpull.T_/2), 0], [pushpull.ton + pushpull.T_ * 2 + (pushpull.T_/2), pico_], [pushpull.ton + pushpull.T_ * 2 + (pushpull.T_/2), 0], [tcorte + pushpull.T_ * 2 + (pushpull.T_/2), 0],
        [pushpull.T_ * 3, 0]];

        // diodo
        i3_plot = [[0, 0], [pushpull.ton, pico], [pushpull.ton, pico/2], [tcorte, 0], [pushpull.ton+(pushpull.T_/2), 0], [pushpull.ton+(pushpull.T_/2), pico/2], [tcorte+(pushpull.T_/2), 0],
        [pushpull.T_, 0], [pushpull.ton + pushpull.T_, pico], [pushpull.ton + pushpull.T_, pico/2], [tcorte + pushpull.T_, 0], [pushpull.ton + pushpull.T_+(pushpull.T_/2), 0], [pushpull.ton + pushpull.T_+(pushpull.T_/2), pico/2], [tcorte + pushpull.T_+(pushpull.T_/2), 0],
        [pushpull.T_ * 2, 0], [pushpull.ton + pushpull.T_ * 2, pico], [pushpull.ton + pushpull.T_ * 2, pico/2], [tcorte + pushpull.T_ * 2, 0], [pushpull.ton + pushpull.T_ * 2+(pushpull.T_/2), 0], [pushpull.ton + pushpull.T_ * 2+(pushpull.T_/2), pico/2], [tcorte + pushpull.T_ * 2+(pushpull.T_/2), 0],
        [pushpull.T_ * 3, 0]];

        i3_plot_ = [[0, 0], [pushpull.ton, 0], [pushpull.ton, pico/2], [tcorte, 0], [0+(pushpull.T_/2), 0], [pushpull.ton+(pushpull.T_/2), pico],
        [pushpull.ton+(pushpull.T_/2), pico/2], [tcorte+(pushpull.T_/2), 0], [pushpull.ton + pushpull.T_, 0], [pushpull.ton + pushpull.T_, pico/2], [tcorte + pushpull.T_, 0],[pushpull.T_+(pushpull.T_/2), 0], [pushpull.ton + pushpull.T_+(pushpull.T_/2), pico], [pushpull.ton + pushpull.T_+(pushpull.T_/2), pico/2], [tcorte + pushpull.T_+(pushpull.T_/2), 0],
        [pushpull.ton + pushpull.T_ * 2, 0], [pushpull.ton + pushpull.T_ * 2, pico/2], [tcorte + pushpull.T_ * 2, 0], [pushpull.T_ * 2+(pushpull.T_/2), 0], [pushpull.ton + pushpull.T_ * 2+(pushpull.T_/2), pico], [pushpull.ton + pushpull.T_ * 2+(pushpull.T_/2), pico/2], [tcorte + pushpull.T_ * 2+(pushpull.T_/2), 0],
        [pushpull.T_ * 3, 0]];

        // diodo
        t1_plot_ = [[0, entrada_pushpull], [pushpull.ton, entrada_pushpull], [pushpull.ton, 0], [tcorte, 0], [tcorte, saida], [0+(pushpull.T_/2), saida], [0+(pushpull.T_/2), 0], [tcorte+(pushpull.T_/2), 0], [tcorte+(pushpull.T_/2), saida],
        [pushpull.T_, saida], [pushpull.T_, entrada_pushpull], [pushpull.ton + pushpull.T_, entrada_pushpull], [pushpull.ton + pushpull.T_, 0], [tcorte + pushpull.T_, 0], [tcorte + pushpull.T_, saida], [pushpull.T_+(pushpull.T_/2), saida], [pushpull.T_+(pushpull.T_/2), 0], [tcorte + pushpull.T_+(pushpull.T_/2), 0], [tcorte + pushpull.T_+(pushpull.T_/2), saida], 
        [pushpull.T_ * 2, saida], [pushpull.T_ * 2, entrada_pushpull], [pushpull.T_ * 2, entrada_pushpull], [pushpull.ton + pushpull.T_ * 2, entrada_pushpull], [pushpull.ton + pushpull.T_ * 2, 0], [tcorte + pushpull.T_ * 2, 0], [tcorte + pushpull.T_ * 2, saida], [pushpull.T_ * 2+(pushpull.T_/2), saida], [pushpull.T_ * 2+(pushpull.T_/2), 0], [tcorte + pushpull.T_ * 2+(pushpull.T_/2), 0], [tcorte + pushpull.T_ * 2+(pushpull.T_/2), saida],
        [pushpull.T_ * 3, saida]];

        t1_plot = [[0, 0], [pushpull.ton, 0], [pushpull.ton, 0], [tcorte, 0], [tcorte, saida], [0+(pushpull.T_/2), saida], [0+(pushpull.T_/2), entrada_pushpull], [pushpull.ton+(pushpull.T_/2), entrada_pushpull], [pushpull.ton+(pushpull.T_/2), 0], [tcorte+(pushpull.T_/2), 0], [tcorte+(pushpull.T_/2), saida],
        [pushpull.T_, saida], [pushpull.T_, 0], [pushpull.ton + pushpull.T_, 0], [pushpull.ton + pushpull.T_, 0], [tcorte + pushpull.T_, 0], [tcorte + pushpull.T_, saida], [pushpull.T_+(pushpull.T_/2), saida], [pushpull.T_+(pushpull.T_/2), entrada_pushpull], [pushpull.ton + pushpull.T_+(pushpull.T_/2), entrada_pushpull], [pushpull.ton + pushpull.T_+(pushpull.T_/2), 0], [tcorte + pushpull.T_+(pushpull.T_/2), 0], [tcorte + pushpull.T_+(pushpull.T_/2), saida], 
        [pushpull.T_ * 2, saida], [pushpull.T_ * 2, saida],  [pushpull.T_ * 2, 0], [pushpull.ton + pushpull.T_ * 2, 0], [pushpull.ton + pushpull.T_ * 2, 0], [tcorte + pushpull.T_ * 2, 0], [tcorte + pushpull.T_ * 2, saida], [pushpull.T_ * 2+(pushpull.T_/2), saida], [pushpull.T_ * 2+(pushpull.T_/2), entrada_pushpull], [pushpull.ton + pushpull.T_ * 2+(pushpull.T_/2), entrada_pushpull], [pushpull.ton + pushpull.T_ * 2+(pushpull.T_/2), 0], [tcorte + pushpull.T_ * 2+(pushpull.T_/2), 0], [tcorte + pushpull.T_ * 2+(pushpull.T_/2), saida],
        [pushpull.T_ * 3, saida]];

        // chave
        t2_plot = [[0, 0], [pushpull.ton_, 0], [pushpull.ton_, entrada_pushpull_], [(pushpull.T_/2), entrada_pushpull_], [(pushpull.T_/2), entrada_pushpull_*2], [pushpull.ton_+(pushpull.T_/2), entrada_pushpull_*2], [pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [pushpull.T_, entrada_pushpull_], [pushpull.T_, 0], [pushpull.T_ + pushpull.ton_, 0], [pushpull.T_ + pushpull.ton_, entrada_pushpull_], [pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [pushpull.T_+(pushpull.T_/2), entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [2 * pushpull.T_, entrada_pushpull_], [2 * pushpull.T_, 0], [2 * pushpull.T_ + pushpull.ton_, 0], [2 * pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [3 * pushpull.T_, entrada_pushpull_], [3 * pushpull.T_, 0], [3 * pushpull.T_ + pushpull.ton_, 0]];

        t2_plot_ = [[0, entrada_pushpull_*2], [pushpull.ton_, entrada_pushpull_*2], [(pushpull.T_/2), entrada_pushpull_], [(pushpull.T_/2), 0], [pushpull.ton_+(pushpull.T_/2), 0], [pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [pushpull.T_, entrada_pushpull_], [pushpull.T_, entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_, entrada_pushpull_*2], [pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [pushpull.T_+(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), 0], [pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [2 * pushpull.T_, entrada_pushpull_], [2 * pushpull.T_, entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_, entrada_pushpull_*2], [2 * pushpull.T_ + pushpull.ton_, entrada_pushpull_],
        [2 * pushpull.T_+(pushpull.T_/2), entrada_pushpull_], [2 * pushpull.T_+(pushpull.T_/2), 0], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), 0], [2 * pushpull.T_ + pushpull.ton_+(pushpull.T_/2), entrada_pushpull_],
        [3 * pushpull.T_ + pushpull.ton_, entrada_pushpull_]];
        
        // indutor
        t3_plot = [[0, entrada_pushpull_*trafo-saida], [pushpull.ton, entrada_pushpull_*trafo-saida], [pushpull.ton, -saida], [tcorte, -saida], [tcorte, 0], [pushpull.T, 0], [pushpull.T, entrada_pushpull_*trafo-saida], [pushpull.ton + pushpull.T, entrada_pushpull_*trafo-saida], [pushpull.ton + pushpull.T, -saida], [tcorte + pushpull.T, -saida], [tcorte + pushpull.T, 0], [pushpull.T * 2, 0], [pushpull.T * 2, entrada_pushpull_*trafo-saida], [pushpull.ton + pushpull.T * 2, entrada_pushpull_*trafo-saida], [pushpull.ton + pushpull.T * 2, -saida], [tcorte + pushpull.T * 2, -saida], [tcorte + pushpull.T * 2, 0], [pushpull.T * 3, 0], [pushpull.T * 3, entrada_pushpull_*trafo-saida], [pushpull.ton + pushpull.T * 3, entrada_pushpull_*trafo-saida]];
    }
    $.plot($("#corrente_indutor_pushpull"), [
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

    textox('Tempo (s)','#corrente_indutor_pushpull');
    textoy('Corrente (A)','#corrente_indutor_pushpull');

    $.plot($("#tensao_indutor_pushpull"), [
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

    textox('Tempo (s)','#tensao_indutor_pushpull');
    textoy('Tensão (V)','#tensao_indutor_pushpull');

    var datasetsDiodosA = {
        "Diodo1Apushpull": {
            color: 6,
            label: "Corrente Diodo 1",
            data: i3_plot
        }, "Diodo2Apushpull":
        {
            color: 12,
            label: "Corrente Diodo 2",
            data: i3_plot_
        }};
        var choiceContainerDiodosA = $("#choicesDiodosA_pushpull");
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
                $.plot("#corrente_diodo_pushpull", data, {
                    yaxis: {
                        min: 0
                    }
                });
                textox('Tempo (s)','#corrente_diodo_pushpull');
                textoy('Corrente (A)','#corrente_diodo_pushpull');
            }
        }

        plotAccordingToChoicesDiodosA();

        var datasetsDiodosV = {
            "Diodo1Vpushpull": {
                color: 6,
                label: "Tensão Diodo 1",
                data: t1_plot
            }, "Diodo2Vpushpull":
            {
                color: 12,
                label: "Tensão Diodo 2",
                data: t1_plot_
            }};
            var choiceContainerDiodosV = $("#choicesDiodosV_pushpull");
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
                    $.plot("#tensao_diodo_pushpull", data, {
                        yaxis: {
                            min: 0
                        }
                    });
                    textox('Tempo (s)','#tensao_diodo_pushpull');
                    textoy('Tensão (V)','#tensao_diodo_pushpull');
                }
            }

            plotAccordingToChoicesDiodosV();

            var datasetsChavesA = {
                "Chave1Apushpull": {
                    color: 6,
                    label: "Corrente Chave 1",
                    data: i2_plot
                }, "Chave2Apushpull":
                {
                    color: 12,
                    label: "Corrente Chave 2",
                    data: i2_plot_
                }};
                var choiceContainerChavesA = $("#choicesChavesA_pushpull");
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
                        $.plot("#corrente_chave_pushpull", data, {
                            yaxis: {
                                min: 0
                            }
                        });
                        textox('Tempo (s)','#corrente_chave_pushpull');
                        textoy('Corrente (A)','#corrente_chave_pushpull');
                    }
                }

                plotAccordingToChoicesChavesA();

                var datasetsChavesV = {
                    "Chave1Vpushpull": {
                        color: 6,
                        label: "Tensão Chave 1",
                        data: t2_plot
                    }, "Chave2Vpushpull":
                    {
                        color: 12,
                        label: "Tensão Chave 2",
                        data: t2_plot_
                    }};
                    var choiceContainerChavesV = $("#choicesChavesV_pushpull");
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
                            $.plot("#tensao_chave_pushpull", data, {
                                yaxis: {
                                    min: 0
                                }
                            });
                            textox('Tempo (s)','#tensao_chave_pushpull');
                            textoy('Tensão (V)','#tensao_chave_pushpull');
                        }
                    }

                    plotAccordingToChoicesChavesV();

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=saida_pushpull / entrada_pushpull;
    Gdo=saida_pushpull/pushpull.D;
    wo=1/Math.sqrt(pushpull.Lo*pushpull.capacitancia);
    Q=carga_pushpull*Math.sqrt(pushpull.capacitancia/pushpull.Lo);
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
    $.plot($("#diagrama_bode_pushpull"), [
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
    $.plot($("#diagrama_fase_pushpull"), [
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

    textox('Frequência (Hz)','#diagrama_bode_pushpull');
    textoy('Ganho (V)','#diagrama_bode_pushpull');

    textox('Frequência (Hz)','#diagrama_fase_pushpull');
    textoy('Ângulo (°)','#diagrama_fase_pushpull');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////
step_plot = [];

t=0;
if (si > 1) {
    while (t < 5*((3*si)/wo)) {
        step_plot.push([t, entrada_pushpull * Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
        t+=((5*((3*si)/wo))/100);
    }
}
else {
    while (t < 4.6/(si*wo)) {
        step_plot.push([t, entrada_pushpull * Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
        t+=((5*((3*si)/wo))/100);
    }
}

$.plot($("#resposta_degrau_pushpull"), [
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

textox('Tempo (s)','#resposta_degrau_pushpull');
textoy('Tensão (V)','#resposta_degrau_pushpull');

$("#resposta_degrau_pushpull").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            $("#valor_tensao_step_pushpull").html("Vo (V) =  " + pos.y.toFixed(2));
            $("#valor_tempo_step_pushpull").html("t (s) = " + pos.x.toFixed(6));
        }
    }
});
}

if (carga_manual_pushpull = "null") {
    carga_manual_pushpull = carga_pushpull.toFixed(2);
}

};