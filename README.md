# festasearraiais_submit_new

Novo formulário público de submissão de eventos para [Festas & Arraiais](https://festasearraiais.pt).

Refaz o projeto PHP `festasearraiais_submit` com a mesma stack do `festasearraiais_website_new`.

---

## Stack

- **Next.js 16** — App Router, Server + Client Components
- **TypeScript** — tipagem estrita
- **Tailwind CSS v4** — mesmo design system do `website_new`
- **Leaflet / react-leaflet** — mapa para selecção de lat/lon
- **Barlow + Raleway** — fontes da marca
- Sem Zod, sem React Hook Form — validação custom consistente com `website_new`

---

## Campos do formulário

Todos os campos são herdados fielmente do `festasearraiais_submit` (PHP):

| Campo | Tipo | Obrigatório | Notas |
|---|---|---|---|
| `eventName` | texto | ✅ | max 256 |
| `district` | select | ✅ | ID do distrito |
| `city` | select | ✅ | cascade por district |
| `township` | select | ✅ | cascade por city |
| `place` | texto | ✅ | max 128 |
| `category` | select | ✅ | ID da categoria |
| `start_date` | date | ✅ | YYYY-MM-DD |
| `end_date` | date | ✅ | YYYY-MM-DD |
| `duration` | número | ✅ | calculado auto |
| `lat` | float | ✅ | via mapa ou manual |
| `lon` | float | ✅ | via mapa ou manual |
| `image_url` | url | *ou* | exclusão mútua com image_up |
| `image_up` | file | *ou* | jpg/png/webp, max 3MB |
| `description` | textarea | ✅ | min 10, max 6192 |
| `price` | texto | ❌ | max 10 |
| `website` | url | ❌ | |
| `email` | email | ❌ | |
| `contact` | tel | ❌ | max 9 dígitos |

---

## API

Submissão: `POST /v1/submited/events/event` → `festasearraiais_backoffice_api`

Dados auxiliares (público, sem auth):
- `GET /v1/public/districts`
- `GET /v1/public/cities/by-district/:id`
- `GET /v1/public/townships/by-city/:id`
- `GET /v1/public/categories`

---

## Setup local

```bash
# 1. Copia o ficheiro de env
cp .env.local.example .env.local
# edita NEXT_PUBLIC_BACKOFFICE_API_URL com a URL real da backoffice_api

# 2. Instala dependências
npm install

# 3. Dev
npm run dev
# → http://localhost:3000 → redireciona para /submeter

# 4. Build produção
npm run build
npm start
```

---

## Produção (PM2)

```bash
npm run build
pm2 start ecosystem.config.js --env production
```

### Nginx (proxy)

```nginx
server {
    server_name adicionar.festasearraiais.pt;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Estrutura de ficheiros

```
src/
  app/
    globals.css          # design tokens + estilos base (= website_new)
    layout.tsx           # RootLayout com Navbar + Footer
    page.tsx             # redirect → /submeter
    submeter/
      page.tsx           # Server Component: fetch districts+categories, render form
  components/
    Navbar.tsx           # header simplificado (link back to main site)
    Footer.tsx           # footer consistente com website_new
    SubmitForm/
      SubmitForm.tsx     # form principal (Client Component)
      SectionCard.tsx    # wrapper visual por secção
      FormField.tsx      # label + error + hint acessível
      LocationSelects.tsx # cascade district/city/township
      ImageInput.tsx     # mutual-exclusion URL/upload com preview
      MapModal.tsx       # modal Leaflet para lat/lon
      LeafletPicker.tsx  # Leaflet map (dynamic import, no SSR)
  hooks/
    useLocationCascade.ts # lógica da cascade
  lib/
    types.ts             # tipos: SubmitFormState, District, City, etc.
    api.ts               # client para backoffice_api
    validation.ts        # regras herdadas do PHP + API middleware
```

---

## Modificações no `festasearraiais_backoffice_api`

Ficheiros adicionados:
- `api/lib/categories.js` — query à tabela `category`
- `api/controllers/categoriesController.js`
- `api/routes/public.js` — rotas públicas sem auth

`index.js` — adicionado `require('./api/routes/public')(app)`

As rotas públicas expõem apenas dados read-only necessários ao formulário público.
Não há alteração de endpoints existentes nem autenticados.

---

## Decisões documentadas

| Decisão | Justificação |
|---|---|
| Sem Zod/RHF | Não estão em `website_new`; validação custom mantém consistência |
| `description` obrigatório | `validateEventCreation` exige min 10 chars; PHP não bloqueava mas API sim |
| Leaflet (não Google Maps) | Já em `website_new`; não precisa de API key |
| Redirect `/` → `/submeter` | URL canónica clara; mantém compatibilidade futura |
| `revalidate = 1800` | Dados de distritos/categorias mudam raramente; evita DB hits desnecessários |
| Image mutual exclusion | Comportamento exacto do PHP `index.php` |

## Pontos pendentes

- [ ] Configurar `.env.local` com `NEXT_PUBLIC_BACKOFFICE_API_URL` real
- [ ] Adicionar reCAPTCHA v3 ou Cloudflare Turnstile (quando activado na backoffice_api)
- [ ] Configurar nginx para `adicionar.festasearraiais.pt` → porta 3002
- [ ] Testar o endpoint `POST /v1/submited/events/event` com a API real
