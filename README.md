# 🏠 BuscaImóveis – MVP

Web application for visualizing rental properties in João Pessoa – PB (Brazil), focused on:

- 📍 Map-based property search  
- 💰 Airbnb-style price labels  
- 🌡️ Budget-based intelligent heatmap  
- 🔎 Automatic zoom-based transition between macro and detailed views  

---

## 🚀 Project Goal

Build a real estate web application centered on visual experience, where users can:

- View properties directly on the map  
- Instantly understand which areas fit their budget  
- Automatically switch between:
  - 🌡️ Heatmap (strategic overview)
  - 📍 Individual price markers (detailed view)

The key differentiator is the **budget-driven geographic heatmap**, inspired by the Uber Driver demand heatmap experience.

---

## 🧠 Product Concept

### 🔎 Macro View (Low Zoom)

- The map is divided into geographic grid cells  
- The average property price is calculated per cell  
- Areas are color-coded according to the user’s budget:

| Color | Meaning |
|-------|----------|
| 🟢 Green | Below budget |
| 🔵 Blue | Within budget range |
| 🔴 Red | Above budget |

---

### 📍 Detailed View (High Zoom)

- Individual property markers appear  
- Price is displayed directly on the map  
- Popup shows property information  

Experience inspired by Airbnb’s map interface.

---

## 🏗️ Tech Stack

### Frontend
- React (Vite)
- React Leaflet
- Leaflet

### Backend
- ❌ Not implemented (Fake MVP)
- Data generated dynamically (mock data)

---

## 📂 Project Structure

```
busca-imoveis/
│
├── src/
│   ├── data/
│   │   └── imoveis.js        # Mock property generator
│   │
│   ├── leafletFix.js         # Leaflet icon fix
│   │
│   ├── App.jsx               # Main map logic
│   ├── index.css             # Global styles and markers
│   └── main.jsx              # Entry point
│
└── package.json
```

---

## ⚙️ Implemented Features

### ✔ 1. Map Centered on João Pessoa

```js
const center = [-7.115, -34.863];
```

---

### ✔ 2. 200 Simulated Properties

- Distributed across neighborhoods  
- Region-based price variation  
- Realistic geographic spread using radius logic  

---

### ✔ 3. Custom Price Markers

- Custom `divIcon`
- Price formatted using `pt-BR`
- Styled label using:

```css
display: inline-block;
width: max-content;
```

This ensures proper layout rendering inside Leaflet.

---

### ✔ 4. Smart Zoom-Based Rendering

| Zoom Level | Behavior |
|------------|----------|
| < 13 | Heatmap |
| >= 13 | Individual price markers |

Implemented with:

```js
useMapEvents({
  zoomend: (e) => setZoom(e.target.getZoom())
});
```

---

### ✔ 5. Grid-Based Heatmap Algorithm

Algorithm steps:

1. Divide map into cells (`cellSize`)
2. Group properties by cell
3. Calculate average price
4. Compare against user budget
5. Apply color dynamically

---

## 🧮 Grid Logic

```js
const latKey = Math.floor(property.lat / cellSize) * cellSize;
const lngKey = Math.floor(property.lng / cellSize) * cellSize;
```

Ensures efficient spatial grouping.

---

## 🎨 Marker Styling

```css
.price-label {
  display: inline-block;
  width: max-content;
  padding: 8px 12px;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.22);
}
```

---

## 🧩 Region Classification Logic

```js
if (average <= budget * 0.85) green
else if (average > budget * 1.1) red
else blue
```

---

## 📌 Current Project Status

- ✔ Functional visual MVP  
- ✔ Dynamic heatmap  
- ✔ Airbnb-style price markers  
- ✔ Zoom-based rendering logic  
- ✔ Realistic mock data  

---

## 🔮 Roadmap

### 🔹 Short Term
- Dynamic budget slider
- Highlight properties within budget
- UX improvements (hover and active selection)

### 🔹 Mid Term
- Spring Boot backend
- PostgreSQL persistence
- Real property registration
- Authentication system

### 🔹 Long Term
- Real estate agency integrations
- Favorites system
- Advanced filtering
- Mobile optimization

---

## 🎯 Strategic Objective

Validate the concept of:

> "Geographically budget-oriented real estate search"

Before investing in backend architecture and external integrations.

---

## 🧑‍💻 Running the Project

```bash
npm install
npm run dev
```

---

## 📍 Current City

João Pessoa – PB, Brazil

Architecture designed for future multi-city scalability.
