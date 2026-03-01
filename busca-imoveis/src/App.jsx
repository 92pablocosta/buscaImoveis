import { MapContainer, Polygon, Popup, TileLayer, useMapEvents } from "react-leaflet";
import { useMemo, useState } from "react";
import "./leafletFix";
import { gerarImoveis } from "./data/imoveis";

const SQRT3 = Math.sqrt(3);
const MAP_CENTER = [-7.115, -34.863];

function ZoomWatcher({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
}

function getHexRadiusByZoom(zoom) {
  if (zoom <= 11) return 1200;
  if (zoom <= 12) return 900;
  if (zoom <= 13) return 650;
  if (zoom <= 14) return 450;
  if (zoom <= 15) return 320;
  return 220;
}

function latLngToMeters(lat, lng, originLat, originLng) {
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos((originLat * Math.PI) / 180);
  return {
    x: (lng - originLng) * metersPerDegLng,
    y: (lat - originLat) * metersPerDegLat,
  };
}

function metersToLatLng(x, y, originLat, originLng) {
  const metersPerDegLat = 111320;
  const metersPerDegLng = 111320 * Math.cos((originLat * Math.PI) / 180);
  return {
    lat: y / metersPerDegLat + originLat,
    lng: x / metersPerDegLng + originLng,
  };
}

function axialRound(q, r) {
  let x = q;
  let z = r;
  let y = -x - z;

  let rx = Math.round(x);
  let ry = Math.round(y);
  let rz = Math.round(z);

  const xDiff = Math.abs(rx - x);
  const yDiff = Math.abs(ry - y);
  const zDiff = Math.abs(rz - z);

  if (xDiff > yDiff && xDiff > zDiff) {
    rx = -ry - rz;
  } else if (yDiff > zDiff) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  return { q: rx, r: rz };
}

function getHexCorners(centerX, centerY, hexRadius, originLat, originLng) {
  const corners = [];

  for (let i = 0; i < 6; i += 1) {
    const angle = ((60 * i - 30) * Math.PI) / 180;
    const x = centerX + hexRadius * Math.cos(angle);
    const y = centerY + hexRadius * Math.sin(angle);
    const { lat, lng } = metersToLatLng(x, y, originLat, originLng);
    corners.push([lat, lng]);
  }

  return corners;
}

function buildHexHeatmap(imoveis, hexRadius, originLat, originLng) {
  const cells = new Map();

  for (const imovel of imoveis) {
    const { x, y } = latLngToMeters(imovel.lat, imovel.lng, originLat, originLng);
    const q = (SQRT3 / 3 * x - y / 3) / hexRadius;
    const r = (2 / 3 * y) / hexRadius;
    const rounded = axialRound(q, r);
    const key = `${rounded.q}_${rounded.r}`;

    if (!cells.has(key)) {
      cells.set(key, { q: rounded.q, r: rounded.r, somaPrecos: 0, count: 0 });
    }

    const cell = cells.get(key);
    cell.somaPrecos += imovel.preco;
    cell.count += 1;
  }

  return Array.from(cells.values()).map((cell) => {
    const centerX = hexRadius * SQRT3 * (cell.q + cell.r / 2);
    const centerY = hexRadius * 1.5 * cell.r;
    const centerLatLng = metersToLatLng(centerX, centerY, originLat, originLng);
    const mediaPreco = Math.round(cell.somaPrecos / cell.count);

    return {
      key: `${cell.q}_${cell.r}`,
      count: cell.count,
      mediaPreco,
      center: [centerLatLng.lat, centerLatLng.lng],
      corners: getHexCorners(centerX, centerY, hexRadius, originLat, originLng),
    };
  });
}

function getCellColor(mediaPreco, faixaMin, faixaMax) {
  if (mediaPreco < faixaMin) return "#22c55e";
  if (mediaPreco <= faixaMax) return "#2563eb";
  return "#ef4444";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

function App() {
  const [imoveis] = useState(() => gerarImoveis(200));
  const [zoom, setZoom] = useState(13);
  const [precoMinInput, setPrecoMinInput] = useState("2500");
  const [precoMaxInput, setPrecoMaxInput] = useState("3500");

  const precoMin = Number(precoMinInput) || 0;
  const precoMax = Number(precoMaxInput) || 0;
  const faixaMin = Math.min(precoMin, precoMax);
  const faixaMax = Math.max(precoMin, precoMax);

  const heatmap = useMemo(() => {
    const hexRadius = getHexRadiusByZoom(zoom);
    return buildHexHeatmap(imoveis, hexRadius, MAP_CENTER[0], MAP_CENTER[1]);
  }, [imoveis, zoom]);

  return (
    <div className="map-shell">
      <aside className="map-controls">
        <h2>Heatmap de Preco</h2>
        <p>Defina a faixa alvo para colorir as celulas hexagonais.</p>

        <div className="range-inputs">
          <label htmlFor="preco-min">
            Minimo
            <input
              id="preco-min"
              type="number"
              min="0"
              step="100"
              value={precoMinInput}
              onChange={(e) => setPrecoMinInput(e.target.value)}
            />
          </label>

          <label htmlFor="preco-max">
            Maximo
            <input
              id="preco-max"
              type="number"
              min="0"
              step="100"
              value={precoMaxInput}
              onChange={(e) => setPrecoMaxInput(e.target.value)}
            />
          </label>
        </div>

        <p className="range-preview">
          Faixa ativa: {formatCurrency(faixaMin)} ate {formatCurrency(faixaMax)}
        </p>

        <ul className="legend">
          <li>
            <span className="legend-color below" />
            Abaixo da faixa (verde)
          </li>
          <li>
            <span className="legend-color in-range" />
            Dentro da faixa (azul)
          </li>
          <li>
            <span className="legend-color above" />
            Acima da faixa (vermelho)
          </li>
        </ul>
      </aside>

      <MapContainer center={MAP_CENTER} zoom={13} className="map-canvas">
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomWatcher onZoomChange={setZoom} />

        {heatmap.map((cell) => {
          const cellColor = getCellColor(cell.mediaPreco, faixaMin, faixaMax);

          return (
            <Polygon
              key={cell.key}
              positions={cell.corners}
              pathOptions={{
                color: cellColor,
                fillColor: cellColor,
                fillOpacity: 0.34,
                weight: 1,
              }}
            >
              <Popup>
                <strong>Regiao</strong>
                <br />
                Media: {formatCurrency(cell.mediaPreco)}
                <br />
                Imoveis: {cell.count}
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default App;
