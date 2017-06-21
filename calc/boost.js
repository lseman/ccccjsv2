///////////////////////////////
// BOOST
///////////////////////////////

var carga_boost, carga_manual_boost, contas_boost, handle_check_boost, play_boost, carga_nova;

carga_boost = 0;

carga_manual_boost = "null";

handle_check_boost = function() {
    var estado;
    estado = $("#check_load_boost").is(':checked');
    if (!estado) {
    $("#carga_tag_boost").html("Carga (&Omega;): " + carga_boost.toFixed(2) + " <input id='check_load_boost' type='checkbox' onclick='handle_check_boost()'>");
} else {
    $("#carga_tag_boost").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_boost + "' id='carga_manual_boost' onkeydown='if (event.keyCode == 13) play_boost()'> <input id='check_load_boost' type='checkbox' checked='true' onclick='handle_check_boost()'>");
}
};

contas_boost = function(entrada_boost, saida_boost, frequencia_boost, potencia_boost, delta_i, delta_v) {
    this.q = saida_boost / entrada_boost;
    this.D = (saida_boost - entrada_boost) / saida_boost;
    this.T = 1 / (frequencia_boost * 1000);
    this.ton = this.T * this.D;
    this.Io = potencia_boost / saida_boost;
    this.Lo = (entrada_boost / (frequencia_boost * 1000 * (delta_i / 100) * this.Io * this.q)) * this.D;
    this.delta_i = delta_i;
    this.capacitancia = (this.Io / (frequencia_boost * 1000 * delta_v / 100 * saida_boost)) * this.D;
    this.Lcri = (entrada_boost * this.D * (1 - this.D)) / (2 * (frequencia_boost * 1000) * this.Io);
    this.Ilmed = ((entrada_boost - saida_boost) * this.q) / frequencia_boost * 1000 * 2 * this.Lo;
    this.critico = this.D*(1-this.D)/2;
    carga_boost = saida_boost * saida_boost / potencia_boost;
};

play_boost = function() {
    var i3_plot, si, t, step_plot, a, b, c, d, j, Ggo, Gdo, wo, Q, funcao, D, boost, carga_ponto, cond, critico, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, entrada_boost, f_plot, fase, frequencia_boost, g_plot, ganho_ponto, i1_plot, i2_plot, ident_boost, k, ok, options, pico, plot, potencia_boost, saida, saida_boost, tcorte, tensao_saida_boost, v_carga, valor_temporario;

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

ganho_ponto = parseFloat($("#ganho_boost").text())
k_ponto = parseFloat($("#k_boost").text())

entrada_boost = parseFloat($("#entrada_boost").val());
saida_boost = parseFloat($("#saida_boost").val());
frequencia_boost = parseFloat($("#frequencia_boost").val());
potencia_boost = parseFloat($("#potencia_boost").val());
delta_v = parseFloat($("#delta_v_boost").val());
delta_i = parseFloat($("#delta_i_boost").val());

if(saida_boost<entrada_boost) {
    alert('Saída deve ser maior!')
    return false;
}

boost = new contas_boost(entrada_boost, saida_boost, frequencia_boost, potencia_boost, delta_i, delta_v);
//  k = (boost.Io * boost.Lo) / (entrada_boost * boost.T);
if ($("#check_load_boost").is(':checked')) {
    carga_boost = parseFloat($("#carga_manual_boost").val());
    boost.Io = saida_boost / carga_boost;
    carga_manual_boost = carga_boost;
    k = (boost.Io * boost.Lo) / (entrada_boost * boost.T);
    console.log('capacitancia')
}
    k = (boost.Io * boost.Lo) / (entrada_boost * boost.T);

///////////////////////////////
// CONTÍNUA
///////////////////////////////

if (k > boost.critico) {
    $("#modo_conducao_boost").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_boost').show()
    cond = "cont";
    $("#potencia_atual_boost").hide();
//    k = (boost.Io * boost.Lo) / (entrada_boost * boost.T);
//D = boost.D;
//    $("#tensao_atual_boost").hide();
$("#tensao_atual_boost").html("<br>");
$("#potencia_atual_boost").hide();
saida = saida_boost;
if ($("#check_load_boost").is(':checked')) {
    $("#potencia_atual_boost").show();
    $("#potencia_atual_boost").html("Po* (W): " + (saida * boost.Io).toFixed(2));
}
}

///////////////////////////////
// CRÍTICA
///////////////////////////////

else if (boost.critico === k) {
    $("#modo_conducao_boost").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = boost.critico;
//  D = boost.D;
//    $("#tensao_saida_box").show();
saida = saida_boost;
$("#potencia_atual_boost").show();
$("#potencia_atual_boost").html("Po* (W): " + (saida * boost.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUA
///////////////////////////////

else {
    $("#modo_conducao_boost").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_boost').hide()

    cond = "desc";
    ganho_ponto=0;
    i=0;
    while (i < boost.critico) {
        ganho = ((boost.D * boost.D) / (2 * i)) + 1;
        carga_nova=((boost.Lo * ganho) / (i * boost.T)).toFixed(1);
        var diff = Math.abs( carga_nova - carga_boost );
        if( diff < 100 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }

    saida = parseFloat((ganho_ponto * entrada_boost).toFixed(1));
    boost.Io = saida / carga_boost;
    $("#tensao_atual_boost").html("Vo* (V): " + saida);
    $("#potencia_atual_boost").show();
    $("#potencia_atual_boost").html("Po* (W): " + (saida * boost.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_boost").html("Capacitância (uF): " + (boost.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_boost").html("Ganho Estático: " + (saida / entrada_boost).toFixed(2));
$("#duty_tag_boost").html("Razão Cíclica: " + boost.D.toFixed(2));
$("#indutancia_critica_boost").html("Indut. Crítica (uH): " + (boost.Lcri * 1000000).toFixed(2));
$("#io_param_boost").html("k (param.): " + k.toFixed(2));
$("#io_critica_boost").html("I<sub>o</sub> crítica (A): " + ((boost.critico * entrada_boost * boost.T) / boost.Lo).toFixed(3));
$("#io_boost").html("I<sub>o</sub> (A): " + boost.Io.toFixed(2));
$("#indutancia_tag_boost").html("Indutância (uH): " + (boost.Lo * 1000000).toFixed(2));
handle_check_boost();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * boost.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_boost * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_boost = $("#tensao_saida_boost");
options = {
    xaxis: {
    ticks: 4,
    zoomRange: [0.0001, 5 * boost.T],
    panRange: [0, 5 * boost.T]
},
yaxis: {
    zoomRange: [1.1 * saida_boost / 100 * delta_v, 1.3 * saida],
    panRange: [0, 1.2 * saida],
    min: 0,
    max: 1.2 * saida
},
zoom: {
    interactive: true
},
pan: {
    interactive: true
}
};
plot = $.plot(tensao_saida_boost, data, options);

textox('Tempo (s)','#tensao_saida_boost');
textoy('Tensão (V)','#tensao_saida_boost');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////

d1_plot = [];
d2_plot = [];
d3_plot = [];
i = 0;
while (i < 0.13) {
    d1_plot.push([i, (1 - Math.sqrt(1 - 8 * i)) / (4 * i)]);
    i += 0.00005;
}
i = 0;
while (i < 0.13) {
    d1_plot.push([i, (1 + Math.sqrt(1 - 8 * i)) / (4 * i)]);
    i += 0.00005;
}
i = 0;
while (i < boost.critico) {
    d2_plot.push([i, ((boost.D * boost.D) / (2 * i)) + 1]);
    i += 0.00005;
}
i = boost.critico;
while (i < 0.2) {
    d2_plot.push([i, saida_boost / entrada_boost]);
    i += 0.0001;
}
if (k > 0.2) {
    k = 0.2;
}

if (cond === "cont") {
    d3_plot = [[k, boost.q - 0.4], [k, boost.q + 0.4]];
}
else {
    d3_plot = [[(boost.D*boost.D)/(2*(ganho_ponto-1)), ganho_ponto - 0.4], [(boost.D*boost.D)/(2*(ganho_ponto-1)), ganho_ponto + 0.4]];
    console.log('ha')
    console.log(ganho_ponto)
    console.log((boost.D*boost.D)/(2*(ganho_ponto-1)))
}


$.plot($("#grafico_operacao_boost"), [
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
    max: 20,
    min: 0
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
$("#grafico_operacao_boost").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
    if (previousPoint !== item.datapoint) {
        previousPoint = item.datapoint;
        if (pos.x > 0 && pos.x < 0.2 && pos.y > 0 && pos.y < 20) {
        $("#valor_k_boost").html("k = " + pos.x.toFixed(2));
        if (pos.x > boost.critico) {
            $("#valor_ganho_boost").html("Ganho Estático = " + (saida_boost / entrada_boost).toFixed(2));
            $("#continha_boost").html("CONTÍNUO");
            $("#valor_vo_boost").html("Vo = " + (entrada_boost * boost.q).toFixed(2));
            carga_nova = ((boost.Lo * item.datapoint[1]) / (item.datapoint[0] * boost.T)).toFixed(2);
            $("#valor_novo_carga_boost").html("Carga (&Omega;) = " + carga_nova);
            $("#valor_io_novo_boost").html("Io (A) = " + ((pos.y * entrada_boost) / carga_nova).toFixed(2));
        } else {
            $("#valor_ganho_boost").html("Ganho Estático = " + pos.y.toFixed(2));
            $("#continha_boost").html("DESCONTÍNUO");
            $("#valor_vo_boost").html("Vo (V) = " + (pos.y * entrada_boost).toFixed(2));
            carga_nova = ((boost.Lo * item.datapoint[1]) / (item.datapoint[0] * boost.T)).toFixed(2);
            $("#valor_novo_carga_boost").html("Carga (&Omega;) = " + carga_nova);
            $("#valor_io_novo_boost").html("Io (A) = " + ((pos.y * entrada_boost) / carga_nova).toFixed(2));
        }
    }
}
}
});

$("#grafico_operacao_boost").bind("plotclick", function (event, pos, item) {
//    carga_nova = Math.round(carga_nova);

//if (item && (item.series.label === "Curva Operação")) {
//    $("#ganho_boost").html((pos.y));
//    $("#k_boost").html((pos.x));
//}
if ($("#check_load_boost").is(':checked')) {
    $("#carga_manual_boost").val(carga_nova);
} else {
    $("#check_load_boost").prop('checked', true);
    handle_check_boost();
    $("#carga_manual_boost").val(carga_nova);
}
});

textox('Corrente Parametrizada','#grafico_operacao_boost');
textoy('Ganho','#grafico_operacao_boost');

///////////////////////////////
// PLOT DAS CORRENTES E TENSÕES
///////////////////////////////

i1_plot = [];
i2_plot = [];
i3_plot = [];
if (cond === "cont") {
    var varia_corrente, iL;
    varia_corrente = (entrada_boost * boost.T * boost.D) / boost.Lo;
    iL=((saida_boost*boost.Io)/entrada_boost);
    boost.delta_i = 100*varia_corrente/iL;
    // indutor
    i1_plot = [[0, iL - ((iL * boost.delta_i / 100) / 2)], [boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [2 * boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [2 * boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [3 * boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [3 * boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)]];
    // chave
    i2_plot = [[0, iL - ((iL * boost.delta_i / 100) / 2)], [boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [boost.ton, 0], [boost.T, 0], [boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [boost.T + boost.ton, 0], [2 * boost.T, 0], [2 * boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [2 * boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [2 * boost.T + boost.ton, 0], [3 * boost.T, 0], [3 * boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [3 * boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)]];
    // diodo
    i3_plot = [[0, 0], [boost.ton, 0], [boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [boost.T, 0], [boost.T + boost.ton, 0], [boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [2 * boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [2 * boost.T, 0], [2 * boost.T + boost.ton, 0], [2 * boost.T + boost.ton, iL + ((iL * boost.delta_i / 100) / 2)], [3 * boost.T, iL - ((iL * boost.delta_i / 100) / 2)], [3 * boost.T, 0], [3 * boost.T + boost.ton, 0]];
    // diodo
    t1_plot = [[0, saida], [boost.ton, saida], [boost.ton, 0], [boost.T, 0], [boost.T, saida], [boost.T + boost.ton, saida], [boost.T + boost.ton, 0], [2 * boost.T, 0], [2 * boost.T, saida], [2 * boost.T + boost.ton, saida], [2 * boost.T + boost.ton, 0], [3 * boost.T, 0], [3 * boost.T, saida], [3 * boost.T + boost.ton, saida]];
    // chave
    t2_plot = [[0, 0], [boost.ton, 0], [boost.ton, saida], [boost.T, saida], [boost.T, 0], [boost.T + boost.ton, 0], [boost.T + boost.ton, saida], [2 * boost.T, saida], [2 * boost.T, 0], [2 * boost.T + boost.ton, 0], [2 * boost.T + boost.ton, saida], [3 * boost.T, saida], [3 * boost.T, 0], [3 * boost.T + boost.ton, 0]];
    // indutor
    t3_plot = [[0, entrada_boost], [boost.ton, entrada_boost], [boost.ton, -(saida-entrada_boost)], [boost.T, -(saida-entrada_boost)], [boost.T, entrada_boost], [boost.T + boost.ton, entrada_boost], [boost.T + boost.ton, -(saida-entrada_boost)], [2 * boost.T, -(saida-entrada_boost)], [2 * boost.T, entrada_boost], [2 * boost.T + boost.ton, entrada_boost], [2 * boost.T + boost.ton, -(saida-entrada_boost)], [3 * boost.T, -(saida-entrada_boost)], [3 * boost.T, entrada_boost], [3 * boost.T + boost.ton, entrada_boost]];
} 
else {
    pico = (entrada_boost / boost.Lo) * boost.ton;
    tcorte=boost.T*((entrada_boost+(boost.D-1)*saida)/(entrada_boost-saida))
    tcorte=boost.T-tcorte;
    // indutor
    i1_plot = [[0, 0], [boost.ton, pico], [tcorte, 0], [boost.T, 0], [boost.ton + boost.T, pico], [tcorte + boost.T, 0], [boost.T * 2, 0], [boost.ton + boost.T * 2, pico], [tcorte + boost.T * 2, 0], [boost.T * 3, 0], [boost.ton + boost.T * 3, pico]];
    // chave
    i2_plot = [[0, 0], [boost.ton, pico], [boost.ton, 0], [tcorte, 0], [boost.T, 0], [boost.ton + boost.T, pico], [boost.ton + boost.T, 0], [tcorte + boost.T, 0], [boost.T * 2, 0], [boost.ton + boost.T * 2, pico], [boost.ton + boost.T * 2, 0], [tcorte + boost.T * 2, 0], [boost.T * 3, 0], [boost.ton + boost.T * 3, pico]];
    // diodo
    i3_plot = [[0, 0], [boost.ton, 0], [boost.ton, pico], [tcorte, 0], [boost.T, 0], [boost.ton + boost.T, 0], [boost.ton + boost.T, pico], [tcorte + boost.T, 0], [boost.T * 2, 0], [boost.ton + boost.T * 2, 0], [boost.ton + boost.T * 2, pico], [tcorte + boost.T * 2, 0], [boost.T * 3, 0], [boost.ton + boost.T * 3, 0]];
    // diodo
    t1_plot = [[0, saida], [boost.ton, saida], [boost.ton, 0], [tcorte, 0], [tcorte, saida-entrada_boost], [boost.T, saida-entrada_boost], [boost.T, saida], [boost.ton + boost.T, saida], [boost.ton + boost.T, 0], [tcorte + boost.T, 0], [tcorte + boost.T, saida-entrada_boost], [boost.T * 2, saida-entrada_boost], [boost.T * 2, saida], [boost.ton + boost.T * 2, saida], [boost.ton + boost.T * 2, 0], [tcorte + boost.T * 2, 0], [tcorte + boost.T * 2, saida-entrada_boost], [boost.T * 3, saida-entrada_boost], [boost.T * 3, saida], [boost.ton + boost.T * 3, saida]];
    // chave
    t2_plot = [[0, 0], [boost.ton, 0], [boost.ton, saida], [tcorte, saida], [tcorte, entrada_boost], [boost.T, entrada_boost], [boost.T, 0], [boost.ton + boost.T, 0], [boost.ton + boost.T, saida], [tcorte + boost.T, saida], [tcorte + boost.T, entrada_boost], [boost.T * 2, entrada_boost], [boost.T * 2, 0], [boost.ton + boost.T * 2, 0], [boost.ton + boost.T * 2, saida], [tcorte + boost.T * 2, saida], [tcorte + boost.T * 2, entrada_boost], [boost.T * 3, entrada_boost], [boost.T * 3, 0], [boost.ton + boost.T * 3, 0]];
    // indutor
    t3_plot = [[0, entrada_boost], [boost.ton, entrada_boost], [boost.ton, -(saida-entrada_boost)], [tcorte, -(saida-entrada_boost)], [tcorte, 0], [boost.T, 0], [boost.T, entrada_boost], [boost.ton + boost.T, entrada_boost], [boost.ton + boost.T, -(saida-entrada_boost)], [tcorte + boost.T, -(saida-entrada_boost)], [tcorte + boost.T, 0], [boost.T * 2, 0], [boost.T * 2, entrada_boost], [boost.ton + boost.T * 2, entrada_boost], [boost.ton + boost.T * 2, -(saida-entrada_boost)], [tcorte + boost.T * 2, -(saida-entrada_boost)], [tcorte + boost.T * 2, 0], [boost.T * 3, 0], [boost.T * 3, entrada_boost], [boost.ton + boost.T * 3, entrada_boost]];
}
$.plot($("#corrente_indutor_boost"), [
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

textox('Tempo (s)','#corrente_indutor_boost');
textoy('Corrente (A)','#corrente_indutor_boost');

$.plot($("#tensao_indutor_boost"), [
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

textox('Tempo (s)','#tensao_indutor_boost');
textoy('Tensão (V)','#tensao_indutor_boost');

$.plot($("#corrente_chave_boost"), [
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

textox('Tempo (s)','#corrente_chave_boost');
textoy('Corrente (A)','#corrente_chave_boost');

$.plot($("#corrente_diodo_boost"), [
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

textox('Tempo (s)','#corrente_diodo_boost');
textoy('Corrente (A)','#corrente_diodo_boost');

$.plot($("#tensao_diodo_boost"), [
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

textox('Tempo (s)','#tensao_diodo_boost');
textoy('Tensão (V)','#tensao_diodo_boost');

$.plot($("#tensao_chave_boost"), [
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

textox('Tempo (s)','#tensao_chave_boost');
textoy('Tensão (V)','#tensao_chave_boost');

///////////////////////////////
// DIAGRAMA DE BODE
///////////////////////////////

g_plot = [];
f_plot = [];

if (cond == "cont") {
    Ggo=1/(1-boost.D);
    Gdo=saida_boost/(1-boost.D);
    wo=(1-boost.D)/Math.sqrt(boost.Lo*boost.capacitancia);
    Q=(1-boost.D)*carga_boost*Math.sqrt(boost.capacitancia/boost.Lo);
    wz = ((1-boost.D)*(1-boost.D)*carga_boost)/boost.Lo;
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
$.plot($("#diagrama_bode_boost"), [
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
$.plot($("#diagrama_fase_boost"), [
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

textox('Frequência (Hz)','#diagrama_bode_boost');
textoy('Ganho (V)','#diagrama_bode_boost');

textox('Frequência (Hz)','#diagrama_fase_boost');
textoy('Ângulo (°)','#diagrama_fase_boost');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////

step_plot = [];
t = 0;

if (si > 1) {
    while (t < 5*((3*si)/wo)) {
    step_plot.push([t, entrada_boost * Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
    t+=((5*((3*si)/wo))/100);
}
}
else {
    while (t < 4.6/(si*wo)) {
    step_plot.push([t, entrada_boost * Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
    t+=((5*((3*si)/wo))/100);
}
}

$.plot($("#resposta_degrau_boost"), [
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

textox('Tempo (s)','#resposta_degrau_boost');
textoy('Tensão (V)','#resposta_degrau_boost');

$("#resposta_degrau_boost").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
    if (previousPoint !== item.datapoint) {
        previousPoint = item.datapoint;
        $("#valor_tensao_step_boost").html("Vo (V) =  " + pos.y.toFixed(2));
        $("#valor_tempo_step_boost").html("t (s) = " + pos.x.toFixed(6));
    }
}
});
}

if (carga_manual_boost = "null") {
    carga_manual_boost = carga_boost.toFixed(2);
}
};
