Este Website foi Criado Por mim para uma Grande amiga minha, essa amiga é a criadora desse Incrível RPG e desse Universo, e é algo que ela 
deveria se orgulhar mais. e saber que eu faço parte desse universo e mundo? sempre da um sorriso no meu rosto.

https://fernandoechavej.github.io/UnderHotel-Website/

este é o Link do Site a cima

Creditos

Programador:
Criadora:
Artista-1:
Artista-2:
Artista-3:
Escritor:

Players:

## Fichas da comunidade

A aba de criação em `cards/Hospedes/Hospedes.Html` usa o Supabase para guardar fichas enviadas pelos visitantes. Para ativá-la:

1. Crie um projeto Supabase e execute `cards/Hospedes/supabase-guest-cards.sql` no SQL Editor. Se você já tinha criado a tabela, execute o arquivo novamente para adicionar o campo da ficha completa.
2. Em `cards/Hospedes/Hospedes.js`, substitua `SUPABASE_URL` e `SUPABASE_PUBLIC_KEY` pela URL do projeto e pela chave pública (anon/publishable).
3. Publique o site novamente. A página só lista fichas aprovadas; novos envios ficam como `pending`.
4. Revise os envios na tabela `guest_cards` pelo painel do Supabase e altere `status` para `approved` para publicar uma ficha.

O formulário pede somente o link da imagem e a ficha completa pré-preenchida; o nome do personagem é lido da resposta após a seta em “Nome e sobrenome”.

Não coloque a chave `service_role` no site. A política RLS permite que visitantes leiam somente fichas aprovadas e enviem fichas pendentes; não permite que alterem ou apaguem fichas.

Como o formulário aceita envios anônimos, a aprovação evita publicação automática, mas não impede spam. Antes de divulgar amplamente, configure proteção contra bots e limite de envios no backend.
