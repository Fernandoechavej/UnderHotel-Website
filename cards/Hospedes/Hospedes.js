const SUPABASE_URL = "https://SEU-PROJETO.supabase.co";
const SUPABASE_PUBLIC_KEY = "COLE_A_CHAVE_PUBLICA_AQUI";
const PLACEHOLDER_IMAGE = "../../src/Placeholder_U.H._404.png";

const form = document.querySelector("#guest-form");
const submitButton = form.querySelector('button[type="submit"]');
const formStatus = document.querySelector("#form-status");
const listStatus = document.querySelector("#lista-status");
const cardsContainer = document.querySelector("#community-cards");
const previewContainer = document.querySelector("#guest-preview");
const tabs = Array.from(document.querySelectorAll(".community-tab"));
const panels = Array.from(document.querySelectorAll(".community-tabpanel"));

function isSupabaseConfigured() {
    return SUPABASE_URL.startsWith("https://")
        && !SUPABASE_URL.includes("SEU-PROJETO")
        && SUPABASE_PUBLIC_KEY.length > 20
        && !SUPABASE_PUBLIC_KEY.includes("COLE_A_CHAVE");
}

function setActiveTab(tab) {
    tabs.forEach((currentTab) => {
        const selected = currentTab === tab;
        currentTab.setAttribute("aria-selected", String(selected));
        currentTab.tabIndex = selected ? 0 : -1;
    });

    panels.forEach((panel) => {
        panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });

    if (tab.id === "tab-lista") {
        loadApprovedCards();
    }
}

function makeCard(cardData) {
    const article = document.createElement("article");
    article.className = "community-card";

    const title = document.createElement("h3");
    title.textContent = cardData.character_name || "Ficha da comunidade";
    article.append(title);

    const body = document.createElement("div");
    body.className = "community-card-body";

    const image = document.createElement("img");
    image.className = "community-card-image";
    image.src = cardData.image_url || PLACEHOLDER_IMAGE;
    image.alt = `Imagem de ${cardData.character_name}`;
    image.addEventListener("error", () => {
        image.src = PLACEHOLDER_IMAGE;
    }, { once: true });
    body.append(image);

    const details = document.createElement("div");
    details.className = "community-card-details";
    if (cardData.ficha_text) {
        const ficha = document.createElement("pre");
        ficha.className = "community-card-ficha";
        ficha.textContent = cardData.ficha_text;
        details.append(ficha);
    } else if (cardData.creator_name) {
        const creator = document.createElement("p");
        creator.textContent = `Criado por: ${cardData.creator_name}`;
        details.append(creator);
    }

    if (!cardData.ficha_text) {
        const fields = [
            ["Idade", cardData.age],
            ["Raça ou espécie", cardData.species],
            ["Aparência", cardData.appearance],
            ["Personalidade", cardData.personality],
            ["Habilidades ou poderes", cardData.powers],
            ["História", cardData.backstory],
        ];

        fields.forEach(([label, value]) => {
            if (!value) {
                return;
            }

            const field = document.createElement("section");
            field.className = "community-field";
            const heading = document.createElement("h4");
            heading.textContent = label;
            const content = document.createElement("p");
            content.textContent = value;
            field.append(heading, content);
            details.append(field);
        });
    }

    body.append(details);
    article.append(body);
    return article;
}

function getFormData() {
    const data = Object.fromEntries(new FormData(form).entries());
    Object.keys(data).forEach((key) => {
        data[key] = String(data[key]).trim();
    });

    let imageUrl;
    try {
        imageUrl = new URL(data.image_url);
    } catch {
        throw new Error("Informe um link de imagem válido usando https://.");
    }
    if (imageUrl.protocol !== "https:") {
        throw new Error("O link da imagem precisa começar com https://.");
    }

    const lines = data.ficha_text.split(/\r?\n/);
    const nameLabelIndex = lines.findIndex((line) => line.includes("Nome e sobrenome"));
    const nameAnswer = nameLabelIndex === -1 ? "" : lines[nameLabelIndex + 1] || "";
    const arrowIndex = nameAnswer.indexOf("↳");
    data.character_name = arrowIndex === -1 ? "" : nameAnswer.slice(arrowIndex + 1).trim();
    if (!data.character_name) {
        throw new Error("Preencha o nome do personagem depois da seta ↳ em “Nome e sobrenome”.");
    }

    return data;
}

async function loadApprovedCards() {
    if (!isSupabaseConfigured()) {
        listStatus.textContent = "A conexão com o Supabase ainda não foi configurada. As fichas aprovadas aparecerão aqui após a configuração.";
        return;
    }

    listStatus.textContent = "Carregando fichas aprovadas...";
    try {
        const url = new URL(`${SUPABASE_URL}/rest/v1/guest_cards`);
        url.search = new URLSearchParams({
            select: "character_name,creator_name,image_url,ficha_text,age,species,appearance,personality,powers,backstory",
            status: "eq.approved",
            order: "created_at.desc",
            limit: "100",
        });
        const response = await fetch(url, {
            headers: {
                apikey: SUPABASE_PUBLIC_KEY,
                Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
            },
        });

        if (!response.ok) {
            throw new Error(`O Supabase respondeu com o status ${response.status}.`);
        }

        const cards = await response.json();
        cardsContainer.replaceChildren(...cards.map(makeCard));
        listStatus.textContent = cards.length
            ? `${cards.length} ficha(s) aprovada(s).`
            : "Ainda não há fichas aprovadas da comunidade.";
    } catch (error) {
        console.error("Não foi possível carregar as fichas da comunidade.", error);
        listStatus.textContent = "Não foi possível carregar as fichas. Verifique a configuração e tente novamente.";
    }
}

tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => setActiveTab(tab));
    tab.addEventListener("keydown", (event) => {
        let nextIndex;
        if (event.key === "ArrowRight") {
            nextIndex = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = tabs.length - 1;
        } else {
            return;
        }

        event.preventDefault();
        tabs[nextIndex].focus();
        setActiveTab(tabs[nextIndex]);
    });
});

document.querySelector("#preview-button").addEventListener("click", () => {
    formStatus.textContent = "";
    try {
        const card = getFormData();
        previewContainer.replaceChildren(makeCard(card));
    } catch (error) {
        formStatus.textContent = error.message;
    }
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formStatus.textContent = "";

    if (!isSupabaseConfigured()) {
        formStatus.textContent = "O envio ainda não está disponível: a equipe precisa configurar o projeto Supabase nesta página.";
        return;
    }

    let card;
    try {
        card = getFormData();
    } catch (error) {
        formStatus.textContent = error.message;
        return;
    }

    submitButton.disabled = true;
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/guest_cards`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_PUBLIC_KEY,
                Authorization: `Bearer ${SUPABASE_PUBLIC_KEY}`,
                "Content-Type": "application/json",
                Prefer: "return=minimal",
            },
            body: JSON.stringify({ ...card, status: "pending" }),
        });

        if (!response.ok) {
            throw new Error(`O Supabase respondeu com o status ${response.status}.`);
        }

        form.reset();
        previewContainer.replaceChildren();
        formStatus.textContent = "Ficha enviada! Ela aparecerá na lista depois de ser aprovada.";
    } catch (error) {
        console.error("Não foi possível enviar a ficha.", error);
        formStatus.textContent = "Não foi possível enviar a ficha. Verifique a conexão e tente novamente.";
    } finally {
        submitButton.disabled = false;
    }
});

loadApprovedCards();
