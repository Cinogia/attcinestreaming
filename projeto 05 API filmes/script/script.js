const banner = document.getElementById("banner");
const destaques = document.getElementById("destaques");
const maisBuscados = document.getElementById("mais-buscados");
const detalhe = document.getElementById("detalhe");

const apiKey = "b1b4187fe91ad28e7c4c17be4078a0f6"; // Nossa chave da api

// Busca dados da API
async function buscarFilmes(url) {
  const resposta = await fetch(url);
  const dados = await resposta.json();
  return dados.results;
}

// Exibe os filmes no carrossel de destaques ou mais buscados
function exibirFilmes(lista, container) {
  lista.forEach((filme) => {
    const card = document.createElement("div");
    card.classList.add("card");

    // Adiciona imagem do pôster ou uma imagem padrão se não houver
    const imagem = document.createElement("img");
    imagem.src = filme.poster_path
      ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
      : "https://via.placeholder.com/500x750?text=Sem+Imagem";

    // Quando clica no card, mostra os detalhes do filme
    card.onclick = () => exibirDetalhes(filme.id, filme.media_type || (filme.first_air_date ? "tv" : "movie"));
    card.appendChild(imagem);
    container.appendChild(card);
  });
}

// Função principal para carregar os filmes assim que a página carrega
async function carregarFilmes() {
  // Filmes em alta
  const urlDestaques = `https://api.themoviedb.org/3/trending/all/week?api_key=${apiKey}&language=pt-BR`;
  const filmesDestaques = await buscarFilmes(urlDestaques);
  exibirFilmes(filmesDestaques, destaques);

  // 🔍 Filmes mais populares
  const urlMaisBuscados = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=pt-BR`;
  const filmesMaisBuscados = await buscarFilmes(urlMaisBuscados);
  exibirFilmes(filmesMaisBuscados, maisBuscados);
}

// Função para mostrar os detalhes de um filme ou série ao clicar
async function exibirDetalhes(id, tipo) {
  const url = `https://api.themoviedb.org/3/${tipo}/${id}?api_key=${apiKey}&language=pt-BR&append_to_response=videos,credits`;
  const resposta = await fetch(url);
  const filme = await resposta.json();

  //  Oculta o conteúdo anterior
  banner.style.display = "none";
  destaques.style.display = "none";
  maisBuscados.style.display = "none";
  detalhe.style.display = "flex";

  // Trailer do filme/série
  const trailer = filme.videos.results.find(video => video.type === "Trailer" && video.site === "YouTube");

  //  Elenco (atores principais)
  const elenco = filme.credits.cast.slice(0, 5).map(ator => ator.name).join(", ");

  //  Criador (apenas se for série)
  const criador = Array.isArray(filme.created_by) && filme.created_by.length > 0
    ? filme.created_by[0].name
    : "Desconhecido";

  //  Atualiza o conteúdo da seção de detalhes
  detalhe.innerHTML = `
    <div class="detalhes">
      <h2>${filme.title || filme.name}</h2>
      <p class="descricao">${filme.overview}</p>
      <p class="info"><b class="info1">Elenco:</b> ${elenco}</p>
      <p class="info"><b class="att1">Criador:</b> ${criador}</p>
      <button class="voltar" onclick="voltar()">Voltar</button>
    </div>
    <div class="trailer">
      ${
        trailer
          ? `<iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1" 
              frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`
          : "<p>Trailer não disponível</p>"
      }
    </div>
  `;
}

// Volta à tela principal (carrosséis)
function voltar() {
  banner.style.display = "flex";
  destaques.style.display = "flex";
  maisBuscados.style.display = "flex";
  detalhe.style.display = "none";
  detalhe.innerHTML = ""; // 🧹 Limpa o conteúdo da seção de detalhes
}

//  Função para buscar filmes ou séries digitados pelo usuário
async function buscar() {
  const termo = document.getElementById("busca").value;
  const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=pt-BR&query=${encodeURIComponent(termo)}`;
  const resultados = await buscarFilmes(url);

  //  Oculta seções antigas
  banner.style.display = "none";
  destaques.style.display = "none";
  maisBuscados.style.display = "none";
  detalhe.style.display = "flex";
  detalhe.innerHTML = "";

  //  Mostra os resultados da busca
  resultados.forEach((filme) => {
    const card = document.createElement("div");
    card.classList.add("card");

    const imagem = document.createElement("img");
    imagem.src = filme.poster_path
      ? `https://image.tmdb.org/t/p/w500${filme.poster_path}`
      : "https://via.placeholder.com/500x750?text=Sem+Imagem";

    card.onclick = () => exibirDetalhes(filme.id, filme.media_type || (filme.first_air_date ? "tv" : "movie"));
    card.appendChild(imagem);
    detalhe.appendChild(card);
  });
}

// Chama a função principal assim que a página carrega
carregarFilmes();
