# DrinkOnMe - Mobile App Design

## Overview

DrinkOnMe é um aplicativo móvel que conecta usuários a bares participantes, permitindo resgatar 1 drink grátis por semana. O design segue as **Apple Human Interface Guidelines (HIG)** para garantir uma experiência nativa no iOS.

**Orientação**: Portrait (9:16)  
**Estilo**: Native iOS com componentes minimalistas  
**Tema**: Light/Dark mode automático

---

## Color Palette

| Elemento | Cor (Light) | Cor (Dark) | Uso |
|----------|-------------|-----------|-----|
| **Primary** | `#FF6B35` | `#FF8C5A` | Botões principais, ações, destaques |
| **Secondary** | `#004E89` | `#0066CC` | Links, informações secundárias |
| **Success** | `#2ECC71` | `#27AE60` | Status de resgate bem-sucedido |
| **Warning** | `#F39C12` | `#E67E22` | Avisos, resgates indisponíveis |
| **Background** | `#FFFFFF` | `#1A1A1A` | Fundo principal |
| **Surface** | `#F8F9FA` | `#2D2D2D` | Cards, containers |
| **Text Primary** | `#1A1A1A` | `#FFFFFF` | Textos principais |
| **Text Secondary** | `#666666` | `#AAAAAA` | Textos secundários |
| **Divider** | `#E0E0E0` | `#404040` | Linhas separadoras |

---

## Typography

| Tipo | Tamanho | Peso | Uso |
|------|---------|------|-----|
| **Title** | 32pt | Bold (700) | Títulos de telas |
| **Subtitle** | 20pt | SemiBold (600) | Subtítulos, nomes de bares |
| **Body** | 16pt | Regular (400) | Texto principal |
| **Body SemiBold** | 16pt | SemiBold (600) | Destaques no corpo |
| **Caption** | 14pt | Regular (400) | Textos pequenos, datas |
| **Small Caption** | 12pt | Regular (400) | Labels, badges |

---

## Screen List

### 1. **Login Screen** (Splash/Auth)
**Rota**: `/` (home inicial antes de autenticação)

**Conteúdo**:
- Logo do app (ícone grande, 120x120pt)
- Título "DrinkOnMe"
- Subtítulo "Resgate drinks grátis em bares participantes"
- Botão "Entrar com Email" (primário)
- Botão "Criar Conta" (secundário)
- Link "Esqueceu a senha?" (texto pequeno)

**Funcionalidade**:
- Valida email e senha
- Armazena JWT em AsyncStorage após login bem-sucedido
- Navega para Home após autenticação

---

### 2. **Home Screen** (Lista de Bares)
**Rota**: `/(tabs)/index`

**Conteúdo**:
- Header com saudação "Olá, [Nome]" e ícone de perfil
- Barra de busca/filtro (opcional: localização, nome)
- Lista de bares em cards verticais:
  - Imagem do bar (altura 180pt)
  - Nome do bar (Subtitle)
  - Endereço com ícone de localização (Caption)
  - Distância/Avaliação (Small Caption, cor secundária)
  - Badge "Resgate disponível" ou "Próximo em X dias" (cor Success/Warning)

**Funcionalidade**:
- Consome endpoint `/bares`
- Exibe lista com FlatList (otimizado para performance)
- Tap em card navega para Detalhes do Bar
- Pull-to-refresh para atualizar lista
- Logout acessível via menu superior

---

### 3. **Bar Details Screen** (Detalhes e Resgate)
**Rota**: `/bar/:id`

**Conteúdo**:
- Imagem do bar (full-width, altura 240pt)
- Botão voltar (canto superior esquerdo)
- Nome do bar (Title)
- Endereço completo com mapa (opcional)
- Avaliação/Reviews (Small Caption)
- Seção "Drinks Disponíveis":
  - Lista de drinks em cards horizontais:
    - Nome do drink
    - Descrição breve
    - Ícone/badge
- Botão "Resgatar Drink" (primário, grande, 44pt de altura)
- Texto informativo: "Você pode resgatar 1 drink por semana"

**Funcionalidade**:
- Consome endpoint `/bares/:id`
- Botão "Resgatar" faz POST para `/resgatar/:barId`
- Valida se usuário já resgatou nos últimos 7 dias
- Mostra feedback: sucesso (verde), erro (vermelho), ou "Próximo resgate em X dias"
- Haptic feedback ao resgatar

---

### 4. **Profile Screen** (Histórico de Resgates)
**Rota**: `/(tabs)/profile`

**Conteúdo**:
- Header com foto/avatar do usuário (60x60pt)
- Nome e email do usuário
- Seção "Estatísticas":
  - Total de resgates
  - Último resgate (data)
  - Próximo resgate disponível (data)
- Seção "Histórico de Resgates":
  - Lista de resgates em ordem cronológica (mais recente primeiro):
    - Nome do bar
    - Drink resgatado
    - Data e hora
    - Ícone de confirmação (checkmark verde)
- Botão "Logout" (vermelho, rodapé)

**Funcionalidade**:
- Consome endpoint `/resgates/me`
- Exibe lista com FlatList
- Pull-to-refresh para atualizar histórico
- Mostra mensagem vazia se nenhum resgate

---

## Key User Flows

### Flow 1: Login
1. Usuário abre app → Tela de Login
2. Insere email e senha
3. Toca "Entrar"
4. App valida credenciais e armazena JWT
5. Navega para Home (lista de bares)

### Flow 2: Visualizar Bares
1. Usuário está em Home
2. Vê lista de bares com imagens e endereços
3. Toca em um bar
4. Navega para Detalhes do Bar

### Flow 3: Resgatar Drink
1. Usuário está em Detalhes do Bar
2. Vê botão "Resgatar Drink"
3. Toca no botão
4. App faz POST para `/resgatar/:barId`
5. Se sucesso: mostra feedback verde "Drink resgatado! Aproveite!"
6. Se erro (já resgatou): mostra "Próximo resgate em X dias"
7. Usuário pode voltar para Home ou ver Perfil

### Flow 4: Visualizar Histórico
1. Usuário toca na aba "Perfil"
2. Vê estatísticas e lista de resgates anteriores
3. Cada item mostra bar, drink, data e hora
4. Pode fazer pull-to-refresh para atualizar

---

## Layout Specifications

### Safe Area & Spacing
- **Top padding**: 20pt (header) + safe area
- **Bottom padding**: 20pt + safe area (home indicator)
- **Horizontal padding**: 16pt em ambos os lados
- **Grid**: 8pt (múltiplos de 8 para consistência)

### Component Sizes
- **Touch targets**: Mínimo 44pt × 44pt (Apple HIG)
- **Tab bar**: 49pt + safe area
- **Header**: 56pt (com padding)
- **Card border radius**: 12pt
- **Button border radius**: 8pt

### Images
- **Bar images**: 16:9 aspect ratio (recomendado)
- **Avatar**: 60×60pt, border-radius 30pt
- **Icons**: 24pt (body), 28pt (tabs), 32pt (headers)

---

## Navigation Structure

```
Root
├── (auth)
│   ├── login
│   └── signup
├── (tabs)
│   ├── index (Home)
│   ├── profile (Perfil)
│   └── _layout
├── bar
│   └── [id] (Detalhes do Bar)
└── oauth
    └── callback
```

---

## Accessibility

- **Text contrast**: WCAG AA (4.5:1 para body text)
- **Touch targets**: Mínimo 44×44pt
- **Icons**: Sempre acompanhados de labels em botões
- **Dark mode**: Suporte completo com cores ajustadas
- **Haptic feedback**: Confirmação ao resgatar drink

---

## Performance Considerations

- **FlatList**: Usar para listas de bares e resgates (não ScrollView)
- **Image caching**: Expo Image com cache automático
- **Lazy loading**: Carregar imagens sob demanda
- **Memoization**: React.memo para cards que não mudam frequentemente

---

## Future Enhancements

- Mapa integrado com localização de bares
- Filtros avançados (tipo de bebida, distância, avaliação)
- Notificações push quando novo resgate disponível
- Sistema de avaliação de bares
- Compartilhamento de resgates em redes sociais
- Programa de fidelidade (pontos, descontos)

