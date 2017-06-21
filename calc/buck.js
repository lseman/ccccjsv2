///////////////////////////////
// BUCK
///////////////////////////////

var carga_buck, carga_manual_buck, contas_buck, handle_check_buck, play_buck, carga_nova;

carga_buck = 0;

carga_manual_buck = "null";

handle_check_buck = function() {
    var estado;
    estado = $("#check_load_buck").is(':checked');
    if (!estado) {
    $("#carga_tag_buck").html("Carga (&Omega;): " + carga_buck.toFixed(2) + " <input id='check_load_buck' type='checkbox' onclick='handle_check_buck()'>");
} else {
    $("#carga_tag_buck").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_buck + "' id='carga_manual_buck' onkeydown='if (event.keyCode == 13) play_buck()'> <input id='check_load_buck' type='checkbox' checked='true' onclick='handle_check_buck()'>");
}
};

contas_buck = function(entrada_buck, saida_buck, frequencia_buck, potencia_buck, delta_i, delta_v) {
    this.q = saida_buck / entrada_buck;
    this.D = this.q;
    this.T = 1 / (frequencia_buck * 1000);
    this.ton = this.T * this.q;
    this.Io = potencia_buck / saida_buck;
    this.Lo = (entrada_buck-saida_buck)*this.ton/((delta_i / 100) * this.Io);
    this.delta_i = delta_i;
    this.capacitancia = entrada_buck / (31 * this.Lo * frequencia_buck * 1000 * frequencia_buck * 1000 * delta_v / 100 * saida_buck);
    this.Lcri = (entrada_buck-saida_buck)*this.ton/(2*this.Io);
    this.Ilmed = ((entrada_buck - saida_buck) * this.q) / frequencia_buck * 1000 * 2 * this.Lo;
    this.critico = ((this.D * this.D) / 2) * ((1 / this.D) - 1);
    this.Iocrit = ((delta_i / 100) * this.Io)/2;
    carga_buck = saida_buck * saida_buck / potencia_buck;
};

play_buck = function() {
    var i3_plot, si, t, step_plot, j, Ggo, Gdo, wo, Q, funcao, D, buck, carga_ponto, cond, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, denominador, entrada_buck, f_plot, fase, frequencia_buck, g_plot, ganho_ponto, i1_plot, i2_plot, imaginaria, k, options, pico, plot, ponto, potencia_buck, real, saida, saida_buck, tcorte, tensao_saida_buck, v_carga;

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

entrada_buck = parseFloat($("#entrada_buck").val());
saida_buck = parseFloat($("#saida_buck").val());
frequencia_buck = parseFloat($("#frequencia_buck").val());
potencia_buck = parseFloat($("#potencia_buck").val());
delta_v = parseFloat($("#delta_v_buck").val());
delta_i = parseFloat($("#delta_i_buck").val());

if(saida_buck>entrada_buck) {
    alert('Saída deve ser menor!')
    return false;
}

///////////////////////////////
// MODO DE CONDUÇÃO
///////////////////////////////

buck = new contas_buck(entrada_buck, saida_buck, frequencia_buck, potencia_buck, delta_i, delta_v);
//  k = (buck.Io * buck.Lo) / (entrada_buck * buck.T);
if ($("#check_load_buck").is(':checked')) {
    carga_buck = parseFloat($("#carga_manual_buck").val());
    buck.Io = saida_buck / carga_buck;
    carga_manual_buck = carga_buck;
//    k = (buck.Io * buck.Lo) / (entrada_buck * buck.T);
}
k = (buck.Io * buck.Lo) / (entrada_buck * buck.T);
D = buck.q;

///////////////////////////////
// CONTÍNUO
///////////////////////////////

if (k > buck.critico) {
    $("#modo_conducao_buck").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_buck').show()
    cond = "cont";
    $("#potencia_atual_buck").hide();
//    k = (buck.Io * buck.Lo) / (entrada_buck * buck.T);
//    D = buck.q;
//    $("#tensao_atual_buck").hide();
    $("#tensao_atual_buck").html("<br>");
    $("#potencia_atual_buck").hide();
    saida = saida_buck;
    if ($("#check_load_buck").is(':checked')) {
        $("#potencia_atual_buck").show();
        $("#potencia_atual_buck").html("Po* (W): " + (saida * buck.Io).toFixed(2));
    }
} 

///////////////////////////////
// CRÍTICO
///////////////////////////////

else if (buck.critico === k) {
    $("#modo_conducao_buck").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = ((buck.q * buck.q) / 2) * ((1 / buck.q) - 1);
//    D = buck.q;
//    $("#tensao_saida_box_buck").show();
    saida = saida_buck;
    $("#potencia_atual_buck").show();
    $("#potencia_atual_buck").html("Po* (W): " + (saida * buck.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUO
///////////////////////////////

else {
    $("#modo_conducao_buck").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_buck').hide()

    cond = "desc";
    D = buck.q;
    ganho_ponto = ((D*Math.sqrt(carga_buck)*Math.sqrt(buck.T)*Math.sqrt(D*D*carga_buck*buck.T+8*buck.Lo))-D*D*(carga_buck)*buck.T)/(4*buck.Lo)
    console.log(ganho_ponto)
    k = (buck.Lo * entrada_buck * ganho_ponto)/(carga_buck*entrada_buck*buck.T);
    buck.q = ganho_ponto;

    saida = parseFloat((buck.q * entrada_buck).toFixed(1));
    buck.Io = saida / carga_buck;
//    $("#tensao_atual_buck").show();
$("#tensao_atual_buck").html("Vo* (V): " + saida);
$("#potencia_atual_buck").show();
$("#potencia_atual_buck").html("Po* (W): " + (saida * buck.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_buck").html("Capacitância (uF): " + (buck.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_buck").html("Ganho Estático: " + (saida / entrada_buck).toFixed(2));
$("#duty_tag_buck").html("Razão Cíclica: " + D.toFixed(2));
$("#indutancia_critica_buck").html("Indut. Crítica (uH): " + (buck.Lcri * 1000000).toFixed(2));
$("#io_param_buck").html("k (param.): " + k.toFixed(2));
$("#io_critica_buck").html("I<sub>o</sub> crítica (A): " + buck.Iocrit.toFixed(3));
$("#io_buck").html("I<sub>o</sub> (A): " + buck.Io.toFixed(2));
$("#indutancia_tag_buck").html("Indutância (uH): " + (buck.Lo * 1000000).toFixed(2));
handle_check_buck();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * buck.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_buck * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_buck = $("#tensao_saida_buck");
options = {
    xaxis: {
    ticks: 4,
    zoomRange: [0.0001, 5 * buck.T],
    panRange: [0, 5 * buck.T]
},
yaxis: {
    zoomRange: [1.1 * saida_buck / 100 * delta_v, 1.3 * saida],
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

plot = $.plot(tensao_saida_buck, data, options);

textox('Tempo (s)','#tensao_saida_buck');
textoy('Tensão (V)','#tensao_saida_buck');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////

d1_plot = [];
d2_plot = [];
d3_plot = [];
i = 0;
while (i < 0.15) {
    d1_plot.push([i, (1 + Math.sqrt(1 - 8 * i)) / 2]);
    i += 0.00005;
}
i = 0;
while (i < 0.15) {
    d1_plot.push([i, (1 - Math.sqrt(1 - 8 * i)) / 2]);
    i += 0.00005;
}
i = 0;
while (i < buck.critico) {
    d2_plot.push([i, (buck.D*buck.D)/(buck.D*buck.D+2*i)]);
    i += 0.0005;
}
i = buck.critico;
while (i < 0.6) {
    d2_plot.push([i, D]);
    i += 0.0005;
}
if (k > 0.5) {
    k = 0.5;
}
d3_plot = [[k, buck.q - 0.02], [k, buck.q + 0.02]];
$.plot($("#grafico_operacao_buck"), [
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
    max: 1,
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
$("#grafico_operacao_buck").bind("plothover", function(event, pos, item) {
    var critico, previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
    if (previousPoint !== item.datapoint) {
        previousPoint = item.datapoint;
        if (pos.x > 0 && pos.x < 1 && pos.y > 0 && pos.y < 1) {
        $("#valor_k_buck").html("k = " + pos.x.toFixed(2));
        if (pos.x > (critico = ((pos.y * pos.y) / 2) * ((1 / pos.y) - 1))) {
            $("#valor_ganho_buck").html("Ganho Estático = " + D.toFixed(2));
            $("#continha_buck").html("CONTÍNUO");
            $("#valor_vo_buck").html("Vo (V) = " + (entrada_buck * buck.D).toFixed(2));
            carga_nova = ((buck.Lo * item.datapoint[1]) / (item.datapoint[0] * buck.T)).toFixed(2);
            $("#valor_novo_carga_buck").html("Carga (&Omega;) = " + carga_nova);
            $("#valor_io_novo_buck").html("Io (A) = " + ((item.datapoint[1] * entrada_buck) / carga_nova).toFixed(2));
        } else {
            $("#valor_ganho_buck").html("Ganho Estático = " + pos.y.toFixed(2));
            $("#continha_buck").html("DESCONTÍNUO");
            $("#valor_vo_buck").html("Vo (V) = " + (item.datapoint[1] * entrada_buck).toFixed(2));
            carga_nova = ((buck.Lo * item.datapoint[1]) / (item.datapoint[0] * buck.T)).toFixed(2);
            $("#valor_novo_carga_buck").html("Carga (&Omega;) = " + carga_nova);
            $("#valor_io_novo_buck").html("Io (A) = " + ((item.datapoint[1] * entrada_buck) / carga_nova).toFixed(2));
        }
    }
}
}
});

$("#grafico_operacao_buck").bind("plotclick", function (event, pos, item) {
//    carga_nova = Math.round(carga_nova);
if ($("#check_load_buck").is(':checked')) {
    $("#carga_manual_buck").val(carga_nova);
} else {
    $("#check_load_buck").prop('checked', true);
    handle_check_buck();
    $("#carga_manual_buck").val(carga_nova);
}
});

textox('Corrente Parametrizada','#grafico_operacao_buck');
textoy('Ganho','#grafico_operacao_buck');

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
    varia_corrente = ((entrada_buck - saida) / buck.Lo) * buck.ton;
    buck.delta_i = 100*varia_corrente/buck.Io;
    // indutor
    i1_plot = [[0, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [2 * buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [2 * buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [3 * buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [3 * buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)]];
    // chave
    i2_plot = [[0, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [buck.ton, 0], [buck.T, 0], [buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [buck.T + buck.ton, 0], [2 * buck.T, 0], [2 * buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [2 * buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [2 * buck.T + buck.ton, 0], [3 * buck.T, 0], [3 * buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [3 * buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)]];
    // diodo
    i3_plot = [[0, 0], [buck.ton, 0], [buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [buck.T, 0], [buck.T + buck.ton, 0], [buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [2 * buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [2 * buck.T, 0], [2 * buck.T + buck.ton, 0], [2 * buck.T + buck.ton, buck.Io + ((buck.Io * buck.delta_i / 100) / 2)], [3 * buck.T, buck.Io - ((buck.Io * buck.delta_i / 100) / 2)], [3 * buck.T, 0], [3 * buck.T + buck.ton, 0]];
    // diodo
    t1_plot = [[0, entrada_buck], [buck.ton, entrada_buck], [buck.ton, 0], [buck.T, 0], [buck.T, entrada_buck], [buck.T + buck.ton, entrada_buck], [buck.T + buck.ton, 0], [2 * buck.T, 0], [2 * buck.T, entrada_buck], [2 * buck.T + buck.ton, entrada_buck], [2 * buck.T + buck.ton, 0], [3 * buck.T, 0], [3 * buck.T, entrada_buck], [3 * buck.T + buck.ton, entrada_buck]];
    // chave
    t2_plot = [[0, 0], [buck.ton, 0], [buck.ton, entrada_buck], [buck.T, entrada_buck], [buck.T, 0], [buck.T + buck.ton, 0], [buck.T + buck.ton, entrada_buck], [2 * buck.T, entrada_buck], [2 * buck.T, 0], [2 * buck.T + buck.ton, 0], [2 * buck.T + buck.ton, entrada_buck], [3 * buck.T, entrada_buck], [3 * buck.T, 0], [3 * buck.T + buck.ton, 0]];
    // indutor
    t3_plot = [[0, entrada_buck-saida], [buck.ton, entrada_buck-saida], [buck.ton, -saida], [buck.T, -saida], [buck.T, entrada_buck-saida], [buck.T + buck.ton, entrada_buck-saida], [buck.T + buck.ton, -saida], [2 * buck.T, -saida], [2 * buck.T, entrada_buck-saida], [2 * buck.T + buck.ton, entrada_buck-saida], [2 * buck.T + buck.ton, -saida], [3 * buck.T, -saida], [3 * buck.T, entrada_buck-saida], [3 * buck.T + buck.ton, entrada_buck-saida]];
} 
else {
    pico = ((entrada_buck - saida) / buck.Lo) * buck.ton;
    tcorte=buck.T-(entrada_buck*buck.D*buck.T)/saida;
    tcorte=buck.T-tcorte;
    // indutor    
    i1_plot = [[0, 0], [buck.ton, pico], [tcorte, 0], [buck.T, 0], [buck.ton + buck.T, pico], [tcorte + buck.T, 0], [buck.T * 2, 0], [buck.ton + buck.T * 2, pico], [tcorte + buck.T * 2, 0], [buck.T * 3, 0], [buck.ton + buck.T * 3, pico]];
    // chave
    i2_plot = [[0, 0], [buck.ton, pico], [buck.ton, 0], [tcorte, 0], [buck.T, 0], [buck.ton + buck.T, pico], [buck.ton + buck.T, 0], [tcorte + buck.T, 0], [buck.T * 2, 0], [buck.ton + buck.T * 2, pico], [buck.ton + buck.T * 2, 0], [tcorte + buck.T * 2, 0], [buck.T * 3, 0], [buck.ton + buck.T * 3, pico]];
    // diodo
    i3_plot = [[0, 0], [buck.ton, 0], [buck.ton, pico], [tcorte, 0], [buck.T, 0], [buck.ton + buck.T, 0], [buck.ton + buck.T, pico], [tcorte + buck.T, 0], [buck.T * 2, 0], [buck.ton + buck.T * 2, 0], [buck.ton + buck.T * 2, pico], [tcorte + buck.T * 2, 0], [buck.T * 3, 0], [buck.ton + buck.T * 3, 0]];
    // diodo
    t1_plot = [[0, entrada_buck], [buck.ton, entrada_buck], [buck.ton, 0], [tcorte, 0], [tcorte, saida], [buck.T, saida], [buck.T, entrada_buck], [buck.ton + buck.T, entrada_buck], [buck.ton + buck.T, 0], [tcorte + buck.T, 0], [tcorte + buck.T, saida], [buck.T * 2, saida], [buck.T * 2, entrada_buck], [buck.ton + buck.T * 2, entrada_buck], [buck.ton + buck.T * 2, 0], [tcorte + buck.T * 2, 0], [tcorte + buck.T * 2, saida], [buck.T * 3, saida], [buck.T * 3, entrada_buck], [buck.ton + buck.T * 3, entrada_buck]];
    // chave
    t2_plot = [[0, 0], [buck.ton, 0], [buck.ton, entrada_buck], [tcorte, entrada_buck], [tcorte, entrada_buck-saida], [buck.T, entrada_buck-saida], [buck.T, 0], [buck.ton + buck.T, 0], [buck.ton + buck.T, entrada_buck], [tcorte + buck.T, entrada_buck], [tcorte + buck.T, entrada_buck-saida], [buck.T * 2, entrada_buck-saida], [buck.T * 2, 0], [buck.ton + buck.T * 2, 0], [buck.ton + buck.T * 2, entrada_buck], [tcorte + buck.T * 2, entrada_buck], [tcorte + buck.T * 2, entrada_buck-saida], [buck.T * 3, entrada_buck-saida], [buck.T * 3, 0], [buck.ton + buck.T * 3, 0]];
    // indutor
    t3_plot = [[0, entrada_buck-saida], [buck.ton, entrada_buck-saida], [buck.ton, -saida], [tcorte, -saida], [tcorte, 0], [buck.T, 0], [buck.T, entrada_buck-saida], [buck.ton + buck.T, entrada_buck-saida], [buck.ton + buck.T, -saida], [tcorte + buck.T, -saida], [tcorte + buck.T, 0], [buck.T * 2, 0], [buck.T * 2, entrada_buck-saida], [buck.ton + buck.T * 2, entrada_buck-saida], [buck.ton + buck.T * 2, -saida], [tcorte + buck.T * 2, -saida], [tcorte + buck.T * 2, 0], [buck.T * 3, 0], [buck.T * 3, entrada_buck-saida], [buck.ton + buck.T * 3, entrada_buck-saida]];
}
$.plot($("#corrente_indutor_buck"), [
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

textox('Tempo (s)','#corrente_indutor_buck');
textoy('Corrente (A)','#corrente_indutor_buck');

$.plot($("#tensao_indutor_buck"), [
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

textox('Tempo (s)','#tensao_indutor_buck');
textoy('Tensão (V)','#tensao_indutor_buck');

$.plot($("#corrente_chave_buck"), [
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

textox('Tempo (s)','#corrente_chave_buck');
textoy('Corrente (A)','#corrente_chave_buck');

$.plot($("#corrente_diodo_buck"), [
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

textox('Tempo (s)','#corrente_diodo_buck');
textoy('Corrente (A)','#corrente_diodo_buck');

$.plot($("#tensao_diodo_buck"), [
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

textox('Tempo (s)','#tensao_diodo_buck');
textoy('Tensão (V)','#tensao_diodo_buck');

$.plot($("#tensao_chave_buck"), [
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

textox('Tempo (s)','#tensao_chave_buck');
textoy('Tensão (V)','#tensao_chave_buck');

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=saida_buck / entrada_buck;
    Gdo=saida_buck/buck.D;
    wo=1/Math.sqrt(buck.Lo*buck.capacitancia);
    Q=carga_buck*Math.sqrt(buck.capacitancia/buck.Lo);
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
$.plot($("#diagrama_bode_buck"), [
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
$.plot($("#diagrama_fase_buck"), [
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

textox('Frequência (Hz)','#diagrama_bode_buck');
textoy('Ganho (V)','#diagrama_bode_buck');

textox('Frequência (Hz)','#diagrama_fase_buck');
textoy('Ângulo (°)','#diagrama_fase_buck');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////
step_plot = [];

t=0;
if (si > 1) {
    while (t < 5*((3*si)/wo)) {
    step_plot.push([t, entrada_buck * Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
    t+=((5*((3*si)/wo))/100);
}
}
else {
    while (t < 4.6/(si*wo)) {
    step_plot.push([t, entrada_buck * Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
    t+=((5*((3*si)/wo))/100);
}
}

$.plot($("#resposta_degrau_buck"), [
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

textox('Tempo (s)','#resposta_degrau_buck');
textoy('Tensão (V)','#resposta_degrau_buck');

$("#resposta_degrau_buck").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
    if (previousPoint !== item.datapoint) {
        previousPoint = item.datapoint;
        $("#valor_tensao_step_buck").html("Vo (V) =  " + pos.y.toFixed(2));
        $("#valor_tempo_step_buck").html("t (s) = " + pos.x.toFixed(6));
    }
}
});
}

if (carga_manual_buck = "null") {
    carga_manual_buck = carga_buck.toFixed(2);
}

};