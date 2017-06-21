var grava_cookies, le_cookies;

console.log("CC-CCjs v2");
console.log("BETA 1 - Codnome: Capitão Caverna");
console.log("autor: Laio O. Seman")
console.log("autor: Julio C. Dias")
textox = function(texto,plot) {
    var xaxisLabel = $("<div class='axisLabel xaxisLabel'></div>")
    .text(texto)
    .appendTo($(plot));
}

textoy = function(texto,plot) {
    var yaxisLabel = $("<div class='axisLabel yaxisLabel'></div>")
    .text(texto)
    .appendTo($(plot));
}

le_cookies = function() {
    var boost, buck, buck_boost;
    if (localStorage.getItem("buck") === null) {
        play_buck();
    } else {
        buck = JSON.parse(localStorage['buck']);
        $("#entrada_buck").val(buck.entrada_buck);
        $("#saida_buck").val(buck.saida_buck);
        $("#frequencia_buck").val(buck.frequencia_buck);
        $("#potencia_buck").val(buck.potencia_buck);
        $("#delta_v_buck").val(buck.delta_v_buck);
        $("#delta_i_buck").val(buck.delta_i_buck);
        play_buck();
    }
    if (localStorage.getItem("boost") === null) {
        play_boost();
    } else {
        boost = JSON.parse(localStorage['boost']);
        $("#entrada_boost").val(boost.entrada_boost);
        $("#saida_boost").val(boost.saida_boost);
        $("#frequencia_boost").val(boost.frequencia_boost);
        $("#potencia_boost").val(boost.potencia_boost);
        $("#delta_v_boost").val(boost.delta_v_boost);
        $("#delta_i_boost").val(boost.delta_i_boost);
        play_boost();
    }
    if (localStorage.getItem("buck_boost") === null) {
        play_buck_boost();
    } else {
        buck_boost = JSON.parse(localStorage['buck_boost']);
        $("#entrada_buck_boost").val(buck_boost.entrada_buck_boost);
        $("#saida_buck_boost").val(buck_boost.saida_buck_boost);
        $("#frequencia_buck_boost").val(buck_boost.frequencia_buck_boost);
        $("#potencia_buck_boost").val(buck_boost.potencia_buck_boost);
        $("#delta_v_buck_boost").val(buck_boost.delta_v_buck_boost);
        $("#delta_i_buck_boost").val(buck_boost.delta_i_buck_boost);
        play_buck_boost();
    }
};

grava_cookies = function() {
    var boost, buck, buck_boost;
    buck = [];
    buck = {
        "entrada_buck": $("#entrada_buck").val(),
        "saida_buck": $("#saida_buck").val(),
        "frequencia_buck": $("#frequencia_buck").val(),
        "potencia_buck": $("#potencia_buck").val(),
        "delta_v_buck": $("#delta_v_buck").val(),
        "delta_i_buck": $("#delta_i_buck").val()
    };
    localStorage['buck'] = JSON.stringify(buck);
    boost = [];
    boost = {
        "entrada_boost": $("#entrada_boost").val(),
        "saida_boost": $("#saida_boost").val(),
        "frequencia_boost": $("#frequencia_boost").val(),
        "potencia_boost": $("#potencia_boost").val(),
        "delta_v_boost": $("#delta_v_boost").val(),
        "delta_i_boost": $("#delta_i_boost").val()
    };
    localStorage['boost'] = JSON.stringify(boost);
    buck_boost = [];
    buck_boost = {
        "entrada_buck_boost": $("#entrada_buck_boost").val(),
        "saida_buck_boost": $("#saida_buck_boost").val(),
        "frequencia_buck_boost": $("#frequencia_buck_boost").val(),
        "potencia_buck_boost": $("#potencia_buck_boost").val(),
        "delta_v_buck_boost": $("#delta_v_buck_boost").val(),
        "delta_i_buck_boost": $("#delta_i_buck_boost").val()
    };
    localStorage['buck_boost'] = JSON.stringify(buck_boost);
};
