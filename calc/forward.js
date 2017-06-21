///////////////////////////////
// FORWARD
///////////////////////////////

var carga_forward, carga_manual_forward, contas_forward, handle_check_forward, play_forward, carga_nova;

carga_forward = 0;

carga_manual_forward = "null";

handle_check_forward = function() {
    var estado;
    estado = $("#check_load_forward").is(':checked');
    if (!estado) {
        $("#carga_tag_forward").html("Carga (&Omega;): " + carga_forward.toFixed(2) + " <input id='check_load_forward' type='checkbox' onclick='handle_check_forward()'>");
    } else {
        $("#carga_tag_forward").html("Carga (&Omega;): <input type='text' style='width: 50px;' value='" + carga_manual_forward + "' id='carga_manual_forward' onkeydown='if (event.keyCode == 13) play_forward()'> <input id='check_load_forward' type='checkbox' checked='true' onclick='handle_check_forward()'>");
    }
};

contas_forward = function(entrada_forward, saida_forward, frequencia_forward, potencia_forward, delta_i, delta_v) {
    this.q = saida_forward / entrada_forward_;
    this.D = saida_forward / entrada_forward;
    this.T = 1 / (frequencia_forward * 1000);
    this.ton = this.T * this.D;
    this.Io = potencia_forward / saida_forward;
    this.Lo = (entrada_forward_*trafo-saida_forward)*this.ton/((delta_i / 100) * this.Io);
    this.delta_i = delta_i;
    this.capacitancia = entrada_forward / (31 * this.Lo * frequencia_forward * 1000 * frequencia_forward * 1000 * delta_v / 100 * saida_forward);
    this.Lcri = (entrada_forward_*trafo-saida_forward)*this.ton/(2*this.Io);
    this.Ilmed = ((entrada_forward - saida_forward) * this.q) / frequencia_forward * 1000 * 2 * this.Lo;
    this.critico = trafo*(-this.D * this.D + this.D)/2;
    this.Iocrit = (delta_i / 100) * this.Io/2;
    carga_forward = saida_forward * saida_forward / potencia_forward;
};

play_forward = function() {
    var i3_plot, si, t, step_plot, j, Ggo, Gdo, wo, Q, funcao, D, forward, carga_ponto, cond, d1_plot, d2_plot, d3_plot, data, delta_i, delta_v, denominador, entrada_forward, f_plot, fase, frequencia_forward, g_plot, ganho_ponto, i1_plot, i2_plot, imaginaria, k, options, pico, plot, ponto, potencia_forward, real, saida, saida_forward, tcorte, tensao_saida_forward, v_carga;

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

//ganho_ponto = parseFloat($("#ganho_forward").text())
//k_ponto = parseFloat($("#k_forward").text())

entrada_forward = parseFloat($("#entrada_forward").val()) * parseFloat($("#trafo_forward").val());
entrada_forward_ = parseFloat($("#entrada_forward").val());

trafo = parseFloat($("#trafo_forward").val());
trafo_desmag = parseFloat($("#trafo_forward_desmag").val());

lm_forward = parseFloat($("#lm_forward").val())/1000;
console.log(lm_forward)

saida_forward = parseFloat($("#saida_forward").val());
frequencia_forward = parseFloat($("#frequencia_forward").val());
potencia_forward = parseFloat($("#potencia_forward").val());
delta_v = parseFloat($("#delta_v_forward").val());
delta_i = parseFloat($("#delta_i_forward").val());

if(saida_forward>entrada_forward) {
    alert('Saída deve ser menor!')
    return false;
}

///////////////////////////////
// MODO DE CONDUÇÃO
///////////////////////////////

forward = new contas_forward(entrada_forward, saida_forward, frequencia_forward, potencia_forward, delta_i, delta_v);
//  k = (forward.Io * forward.Lo) / (entrada_forward * forward.T);
if ($("#check_load_forward").is(':checked')) {
    carga_forward = parseFloat($("#carga_manual_forward").val());
    forward.Io = saida_forward / carga_forward;
    carga_manual_forward = carga_forward;
//    k = (forward.Io * forward.Lo) / (entrada_forward * forward.T);
}
//if (k_ponto !== k_ponto) {
k = (forward.Io * forward.Lo) / (entrada_forward_ * forward.T);
//}
//else {
//    k = k_ponto;
//}

//D = forward.q;

///////////////////////////////
// CONTÍNUO
///////////////////////////////

if (k > forward.critico) {
    $("#modo_conducao_forward").html("<pre>CONDUÇÃO CONTÍNUA*</pre>");
    $('li.podenao_forward').show()
    cond = "cont";
    $("#potencia_atual_forward").hide();
    $("#tensao_atual_forward").html("<br>");
    $("#potencia_atual_forward").hide();
    saida = saida_forward;
    if ($("#check_load_forward").is(':checked')) {
        $("#potencia_atual_forward").show();
        $("#potencia_atual_forward").html("Po* (W): " + (saida * forward.Io).toFixed(2));
    }
} 

///////////////////////////////
// CRÍTICO
///////////////////////////////

else if (forward.critico === k) {
    $("#modo_conducao_forward").html("<pre>CONDUÇÃO CRÍTICA*</pre>");
    cond = "crit";
    k = ((forward.q * forward.q) / 2) * ((1 / forward.q) - 1);
    saida = saida_forward;
    $("#potencia_atual_forward").show();
    $("#potencia_atual_forward").html("Po* (W): " + (saida * forward.Io).toFixed(2));
}

///////////////////////////////
// DESCONTÍNUO
///////////////////////////////

else {
    $("#modo_conducao_forward").html("<pre>CONDUÇÃO DESCONTÍNUA*</pre>");
    $('li.podenao_forward').hide()
    cond = "desc";
    ganho_ponto = 0;
    i=0;
    while (i < forward.critico) {
        ganho = (trafo*forward.D*forward.D)/(forward.D*forward.D+(2*i/trafo));
        carga_nova=((forward.Lo * ganho) / (i * forward.T)).toFixed(1);
        var diff = Math.abs( carga_nova - carga_forward );
        if( diff < 1 ) {
            ganho_ponto=ganho;
            k = i;
            break;
        }
        i += 0.00005;
    }
    saida = parseFloat((ganho_ponto * entrada_forward_).toFixed(1));
    forward.Io = saida / carga_forward;

  $("#tensao_atual_forward").html("Vo* (V): " + saida);
  $("#potencia_atual_forward").show();
  $("#potencia_atual_forward").html("Po* (W): " + (saida * forward.Io).toFixed(2));
}

///////////////////////////////
// PLOT PRO HTML
///////////////////////////////

$("#capacitancia_tag_forward").html("Capacitância (uF): " + (forward.capacitancia * 1000000).toFixed(2));
$("#ganho_tag_forward").html("Ganho Estático: " + (saida / entrada_forward_).toFixed(2));
$("#duty_tag_forward").html("Razão Cíclica: " + forward.D.toFixed(2));
$("#indutancia_critica_forward").html("Indut. Crítica (uH): " + (forward.Lcri * 1000000).toFixed(2));
$("#io_param_forward").html("k (param.): " + k.toFixed(2));
$("#io_critica_forward").html("I<sub>o</sub> crítica (A): " + forward.Iocrit.toFixed(3));
$("#io_forward").html("I<sub>o</sub> (A): " + forward.Io.toFixed(2));
$("#indutancia_tag_forward").html("Indutância (uH): " + (forward.Lo * 1000000).toFixed(2));
handle_check_forward();

///////////////////////////////
// PLOT DA TENSÃO NA CARGA
///////////////////////////////

v_carga = [];
i = 0;
while (i < (5 * forward.T)) {
    v_carga.push([i, saida + ((delta_v / 100) / 2) * saida * Math.sin(2 * Math.PI * frequencia_forward * 1000 * i)]);
    i += 0.0000001;
}
data = [
{
    label: "Tensão Carga",
    data: v_carga
}
];
tensao_saida_forward = $("#tensao_saida_forward");
options = {
    xaxis: {
        ticks: 4,
        zoomRange: [0.0001, 5 * forward.T],
        panRange: [0, 5 * forward.T]
    },
    yaxis: {
        zoomRange: [1.1 * saida_forward / 100 * delta_v, 1.3 * saida],
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

plot = $.plot(tensao_saida_forward, data, options);

textox('Tempo (s)','#tensao_saida_forward');
textoy('Tensão (V)','#tensao_saida_forward');

///////////////////////////////
// PLOT DA OPERAÇÃO
///////////////////////////////

d1_plot = [];
d2_plot = [];
d3_plot = [];
i = 0;
while (i < trafo*0.126){
    d1_plot.push([i,  trafo*(1 + Math.sqrt(1 - (8 * i / trafo))) / 2]);
    i += 0.00005;
}
i = 0;
while (i < trafo*0.126){
    d1_plot.push([i,  trafo*(1 - Math.sqrt(1 - (8 * i / trafo))) / 2]);
    i += 0.00005;
}
i = 0;
while (i < forward.critico) {
    d2_plot.push([i, (trafo*forward.D*forward.D)/(forward.D*forward.D+(2*i/trafo))]);
    i += 0.0005;
}
i = forward.critico;
while (i < 0.6) {
    d2_plot.push([i, forward.q]);
    i += 0.0005;
}
if (k > 0.5) {
    k = 0.5;
}

if (cond === "cont") {
    d3_plot = [[k, forward.q - 0.02], [k, forward.q + 0.02]];
}
else {
    d3_plot = [[k, ganho_ponto - 0.02], [k, ganho_ponto + 0.02]];
}

$.plot($("#grafico_operacao_forward"), [
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
$("#grafico_operacao_forward").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item && (item.series.label === "Curva Operação")) {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            if (pos.x > 0 && pos.x < 1 && pos.y > 0 && pos.y < trafo) {
                $("#valor_k_forward").html("k = " + pos.x.toFixed(2));
                if (pos.x > forward.critico) {
                    $("#valor_ganho_forward").html("Ganho Estático = " + forward.q.toFixed(2));
                    $("#continha_forward").html("CONTÍNUO");
                    $("#valor_vo_forward").html("Vo (V) = " + (entrada_forward * forward.q).toFixed(2));
                    carga_nova=((forward.Lo * item.datapoint[1]) / (item.datapoint[0] * forward.T)).toFixed(2);
                    $("#valor_novo_carga_forward").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_forward").html("Io (A) = " + ((item.datapoint[1] * entrada_forward_) / carga_nova).toFixed(2));
                } else {
                    $("#valor_ganho_forward").html("Ganho Estático = " + item.datapoint[1].toFixed(2));
                    $("#continha_forward").html("DESCONTÍNUO");
                    $("#valor_vo_forward").html("Vo (V) = " + (pos.y * entrada_forward_).toFixed(2));
                    carga_nova=((forward.Lo * item.datapoint[1]) / (item.datapoint[0] * forward.T)).toFixed(2);
                    $("#valor_novo_carga_forward").html("Carga (&Omega;) = " + carga_nova);
                    $("#valor_io_novo_forward").html("Io (A) = " + ((item.datapoint[1] * entrada_forward_) / carga_nova).toFixed(2));
                }
            }
        }
    }
});

$("#grafico_operacao_forward").bind("plotclick", function (event, pos, item) {
//    carga_nova = Math.round(carga_nova);

//if (item && (item.series.label === "Curva Operação")) {
//    $("#ganho_forward").html((pos.y));
///    $("#k_forward").html((pos.x));

    if ($("#check_load_forward").is(':checked')) {
        $("#carga_manual_forward").val(carga_nova);
    } else {
        $("#check_load_forward").prop('checked', true);
        handle_check_forward();
        $("#carga_manual_forward").val(carga_nova);
    }



});

textox('Corrente Parametrizada','#grafico_operacao_forward');
textoy('Ganho','#grafico_operacao_forward');

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
    varia_corrente = ((entrada_forward - saida) / forward.Lo) * forward.ton/2;
    varia_corrente_ = ((entrada_forward - saida) / forward.Lo) * forward.ton*trafo;
    
    iLm=(entrada_forward_*forward.D*forward.T)/lm_forward
    console.log(iLm)

        // indutor
        i1_plot = [[0, forward.Io - varia_corrente], [forward.ton, forward.Io + varia_corrente],
        [forward.T, forward.Io - varia_corrente], [forward.T + forward.ton, forward.Io + varia_corrente],
        [2 * forward.T, forward.Io - varia_corrente], [2 * forward.T + forward.ton, forward.Io + varia_corrente],
        [3 * forward.T, forward.Io - varia_corrente], [3 * forward.T + forward.ton, forward.Io + varia_corrente]];
        // chave
        i2_plot = [[0, forward.Io*trafo - varia_corrente_], [forward.ton, forward.Io*trafo + varia_corrente_], [forward.ton, 0],
        [forward.T, 0], [forward.T, forward.Io*trafo - varia_corrente_], [forward.T + forward.ton, forward.Io*trafo + varia_corrente_], [forward.T + forward.ton, 0],
        [2 * forward.T, 0], [2 * forward.T, forward.Io*trafo - varia_corrente_], [2 * forward.T + forward.ton, forward.Io*trafo + varia_corrente_], [2 * forward.T + forward.ton, 0],
        [3 * forward.T, 0], [3 * forward.T, forward.Io*trafo - varia_corrente_], [3 * forward.T + forward.ton, forward.Io*trafo + varia_corrente_]];
        // diodo
        i3_plot = [[0, forward.Io - varia_corrente], [forward.ton, forward.Io + varia_corrente], [forward.ton, 0],
        [forward.T, 0], [forward.T, forward.Io - varia_corrente], [forward.T + forward.ton, forward.Io + varia_corrente], [forward.T + forward.ton, 0],
        [2*forward.T, 0], [2*forward.T, forward.Io - varia_corrente], [2*forward.T + forward.ton, forward.Io + varia_corrente], [2*forward.T + forward.ton, 0],
        [3*forward.T, 0], [3*forward.T, forward.Io - varia_corrente], [3*forward.T + forward.ton, forward.Io + varia_corrente]];

        i3_plot_ = [[0, 0], [forward.ton, 0], [forward.ton, forward.Io + varia_corrente], [forward.T, forward.Io - varia_corrente],
        [forward.T, 0], [forward.T + forward.ton, 0], [forward.T + forward.ton, forward.Io + varia_corrente], [2 * forward.T, forward.Io - varia_corrente],
        [2 * forward.T, 0], [2* forward.T+ forward.ton, 0], [2 * forward.T + forward.ton, forward.Io + varia_corrente],
        [3 * forward.T, forward.Io - varia_corrente], [3 * forward.T, 0], [3 * forward.T + forward.ton, 0]];

        i3_plot__ = [[0, 0], [forward.ton, 0], [forward.ton, iLm], [forward.T*forward.D*trafo_desmag, 0],
        [forward.T + forward.ton, 0], [forward.T + forward.ton, iLm], [forward.T + forward.T*forward.D*trafo_desmag, 0], [forward.T + forward.ton + forward.T*forward.D*trafo_desmag, 0],
        [2*forward.T + forward.ton, 0], [2*forward.T + forward.ton, iLm], [2*forward.T+ forward.T*forward.D*trafo_desmag, 0], [2*forward.T + forward.ton + forward.T*forward.D*trafo_desmag, 0]];

        // diodo
        t1_plot = [[0, 0], [forward.ton, 0], [forward.ton, entrada_forward/trafo_desmag], [forward.T*forward.D*trafo_desmag, entrada_forward/trafo_desmag], [forward.T*forward.D*trafo_desmag, 0],
        [forward.T+forward.ton, 0], [forward.T+forward.ton, entrada_forward/trafo_desmag], [forward.T+forward.T*forward.D*trafo_desmag, entrada_forward/trafo_desmag], [forward.T+forward.T*forward.D*trafo_desmag, 0],
        [2*forward.T+forward.ton, 0], [2*forward.T+forward.ton, entrada_forward/trafo_desmag], [2*forward.T+forward.T*forward.D*trafo_desmag, entrada_forward/trafo_desmag], [2*forward.T+forward.T*forward.D*trafo_desmag, 0],
        [3*forward.T+forward.ton, 0]];

        t1_plot_ = [[0, entrada_forward], [forward.ton, entrada_forward], [forward.ton, 0],
        [forward.T, 0], [forward.T, entrada_forward], [forward.T + forward.ton, entrada_forward], [forward.T + forward.ton, 0],
        [2 * forward.T, 0], [2 * forward.T, entrada_forward], [2 * forward.T + forward.ton, entrada_forward], [2 * forward.T + forward.ton, 0],
        [3 * forward.T, 0], [3 * forward.T, entrada_forward], [3 * forward.T + forward.ton, entrada_forward]];

        t1_plot__ = [[0, entrada_forward_+entrada_forward_*trafo_desmag], [forward.ton, entrada_forward_+entrada_forward_*trafo_desmag], [forward.ton, 0], [forward.T*forward.D*trafo_desmag, 0], [forward.T*forward.D*trafo_desmag, entrada_forward],
        [forward.T, entrada_forward], [forward.T, entrada_forward_+entrada_forward_*trafo_desmag], [forward.T + forward.ton, entrada_forward_+entrada_forward_*trafo_desmag], [forward.T + forward.ton, 0], [forward.T + forward.T*forward.D*trafo_desmag, 0], [forward.T + forward.T*forward.D*trafo_desmag, entrada_forward], 
        [2 * forward.T, entrada_forward], [2 * forward.T, entrada_forward_+entrada_forward_*trafo_desmag], [2 * forward.T + forward.ton, entrada_forward_+entrada_forward_*trafo_desmag], [2 * forward.T + forward.ton, 0],
        [2 * forward.T + forward.T*forward.D*trafo_desmag, 0], [2 * forward.T + forward.T*forward.D*trafo_desmag, entrada_forward], [3 * forward.T, entrada_forward],
        [3 * forward.T, entrada_forward_+entrada_forward_*trafo_desmag], [3 * forward.T + forward.ton, entrada_forward_+entrada_forward_*trafo_desmag]];

        // chave
        t2_plot = [[0, 0], [forward.ton, 0], [forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], [forward.ton+forward.T*forward.D*trafo_desmag, entrada_forward_+entrada_forward_/trafo_desmag], [forward.ton+forward.T*forward.D*trafo_desmag, entrada_forward_],
        [forward.T, entrada_forward_], [forward.T, 0], [forward.T + forward.ton, 0], [forward.T + forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], [forward.T + forward.T*forward.D*trafo_desmag + forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], [forward.T + forward.ton +forward.T*forward.D*trafo_desmag, entrada_forward_],
        [2 * forward.T, entrada_forward_], [2 * forward.T, 0], [2 * forward.T + forward.ton, 0], [2 * forward.T + forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], 
        [2 * forward.T + forward.ton + forward.T*forward.D*trafo_desmag, entrada_forward_+entrada_forward_/trafo_desmag], [2 * forward.T + forward.ton + forward.T*forward.D*trafo_desmag, entrada_forward_],
        [3 * forward.T, entrada_forward_], [3 * forward.T, 0], [3 * forward.T + forward.ton, 0]];
        // indutor
        t3_plot = [[0, entrada_forward-saida], [forward.ton, entrada_forward-saida], [forward.ton, -saida],
        [forward.T, -saida], [forward.T, entrada_forward-saida], [forward.T + forward.ton, entrada_forward-saida], [forward.T + forward.ton, -saida],
        [2 * forward.T, -saida], [2 * forward.T, entrada_forward-saida], [2 * forward.T + forward.ton, entrada_forward-saida], [2 * forward.T + forward.ton, -saida],
        [3 * forward.T, -saida], [3 * forward.T, entrada_forward-saida], [3 * forward.T + forward.ton, entrada_forward-saida]];
    } 
    else {
        pico = ((entrada_forward - saida) / forward.Lo) * forward.ton;
        tcorte = forward.ton + (entrada_forward - saida)*forward.ton/saida;
        
        // indutor    
        i1_plot = [[0, 0], [forward.ton, pico], [tcorte, 0], [forward.T, 0], [forward.ton + forward.T, pico], [tcorte + forward.T, 0], [forward.T * 2, 0], [forward.ton + forward.T * 2, pico], [tcorte + forward.T * 2, 0], [forward.T * 3, 0], [forward.ton + forward.T * 3, pico]];
        // chave
        i2_plot = [[0, 0], [forward.ton, pico], [forward.ton, 0], [tcorte, 0], [forward.T, 0], [forward.ton + forward.T, pico], [forward.ton + forward.T, 0], [tcorte + forward.T, 0], [forward.T * 2, 0], [forward.ton + forward.T * 2, pico], [forward.ton + forward.T * 2, 0], [tcorte + forward.T * 2, 0], [forward.T * 3, 0], [forward.ton + forward.T * 3, pico]];
        // diodo
        i3_plot = [[0, 0], [forward.ton, 0], [forward.ton, pico], [tcorte, 0], [forward.T, 0], [forward.ton + forward.T, 0], [forward.ton + forward.T, pico], [tcorte + forward.T, 0], [forward.T * 2, 0], [forward.ton + forward.T * 2, 0], [forward.ton + forward.T * 2, pico], [tcorte + forward.T * 2, 0], [forward.T * 3, 0], [forward.ton + forward.T * 3, 0]];
        // diodo
        t1_plot = [[0, entrada_forward], [forward.ton, entrada_forward], [forward.ton, 0], [tcorte, 0], [tcorte, saida], [forward.T, saida], [forward.T, entrada_forward], [forward.ton + forward.T, entrada_forward], [forward.ton + forward.T, 0], [tcorte + forward.T, 0], [tcorte + forward.T, saida], [forward.T * 2, saida], [forward.T * 2, entrada_forward], [forward.ton + forward.T * 2, entrada_forward], [forward.ton + forward.T * 2, 0], [tcorte + forward.T * 2, 0], [tcorte + forward.T * 2, saida], [forward.T * 3, saida], [forward.T * 3, entrada_forward], [forward.ton + forward.T * 3, entrada_forward]];
        // chave
        t2_plot = [[0, 0], [forward.ton, 0], [forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], [forward.ton+forward.T*forward.D*trafo_desmag, entrada_forward_+entrada_forward_/trafo_desmag], [forward.ton+forward.T*forward.D*trafo_desmag, entrada_forward_],
        [forward.T, entrada_forward_], [forward.T, 0], [forward.T + forward.ton, 0], [forward.T + forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], [forward.T + forward.T*forward.D*trafo_desmag + forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], [forward.T + forward.ton +forward.T*forward.D*trafo_desmag, entrada_forward_],
        [2 * forward.T, entrada_forward_], [2 * forward.T, 0], [2 * forward.T + forward.ton, 0], [2 * forward.T + forward.ton, entrada_forward_+entrada_forward_/trafo_desmag], 
        [2 * forward.T + forward.ton + forward.T*forward.D*trafo_desmag, entrada_forward_+entrada_forward_/trafo_desmag],
        [2 * forward.T + forward.ton + forward.T*forward.D*trafo_desmag, entrada_forward_], [3 * forward.T, entrada_forward_], [3 * forward.T, 0], [3 * forward.T + forward.ton, 0]];

        // indutor
        t3_plot = [[0, entrada_forward-saida], [forward.ton, entrada_forward-saida], [forward.ton, -saida], [tcorte, -saida], [tcorte, 0], [forward.T, 0], [forward.T, entrada_forward-saida], [forward.ton + forward.T, entrada_forward-saida], [forward.ton + forward.T, -saida], [tcorte + forward.T, -saida], [tcorte + forward.T, 0], [forward.T * 2, 0], [forward.T * 2, entrada_forward-saida], [forward.ton + forward.T * 2, entrada_forward-saida], [forward.ton + forward.T * 2, -saida], [tcorte + forward.T * 2, -saida], [tcorte + forward.T * 2, 0], [forward.T * 3, 0], [forward.T * 3, entrada_forward-saida], [forward.ton + forward.T * 3, entrada_forward-saida]];
    }
    $.plot($("#corrente_indutor_forward"), [
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

    textox('Tempo (s)','#corrente_indutor_forward');
    textoy('Corrente (A)','#corrente_indutor_forward');

    $.plot($("#tensao_indutor_forward"), [
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

    textox('Tempo (s)','#tensao_indutor_forward');
    textoy('Tensão (V)','#tensao_indutor_forward');

    var datasetsDiodosA = {
        "Diodo1Aforward": {
            color: 6,
            label: "Corrente Diodo 1",
            data: i3_plot
        }, "Diodo2Aforward":
        {
            color: 12,
            label: "Corrente Diodo 2",
            data: i3_plot_
        }, "Diodo3Aforward":
        {
            color: 13,
            label: "Corrente Diodo 3",
            data: i3_plot__
        }
    };
    var choiceContainerDiodosA = $("#choicesDiodosA_forward");
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
            $.plot("#corrente_diodo_forward", data, {
                yaxis: {
                    min: 0
                }
            });
            textox('Tempo (s)','#corrente_diodo_forward');
            textoy('Corrente (A)','#corrente_diodo_forward');
        }
    }

    plotAccordingToChoicesDiodosA();

    var datasetsDiodosV = {
        "Diodo1Vforward": {
            color: 6,
            label: "Tensão Diodo 1",
            data: t1_plot
        }, "Diodo2Vforward":
        {
            color: 12,
            label: "Tensão Diodo 2",
            data: t1_plot_
        }, "Diodo3Vforward":
        {
            color: 13,
            label: "Tensão Diodo 3",
            data: t1_plot__
        }
    };
    var choiceContainerDiodosV = $("#choicesDiodosV_forward");
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
            $.plot("#tensao_diodo_forward", data, {
                yaxis: {
                    min: 0
                }
            });
            textox('Tempo (s)','#tensao_diodo_forward');
            textoy('Tensão (V)','#tensao_diodo_forward');
        }
    }

    plotAccordingToChoicesDiodosV();

    $.plot($("#corrente_chave_forward"), [
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

    $.plot($("#tensao_chave_forward"), [
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
    Ggo=saida_forward / entrada_forward;
    Gdo=saida_forward/forward.D;
    wo=1/Math.sqrt(forward.Lo*forward.capacitancia);
    Q=carga_forward*Math.sqrt(forward.capacitancia/forward.Lo);
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
    $.plot($("#diagrama_bode_forward"), [
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
    $.plot($("#diagrama_fase_forward"), [
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

    textox('Frequência (Hz)','#diagrama_bode_forward');
    textoy('Ganho (V)','#diagrama_bode_forward');

    textox('Frequência (Hz)','#diagrama_fase_forward');
    textoy('Ângulo (°)','#diagrama_fase_forward');

///////////////////////////////
// RESPOSTA AO DEGRAU
///////////////////////////////
step_plot = [];

t=0;
if (si > 1) {
    while (t < 5*((3*si)/wo)) {
        step_plot.push([t, entrada_forward * Ggo * ( 1 + ((-si-Math.sqrt(si*si-1)) * Math.exp(-wo*(si-Math.sqrt(si*si-1))*t) - (-si+Math.sqrt(si*si-1)) * Math.exp(-wo*(si+Math.sqrt(si*si-1))*t))/(2*Math.sqrt(si*si-1))) ]);
        t+=((5*((3*si)/wo))/100);
    }
}
else {
    while (t < 4.6/(si*wo)) {
        step_plot.push([t, entrada_forward * Ggo * ( 1 - (1/(Math.sqrt(1-si*si))) * Math.exp(-si*wo*t) * Math.sin(wo*Math.sqrt(1-si*si)*t+Math.acos(si))) ] );
        t+=((5*((3*si)/wo))/100);
    }
}

$.plot($("#resposta_degrau_forward"), [
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

textox('Tempo (s)','#resposta_degrau_forward');
textoy('Tensão (V)','#resposta_degrau_forward');

$("#resposta_degrau_forward").bind("plothover", function(event, pos, item) {
    var previousPoint;
    if (item.series.label === "Resposta ao Degrau") {
        if (previousPoint !== item.datapoint) {
            previousPoint = item.datapoint;
            $("#valor_tensao_step_forward").html("Vo (V) =  " + pos.y.toFixed(2));
            $("#valor_tempo_step_forward").html("t (s) = " + pos.x.toFixed(6));
        }
    }
});
}

if (carga_manual_forward = "null") {
    carga_manual_forward = carga_forward.toFixed(2);
}

};