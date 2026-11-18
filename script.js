// Todo o código só começa a rodar depois que a página terminou de carregar
document.addEventListener("DOMContentLoaded", () => {
    // ==========================================================
    // ANIMAÇÃO DE ENTRADA DAS SEÇÕES
    // Observa quando cada seção aparece na tela e coloca a classe visivel,
    // o que faz o CSS animar a seção subindo e ficando visível
    // ==========================================================
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visivel');
            }
        });
    }, { threshold: 0.1 });

    // Liga o observador a todas as seções que têm a classe animar-scroll
    document.querySelectorAll('.animar-scroll').forEach(secao => {
        observer.observe(secao);
    });

    // ==========================================================
    // TEMA CLARO E ESCURO
    // Botão da lua e do sol no menu
    // ==========================================================
    const btnTema = document.querySelector("#tema");
    if (btnTema) {
        // Ao clicar, liga ou desliga a classe escuro no body, que troca as cores no CSS
        btnTema.addEventListener("click", () => {
            const ehEscuro = document.body.classList.toggle("escuro");
            // Informa o estado do botão para leitores de tela
            btnTema.setAttribute("aria-pressed", String(ehEscuro));
            
            // Troca o ícone: sol quando o tema é escuro e lua quando é claro
            const icone = btnTema.querySelector('i');
            if(ehEscuro) {
                icone.classList.replace('ph-moon', 'ph-sun');
            } else {
                icone.classList.replace('ph-sun', 'ph-moon');
            }
        });
    }

    // ==========================================================
    // EFEITO DE DIGITAÇÃO DO SUBTÍTULO NO CELULAR
    // No computador o efeito é feito pelo CSS. Em telas pequenas, o CSS desliga a animação
    // e este código escreve o texto letra por letra, deixando o texto poder quebrar de linha
    // ==========================================================
    const fraseDigitada = document.querySelector(".maquina-escrever p");
    if (fraseDigitada) {
        // Guarda o texto original e cria a verificação de tela pequena
        const textoOriginal = fraseDigitada.textContent.trim();
        const telaPequena = window.matchMedia("(max-width: 768px)");
        let timerDigitacao;

        // Começa ou reinicia a digitação, conforme o tamanho da tela
        function iniciarDigitacao() {
            // Para a digitação anterior, se houver
            clearInterval(timerDigitacao);

            // Em tela grande, mostra o texto inteiro e deixa o efeito com o CSS
            if (!telaPequena.matches) {
                fraseDigitada.textContent = textoOriginal;
                return;
            }

            // Em tela pequena, divide o texto em duas partes: a já digitada e a que falta
            fraseDigitada.innerHTML = '<span class="digitado"></span><span class="restante"></span>';
            const digitado = fraseDigitada.querySelector(".digitado");
            const restante = fraseDigitada.querySelector(".restante");
            restante.textContent = textoOriginal;

            // A cada 50 milissegundos passa uma letra da parte restante para a digitada
            let i = 0;
            timerDigitacao = setInterval(() => {
                i++;
                digitado.textContent = textoOriginal.slice(0, i);
                restante.textContent = textoOriginal.slice(i);
                if (i >= textoOriginal.length) clearInterval(timerDigitacao);
            }, 50);
        }

        // Roda uma vez ao carregar e de novo quando a tela passa de grande para pequena ou ao contrário
        iniciarDigitacao();
        telaPequena.addEventListener("change", iniciarDigitacao);
    }

    // ==========================================================
    // FILTRO DE PROJETOS
    // Mostra só os cards da categoria escolhida e atualiza o contador
    // ==========================================================
    // Elementos usados pelo filtro: a lista de seleção, a lista de cards e o texto do contador
    const filtroProjetos = document.querySelector("#filtro");
    const listaProjetos = document.querySelector("#lista-projetos");
    const contadorProjetos = document.querySelector("#contador");

    // Percorre todos os cards e esconde os que não são da categoria escolhida
    function aplicarFiltro() {
        if (!listaProjetos || !filtroProjetos) return;
        const valorFiltro = filtroProjetos.value.toLowerCase();
        const cards = listaProjetos.querySelectorAll(".projeto");
        let visiveis = 0;

        cards.forEach((card) => {
            // Lê a categoria do card, escrita no data-categoria do HTML
            const categoriaCard = (card.dataset.categoria || "").toLowerCase();
            // Se a opção é todos ou a categoria bate, mostra o card e conta. Senão, esconde
            if (valorFiltro === "todos" || categoriaCard === valorFiltro) {
                card.classList.remove("oculto");
                visiveis++;
            } else {
                card.classList.add("oculto");
            }
        });

        // Atualiza o texto com a quantidade de projetos exibidos, ou avisa quando não há nenhum
        if (contadorProjetos) {
            contadorProjetos.textContent = visiveis === 0
                ? "Nenhum projeto encontrado nesta categoria."
                : `Exibindo ${visiveis} projeto(s).`;
        }
    }

    // Aplica o filtro sempre que o visitante muda a opção, e também uma vez ao carregar
    if (filtroProjetos) {
        filtroProjetos.addEventListener("change", aplicarFiltro);
        aplicarFiltro();
    }

    // ==========================================================
    // FORMULÁRIO DE CONTATO
    // Se a página não tiver o formulário, o código para aqui
    // ==========================================================
    const formContato = document.querySelector("#form-contato");
    if (!formContato) return;

    // Seleção dos elementos do formulário: campos, contadores, resumo de erros, status e botão
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

    // Variáveis de controle: se o visitante já tentou enviar e se há um envio em andamento
    let formEnviadoUmaVez = false;
    let emProcessamento = false;

    // ---------- CONTADORES DE CARACTERES ----------

    // Critério único de contagem: tira os espaços das pontas e conta o resto. Serve para os contadores e para a validação
    function obterTamanhoNormalizado(valor) {
        return (valor || "").trim().length;
    }

    // Deixa o contador vermelho quando o tamanho está fora do limite, e cinza quando está certo
    function atualizarCorContador(campo, contador, minimo, maximo) {
        if (!campo || !contador) return;
        const tamanho = obterTamanhoNormalizado(campo.value);

        if (tamanho > maximo || (tamanho > 0 && tamanho < minimo)) {
            contador.style.color = "#ef4444";
        } else {
            contador.style.color = "var(--text-muted)";
        }
    }

    // Um contador para cada campo, com seus limites: nome de 3 a 80, assunto de 5 a 100 e mensagem de 30 a 1000
    function atualizarContadorNome() {
        atualizarCorContador(campoNome, contadorNome, 3, 80);
    }

    function atualizarContadorAssunto() {
        atualizarCorContador(campoAssunto, contadorAssunto, 5, 100);
    }

    function atualizarContadorMensagem() {
        atualizarCorContador(campoMensagem, contadorMensagem, 30, 1000);
    }

    // Atualiza cada contador enquanto o visitante digita
    if (campoNome) {
        campoNome.addEventListener("input", atualizarContadorNome);
    }

    if (campoAssunto) {
        campoAssunto.addEventListener("input", atualizarContadorAssunto);
    }

    // Na mensagem, além do contador, revalida o campo se já houve tentativa de envio
    if (campoMensagem) {
        campoMensagem.addEventListener("input", () => {
            atualizarContadorMensagem();
            if (formEnviadoUmaVez) validarCampo(campoMensagem);
        });
    }

    // ---------- CAMPO ASSUNTO CONDICIONAL ----------

    // Mostra o campo Assunto só quando o motivo é Outro. Quando não é, esconde, tira a obrigatoriedade, limpa o erro e o valor
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

    // Ao trocar o motivo, atualiza o campo Assunto e revalida o motivo se já houve tentativa de envio
    if (campoMotivo) {
        campoMotivo.addEventListener("change", () => {
            atualizarRegraCondicional();
            if (formEnviadoUmaVez) validarCampo(campoMotivo);
        });
    }

    // ---------- VALIDAÇÃO ----------

    // Confere um campo de acordo com suas regras e mostra ou limpa o erro. Devolve true se o campo está válido
    function validarCampo(campo) {
        if (!campo) return true;

        // Assunto escondido não é validado e não deixa erro para trás
        if (campo === campoAssunto && containerAssunto.hidden) {
            limparErroCampo(campo);
            return true;
        }

        const id = campo.id;
        const valor = campo.value;
        const tam = obterTamanhoNormalizado(valor);
        let mensagemErro = "";

        // Regras de cada campo, escolhidas pelo id
        if (id === "contato-nome") {
            // Nome: obrigatório, de 3 a 80 caracteres
            if (tam === 0) mensagemErro = "Obrigatório.";
            else if (tam < 3 || tam > 80) mensagemErro = "Entre 3 e 80 caracteres.";
        } else if (id === "contato-email") {
            // E-mail: obrigatório e com formato de texto, arroba e domínio
            const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (tam === 0) mensagemErro = "Obrigatório.";
            else if (!regex.test(valor.trim())) mensagemErro = "E-mail inválido.";
        } else if (id === "contato-motivo") {
            // Motivo: precisa escolher uma opção que não seja a inicial vazia
            if (!valor) mensagemErro = "Selecione uma opção.";
        } else if (id === "contato-assunto") {
            // Assunto: só é exigido quando o motivo é Outro, de 5 a 100 caracteres
            if (campoMotivo.value === "Outro") {
                if (tam === 0) mensagemErro = "Obrigatório.";
                else if (tam < 5 || tam > 100) mensagemErro = "Entre 5 e 100 caracteres.";
            }
        } else if (id === "contato-mensagem") {
            // Mensagem: obrigatória, de 30 a 1000 caracteres, com a contagem atual na mensagem de erro
            if (tam === 0) mensagemErro = "Obrigatório.";
            else if (tam < 30) mensagemErro = `Mín. 30 caracteres (${tam}/30).`;
            else if (tam > 1000) mensagemErro = `Máx. 1000 caracteres (${tam}/1000).`;
        }

        // Se há erro, mostra no campo. Se não, limpa
        if (mensagemErro) {
            aplicarErroCampo(campo, mensagemErro);
            return false;
        } else {
            limparErroCampo(campo);
            return true;
        }
    }

    // ---------- MOSTRAR E LIMPAR ERROS ----------

    // Marca o campo como inválido para leitores de tela e escreve a mensagem no espaço de erro dele
    function aplicarErroCampo(campo, texto) {
        campo.setAttribute("aria-invalid", "true");
        const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
        if (spanErro) spanErro.textContent = texto;
    }

    // Tira a marca de inválido e apaga a mensagem de erro do campo
    function limparErroCampo(campo) {
        campo.removeAttribute("aria-invalid");
        const spanErro = document.querySelector(`#erro-${campo.id.replace("contato-", "")}`);
        if (spanErro) spanErro.textContent = "";
    }

    // Nome, e-mail e assunto são validados ao digitar, se já houve tentativa de envio, e ao sair do campo, se ele tem algo escrito
    [campoNome, campoEmail, campoAssunto].forEach((campo) => {
        if (!campo) return;
        campo.addEventListener("input", () => {
            if (formEnviadoUmaVez) validarCampo(campo);
        });
        campo.addEventListener("blur", () => {
            if (formEnviadoUmaVez || campo.value.trim() !== "") validarCampo(campo);
        });
    });

    // Quando o visitante volta a mexer em um campo, apaga o status antigo do envio, como o Enviado com sucesso
    const todosCamposFormulario = [campoNome, campoEmail, campoMotivo, campoAssunto, campoMensagem];
    todosCamposFormulario.forEach((campo) => {
        if (!campo) return;
        campo.addEventListener("focus", () => {
            if (statusContato) statusContato.textContent = "";
        });
        campo.addEventListener("input", () => {
            if (statusContato) statusContato.textContent = "";
        });
        campo.addEventListener("change", () => {
            if (statusContato) statusContato.textContent = "";
        });
    });

    // ---------- ENVIO DO FORMULÁRIO ----------

    // Roda quando o visitante clica em Enviar. Valida os campos e, se estiver tudo certo, envia os dados
    formContato.addEventListener("submit", async (e) => {
        // Impede o envio padrão do navegador, para controlar o envio por aqui
        e.preventDefault();
        formEnviadoUmaVez = true;

        // Se já há um envio em andamento, ignora o novo clique
        if (emProcessamento) return;

        // Valida todos os campos e guarda os que têm erro
        const campos = [campoNome, campoEmail, campoMotivo, campoAssunto, campoMensagem];
        const invalidos = [];

        campos.forEach((campo) => {
            if (!validarCampo(campo)) {
                invalidos.push(campo);
            }
        });

        // Se há erros, mostra o aviso geral, leva o cursor ao primeiro campo com erro e para
        if (invalidos.length > 0) {
            exibirResumoErros();
            invalidos[0].focus();
            return;
        }

        // Tudo certo: esconde o aviso de erros e liga o estado de processamento
        if (resumoErros) resumoErros.hidden = true;
        iniciarEstadoProcessamento(true);

        // Reúne os dados do formulário. Se o motivo não é Outro, o assunto não vai junto
        const dadosForm = new FormData(formContato);
        if (campoMotivo.value !== "Outro") dadosForm.delete("assunto");

        try {
            // Envia os dados ao serviço Formspree e espera a resposta
            const resposta = await fetch(formContato.action, {
                method: "POST",
                body: dadosForm,
                headers: { 'Accept': 'application/json' }
            });

            if (resposta.ok) {
                // Sucesso: mostra a confirmação e limpa o formulário só depois da resposta
                exibirStatusContato("Enviado com sucesso!", "sucesso");
                formContato.reset();
                atualizarRegraCondicional();
                atualizarContadorNome();
                atualizarContadorAssunto();
                atualizarContadorMensagem();
                formEnviadoUmaVez = false;
            } else {
                // Resposta com erro do serviço
                throw new Error("Erro no envio.");
            }
        } catch (erro) {
            // Falha: mostra o erro e mantém os dados preenchidos para tentar de novo
            exibirStatusContato(erro.message, "erro");
        } finally {
            // Em qualquer caso, libera o botão de novo
            iniciarEstadoProcessamento(false);
        }
    });

    // ---------- ESTADOS E MENSAGENS ----------

    // Liga ou desliga o estado de envio em andamento: trava novos envios, desativa o botão e troca o texto dele
    function iniciarEstadoProcessamento(processando) {
        emProcessamento = processando;
        if (btnEnviarContato) {
            btnEnviarContato.disabled = processando;
            btnEnviarContato.innerHTML = processando ? "Enviando..." : "Enviar Mensagem <i class='ph ph-paper-plane-right'></i>";
        }
        if (processando) exibirStatusContato("Processando...", "processando");
    }

    // Mostra o texto de status do envio, com cor por tipo: vermelho para erro, verde para sucesso e azul para processando
    function exibirStatusContato(mensagem, tipo) {
        if (!statusContato) return;
        statusContato.textContent = mensagem;
        statusContato.style.color = tipo === "erro" ? "#ef4444" : (tipo === "sucesso" ? "#10b981" : "#3b82f6");
    }

    // Mostra o aviso geral no topo do formulário quando há campos com erro
    function exibirResumoErros() {
        if (!resumoErros) return;
        resumoErros.innerHTML = "Corrija os campos destacados.";
        resumoErros.hidden = false;
    }

    // Estado inicial ao carregar a página: ajusta o campo Assunto e os contadores
    atualizarRegraCondicional();
    atualizarContadorNome();
    atualizarContadorAssunto();
    atualizarContadorMensagem();
});
