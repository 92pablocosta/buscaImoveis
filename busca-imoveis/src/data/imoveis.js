export const bairros = [
  { nome: "Tambaú", lat: -7.1133, lng: -34.8236, base: 3500, raio: 1200 },
  { nome: "Manaíra", lat: -7.1065, lng: -34.8355, base: 3200, raio: 1500 },
  { nome: "Bessa", lat: -7.0900, lng: -34.8410, base: 2500, raio: 2000 },
  { nome: "Altiplano", lat: -7.1280, lng: -34.8400, base: 5000, raio: 1800 },
  { nome: "Bancários", lat: -7.1520, lng: -34.8650, base: 1800, raio: 2500 },
  { nome: "Cristo", lat: -7.1410, lng: -34.8730, base: 1500, raio: 2200 },
  { nome: "Torre", lat: -7.1200, lng: -34.8700, base: 2200, raio: 2000 },
];

function gerarCoordenadaAleatoria(lat, lng, raioEmMetros) {
  const raioEmGraus = raioEmMetros / 111300; // conversão aproximada metros → graus

  const u = Math.random();
  const v = Math.random();
  const w = raioEmGraus * Math.sqrt(u);
  const t = 2 * Math.PI * v;

  const newLat = lat + w * Math.cos(t);
  const newLng = lng + w * Math.sin(t);

  return { newLat, newLng };
}

export function gerarImoveis(qtd = 200) {
  const lista = [];

  for (let i = 0; i < qtd; i++) {
    const bairro = bairros[Math.floor(Math.random() * bairros.length)];

    const preco = Math.round(
      bairro.base * (0.7 + Math.random() * 0.6)
    );

    const { newLat, newLng } = gerarCoordenadaAleatoria(
      bairro.lat,
      bairro.lng,
      bairro.raio
    );

    lista.push({
      id: i,
      titulo: `Apartamento em ${bairro.nome}`,
      preco,
      lat: newLat,
      lng: newLng,
      bairro: bairro.nome,
    });
  }

  return lista;
}