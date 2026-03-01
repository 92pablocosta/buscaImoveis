import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  Rectangle,
} from "react-leaflet";
import "./leafletFix";
import { gerarImoveis } from "./data/imoveis";
import L from "leaflet";
import { useMemo, useState } from "react";

function ZoomWatcher({ onZoomChange }) {
  useMapEvents({
    zoomend: (e) => onZoomChange(e.target.getZoom()),
  });
  return null;
}

function gerarGrid(imoveis, cellSize) {
  const grid = {};

  for (const imovel of imoveis) {
    const latKey = Math.floor(imovel.lat / cellSize) * cellSize;
    const lngKey = Math.floor(imovel.lng / cellSize) * cellSize;
    const key = `${latKey}_${lngKey}`;

    if (!grid[key]) {
      grid[key] = { lat: latKey, lng: lngKey, valores: [] };
    }

    grid[key].valores.push(imovel.preco);
  }

  return Object.values(grid);
}

function App() {
  const center = [-7.115, -34.863];

  const [imoveis] = useState(() => gerarImoveis(200));
  const [zoom, setZoom] = useState(13);
  const [orcamento] = useState(3000);

  const CELL_SIZE = 0.01;

  const grid = useMemo(() => gerarGrid(imoveis, CELL_SIZE), [imoveis]);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomWatcher onZoomChange={setZoom} />

        {/* HEATMAP (zoom baixo) */}
        {zoom < 13 &&
          grid.map((celula, index) => {
            const media =
              celula.valores.reduce((a, b) => a + b, 0) / celula.valores.length;

            let color = "blue";
            if (media <= orcamento * 0.85) color = "green";
            else if (media > orcamento * 1.1) color = "red";

            const bounds = [
              [celula.lat, celula.lng],
              [celula.lat + CELL_SIZE, celula.lng + CELL_SIZE],
            ];

            return (
              <Rectangle
                key={index}
                bounds={bounds}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.25,
                  weight: 0,
                }}
              />
            );
          })}

        {/* PREÇOS (zoom alto) */}
        {zoom >= 13 &&
          imoveis.map((imovel) => {
            const priceIcon = L.divIcon({
              className: "price-marker",
              html: `<div class="price-label">R$ ${imovel.preco}</div>`,
              iconSize: [0, 0],
              iconAnchor: [0, 0],
            });

            return (
              <Marker
                key={imovel.id}
                position={[imovel.lat, imovel.lng]}
                icon={priceIcon}
              >
                <Popup>
                  <strong>{imovel.titulo}</strong>
                  <br />
                  R$ {imovel.preco}
                  <br />
                  {imovel.bairro}
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

export default App;