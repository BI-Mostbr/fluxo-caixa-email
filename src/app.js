const nodemailer = require('nodemailer');
const axios = require('axios');
const fs = require('fs');
const qs = require('qs');
const https = require('https');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 2901;

// Lê os arquivos de certificado e chave
const certificado = fs.readFileSync('/etc/letsencrypt/live/mostbr.com.br.server-node.mostbr.com.br/cert.pem');
const chave = fs.readFileSync('/etc/letsencrypt/live/mostbr.com.br.server-node.mostbr.com.br/privkey.pem');
const ca = fs.readFileSync('/etc/letsencrypt/live/mostbr.com.br.server-node.mostbr.com.br/chain.pem');

// Configuração do CORS
const corsOptions = {
    origin: true,
    //['https://app.flutterflow.io/', 'https://app.mostbr.com.br/', 'https://sistema-m-o-s-t-veayjp.flutterflow.app/', 'https://ff-debug-service-frontend-pro-ygxkweukma-uc.a.run.app/'],
    optionsSuccessStatus: 200
};

// Opções para o servidor HTTPS
const credentials = { 
    key: chave, 
    cert: certificado, 
    ca: ca 
};

app.use(cors(corsOptions));

app.use(express.json({limit: "5mb"}));

app.options('*', (req, res) => {
  res.status(200).send();
});

app.post('/api/email-caixa', async(req, res) => {
    try {
        const data = req.body; 
        const email = data.email;
        const nomeCliente = data.nomeCliente;
        const nome_consultor = data.nomeConsultor;
        const cpf_cliente = data.cpfCliente;
        const idProposta = data.idProposta;
        const statusAnterior = data.statusAnterior;
        const statusAtual = data.statusAtual;
        const situacaoAtual = data.situacaoAtual;
        const situacaoAnterior = data.situacaoAnterior;
        const valorCompraEVenda = data.valorCompraEVenda;
        const valorFinanciamento = data.valorFinanciamento;
        const valorAprovado = data.valorAprovado;
        const taxaDeJuros = data.taxaDeJuros;
        const prazo = data.prazo;
        const ITBI = data.ITBI;
        const FGTS = data.FGTS;
        const avaliacaoAprovada = data.avaliacaoAprovada
        //////////
        const valorAvaliacao = data.valorAvaliacao
        //////////
        const dataDeAgendamento = data.dataDeAgendamento
        const horario = data.horario
        const local = data.local


        let alteraStatusSituacao;
        let alteraStatusSituacaoText;
        let incluirstatus;

        if(statusAtual === statusAnterior) {
            incluirstatus = `<p>Mudança de Situação de <u><i>${situacaoAnterior}</u></i> para <b><i>${situacaoAtual}</i></b>.</p>`;
        } else if(situacaoAnterior === situacaoAtual) {
            incluirstatus = `<p>Mudança de Status de <u><i>${statusAnterior}</u></i> para <b><i>${statusAtual}</i></b>.<p>`; 
        } else {
            incluirstatus = `<p>Mudança de Status de <u><i>${statusAnterior}</u></i> para <b><i>${statusAtual}</i></b>.
                                        <br>
                                        <br>
                                        Mudança de Situação de <u><i>${situacaoAnterior}</u></i> para <b><i>${situacaoAtual}</i></b>.</p>`
        }

        if(statusAtual === "Crédito" && situacaoAtual == "APROVADO" || statusAtual === "Conf Valores" && situacaoAtual === "PENDENTE") {
            alteraStatusSituacao = "ambos";
            alteraStatusSituacaoText = `<p>${incluirstatus}.
                                        <br>
                                        <br>
                                        Valor Compra e Venda: <b>${valorCompraEVenda}</b>
                                        <br>
                                        <br>
                                        Valor de Financiamento: <b>${valorFinanciamento}</b>
                                        <br>
                                        <br>
                                        Valor Aprovado: <b>${valorAprovado}</b>
                                        <br>
                                        <br>
                                        Taxa de Juros: <b>${taxaDeJuros}%</b>
                                        <br>
                                        <br>
                                        Prazo: <b>${prazo} Meses</b>
                                        <br>
                                        <br>
                                        ITBI: <b>${ITBI}</b>
                                        <br>
                                        <br>
                                        FGTS: <b>${FGTS}</b>
                                        <br>
                                        <br>
                                        Logo ele se encontra no status ${statusAtual} e situação ${situacaoAtual}.</p>`;
        } else if(statusAtual === "Checklist" && situacaoAtual == "PENDENTE") {
            alteraStatusSituacao = "ambos";
            alteraStatusSituacaoText = `<p>${incluirstatus}.
                                        <br>
                                        <br>
                                        Valor da avaliação: <b>${valorAvaliacao}</b>
                                        <br>
                                        <br>
                                        Avaliação Aprovada: <b>${avaliacaoAprovada}</b>
                                        <br>
                                        <br>
                                        Avaliação Aprovada: <b>Sim</b>
                                        <br>
                                        <br>
                                        Logo ele se encontra no status ${statusAtual} e situação ${situacaoAtual}.<p>`;
        } else if(statusAtual === "Conf Valores" && situacaoAtual == "EM ANÁLISE") {
            alteraStatusSituacao = "ambos";
            alteraStatusSituacaoText = `<p>${incluirstatus}.
                                        <br>
                                        <br>
                                        Data de Agendamento: <b>${dataDeAgendamento}</b>
                                        <br>
                                        <br>
                                        Horário: <b>${horario}</b>
                                        <br>
                                        <br>
                                        Local: <b>${local}</b>
                                        <br>
                                        <br>
                                        Logo ele se encontra no status ${statusAtual} e situação ${situacaoAtual}.<p>`;
        } else {
            alteraStatusSituacao = "ambos";
            alteraStatusSituacaoText = `<p>${incluirstatus}.
                                        <br>
                                        <br>
                                        Logo ele se encontra no status ${statusAtual} e situação ${situacaoAtual}.</p>`
        }

        // Envia email
        let transporter = nodemailer.createTransport({
            host: 'email-ssl.com.br',
            port: 465,
            secure: true,
            auth: {
                user: 'notificacao.miracle@mostbr.com',
                pass: 'Most123%',
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        let info = await transporter.sendMail({
            from: 'notificacao.miracle@mostbr.com',
            to: `luis.pires@mostbr.com, daniel.leme@mostbr.com, vinicius.augusto@mostbr.com, ${email}`,
            subject: `Atualização Miracle | Banco Caixa do cliente ${nomeCliente}`,
            text: 'Atualização Miracle',
            html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Email Template</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
    body {
        font-family: Space Grotesk, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
    }
    .container {
        width: 100%;
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 0 15px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    .header {
        width: 576px;
        height: 203px;
        margin: 8px auto;
    }
    .content {
        padding: 32px;
        color: #333333;
        font-size: 18px;
    }
    .content h1 {
        color: #131316;
        font-size: 24px;
    }
    .property {
        display: flex;
        margin-bottom: 20px;
        border-bottom: 1px solid #eeeeee;
        padding-bottom: 20px;
    }
    .property img {
        max-width: 150px;
    }
    .property-details {
        flex: 1;
    }
    .property-details h2 {
        margin: 0;
        color: #131316;
    }
    .property-details p {
        margin: 5px 0;
    }
    .footer {
        background-color: #131316;
        color: #ffffff;
        text-align: center;
        padding: 10px;
        font-size: 12px;
        margin-bottom: 8px;
        border-radius: 8px;
    }
    /* Estilo para o parágrafo específico */
    .status-update {
        font-size: 16px;
        color: #333333;
    }
</style>
</head>
<body>
<div class="container">
    <div class="header">
        <img src="http://mostbr.com.br/wp-content/uploads/2024/07/header.png" alt="Company Logo">
    </div>
    <div class="content">
        <h1>Olá, ${nome_consultor}</h1>
        <br>
        <p>O cliente ${nomeCliente} teve uma atualização na proposta <b>${idProposta}</b> do banco Caixa no qual houve a seguinte alteração:</p>
        <p class="status-update">${alteraStatusSituacaoText}</p>
        <p><a href="https://app.mostbr.com.br/cliente-detalhes?cpf=${cpf_cliente}">Clique aqui para acessar este cliente</a></p>
        <p>Att,<br><br>Sistema de notificação Miracle</p>
    </div>
    <div class="footer">
        <p>Most | Av. Eng. Luís Carlos Berrini, 105, Cj 1607/1609 Vila Olimpia - São Paulo/SP</p>
        <p>&copy; 2024 Most. Todos os direitos reservados.</p>
    </div>
</div>
</body>
</html>`
, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log(`Message sent to: luis.pires@mostbr.com, daniel.leme@mostbr.com, vinicius.augusto@mostbr.com, ${email}`);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        res.json({"Message": "Mensagem enviada com sucesso!!"});
    } catch (error) {
        console.error('Error occurred:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// // Iniciar o servidor
// app.listen(PORT, () => {
//     console.log(`Servidor intermediário está rodando na porta ${PORT}`);
// });

const server = https.createServer(credentials, app);

server.listen(PORT, () => {
    console.log(`Servidor rodando em https://localhost:${PORT}`);
});
