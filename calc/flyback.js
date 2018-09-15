///////////////////////////////
// BUCK-BOOST
///////////////////////////////

var carga_flyback, carga_manual_flyback, contas_flyback, handle_check_flyback, play_flyback, carga_nova;

carga_flyback = 0;
ganho_ponto = 0;

carga_manual_flyback = "null";

handle_check_flyback = function() {
    var estado;
    estado = $("#check_load_flyback").is(':checked');
    if (!estado) {
        $("#carga_tag_flyback").html("Carga (&Omega;): " + carga_flyback.toFixed(2) + " <input id='check_load_flyback' type='checkbox' onclick='handle_check_flyback()'>");
    } else {
        $("#carga_tag_flyback").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_flyback + "' id='carga_manual_flyback' onkeydown='if (event.keyCode == 13) play_flyback()'> <input id='check_load_flyback' type='checkbox' checked='true' onclick='handle_check_flyback()'>");
    }
};

contas_flyback = function(entrada_flyback, saida_flyback, frequencia_flyback, potencia_flyback, delta_i, delta_v) {
    this.q = saida_flyback / entrada_flyback_;
    this.D = (saida_flyback) / (saida_flyback + entrada_flyback);
    this.T = 1 / (frequencia_flyback * 1000);
    this.ton = this.T * this.D;
    this.Io = potencia_flyback / saida_flyback;
    this.Lo = (entrada_flyback / (frequencia_flyback * 1000 * (delta_i / 100) * this.Io/(1-this.D) )) * this.D;
    this.delta_i = delta_i;
    this.capacitancia = (this.Io / (frequencia_flyback * 1000 * delta_v / 100 * saida_flyback)) * this.D;
    this.Lcri = (entrada_flyback * this.D * (1 - this.D)) / (2 * (frequencia_flyback * 1000) * this.Io);
    this.Ilmed = ((entrada_flyback - saida_flyback) * this.q) / frequencia_flyback * 1000 * 2 * this.Lo;
    this.critico = (this.D*(1-this.D)/2)*trafo;
    this.Iocrit = (delta_i / 100) * this.Io * (1 - this.D)/trafo;
    carga_flyback = saida_flyback * saida_flyback / potencia_flyback;
};

play_flyback = function() {
    var i3_plot, si, t, step_plot, a, b, c, d, j, Ggo, Gdo, wo, Q, funcao, D, flyback, carga_ponto, cond, critico, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, entrada_flyback, f_plot, fase, frequencia_flyback, g_plot, ganho_ponto, i1_plot, i2_plot, ident_flyback, k, ok, options, pico, plot, potencia_flyback, saida, saida_flyback, tcorte, tensao_saida_flyback, v_carga, valor_temporario;

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

//ganho_ponto = parseFloat($("#ganho_flyback").text());
//k_ponto = parseFloat($("#k_flyback").text());

entrada_flyback = parseFloat($("#entrada_flyback").val())*parseFloat($("#trafo_flyback").val());
entrada_flyback_ = parseFloat($("#entrada_flyback").val());

trafo = parseFloat($("#trafo_flyback").val());

saida_flyback = parseFloat($("#saida_flyback").val());
frequencia_flyback = parseFloat($("#frequencia_flyback").val());
frequencia_flyback_ = parseFloat($("#frequencia_flyback").val());

potencia_flyback = parseFloat($("#potencia_flyback").val());
delta_v = parseFloat($("#delta_v_flyback").val());
delta_i = parseFloat($("#delta_i_flyback").val());

///////////////////////////////
// MODO DE CONDUÇÃO
// neste momento são efetuados pré-calculos pro plot operação
///////////////////////////////

flyback = new contas_flyback(entrada_flyback, saida_flyback, frequencia_flyback, potencia_flyback, delta_i, delta_v);

//  k = (flyback.Io * flyback.Lo) / (entrada_flyback * flyback.T);
if ($("#check_load_flyback").is(':checked')) {
    carga_flyback = parseFloat($("#carga_manual_flyback").val());
    flyback.Io = saida_flyback / carga_flyback;
    carga_manual_flyback = carga_flyback;
//    k = (flyback.Io * flyback.Lo) / (entrada_flyback * flyback.T);
}
//if (k_ponto !== k_ponto) {
    k = (flyback.Io * flyback.Lo) / (entrada_flyback_ * flyback.T);
//}
//else {
//    k = k_ponto
//}
console.log(k)

///////////////////////////////
// CONTÍNUA
///////////////////////////////

if (k > flyback.critico) {
    $("#modo_conducao_flyback").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_flyback').show()
    cond = "cont";
    $("#potencia_atual_flyback").hide();
//    k = (flyback.Io * flyback.Lo) / (entrada_flyback * flyback.T);
//D = flyback.D;
//    $("#tensao_atual_flyback").hide();
$("#tensao_atual_flyback").html("<br>");
$("#potencia_atual_flyback").hide();
saida = saida_flyback;
if ($("#check_load_flyback").is(':checked')) {
    $("#potencia_atual_flyback").show();
    $("#potencia_atual_flyback").html("Po* (W): " + (saida * flyback.Io).toFixed(2));
}
}

///////////////////////////////
// CRÍTICA
///////////////////////////////

else if (flyback.critico === k) {
    $("#modo_conducao_flyback").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = critico;
    saida = saida_flyback;
$("#potencia_atual_flyback").show();
$("#potencia_atual_flyback").html("Po* (W): " + (saida * flyback.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUA
///////////////////////////////

else {
    $("#modo_conducao_flyback").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_flyback').hide()

    cond = "desc";
    ganho_ponto=0;
    i=0;
    while (i < flyback.critico) {
        ganho = ((flyback.D * flyback.D) * trafo * trafo / (2 * i));
        carga_nova=((flyback.Lo * ganho) / (i * flyback.T)).toFixed(1);
        var diff = Math.abs( carga_nova - carga_flyback );
        if( diff < 500 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }
    saida = parseFloat((ganho_ponto * entrada_flyback_).toFixed(1));
    flyback.Io = saida / carga_flyback;
$("#tensao_atual_flyback").html("Vo* (V): " + saida);
$("#potencia_atual_flyback").show();
$("#potencia_atual_flyback").html("Po* (W): " + (saida * flyback.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_flyback").html("Capacitância (uF): " + (flyback.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_flyback").html("Ganho Estático: " + (saida / entrada_flyback_).toFixed(2));
$("#duty_tag_flyback").html("Razão Cíclica: " + flyback.D.toFixed(2));
$("#indutancia_critica_flyback").html("Indut. Crítica (uH): " + (flyback.Lcri * 1000000).toFixed(2));
$("#io_param_flyback").html("k (param.): " + k.toFixed(2));
//$("#io_critica_flyback").html("I<sub>o</sub> crítica (A): " + ((flyback.critico * entrada_flyback_ * flyback.T) / flyback.Lo).toFixed(3));
$("#io_critica_flyback").html("I<sub>o</sub> crítica (A): " + flyback.Iocrit.toFixed(3));
$("#io_flyback").html("I<sub>o</sub> (A): " + flyback.Io.toFixed(2));
$("#indutancia_tag_flyback").html("Indutância (uH): " + (flyback.Lo * 1000000).toFixed(2));
handle_check_flyback();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * flyback.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_flyback * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_flyback = $("#tensao_saida_flyback");
options = {
    xaxis: {
        ticks: 4,
        zoomRange: [0.0001, 5 * flyback.T],
        panRange: [0, 5 * flyback.T]
    },
    yaxis: {
        zoomRange: [1.1 * saida_flyback / 100 * delta_v, 1.3 * saida],
        panRange: [0, 1.2 * saida],
        max: 1.2 * saida,
        min: 0
    },
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true
    }
};
plot = $.plot(tensao_saida_flyback, data, options);

textox('Tempo (s)','#tensao_saida_flyback');
textoy('Tensão (V)','#tensao_saida_flyback');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////

d1_plot = [];
d2_plot = [];
d3_plot = [];

i = 0;
while (i < 0.13*trafo) {
    d1_plot.push([i, trafo*(-1+ (1 - Math.sqrt(1 - 8 * i/trafo)) / (4 * i/trafo))]);
    i += 0.00005;
}
i = 0;
while (i < 0.13*trafo) {
    d1_plot.push([i, trafo*(-1+ (1 + Math.sqrt(1 - 8 * i/trafo)) / (4 * i/trafo))]);
    i += 0.00005;
}
i = 0;
while (i < flyback.critico) {
    d2_plot.push([i, ((flyback.D * flyback.D) * trafo * trafo / (2 * i))]);
    i += 0.00005;
}
i = flyback.critico;
while (i < 0.4) {
    d2_plot.push([i, flyback.q]);
    i += 0.0005;
}
if (k > 0.4) {
    k = 0.4;
}

if (cond === "cont") {
    d3_plot = [[k, flyback.q - 0.2], [k, flyback.q + 0.2]];
}
else {
    d3_plot = [[k, ganho_ponto - 0.2], [k, ganho_ponto + 0.2]];
}

$.plot($("#grafico_operacao_flyback"), [
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
        max: 10,
        min: 0
    },
    xaxis: {
        ticks: 4,
        max: 0.4,
        min: 0
    },
    grid: {
        hoverable: true,
        clickable: true
    }
});
$("#grafico_operacao_flyback").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            if (pos.x > 0 && pos.x < 0.2 && pos.y > 0 && pos.y < 20) {
                $("#valor_k_flyback").html("k = " + pos.x.toFixed(2));
                if (pos.x > flyback.critico) {
                    $("#valor_ganho_flyback").html("Ganho Estático = " + (saida_flyback / entrada_flyback).toFixed(2));
                    $("#continha_flyback").html("CONTÍNUO");
                    $("#valor_vo_flyback").html("Vo = " + (entrada_flyback_ * flyback.q).toFixed(2));
                    carga_nova = ((flyback.Lo * item.datapoint[1]) / (item.datapoint[0] * flyback.T)).toFixed(2);
                    $("#valor_novo_carga_flyback").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_flyback").html("Io (A) = " + ((pos.y * entrada_flyback_) / carga_nova).toFixed(2));
                } else {
                    $("#valor_ganho_flyback").html("Ganho Estático = " + pos.y.toFixed(2));
                    $("#continha_flyback").html("DESCONTÍNUO");
                    $("#valor_vo_flyback").html("Vo (V) = " + (pos.y * entrada_flyback_).toFixed(2));
                    carga_nova = ((flyback.Lo * item.datapoint[1]) / (item.datapoint[0] * flyback.T)).toFixed(2);
                    $("#valor_novo_carga_flyback").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_flyback").html("Io (A) = " + ((pos.y * entrada_flyback_) / carga_nova).toFixed(2));
                }
            }
        }
    }
});

$("#grafico_operacao_flyback").bind("plotclick", function (event, pos, item) {

//if (item && (item.series.label === "Curva Operação")) {
//$("#ganho_flyback").html((pos.y));
//$("#k_flyback").html((pos.x));
//    carga_nova = Math.round(carga_nova);
if ($("#check_load_flyback").is(':checked')) {
    $("#carga_manual_flyback").val(carga_nova);
} else {
    $("#check_load_flyback").prop('checked', true);
    handle_check_flyback();
    $("#carga_manual_flyback").val(carga_nova);
}
});

textox('Corrente Parametrizada','#grafico_operacao_flyback');
textoy('Ganho','#grafico_operacao_flyback');

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
    var varia_corrente, iL;
    varia_corrente = (((entrada_flyback * flyback.T * flyback.D) / flyback.Lo))/2
    iL=((entrada_flyback+saida)*flyback.Io)/entrada_flyback;

    iL_=((entrada_flyback+saida)*flyback.Io)/entrada_flyback_;

    varia_corrente_ = (((entrada_flyback_ * flyback.T * flyback.D) / flyback.Lo))/2

        // indutor
        i1_plot = [[0, iL - varia_corrente], [flyback.ton, iL + varia_corrente],
        [flyback.T, iL - varia_corrente], [flyback.T + flyback.ton, iL + varia_corrente], [2 * flyback.T, iL - varia_corrente], [2 * flyback.T + flyback.ton, iL + varia_corrente],
        [3 * flyback.T, iL - varia_corrente], [3 * flyback.T + flyback.ton, iL + varia_corrente]];
        // chave
        i2_plot = [[0, iL_ - varia_corrente_], [flyback.ton, iL_ + varia_corrente_], [flyback.ton, 0],
        [flyback.T, 0], [flyback.T, iL_ - varia_corrente_], [flyback.T + flyback.ton, iL_ + varia_corrente_], [flyback.T + flyback.ton, 0],
        [2 * flyback.T, 0], [2 * flyback.T, iL_ - varia_corrente_], [2 * flyback.T + flyback.ton, iL_ + varia_corrente_], [2 * flyback.T + flyback.ton, 0],
        [3 * flyback.T, 0], [3 * flyback.T, iL_ - varia_corrente_], [3 * flyback.T + flyback.ton, iL_ + varia_corrente_]];
        // diodo
        i3_plot = [[0, 0], [flyback.ton, 0], [flyback.ton, iL + varia_corrente],
        [flyback.T, iL - varia_corrente], [flyback.T, 0], [flyback.T + flyback.ton, 0], [flyback.T + flyback.ton, iL + varia_corrente],
        [2 * flyback.T, iL - varia_corrente], [2 * flyback.T, 0], [2 * flyback.T + flyback.ton, 0], [2 * flyback.T + flyback.ton, iL + varia_corrente],
        [3 * flyback.T, iL - varia_corrente], [3 * flyback.T, 0], [3 * flyback.T + flyback.ton, 0]];
        // diodo
        t1_plot = [[0, entrada_flyback+saida], [flyback.ton, entrada_flyback+saida], [flyback.ton, 0],
        [flyback.T, 0], [flyback.T, entrada_flyback+saida], [flyback.T + flyback.ton, entrada_flyback+saida], [flyback.T + flyback.ton, 0],
        [2 * flyback.T, 0], [2 * flyback.T, entrada_flyback+saida], [2 * flyback.T + flyback.ton, entrada_flyback+saida], [2 * flyback.T + flyback.ton, 0],
        [3 * flyback.T, 0], [3 * flyback.T, entrada_flyback+saida], [3 * flyback.T + flyback.ton, entrada_flyback+saida]];
        // chave
        t2_plot = [[0, 0], [flyback.ton, 0], [flyback.ton, entrada_flyback+saida/trafo],
        [flyback.T, entrada_flyback+saida/trafo], [flyback.T, 0], [flyback.T + flyback.ton, 0], [flyback.T + flyback.ton, entrada_flyback+saida/trafo],
        [2 * flyback.T, entrada_flyback+saida/trafo], [2 * flyback.T, 0], [2 * flyback.T + flyback.ton, 0], [2 * flyback.T + flyback.ton, entrada_flyback+saida/trafo],
        [3 * flyback.T, entrada_flyback+saida/trafo], [3 * flyback.T, 0], [3 * flyback.T + flyback.ton, 0]];
        // indutor
        t3_plot = [[0, entrada_flyback], [flyback.ton, entrada_flyback], [flyback.ton, -saida],
        [flyback.T, -saida], [flyback.T, entrada_flyback], [flyback.T + flyback.ton, entrada_flyback], [flyback.T + flyback.ton, -saida],
        [2 * flyback.T, -saida], [2 * flyback.T, entrada_flyback], [2 * flyback.T + flyback.ton, entrada_flyback], [2 * flyback.T + flyback.ton, -saida],
        [3 * flyback.T, -saida], [3 * flyback.T, entrada_flyback], [3 * flyback.T + flyback.ton, entrada_flyback]];
    }
    else {
        pico = (entrada_flyback / flyback.Lo) * flyback.ton;

        pico_ = ((entrada_flyback_ / flyback.Lo) * flyback.ton);

        tcorte=flyback.T*(1-(flyback.D*(entrada_flyback+saida)/saida));
        tcorte=flyback.T-tcorte;
        // indutor
        i1_plot = [[0, 0], [flyback.ton, pico], [tcorte, 0],
        [flyback.T, 0], [flyback.ton + flyback.T, pico], [tcorte + flyback.T, 0],
        [flyback.T * 2, 0], [flyback.ton + flyback.T * 2, pico], [tcorte + flyback.T * 2, 0],
        [flyback.T * 3, 0], [flyback.ton + flyback.T * 3, pico]];
        // chave
        i2_plot = [[0, 0], [flyback.ton, pico_], [flyback.ton, 0], [tcorte, 0],
        [flyback.T, 0], [flyback.ton + flyback.T, pico_], [flyback.ton + flyback.T, 0], [tcorte + flyback.T, 0],
        [flyback.T * 2, 0], [flyback.ton + flyback.T * 2, pico_], [flyback.ton + flyback.T * 2, 0], [tcorte + flyback.T * 2, 0],
        [flyback.T * 3, 0], [flyback.ton + flyback.T * 3, pico_]];
        // diodo
        i3_plot = [[0, 0], [flyback.ton, 0], [flyback.ton, pico], [tcorte, 0],
        [flyback.T, 0], [flyback.ton + flyback.T, 0], [flyback.ton + flyback.T, pico], [tcorte + flyback.T, 0],
        [flyback.T * 2, 0], [flyback.ton + flyback.T * 2, 0], [flyback.ton + flyback.T * 2, pico], [tcorte + flyback.T * 2, 0],
        [flyback.T * 3, 0], [flyback.ton + flyback.T * 3, 0]];
        // diodo
        t1_plot = [[0, entrada_flyback+saida], [flyback.ton, entrada_flyback+saida], [flyback.ton, 0], [tcorte, 0], [tcorte, saida],
        [flyback.T, saida], [flyback.T, entrada_flyback+saida], [flyback.ton + flyback.T, entrada_flyback+saida], [flyback.ton + flyback.T, 0], [tcorte + flyback.T, 0], [tcorte + flyback.T, saida],
        [flyback.T * 2, saida], [flyback.T * 2, entrada_flyback+saida], [flyback.ton + flyback.T * 2, entrada_flyback+saida], [flyback.ton + flyback.T * 2, 0], [tcorte + flyback.T * 2, 0], [tcorte + flyback.T * 2, saida],
        [flyback.T * 3, saida], [flyback.T * 3, entrada_flyback+saida], [flyback.ton + flyback.T * 3, entrada_flyback+saida]];
        // chave
        t2_plot = [[0, 0], [flyback.ton, 0], [flyback.ton, entrada_flyback_+saida/trafo], [tcorte, entrada_flyback_+saida/trafo], [tcorte, entrada_flyback_], [flyback.T, entrada_flyback_],
        [flyback.T, 0], [flyback.ton + flyback.T, 0], [flyback.ton + flyback.T, entrada_flyback_+saida/trafo], [tcorte + flyback.T, entrada_flyback_+saida/trafo], [tcorte + flyback.T, entrada_flyback_],
        [flyback.T * 2, entrada_flyback_], [flyback.T * 2, 0], [flyback.ton + flyback.T * 2, 0], [flyback.ton + flyback.T * 2, entrada_flyback_+saida/trafo], [tcorte + flyback.T * 2, entrada_flyback_+saida/trafo], [tcorte + flyback.T * 2, entrada_flyback_],
        [flyback.T * 3, entrada_flyback_], [flyback.T * 3, 0], [flyback.ton + flyback.T * 3, 0]];
        // indutor
        t3_plot = [[0, entrada_flyback], [flyback.ton, entrada_flyback], [flyback.ton, -saida], [tcorte, -saida], [tcorte, 0],
        [flyback.T, 0], [flyback.T, entrada_flyback], [flyback.ton + flyback.T, entrada_flyback], [flyback.ton + flyback.T, -saida], [tcorte + flyback.T, -saida], [tcorte + flyback.T, 0],
        [flyback.T * 2, 0], [flyback.T * 2, entrada_flyback], [flyback.ton + flyback.T * 2, entrada_flyback], [flyback.ton + flyback.T * 2, -saida], [tcorte + flyback.T * 2, -saida], [tcorte + flyback.T * 2, 0],
        [flyback.T * 3, 0], [flyback.T * 3, entrada_flyback], [flyback.ton + flyback.T * 3, entrada_flyback]];
    }
    $.plot($("#corrente_indutor_flyback"), [
    {
        color: 6,
        label: "Corrente Indutor",
        data: i1_plot
    }
    ], {
        yaxis: {
            min: 0
        }
    });

    textox('Tempo (s)','#corrente_indutor_flyback');
    textoy('Corrente (A)','#corrente_indutor_flyback');

    $.plot($("#tensao_indutor_flyback"), [
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

    textox('Tempo (s)','#tensao_indutor_flyback');
    textoy('Tensão (V)','#tensao_indutor_flyback');

    $.plot($("#corrente_chave_flyback"), [
    {
        color: 6,
        label: "Corrente Transistor",
        data: i2_plot
    }
    ], {
        yaxis: {
            min: 0
        }
    });

    textox('Tempo (s)','#corrente_chave_flyback');
    textoy('Corrente (A)','#corrente_chave_flyback');

    $.plot($("#corrente_diodo_flyback"), [
    {
        color: 6,
        label: "Corrente Diodo",
        data: i3_plot
    }
    ], {
        yaxis: {
            min: 0
        }
    });

    textox('Tempo (s)','#corrente_diodo_flyback');
    textoy('Corrente (A)','#corrente_diodo_flyback');

    $.plot($("#tensao_diodo_flyback"), [
    {
        color: 0,
        label: "Tensão Diodo",
        data: t1_plot
    }
    ], {
        yaxis: {
            min: 0
        }
    });

    textox('Tempo (s)','#tensao_diodo_flyback');
    textoy('Tensão (V)','#tensao_diodo_flyback');

    $.plot($("#tensao_chave_flyback"), [
    {
        color: 0,
        label: "Tensão Transistor",
        data: t2_plot
    }
    ], {
        yaxis: {
            min: 0
        }
    });

    textox('Tempo (s)','#tensao_chave_flyback');
    textoy('Tensão (V)','#tensao_chave_flyback');

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=-flyback.D/(1-flyback.D);
    Gdo=saida_flyback/(flyback.D*(1-flyback.D)*(1-flyback.D));
    wo=(1-flyback.D)/Math.sqrt(flyback.Lo*flyback.capacitancia);
    Q=(1-flyback.D)*carga_flyback*Math.sqrt(flyback.capacitancia/flyback.Lo);
    wz = ((1-flyback.D)*(1-flyback.D)*carga_flyback)/(flyback.Lo*flyback.D);
    si = 1/(2*Q);

    j = 100;
    while (j < 1000000) {
        g_plot.push([j, 20 * Math.log((Gdo*(Math.sqrt(1+(j/wz)*(j/wz)))/(Math.sqrt(( (1-(j/wo)*(j/wo))*(1-(j/wo)*(j/wo)) ) + ( (1/(Q*Q))*((j/wo)*(j/wo)) )))))/Math.log(10) ]);
            // (a + jb) / (c + jd) 
            // ArcTan[ (b c - a d)/(a c + b d)] 
            a = 1;
            b = (j/wz);
            c = (1-(j/wo)*(j/wo));
            d = (j/(Q*wo));
            fase = (180 / Math.PI) * Math.atan( (b*c-a*d)/(a*c+b*d));
            if (fase < 0) {
                fase = fase + 180;
            }
            f_plot.push([j, -(-fase+180)]);
            j += 100;
        }
        $.plot($("#diagrama_bode_flyback"), [
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
        $.plot($("#diagrama_fase_flyback"), [
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

textox('Frequência (Hz)','#diagrama_bode_flyback');
textoy('Ganho (V)','#diagrama_bode_flyback');

textox('Frequência (Hz)','#diagrama_fase_flyback');
textoy('Ângulo (°)','#diagrama_fase_flyback');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////

step_plot = [];
t = 0;

if (si > 1) {
    while (t < 5*((3*si)/wo)) {
        step_plot.push([t, entrada_flyback * -Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
        t+=((5*((3*si)/wo))/100);
    }
}
else {
    while (t < 4.6/(si*wo)) {
        step_plot.push([t, entrada_flyback * -Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
        t+=((5*((3*si)/wo))/100);
    }
}

$.plot($("#resposta_degrau_flyback"), [
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

textox('Tempo (s)','#resposta_degrau_flyback');
textoy('Tensão (V)','#resposta_degrau_flyback');

$("#resposta_degrau_flyback").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            $("#valor_tensao_step_flyback").html("Vo (V) =  " + pos.y.toFixed(2));
            $("#valor_tempo_step_flyback").html("t (s) = " + pos.x.toFixed(6));
        }
    }
});
}

if (carga_manual_flyback = "null") {
    carga_manual_flyback = carga_flyback.toFixed(2);
}
};
