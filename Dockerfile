# Etapa 1: Base da imagem para build
FROM node:18-alpine AS builder

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de configuração
COPY package.json package-lock.json* ./

# Instala todas as dependências
RUN npm install --legacy-peer-deps

# Copia o restante do código
COPY . .

# Gera o cliente Prisma
RUN npx prisma generate

# Builda a aplicação Next.js
RUN npm run build

# Etapa 2: Imagem final para execução
FROM node:18-alpine AS runner

# Define o diretório de trabalho
WORKDIR /app

# Define variáveis de ambiente padrão
ENV NODE_ENV=production
ENV PORT=3000

# Copia apenas o necessário da etapa de build
COPY --from=builder /app/package.json /app/package-lock.json* ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Expõe a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]