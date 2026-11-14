document.addEventListener("DOMContentLoaded", () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animar-scroll').forEach(secao => {
        observer.observe(secao);
    });

    const btnTema = document.querySelector("#tema");
    if (btnTema) {
        btnTema.addEventListener("click", () => {
            const ehEscuro = document.body.classList.toggle("escuro");
            btnTema.setAttribute("aria-pressed", String(ehEscuro));
            
            const icone = btnTema.querySelector('i');
            if(ehEscuro) {
                icone.classList.replace('ph-moon', 'ph-sun');
            } else {
                icone.classList.replace('ph-sun', 'ph-moon');
            }
        });
    }

    const fraseDigitada = document.querySelector(".maquina-escrever p");
    if (fraseDigitada) {
        const textoOriginal = fraseDigitada.textContent.trim();
        const telaPequena = window.matchMedia("(max-width: 768px)");
        let timerDigitacao;

        function iniciarDigitacao() {
            clearInterval(timerDigitacao);

            if (!telaPequena.matches) {
                fraseDigitada.textContent = textoOriginal;
                return;
            }

            fraseDigitada.innerHTML = '<span class="digitado"></span><span class="restante"></span>';
            const digitado = fraseDigitada.querySelector(".digitado");
            const restante = fraseDigitada.querySelector(".restante");
            restante.textContent = textoOriginal;

            let i = 0;
            timerDigitacao = setInterval(() => {
                i++;
                digitado.textContent = textoOriginal.slice(0, i);
                restante.textContent = textoOriginal.slice(i);
                if (i >= textoOriginal.length) clearInterval(timerDigitacao);
            }, 50);
        }

        iniciarDigitacao();
        telaPequena.addEventListener("change", iniciarDigitacao);
    }

    const filtroProjetos = document.querySelector("#filtro");
    const listaProjetos = document.querySelector("#lista-projetos");
    const contadorProjetos = document.querySelector("#contador");

    function aplicarFiltro() {
        if (!listaProjetos || !filtroProjetos) return;
        const valorFiltro = filtroProjetos.value.toLowerCase();
        const cards = listaProjetos.querySelectorAll(".projeto");
        let visiveis = 0;

        cards.forEach((card) => {
            const categoriaCard = (card.dataset.categoria || "").toLowerCase();
            if (valorFiltro === "todos" || categoriaCard === valorFiltro) {
                card.classList.remove("oculto");
                visiveis++;
            } else {
                card.classList.add("oculto");
            }
        });

        if (contadorProjetos) {
            contadorProjetos.textContent = visiveis === 0
                ? "Nenhum projeto encontrado nesta categoria."
                : `Exibindo ${visiveis} projeto(s).`;
        }
    }

    if (filtroProjetos) {
        filtroProjetos.addEventListener("change", aplicarFiltro);
        aplicarFiltro();
    }

    const formContato = document.querySelector("#form-contato");
    if (!formContato) return;

    const campoNome = document.querySelector("#contato-nome");
    const campoEmail = document.querySelector("#contato-email");
    const campoMotivo = document.querySelector("#contato-motivo");
    const containerAssunto = document.querySelector("#container-assunto");
    const campoAssunto = document.querySelector("#contato-assunto");
    const campoMensagem = document.querySelector("#contato-mensagem");
    const contadorNome = document.querySelector("#contador-nome");
    const contadorAssunto = document.querySelector("#contador-assunto");
    const contadorMensagem = document.querySelector("#contador-mensagem");
    const resumoErros = document.querySelector("#resumo-erros");
    const statusContato = document.querySelector("#contato-status");
    const btnEnviarContato = document.querySelector("#btn-enviar-contato");

    let formEnviadoUmaVez = false;
    let emProcessamento = false;

    function obterTamanhoNormalizado(valor) {
        return (valor || "").trim().length;
    }

    function atualizarCorContador(campo, contador, minimo, maximo) {
        if (!campo || !contador) return;
        const tamanho = obterTamanhoNormalizado(campo.value);

        if (tamanho > maximo || (tamanho > 0 && tamanho < minimo)) {
            contador.style.color = "#ef4444";
        } else {
            contador.style.color = "var(--text-muted)";
        }
    }

    function atualizarContadorNome() {
        atualizarCorContador(campoNome, contadorNome, 3, 80);
    }

    function atualizarContadorAssunto() {
        atualizarCorContador(campoAssunto, contadorAssunto, 5, 100);
    }

    function atualizarContadorMensagem() {
        atualizarCorContador(campoMensagem, contadorMensagem, 30, 1000);
    }

    if (campoNome) {
        campoNome.addEventListener("input", atualizarContadorNome);
    }

    if (campoAssunto) {
        campoAssunto.addEventListener("input", atualizarContadorAssunto);
    }

    if (campoMensagem) {
        campoMensagem.addEventListener("input", () => {
            atualizarContadorMensagem();
            if (formEnviadoUmaVez) validarCampo(campoMensagem);
        });
    }

    function atualizarRegraCondicional() {
        if (!campoMotivo || !containerAssunto || !campoAssunto) return;
        const ehOutro = campoMotivo.value === "Outro";
        containerAssunto.hidden = !ehOutro;

        if (ehOutro) {
            campoAssunto.setAttribute("required", "true");
        } else {
            campoAssunto.removeAttribute("required");
            limparErroCampo(campoAssunto);
            campoAssunto.value = "";
            atualizarContadorAssunto();
        }
    }

    if (campoMotivo) {
        campoMotivo.addEventListener("change", () => {
            atualizarRegraCondicional();
            if (formEnviadoUmaVez) validarCampo(campoMotivo);
        });
    }

    function validarCampo(campo) {
        if (!campo) return true;

        if (campo === campoAssunto && containerAssunto.hidden) {
            limparErroCampo(campo);
            return true;
        }

        const id = campo.id;
        const valor = campo.value;
        const tam = obterTamanhoNormalizado(valor);
        let mensagemErro = "";

        if (id === "contato-nome") {
            if (tam === 0) mensagemErro = "Obrigatório.";
            else if (tam < 3 || tam > 80) mensagemErro = "Entre 3 e 80 caracteres.";
        } else if (id === "contato-email") {
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (tam === 0) mensagemErro = "Obrigatório.";
            else if (!regex.test(valor.trim())) mensagemErro = "E-mail inválido.";
        } else if (id === "contato-motivo") {
            if (!valor) mensagemErro = "Selecione uma opção.";
        } else if (id === "contato-assunto") {
            if (campoMotivo.value === "Outro") {
                if (tam === 0) mensagemErro = "Obrigatório.";
                else if (tam < 5 || tam > 100) mensagemErro = "Entre 5 e 100 caracteres.";
            }
        } else if (id === "contato-mensagem") {
            if (tam === 0) mensagemErro = "Obrigatório.";
            else if (tam < 30) mensagemErro = `Mín. 30 caracteres (${tam}/30).`;
            else if (tam > 1000) mensagemErro = `Máx. 1000 caracteres (${tam}/1000).`;
        }

        if (mensagemErro) {
            aplicarErroCampo(campo, mensagemErro);
            return false;
        } else {
            limparErroCampo(campo);
            return true;
        }
    }

    function aplicarErroCampo(campo, texto) {
        campo.setAttribute("aria-invalid", "true");
        const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
        if (spanErro) spanErro.textContent = texto;
    }

    function limparErroCampo(campo) {
        campo.removeAttribute("aria-invalid");
        const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
        if (spanErro) spanErro.textContent = "";
    }

    [campoNome, campoEmail, campoAssunto].forEach((campo) => {
        if (!campo) return;
        campo.addEventListener("input", () => {
            if (formEnviadoUmaVez) validarCampo(campo);
        });
        campo.addEventListener("blur", () => {
            if (formEnviadoUmaVez || campo.value.trim() !== "") validarCampo(campo);
        });
    });

    formContato.addEventListener("submit", async (e) => {
        e.preventDefault();
        formEnviadoUmaVez = true;

        if (emProcessamento) return;

        const campos = [campoNome, campoEmail, campoMotivo, campoAssunto, campoMensagem];
        const invalidos = [];

        campos.forEach((campo) => {
            if (!validarCampo(campo)) {
                invalidos.push(campo);
            }
        });

        if (invalidos.length > 0) {
            exibirResumoErros();
            invalidos[0].focus();
            return;
        }

        if (resumoErros) resumoErros.hidden = true;
        iniciarEstadoProcessamento(true);

        const dadosForm = new FormData(formContato);
        if (campoMotivo.value !== "Outro") dadosForm.delete("assunto");

        try {
            const resposta = await fetch(formContato.action, {
                method: "POST",
                body: dadosForm,
                headers: { 'Accept': 'application/json' }
            });

            if (resposta.ok) {
                exibirStatusContato("Enviado com sucesso!", "sucesso");
                formContato.reset();
                atualizarRegraCondicional();
                atualizarContadorNome();
                atualizarContadorAssunto();
                atualizarContadorMensagem();
                formEnviadoUmaVez = false;
            } else {
                throw new Error("Erro no envio.");
            }
        } catch (erro) {
            exibirStatusContato(erro.message, "erro");
        } finally {
            iniciarEstadoProcessamento(false);
        }
    });

    function iniciarEstadoProcessamento(processando) {
        emProcessamento = processando;
        if (btnEnviarContato) {
            btnEnviarContato.disabled = processando;
            btnEnviarContato.innerHTML = processando ? "Enviando..." : "Enviar Mensagem <i class='ph ph-paper-plane-right'></i>";
        }
        if (processando) exibirStatusContato("Processando...", "processando");
    }

    function exibirStatusContato(mensagem, tipo) {
        if (!statusContato) return;
        statusContato.textContent = mensagem;
        statusContato.style.color = tipo === "erro" ? "#ef4444" : (tipo === "sucesso" ? "#10b981" : "#3b82f6");
    }

    function exibirResumoErros() {
        if (!resumoErros) return;
        resumoErros.innerHTML = "Corrija os campos destacados.";
        resumoErros.hidden = false;
    }

    atualizarRegraCondicional();
    atualizarContadorNome();
    atualizarContadorAssunto();
    atualizarContadorMensagem();
});
