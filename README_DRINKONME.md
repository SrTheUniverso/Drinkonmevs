# DrinkOnMe - Mobile App

Um aplicativo móvel desenvolvido com **Expo/React Native** que permite aos usuários encontrar bares participantes e resgatar 1 drink grátis por semana.

## 🎯 Funcionalidades Principais

### 1. **Autenticação**
- Login com email e senha
- Cadastro de novos usuários
- Armazenamento seguro de JWT (SecureStore no nativo, localStorage na web)
- Logout com limpeza de sessão

### 2. **Tela Home - Lista de Bares**
- Exibe lista de bares participantes em cards
- Mostra imagem, nome, endereço e distância de cada bar
- Pull-to-refresh para atualizar lista
- Navegação para detalhes do bar ao tocar no card
- Estados de carregamento e erro

### 3. **Tela de Detalhes do Bar**
- Informações completas do bar (imagem, endereço, avaliação, descrição)
- Lista de drinks disponíveis
- Botão "Resgatar Drink" com validação de 7 dias
- Feedback visual e haptic feedback (vibração) ao resgatar
- Status de resgate com mensagens personalizadas

### 4. **Tela de Perfil**
- Informações do usuário (avatar, nome, email)
- Estatísticas (total de resgates, último resgate)
- Histórico de resgates em ordem cronológica
- Pull-to-refresh para atualizar histórico
- Botão de logout

## 🏗️ Estrutura do Projeto

```
drinkonme/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Configuração de tabs (Home, Perfil)
│   │   ├── index.tsx          # Tela Home (lista de bares)
│   │   └── profile.tsx        # Tela Perfil (histórico de resgates)
│   ├── bar/
│   │   └── [id].tsx           # Tela de detalhes do bar
│   ├── login.tsx              # Tela de login
│   ├── signup.tsx             # Tela de cadastro
│   └── oauth/
│       └── callback.tsx       # Callback OAuth (não modificar)
├── components/
│   ├── themed-text.tsx        # Componente de texto com tema
│   ├── themed-view.tsx        # Componente de view com tema
│   └── ui/
│       └── icon-symbol.tsx    # Mapeamento de ícones
├── constants/
│   ├── oauth.ts               # Configurações OAuth
│   └── theme.ts               # Paleta de cores e fontes
├── hooks/
│   ├── use-auth.ts            # Hook de autenticação
│   └── use-theme-color.ts     # Hook de cores do tema
├── lib/
│   ├── api.ts                 # Chamadas de API
│   ├── auth.ts                # Gerenciamento de token JWT
│   └── trpc.ts                # Cliente tRPC
├── assets/images/
│   ├── icon.png               # Logo do app
│   ├── splash-icon.png        # Ícone da splash screen
│   ├── favicon.png            # Favicon
│   └── android-icon-*.png     # Ícones Android
├── design.md                  # Especificações de design
├── todo.md                    # Lista de tarefas
└── app.config.ts              # Configuração do Expo

```

## 🎨 Design & Cores

**Paleta de Cores:**
- **Primária (Laranja)**: `#FF6B35` - Botões, ações principais
- **Secundária (Azul)**: `#004E89` - Links, informações
- **Sucesso (Verde)**: `#2ECC71` - Resgates bem-sucedidos
- **Aviso (Amarelo)**: `#F39C12` - Resgates indisponíveis

**Tipografia:**
- **Title**: 32pt, Bold
- **Subtitle**: 20pt, SemiBold
- **Body**: 16pt, Regular
- **Caption**: 14pt, Regular

## 🔌 Endpoints da API

O aplicativo consome os seguintes endpoints do backend Node.js/PostgreSQL:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login com email e senha |
| POST | `/api/auth/signup` | Cadastro de novo usuário |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Obter usuário autenticado |
| GET | `/bares` | Lista de bares participantes |
| GET | `/bares/:id` | Detalhes de um bar específico |
| POST | `/resgatar/:barId` | Resgatar drink em um bar |
| GET | `/resgates/me` | Histórico de resgates do usuário |
| GET | `/resgates/status/:barId` | Status de resgate em um bar |

## 🚀 Como Executar

### Pré-requisitos
- Node.js 22.13.0+
- npm ou pnpm
- Expo CLI (instalado via npm)
- Backend rodando na porta 3000

### Instalação

```bash
# Clonar ou acessar o projeto
cd drinkonme

# Instalar dependências
npm install
# ou
pnpm install

# Iniciar o dev server Expo
npm start
# ou
pnpm start
```

### Acessar o App

**Web (Navegador):**
- Acesse `https://8081-xxx.manusvm.computer` no navegador

**iOS (Simulador):**
- Pressione `i` no terminal do Expo

**Android (Emulador):**
- Pressione `a` no terminal do Expo

**Dispositivo Físico:**
- Escaneie o QR code com a câmera (iOS) ou abra com Expo Go (Android)

## 🔐 Autenticação

### Login com Email/Senha
1. Acesse a tela de Login
2. Insira email e senha
3. Toque "Entrar"
4. Token JWT é armazenado automaticamente
5. Redirecionado para Home

### Armazenamento de Token
- **Nativo (iOS/Android)**: SecureStore (criptografado)
- **Web**: localStorage (cookie-based)

### Logout
1. Acesse a aba Perfil
2. Toque "Sair"
3. Token é removido e redirecionado para Login

## 📱 Fluxos de Usuário

### Flow 1: Login e Explorar Bares
```
Login → Home (lista de bares) → Tap no bar → Detalhes do bar
```

### Flow 2: Resgatar Drink
```
Detalhes do bar → Tap "Resgatar Drink" → Validação (7 dias) → Sucesso/Erro
```

### Flow 3: Ver Histórico
```
Aba Perfil → Histórico de resgates → Estatísticas
```

## 🎭 Dark Mode

O aplicativo suporta **dark mode automático** em todas as telas:
- Cores ajustadas automaticamente
- Componentes `ThemedText` e `ThemedView` aplicam tema
- Configuração em `constants/theme.ts`

## 🧪 Testes

Para testar o aplicativo:

1. **Criar conta de teste**
   - Email: `teste@example.com`
   - Senha: `senha123`

2. **Testar fluxo de login**
   - Login com email/senha
   - Verificar armazenamento de token
   - Logout e verificar limpeza

3. **Testar lista de bares**
   - Verificar carregamento de bares
   - Pull-to-refresh
   - Navegação para detalhes

4. **Testar resgate de drink**
   - Resgatar drink em um bar
   - Verificar validação de 7 dias
   - Testar feedback de sucesso/erro

5. **Testar perfil**
   - Verificar informações do usuário
   - Histórico de resgates
   - Estatísticas

## 🐛 Troubleshooting

### Erro: "API base URL not found"
- Verifique se o backend está rodando na porta 3000
- Verifique a variável de ambiente `EXPO_PUBLIC_API_BASE_URL`

### Erro: "Token not found"
- Limpe o cache do app: `npm start -- --clear`
- Faça login novamente

### Erro: "CORS"
- Verifique se o backend permite requisições do frontend
- Verifique headers CORS no backend

### App não carrega na web
- Verifique se a porta 8081 está acessível
- Limpe cache do navegador (Ctrl+Shift+Delete)

## 📚 Recursos Adicionais

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router Documentation](https://docs.expo.dev/routing/introduction/)
- [Design Specifications](./design.md)
- [Task List](./todo.md)

## 📝 Notas de Desenvolvimento

- O aplicativo usa **Expo Router** para navegação
- **React Native Reanimated** para animações
- **Expo Secure Store** para armazenamento seguro de tokens
- **Haptic Feedback** para feedback tátil ao resgatar drinks
- **Dark Mode** suportado automaticamente

## 🎯 Próximas Melhorias

- [ ] Integração com mapa (localização de bares)
- [ ] Filtros avançados (tipo de bebida, distância)
- [ ] Notificações push
- [ ] Sistema de avaliação de bares
- [ ] Compartilhamento em redes sociais
- [ ] Programa de fidelidade (pontos, descontos)

## 📄 Licença

Desenvolvido para validar a ideia do DrinkOnMe.

---

**Desenvolvido com ❤️ usando Expo/React Native**
