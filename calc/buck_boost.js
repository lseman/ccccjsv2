///////////////////////////////
// BUCK-BOOST
///////////////////////////////

var carga_buck_boost, carga_manual_buck_boost, contas_buck_boost, handle_check_buck_boost, play_buck_boost, carga_nova;

carga_buck_boost = 0;

carga_manual_buck_boost = "null";

handle_check_buck_boost = function() {
    var estado;
    estado = $("#check_load_buck_boost").is(':checked');
    if (!estado) {
        $("#carga_tag_buck_boost").html("Carga (&Omega;): " + carga_buck_boost.toFixed(2) + " <input id='check_load_buck_boost' type='checkbox' onclick='handle_check_buck_boost()'>");
    } else {
        $("#carga_tag_buck_boost").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_buck_boost + "' id='carga_manual_buck_boost' onkeydown='if (event.keyCode == 13) play_buck_boost()'> <input id='check_load_buck_boost' type='checkbox' checked='true' onclick='handle_check_buck_boost()'>");
    }
};

contas_buck_boost = function(entrada_buck_boost, saida_buck_boost, frequencia_buck_boost, potencia_buck_boost, delta_i, delta_v) {
    this.q = saida_buck_boost / entrada_buck_boost;
    this.D = (saida_buck_boost) / (saida_buck_boost + entrada_buck_boost);
    this.T = 1 / (frequencia_buck_boost * 1000);
    this.ton = this.T * this.D;
    this.Io = potencia_buck_boost / saida_buck_boost;
    this.Lo = (entrada_buck_boost / (frequencia_buck_boost * 1000 * (delta_i / 100) * this.Io/(1-this.D))) * this.D;
    this.delta_i = delta_i;
    this.capacitancia = (this.Io / (frequencia_buck_boost * 1000 * delta_v / 100 * saida_buck_boost)) * this.D;
    this.Lcri = (entrada_buck_boost * this.D * (1 - this.D)) / (2 * (frequencia_buck_boost * 1000) * this.Io);
    this.Ilmed = ((entrada_buck_boost - saida_buck_boost) * this.q) / frequencia_buck_boost * 1000 * 2 * this.Lo;
    this.critico = this.D*(1-this.D)/2;
//    this.Iocrit = (delta_i / 100) * this.Io * (1 - this.D)
    carga_buck_boost = saida_buck_boost * saida_buck_boost / potencia_buck_boost;
};

play_buck_boost = function() {
    var i3_plot, si, t, step_plot, a, b, c, d, j, Ggo, Gdo, wo, Q, funcao, D, buck_boost, carga_ponto, cond, critico, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, entrada_buck_boost, f_plot, fase, frequencia_buck_boost, g_plot, ganho_ponto, i1_plot, i2_plot, ident_buck_boost, k, ok, options, pico, plot, potencia_buck_boost, saida, saida_buck_boost, tcorte, tensao_saida_buck_boost, v_carga, valor_temporario;

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

entrada_buck_boost = parseFloat($("#entrada_buck_boost").val());
saida_buck_boost = parseFloat($("#saida_buck_boost").val());
frequencia_buck_boost = parseFloat($("#frequencia_buck_boost").val());
potencia_buck_boost = parseFloat($("#potencia_buck_boost").val());
delta_v = parseFloat($("#delta_v_buck_boost").val());
delta_i = parseFloat($("#delta_i_buck_boost").val());

///////////////////////////////
// MODO DE CONDUÇÃO
// neste momento são efetuados pré-calculos pro plot operação
///////////////////////////////

buck_boost = new contas_buck_boost(entrada_buck_boost, saida_buck_boost, frequencia_buck_boost, potencia_buck_boost, delta_i, delta_v);

//  k = (buck_boost.Io * buck_boost.Lo) / (entrada_buck_boost * buck_boost.T);
if ($("#check_load_buck_boost").is(':checked')) {
    carga_buck_boost = parseFloat($("#carga_manual_buck_boost").val());
    buck_boost.Io = saida_buck_boost / carga_buck_boost;
    carga_manual_buck_boost = carga_buck_boost;
//    k = (buck_boost.Io * buck_boost.Lo) / (entrada_buck_boost * buck_boost.T);
}
k = (buck_boost.Io * buck_boost.Lo) / (entrada_buck_boost * buck_boost.T);

///////////////////////////////
// CONTÍNUA
///////////////////////////////

if (k > buck_boost.critico) {
    $("#modo_conducao_buck_boost").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_buck_boost').show()
    cond = "cont";
    $("#potencia_atual_buck_boost").hide();
//    k = (buck_boost.Io * buck_boost.Lo) / (entrada_buck_boost * buck_boost.T);
D = buck_boost.D;
//    $("#tensao_atual_buck_boost").hide();
$("#tensao_atual_buck_boost").html("<br>");
$("#potencia_atual_buck_boost").hide();
saida = saida_buck_boost;
if ($("#check_load_buck_boost").is(':checked')) {
    $("#potencia_atual_buck_boost").show();
    $("#potencia_atual_buck_boost").html("Po* (W): " + (saida * buck_boost.Io).toFixed(2));
}
}

///////////////////////////////
// CRÍTICA
///////////////////////////////

else if (buck_boost.critico === k) {
    $("#modo_conducao_buck_boost").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = buck_boost.critico;
    D = buck_boost.D;
//    $("#tensao_saida_box").show();
saida = saida_buck_boost;
$("#potencia_atual_buck_boost").show();
$("#potencia_atual_buck_boost").html("Po* (W): " + (saida * buck_boost.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUA
///////////////////////////////

else {
    $("#modo_conducao_buck_boost").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_buck_boost').hide()

    cond = "desc";
    ganho_ponto=0;
    i=0;
    while (i < buck_boost.critico) {
        ganho = -((buck_boost.D * buck_boost.D) / (2 * i))
        carga_nova=-((buck_boost.Lo * ganho) / (i * buck_boost.T)).toFixed(1);
        console.log(carga_nova)
        var diff = Math.abs( (carga_nova) - carga_buck_boost );
        if( diff < 1000 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }
    console.log(ganho_ponto)
    console.log(k)

    saida = parseFloat((ganho_ponto * entrada_buck_boost).toFixed(1));
    buck_boost.Io = saida / carga_buck_boost;
//    $("#tensao_atual_buck_boost").show();
$("#tensao_atual_buck_boost").html("Vo* (V): " + saida);
$("#potencia_atual_buck_boost").show();
$("#potencia_atual_buck_boost").html("Po* (W): " + (saida * buck_boost.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_buck_boost").html("Capacitância (uF): " + (buck_boost.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_buck_boost").html("Ganho Estático: " + (saida / entrada_buck_boost).toFixed(2));
$("#duty_tag_buck_boost").html("Razão Cíclica: " + buck_boost.D.toFixed(2));
$("#indutancia_critica_buck_boost").html("Indut. Crítica (uH): " + (buck_boost.Lcri * 1000000).toFixed(2));
$("#io_param_buck_boost").html("k (param.): " + k.toFixed(2));
$("#io_critica_buck_boost").html("I<sub>o</sub> crítica (A): " + ((buck_boost.critico * entrada_buck_boost * buck_boost.T) / buck_boost.Lo).toFixed(3));
$("#io_buck_boost").html("I<sub>o</sub> (A): " + buck_boost.Io.toFixed(2));
$("#indutancia_tag_buck_boost").html("Indutância (uH): " + (buck_boost.Lo * 1000000).toFixed(2));
handle_check_buck_boost();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * buck_boost.T)) {
    v_carga.push([i, -saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_buck_boost * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_buck_boost = $("#tensao_saida_buck_boost");
options = {
    xaxis: {
        ticks: 4,
        zoomRange: [0.0001, 5 * buck_boost.T],
        panRange: [0, 5 * buck_boost.T]
    },
    yaxis: {
        zoomRange: [1.1 * saida_buck_boost / 100 * delta_v, 1.3 * saida],
        panRange: [0, 1.2 * saida],
        min: -1.2 * saida,
        max: 0
    },
    zoom: {
        interactive: true
    },
    pan: {
        interactive: true
    }
};
plot = $.plot(tensao_saida_buck_boost, data, options);

textox('Tempo (s)','#tensao_saida_buck_boost');
textoy('Tensão (V)','#tensao_saida_buck_boost');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////
d1_plot = [];
d2_plot = [];
d3_plot = [];

i = 0;
while (i < 0.13) {
    d1_plot.push([i, 1-(1 - Math.sqrt(1 - 8 * i)) / (4 * i)]);
    i += 0.00005;
}
i = 0;
while (i < 0.13) {
    d1_plot.push([i, 1- (1 + Math.sqrt(1 - 8 * i)) / (4 * i)]);
    i += 0.00005;
}
i=0;
while (i < buck_boost.critico) {
    d2_plot.push([i, -((buck_boost.D * buck_boost.D) / (2 * i))]);
    i += 0.00005;
}

i = buck_boost.critico;
while (i < 0.2) {
    d2_plot.push([i, -saida_buck_boost / entrada_buck_boost]);
    i += 0.0001;
}
if (k > 0.2) {
    k = 0.2;
}

if (cond === "cont") {
    d3_plot = [[k, -buck_boost.q - 0.2], [k, -buck_boost.q + 0.2]];
}
else {
    d3_plot = [[k, ganho_ponto - 0.2], [k, ganho_ponto + 0.2]];
}

$.plot($("#grafico_operacao_buck_boost"), [
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
        max: 0,
        min: -10
    },
    xaxis: {
        ticks: 4,
        max: 0.2,
        min: 0
    },
    grid: {
        hoverable: true,
        clickable: true
    }
});
$("#grafico_operacao_buck_boost").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            if (pos.x > 0 && pos.x < 0.2 && pos.y < 0 && pos.y > -20) {
                $("#valor_k_buck_boost").html("k = " + pos.x.toFixed(2));
                if (pos.x > buck_boost.critico) {
                    $("#valor_ganho_buck_boost").html("Ganho Estático = " + (saida_buck_boost / entrada_buck_boost).toFixed(2));
                    $("#continha_buck_boost").html("CONTÍNUO");
                    $("#valor_vo_buck_boost").html("Vo = " + (entrada_buck_boost * buck_boost.q).toFixed(2));
                    carga_nova = -((buck_boost.Lo * item.datapoint[1]) / (item.datapoint[0] * buck_boost.T)).toFixed(2);
                    $("#valor_novo_carga_buck_boost").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_buck_boost").html("Io (A) = " + -((pos.y * entrada_buck_boost) / carga_nova).toFixed(2));
                } else {
                    $("#valor_ganho_buck_boost").html("Ganho Estático = " + -pos.y.toFixed(2));
                    $("#continha_buck_boost").html("DESCONTÍNUO");
                    $("#valor_vo_buck_boost").html("Vo (V) = " + -(pos.y * entrada_buck_boost).toFixed(2));
                    carga_nova = -((buck_boost.Lo * item.datapoint[1]) / (item.datapoint[0] * buck_boost.T)).toFixed(2);
                    $("#valor_novo_carga_buck_boost").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_buck_boost").html("Io (A) = " + -((pos.y * entrada_buck_boost) / carga_nova).toFixed(2));
                }
            }
        }
    }
});

$("#grafico_operacao_buck_boost").bind("plotclick", function (event, pos, item) {
//    carga_nova = Math.round(carga_nova);
if ($("#check_load_buck_boost").is(':checked')) {
    $("#carga_manual_buck_boost").val(carga_nova);
} else {
    $("#check_load_buck_boost").prop('checked', true);
    handle_check_buck_boost();
    $("#carga_manual_buck_boost").val(carga_nova);
}
});

textox('Corrente Parametrizada','#grafico_operacao_buck_boost');
textoy('Ganho','#grafico_operacao_buck_boost');

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
    varia_corrente = (entrada_buck_boost * buck_boost.T * buck_boost.D) / buck_boost.Lo
    iL=((entrada_buck_boost+saida)*buck_boost.Io)/entrada_buck_boost;
    buck_boost.delta_i = 100*varia_corrente/iL;
        // indutor
        i1_plot = [[0, iL - ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [2 * buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [2 * buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [3 * buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [3 * buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)]];
        // chave
        i2_plot = [[0, iL - ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.ton, 0], [buck_boost.T, 0], [buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.T + buck_boost.ton, 0], [2 * buck_boost.T, 0], [2 * buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [2 * buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [2 * buck_boost.T + buck_boost.ton, 0], [3 * buck_boost.T, 0], [3 * buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [3 * buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)]];
        // diodo
        i3_plot = [[0, 0], [buck_boost.ton, 0], [buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [buck_boost.T, 0], [buck_boost.T + buck_boost.ton, 0], [buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [2 * buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [2 * buck_boost.T, 0], [2 * buck_boost.T + buck_boost.ton, 0], [2 * buck_boost.T + buck_boost.ton, iL + ((iL * buck_boost.delta_i / 100) / 2)], [3 * buck_boost.T, iL - ((iL * buck_boost.delta_i / 100) / 2)], [3 * buck_boost.T, 0], [3 * buck_boost.T + buck_boost.ton, 0]];
        // diodo
        t1_plot = [[0, entrada_buck_boost+saida], [buck_boost.ton, entrada_buck_boost+saida], [buck_boost.ton, 0], [buck_boost.T, 0], [buck_boost.T, entrada_buck_boost+saida], [buck_boost.T + buck_boost.ton, entrada_buck_boost+saida], [buck_boost.T + buck_boost.ton, 0], [2 * buck_boost.T, 0], [2 * buck_boost.T, entrada_buck_boost+saida], [2 * buck_boost.T + buck_boost.ton, entrada_buck_boost+saida], [2 * buck_boost.T + buck_boost.ton, 0], [3 * buck_boost.T, 0], [3 * buck_boost.T, entrada_buck_boost+saida], [3 * buck_boost.T + buck_boost.ton, entrada_buck_boost+saida]];
        // chave
        t2_plot = [[0, 0], [buck_boost.ton, 0], [buck_boost.ton, entrada_buck_boost+saida], [buck_boost.T, entrada_buck_boost+saida], [buck_boost.T, 0], [buck_boost.T + buck_boost.ton, 0], [buck_boost.T + buck_boost.ton, entrada_buck_boost+saida], [2 * buck_boost.T, entrada_buck_boost+saida], [2 * buck_boost.T, 0], [2 * buck_boost.T + buck_boost.ton, 0], [2 * buck_boost.T + buck_boost.ton, entrada_buck_boost+saida], [3 * buck_boost.T, entrada_buck_boost+saida], [3 * buck_boost.T, 0], [3 * buck_boost.T + buck_boost.ton, 0]];
        // indutor
        t3_plot = [[0, entrada_buck_boost], [buck_boost.ton, entrada_buck_boost], [buck_boost.ton, -saida], [buck_boost.T, -saida], [buck_boost.T, entrada_buck_boost], [buck_boost.T + buck_boost.ton, entrada_buck_boost], [buck_boost.T + buck_boost.ton, -saida], [2 * buck_boost.T, -saida], [2 * buck_boost.T, entrada_buck_boost], [2 * buck_boost.T + buck_boost.ton, entrada_buck_boost], [2 * buck_boost.T + buck_boost.ton, -saida], [3 * buck_boost.T, -saida], [3 * buck_boost.T, entrada_buck_boost], [3 * buck_boost.T + buck_boost.ton, entrada_buck_boost]];
    }
    else {
        pico = (entrada_buck_boost / buck_boost.Lo) * buck_boost.ton;
        tcorte=buck_boost.T*(1-(buck_boost.D*(entrada_buck_boost+saida)/saida));
        tcorte=buck_boost.T-tcorte;
        // indutor
        i1_plot = [[0, 0], [buck_boost.ton, pico], [tcorte, 0], [buck_boost.T, 0], [buck_boost.ton + buck_boost.T, pico], [tcorte + buck_boost.T, 0], [buck_boost.T * 2, 0], [buck_boost.ton + buck_boost.T * 2, pico], [tcorte + buck_boost.T * 2, 0], [buck_boost.T * 3, 0], [buck_boost.ton + buck_boost.T * 3, pico]];
        // chave
        i2_plot = [[0, 0], [buck_boost.ton, pico], [buck_boost.ton, 0], [tcorte, 0], [buck_boost.T, 0], [buck_boost.ton + buck_boost.T, pico], [buck_boost.ton + buck_boost.T, 0], [tcorte + buck_boost.T, 0], [buck_boost.T * 2, 0], [buck_boost.ton + buck_boost.T * 2, pico], [buck_boost.ton + buck_boost.T * 2, 0], [tcorte + buck_boost.T * 2, 0], [buck_boost.T * 3, 0], [buck_boost.ton + buck_boost.T * 3, pico]];
        // diodo
        i3_plot = [[0, 0], [buck_boost.ton, 0], [buck_boost.ton, pico], [tcorte, 0], [buck_boost.T, 0], [buck_boost.ton + buck_boost.T, 0], [buck_boost.ton + buck_boost.T, pico], [tcorte + buck_boost.T, 0], [buck_boost.T * 2, 0], [buck_boost.ton + buck_boost.T * 2, 0], [buck_boost.ton + buck_boost.T * 2, pico], [tcorte + buck_boost.T * 2, 0], [buck_boost.T * 3, 0], [buck_boost.ton + buck_boost.T * 3, 0]];
        // diodo
        t1_plot = [[0, entrada_buck_boost+saida], [buck_boost.ton, entrada_buck_boost+saida], [buck_boost.ton, 0], [tcorte, 0], [tcorte, saida], [buck_boost.T, saida], [buck_boost.T, entrada_buck_boost+saida], [buck_boost.ton + buck_boost.T, entrada_buck_boost+saida], [buck_boost.ton + buck_boost.T, 0], [tcorte + buck_boost.T, 0], [tcorte + buck_boost.T, saida], [buck_boost.T * 2, saida], [buck_boost.T * 2, entrada_buck_boost+saida], [buck_boost.ton + buck_boost.T * 2, entrada_buck_boost+saida], [buck_boost.ton + buck_boost.T * 2, 0], [tcorte + buck_boost.T * 2, 0], [tcorte + buck_boost.T * 2, saida], [buck_boost.T * 3, saida], [buck_boost.T * 3, entrada_buck_boost+saida], [buck_boost.ton + buck_boost.T * 3, entrada_buck_boost+saida]];
        // chave
        t2_plot = [[0, 0], [buck_boost.ton, 0], [buck_boost.ton, entrada_buck_boost+saida], [tcorte, entrada_buck_boost+saida], [tcorte, entrada_buck_boost], [buck_boost.T, entrada_buck_boost], [buck_boost.T, 0], [buck_boost.ton + buck_boost.T, 0], [buck_boost.ton + buck_boost.T, entrada_buck_boost+saida], [tcorte + buck_boost.T, entrada_buck_boost+saida], [tcorte + buck_boost.T, entrada_buck_boost], [buck_boost.T * 2, entrada_buck_boost], [buck_boost.T * 2, 0], [buck_boost.ton + buck_boost.T * 2, 0], [buck_boost.ton + buck_boost.T * 2, entrada_buck_boost+saida], [tcorte + buck_boost.T * 2, entrada_buck_boost+saida], [tcorte + buck_boost.T * 2, entrada_buck_boost], [buck_boost.T * 3, entrada_buck_boost], [buck_boost.T * 3, 0], [buck_boost.ton + buck_boost.T * 3, 0]];
        // indutor
        t3_plot = [[0, entrada_buck_boost], [buck_boost.ton, entrada_buck_boost], [buck_boost.ton, -saida], [tcorte, -saida], [tcorte, 0], [buck_boost.T, 0], [buck_boost.T, entrada_buck_boost], [buck_boost.ton + buck_boost.T, entrada_buck_boost], [buck_boost.ton + buck_boost.T, -saida], [tcorte + buck_boost.T, -saida], [tcorte + buck_boost.T, 0], [buck_boost.T * 2, 0], [buck_boost.T * 2, entrada_buck_boost], [buck_boost.ton + buck_boost.T * 2, entrada_buck_boost], [buck_boost.ton + buck_boost.T * 2, -saida], [tcorte + buck_boost.T * 2, -saida], [tcorte + buck_boost.T * 2, 0], [buck_boost.T * 3, 0], [buck_boost.T * 3, entrada_buck_boost], [buck_boost.ton + buck_boost.T * 3, entrada_buck_boost]];
    }
    $.plot($("#corrente_indutor_buck_boost"), [
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

    textox('Tempo (s)','#corrente_indutor_buck_boost');
    textoy('Corrente (A)','#corrente_indutor_buck_boost');

    $.plot($("#tensao_indutor_buck_boost"), [
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

    textox('Tempo (s)','#tensao_indutor_buck_boost');
    textoy('Tensão (V)','#tensao_indutor_buck_boost');

    $.plot($("#corrente_chave_buck_boost"), [
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

    textox('Tempo (s)','#corrente_chave_buck_boost');
    textoy('Corrente (A)','#corrente_chave_buck_boost');

    $.plot($("#corrente_diodo_buck_boost"), [
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

    textox('Tempo (s)','#corrente_diodo_buck_boost');
    textoy('Corrente (A)','#corrente_diodo_buck_boost');

    $.plot($("#tensao_diodo_buck_boost"), [
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

    textox('Tempo (s)','#tensao_diodo_buck_boost');
    textoy('Tensão (V)','#tensao_diodo_buck_boost');

    $.plot($("#tensao_chave_buck_boost"), [
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

    textox('Tempo (s)','#tensao_chave_buck_boost');
    textoy('Tensão (V)','#tensao_chave_buck_boost');

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=-buck_boost.D/(1-buck_boost.D);
    Gdo=saida_buck_boost/(buck_boost.D*(1-buck_boost.D)*(1-buck_boost.D));
    wo=(1-buck_boost.D)/Math.sqrt(buck_boost.Lo*buck_boost.capacitancia);
    Q=(1-buck_boost.D)*carga_buck_boost*Math.sqrt(buck_boost.capacitancia/buck_boost.Lo);
    wz = ((1-buck_boost.D)*(1-buck_boost.D)*carga_buck_boost)/(buck_boost.Lo*buck_boost.D);
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
        $.plot($("#diagrama_bode_buck_boost"), [
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
        $.plot($("#diagrama_fase_buck_boost"), [
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

textox('Frequência (Hz)','#diagrama_bode_buck_boost');
textoy('Ganho (V)','#diagrama_bode_buck_boost');

textox('Frequência (Hz)','#diagrama_fase_buck_boost');
textoy('Ângulo (°)','#diagrama_fase_buck_boost');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////

step_plot = [];
t = 0;

if (si > 1) {
    while (t < 5*((3*si)/wo)) {
        step_plot.push([t, entrada_buck_boost * -Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
        t+=((5*((3*si)/wo))/100);
    }
}
else {
    while (t < 4.6/(si*wo)) {
        step_plot.push([t, entrada_buck_boost * -Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
        t+=((5*((3*si)/wo))/100);
    }
}

$.plot($("#resposta_degrau_buck_boost"), [
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

textox('Tempo (s)','#resposta_degrau_buck_boost');
textoy('Tensão (V)','#resposta_degrau_buck_boost');

$("#resposta_degrau_buck_boost").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            $("#valor_tensao_step_buck_boost").html("Vo (V) =  " + pos.y.toFixed(2));
            $("#valor_tempo_step_buck_boost").html("t (s) = " + pos.x.toFixed(6));
        }
    }
});
}

if (carga_manual_buck_boost = "null") {
    carga_manual_buck_boost = carga_buck_boost.toFixed(2);
}
};
