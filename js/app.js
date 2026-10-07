const URL_CARROS = "http://localhost:8080";
const URL_USUARIOS = "http://localhost:8081";

let usuarioSelecionado = null;


// ================================
// USUÁRIOS
// ================================

async function carregarUsuarios() {

    try {

        const resposta = await fetch(
            `${URL_USUARIOS}/usuario/listar`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar usuários.");
        }

        const usuarios = await resposta.json();

        const select = document.getElementById("usuario");

        select.innerHTML =
            '<option value="">Selecione um usuário</option>';

        usuarios.forEach(usuario => {

            const option = document.createElement("option");

            option.value = usuario.id;

            option.textContent =
                `${usuario.nome} - ${usuario.papel}`;

            select.appendChild(option);
        });

    } catch (erro) {

        console.error(erro);

        alert("Não foi possível carregar os usuários.");
    }
}


// ================================
// SELECIONAR USUÁRIO
// ================================

document
    .getElementById("usuario")
    .addEventListener("change", function () {

        const id = this.value;

        if (!id) {

            usuarioSelecionado = null;

            document.getElementById(
                "usuarioSelecionado"
            ).textContent = "";

            return;
        }

        const texto =
            this.options[this.selectedIndex].textContent;

        usuarioSelecionado = Number(id);

        document.getElementById(
            "usuarioSelecionado"
        ).textContent =
            `Usuário selecionado: ${texto}`;

        listarCarros();
    });


// ================================
// CARROS
// ================================

async function listarCarros() {

    if (!usuarioSelecionado) {

        document.getElementById(
            "listaCarros"
        ).innerHTML =
            "<p>Selecione um usuário primeiro.</p>";

        return;
    }

    try {

        const resposta = await fetch(
            `${URL_CARROS}/carro/listarCarros?usuarioId=${usuarioSelecionado}`
        );

        if (!resposta.ok) {

            const mensagem = await resposta.text();

            throw new Error(mensagem);
        }

        const carros = await resposta.json();

        const div =
            document.getElementById("listaCarros");

        div.innerHTML = "";

        if (carros.length === 0) {

            div.innerHTML =
                "<p>Nenhum carro cadastrado.</p>";

            return;
        }

        carros.forEach(carro => {

            const item =
                document.createElement("div");

            item.className = "carro";

            item.innerHTML = `
                <h3>${carro.modelo}</h3>

                <p>
                    Ano: ${carro.ano}
                </p>

                <p>
                    Preço: R$ ${carro.preco.toFixed(2)}
                </p>

                <button onclick="editarCarro(
                    ${carro.id},
                    '${carro.modelo}',
                    ${carro.ano},
                    ${carro.preco}
                )">
                    Editar
                </button>

                <button onclick="deletarCarro(${carro.id})">
                    Excluir
                </button>
            `;

            div.appendChild(item);
        });

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao listar carros: " +
            erro.message
        );
    }
}


// ================================
// SALVAR / ATUALIZAR
// ================================

async function salvarCarro() {

    if (!usuarioSelecionado) {

        alert("Selecione um usuário.");

        return;
    }

    const id =
        document.getElementById("carroId").value;

    const modelo =
        document.getElementById("modelo").value;

    const ano =
        Number(document.getElementById("ano").value);

    const preco =
        Number(document.getElementById("preco").value);

    const dados = {

        modelo: modelo,

        ano: ano,

        preco: preco,

        usuarioId: usuarioSelecionado
    };

    try {

        let resposta;

        if (id) {

            resposta = await fetch(
                `${URL_CARROS}/carro/${id}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dados)
                }
            );

        } else {

            resposta = await fetch(
                `${URL_CARROS}/carro/salvar`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(dados)
                }
            );
        }

        if (!resposta.ok) {

            const mensagem =
                await resposta.text();

            throw new Error(mensagem);
        }

        alert(
            id
                ? "Carro atualizado com sucesso!"
                : "Carro cadastrado com sucesso!"
        );

        limparFormulario();

        listarCarros();

        listarLogs();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro: " +
            erro.message
        );
    }
}


// ================================
// EDITAR
// ================================

function editarCarro(
    id,
    modelo,
    ano,
    preco
) {

    document.getElementById(
        "carroId"
    ).value = id;

    document.getElementById(
        "modelo"
    ).value = modelo;

    document.getElementById(
        "ano"
    ).value = ano;

    document.getElementById(
        "preco"
    ).value = preco;
}


// ================================
// EXCLUIR
// ================================

async function deletarCarro(id) {

    if (!usuarioSelecionado) {

        alert("Selecione um usuário.");

        return;
    }

    const confirmar =
        confirm(
            "Deseja realmente excluir este carro?"
        );

    if (!confirmar) {
        return;
    }

    try {

        const resposta = await fetch(
            `${URL_CARROS}/carro/${id}?usuarioId=${usuarioSelecionado}`,
            {
                method: "DELETE"
            }
        );

        if (!resposta.ok) {

            const mensagem =
                await resposta.text();

            throw new Error(mensagem);
        }

        alert(
            "Carro excluído com sucesso!"
        );

        listarCarros();

        listarLogs();

    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao excluir: " +
            erro.message
        );
    }
}


// ================================
// LIMPAR FORMULÁRIO
// ================================

function limparFormulario() {

    document.getElementById(
        "carroId"
    ).value = "";

    document.getElementById(
        "modelo"
    ).value = "";

    document.getElementById(
        "ano"
    ).value = "";

    document.getElementById(
        "preco"
    ).value = "";
}


// ================================
// LOGS
// ================================

async function listarLogs() {

    try {

        const resposta = await fetch(
            `${URL_CARROS}/logs`
        );

        if (!resposta.ok) {
            throw new Error("Erro ao buscar logs.");
        }

        const logs = await resposta.json();

        const div =
            document.getElementById("listaLogs");

        div.innerHTML = "";

        logs.forEach(log => {

            const item =
                document.createElement("div");

            item.className = "log";

            item.innerHTML = `
                <p>
                    <strong>ID:</strong>
                    ${log.id}
                </p>

                <p>
                    <strong>Usuário:</strong>
                    ${log.usuarioId} -
                    ${log.nome}
                </p>

                <p>
                    <strong>Timestamp:</strong>
                    ${log.timestamp}
                </p>

                <p>
                    <strong>Data:</strong>
                    ${log.data}
                </p>

                <p>
                    <strong>Ação:</strong>
                    ${log.acao}
                </p>

                <hr>
            `;

            div.appendChild(item);
        });

    } catch (erro) {

        console.error(erro);

        document.getElementById(
            "listaLogs"
        ).innerHTML =
            "<p>Não foi possível carregar os logs.</p>";
    }
}


// ================================
// INICIALIZAÇÃO
// ================================

carregarUsuarios();