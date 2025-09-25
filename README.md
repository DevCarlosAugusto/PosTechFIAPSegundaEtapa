# Pós Tech Fiap - Segunda Etapa

Bem-vindo ao projeto de CRUD da FIAP! Este repositório contém o código-fonte e a configuração do Docker para rodar a aplicação em um ambiente isolado, que inclui os bancos de dados MongoDB, PostgreSQL e MySQL.

## Requisitos

Antes de começar, certifique-se de ter os pacotes mais recentes do Node, Docker e o Docker Compose instalados em sua máquina em sua última versão.

-   [**Node**](https://www.nodejs.tech/pt-br) 
-   [**Docker Desktop**](https://www.docker.com/products/docker-desktop/) (recomendado para Windows e macOS)
-   [**Docker Engine**](https://docs.docker.com/engine/install/) e [**Docker Compose Plugin**](https://docs.docker.com/compose/install/linux/) (para Linux)

## Como Iniciar a Aplicação

Siga os passos abaixo para subir a aplicação e todos os serviços de banco de dados.

1.  **Navegue até o diretório raiz do projeto:**
    Abra o seu terminal e vá para a pasta onde o arquivo `docker-compose.yml` está localizado.

2.  **Verificar o status de autenticação do Docker:**
    Em algumas máquinas o Docker pode dar um erro 401 de não autorizado, isso acontece devido a falta de login e o erro costuma acontecer mais em máquinas Windows, para resolver isso, efetue o comando abaixo no terminal e siga o passo a passo exibido na tela:

```bash
  docker login
```

Caso necessário efetue logout antes com o comando abaixo:


```bash
  docker logout
```


3.  **Inicie os serviços:**
    Execute o seguinte comando para construir as imagens e iniciar todos os containers em segundo plano.

```bash
  docker compose up --build -d
```

    -   `up`: Inicia os serviços.
    -   `--build`: Reconstroi a imagem do seu aplicativo a partir do `Dockerfile`. Use isso quando tiver feito alterações no código.
    -   `-d`: Executa os containers em modo **detached** (segundo plano).

A primeira execução pode demorar um pouco, pois o Docker precisa baixar as imagens dos bancos de dados e construir a imagem da sua aplicação.

## Como Visualizar o Status

Para verificar se todos os containers estão rodando corretamente, use o comando:

```bash
  docker compose ps
```

## Como parar a aplicação

Caso queira parar todos os serviços docker, execute o comando abaixo:

```bash
  docker compose down
```

