//ES MODULES
import { promises } from "fs";
import axios from "axios";
import sha1 from "sha1";
import express from "express";
import engine from "consolidate";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const { writeFile } = promises;
const { get } = axios;

let cifrado = "";
let numeroCasas;
const URL = "https://api.codenation.dev/v1/challenge/dev-ps/generate-data?token=";
const myToken = process.env.TOKEN;

init();
renderPage();

// Inicializar junto com o servidor (executa a requisição)
async function init() {
  get(`${URL}${myToken}`)
    .then((response) => {
      console.log("----------- Requisicao Feita ----------");
      console.log(response.data); //TODO RESPOSTA
      cifrado = response.data.cifrado.toLowerCase();
      numeroCasas = response.data.numero_casas;
      mountedJson(response);
    })
    .catch((error) => {
      console.log(error);
    });
}

/*
* Algoritmo de Descriptografia de Cesar
*/
function descrypt(frase, numero) {
  const num = numero < 0 ? 26 : numero;
  let output = "";

  for (let i = 0; i < frase.length; i++) {
    const code = frase.charCodeAt(i);
    let c = "";

    if (code >= 65 && code <= 90) {
      c = String.fromCharCode((code - num) % 26);
    } else if (code >= 97 && code <= 122) {
      if (code - num < 97) {
        c = String.fromCharCode(code - num + 122 - 97 + 1);
      } else {
        c = String.fromCharCode(code - num);
      }
    } else {
      if (code === 32) {
        c = " ";
      } else if (code === 58) {
        c = String.fromCharCode(code);
      } else if (code === 46) {
        c = String.fromCharCode(code);
      }
    }
    output += c;
  }
  return output;
}

/**
 * Monta o Arquivo JSON (Caso ele ja exista ira sobrescrever os dados)
 * @param {*} response
 */
async function mountedJson(response) {
  var decifrado = descrypt(cifrado, numeroCasas);
  response.data.decifrado = decifrado;
  response.data.resumo_criptografico = sha1(decifrado);
  try {
    writeFile(`answer.json`, JSON.stringify(response.data));
  } catch (error) {
    console.log(error);
  }
}

/**
 * Levanta o servidor na porta definada no @param(process.env.PORT) 
 * no arquivo de variaveis de ambiente '.env', e executa a pagina estática 'index.html'
 */
function renderPage() {
  app.use(express.static("views"));
  app.engine("html", engine.mustache);
  app.get("/", function (req, res) {
    res.render("index.html");
  });
  app.listen(process.env.PORT || 3000);
  console.log('Acesse: http://localhost:'+ process.env.PORT || 3000);
}
