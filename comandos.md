# Comandos Úteis (Executados do Cloud Shell)

Este documento resume os comandos úteis para interagir com o banco de dados e para fazer o deploy da aplicação, com os dados reais que utilizamos e assumindo que todos os comandos são executados do Google Cloud Shell.

## Acessando o Banco de Dados

1.  **Autorizar o IP do Cloud Shell (se necessário):**
    O IP do Cloud Shell pode mudar. Se você não conseguir se conectar, primeiro obtenha o IP atual e adicione-o às redes autorizadas da sua instância do Cloud SQL.

    ```bash
    # Obter o IP atual do Cloud Shell
    curl ifconfig.me

    # Adicionar o IP às redes autorizadas (substitua <EXISTING_IPS> se houver outros)
    gcloud sql instances patch consigja-db --authorized-networks=<NEW_IP>,<EXISTING_IPS>
    ```

2.  **Conectar ao Banco de Dados:**
    Use o `psql` para se conectar diretamente ao IP público da sua instância do Cloud SQL.

    ```bash
    psql "host=34.39.144.18 port=5432 user=postgres dbname=jbc"
    ```
    A senha (`admin`) será solicitada.

3.  **Executar uma Operação SQL:**
    Depois de conectado, você pode executar qualquer comando SQL.

    ```sql
    UPDATE "public"."User" SET email = 'admin@admin' WHERE email = 'jeff@consigja.com';
    ```

    Para sair do `psql`, digite `\q`.

## Build e Deploy da Aplicação

Para fazer o deploy de uma nova versão da aplicação para o Cloud Run:

1.  **Build da Imagem Docker:**
    Este comando usa o Cloud Build para criar uma imagem Docker a partir do seu código-fonte e a envia para o Artifact Registry.

    ```bash
     
    ```

2.  **Deploy da Imagem para o Cloud Run:**
    Este comando faz o deploy da imagem que você acabou de criar para o seu serviço no Cloud Run.

    ```bash
    gcloud run deploy consigja-app --image southamerica-east1-docker.pkg.dev/consigja-2025/cloud-run-source-deploy/consigja-app:latest --region southamerica-east1
    ```


## Acessar banco de dados
gcloud sql connect consigja-db --user=postgres --database=jbc