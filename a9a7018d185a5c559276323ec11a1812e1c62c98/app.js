// app.js - Lògica principal de l'aplicació d'itinerari

let dadesViatge = null;
let viatgeActual = null;

// Carregar les dades del viatge
async function carregarDadesViatge() {
    try {
        const resposta = await fetch('viatge.json');
        if (!resposta.ok) {
            throw new Error(`Error en carregar les dades: ${resposta.status}`);
        }
        dadesViatge = await resposta.json();
        viatgeActual = dadesViatge.viatge;
        inicialitzarAplicacio();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('dayContent').innerHTML = 
            `<div class="error-message"><p>⚠️ No es van poder carregar les dades de l'itinerari.</p></div>`;
    }
}

// Inicialitzar l'aplicació
function inicialitzarAplicacio() {
    if (!viatgeActual) return;
    
    document.title = `Itinerari ${viatgeActual.destinacio} | ${viatgeActual.dates}`;
    
    generarPestanyes(viatgeActual);
    mostrarDia(viatgeActual.dies[0]);
    configurarEsdeveniments();
}

// Generar les pestanyes
function generarPestanyes(viatge) {
    const tabsContainer = document.getElementById('tabsList');
    tabsContainer.innerHTML = '';
    
    // Pestanyes per a cada dia
    viatge.dies.forEach((dia, index) => {
        const boto = document.createElement('button');
        boto.className = 'tab-button';
        boto.dataset.type = 'dia';
        boto.dataset.index = index;
        if (index === 0) boto.classList.add('active');
        boto.innerHTML = `<i class="fas fa-${obtenirIconaDia(dia.numero)}"></i> Dia ${dia.numero}`;
        boto.addEventListener('click', () => {
            mostrarDia(dia);
            activarPestanya(boto);
        });
        tabsContainer.appendChild(boto);
    });
    
    // Pestanya de Vols
    const botoVols = document.createElement('button');
    botoVols.className = 'tab-button';
    botoVols.innerHTML = `<i class="fas fa-plane"></i> Vols`;
    botoVols.addEventListener('click', () => {
        mostrarVols();
        activarPestanya(botoVols);
    });
    tabsContainer.appendChild(botoVols);
    
    // Pestanya de Contactes
    const botoContactes = document.createElement('button');
    botoContactes.className = 'tab-button';
    botoContactes.innerHTML = `<i class="fas fa-address-book"></i> Contactes`;
    botoContactes.addEventListener('click', () => {
        mostrarContactes();
        activarPestanya(botoContactes);
    });
    tabsContainer.appendChild(botoContactes);
    
    // Pestanya de Temps
    const botoTemps = document.createElement('button');
    botoTemps.className = 'tab-button';
    botoTemps.innerHTML = `<i class="fas fa-cloud-sun"></i> Temps`;
    botoTemps.addEventListener('click', () => {
        mostrarTemps();
        activarPestanya(botoTemps);
    });
    tabsContainer.appendChild(botoTemps);
}

function activarPestanya(pestanya) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    pestanya.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Mostrar el contingut d'un dia
function mostrarDia(dia) {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title"><i class="fas fa-${obtenirIconaDia(dia.numero)}"></i> ${dia.titol}</h2>
        <p class="day-date"><i class="fas fa-clock"></i> ${dia.data}</p>
        ${dia.notesDia ? `<div class="day-notes"><i class="fas fa-info-circle"></i> ${dia.notesDia}</div>` : ''}
    `;
    
    dayContent.innerHTML = '';
    
    // --- FRANGES HORÀRIES ---
    if (dia.franges && dia.franges.length > 0) {
        dia.franges.forEach(franja => {
            const franjaElement = document.createElement('div');
            franjaElement.className = 'time-slot';
            franjaElement.innerHTML = `
                <div class="time-range"><i class="far fa-clock"></i> ${franja.horari}</div>
                <h3 class="activity-title">${franja.activitat}</h3>
                ${franja.detalls ? `<p class="activity-details">${franja.detalls}</p>` : ''}
            `;
            dayContent.appendChild(franjaElement);
        });
    }
    
    // --- ENLLAÇ A LA RUTA DE WIKILOC (si n'hi ha) ---
    if (dia.enllacRuta) {
        const rutaSection = document.createElement('div');
        rutaSection.className = 'day-info-panel';
        rutaSection.style.borderLeftColor = '#e67e22';
        rutaSection.innerHTML = `
            <h4><i class="fas fa-hiking"></i> Ruta de senderisme</h4>
            <a href="${dia.enllacRuta}" target="_blank" rel="noopener noreferrer" class="contact-link" style="display: inline-flex; align-items: center; gap: 8px; font-size: 1rem; padding: 0.6rem 1.2rem;">
                <i class="fas fa-external-link-alt"></i> Veure ruta a Wikiloc
            </a>
            <p style="margin-top: 0.5rem; font-size: 0.85rem; color: #7f8c8d;">
                <i class="fas fa-info-circle"></i> Obre l'enllaç per veure el track, descarregar-lo o seguir-lo en directe.
            </p>
        `;
        dayContent.appendChild(rutaSection);
    }
    
    // --- RESTAURANTS DE DINAR ---
    if (dia.restaurantsDinar && dia.restaurantsDinar.length > 0) {
        const restaurantsSection = document.createElement('div');
        restaurantsSection.className = 'day-info-panel';
        let html = `<h4><i class="fas fa-utensils"></i> Restaurants recomanats per dinar</h4><div class="contact-list">`;
        dia.restaurantsDinar.forEach(r => {
            html += `<div class="contact-card">
                        <h4>${r.nom}</h4>
                        <div class="contact-info">
                            <p><i class="fas fa-star"></i> ${r.especialitat}</p>
                            <p><i class="fas fa-map-pin"></i> ${r.ubicacio}</p>
                            ${r.telefon && r.telefon !== "No disponible" ? `<p><i class="fas fa-phone"></i> ${r.telefon}</p>` : ''}
                            ${r.enllacMapa ? `<a href="${r.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure al mapa</a>` : ''}
                        </div>
                    </div>`;
        });
        html += `</div>`;
        restaurantsSection.innerHTML = html;
        dayContent.appendChild(restaurantsSection);
    }

    // --- RESTAURANTS DE SOPAR ---
    if (dia.restaurantsSopar && dia.restaurantsSopar.length > 0) {
        const restaurantsSection = document.createElement('div');
        restaurantsSection.className = 'day-info-panel';
        let html = `<h4><i class="fas fa-utensils"></i> Restaurants recomanats per sopar</h4><div class="contact-list">`;
        dia.restaurantsSopar.forEach(r => {
            html += `<div class="contact-card">
                        <h4>${r.nom}</h4>
                        <div class="contact-info">
                            <p><i class="fas fa-star"></i> ${r.especialitat}</p>
                            <p><i class="fas fa-map-pin"></i> ${r.ubicacio}</p>
                            ${r.telefon ? `<p><i class="fas fa-phone"></i> ${r.telefon}</p>` : ''}
                            ${r.enllacMapa ? `<a href="${r.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure al mapa</a>` : ''}
                        </div>
                    </div>`;
        });
        html += `</div>`;
        restaurantsSection.innerHTML = html;
        dayContent.appendChild(restaurantsSection);
    }
}

// Mostrar informació dels vols
function mostrarVols() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `<h2 class="day-title"><i class="fas fa-plane"></i> Informació dels Vols</h2>`;
    
    if (!viatgeActual.infoVol) {
        dayContent.innerHTML = '<p>No hi ha informació de vols disponible.</p>';
        return;
    }
    
    const vol = viatgeActual.infoVol;
    dayContent.innerHTML = `
        <div class="day-info-panel">
            <h4><i class="fas fa-plane-departure"></i> Vol d'Anada</h4>
            <div class="contact-info">
                <p><strong>Companyia:</strong> ${vol.anada.companyia} (${vol.anada.numeroVol})</p>
                <p><strong>Ruta:</strong> ${vol.anada.ruta}</p>
                <p><strong>Data:</strong> ${vol.anada.data}</p>
                <p><strong>Sortida:</strong> ${vol.anada.sortida} (${vol.anada.terminalSortida})</p>
                <p><strong>Arribada:</strong> ${vol.anada.arribada} (${vol.anada.terminalArribada})</p>
            </div>
        </div>
        <div class="day-info-panel">
            <h4><i class="fas fa-plane-arrival"></i> Vol de Tornada</h4>
            <div class="contact-info">
                <p><strong>Companyia:</strong> ${vol.tornada.companyia} (${vol.tornada.numeroVol})</p>
                <p><strong>Ruta:</strong> ${vol.tornada.ruta}</p>
                <p><strong>Data:</strong> ${vol.tornada.data}</p>
                <p><strong>Sortida:</strong> ${vol.tornada.sortida} (${vol.tornada.terminalSortida})</p>
                <p><strong>Arribada:</strong> ${vol.tornada.arribada} (${vol.tornada.terminalArribada})</p>
            </div>
        </div>
        <div class="day-info-panel">
            <h4><i class="fas fa-ticket-alt"></i> Localitzador de la Reserva</h4>
            <p><strong>Codi:</strong> ${vol.localitzador}</p>
            <p><i class="fas fa-info-circle"></i> ${vol.checkIn}</p>
        </div>
    `;
}

// Mostrar tots els contactes
function mostrarContactes() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `<h2 class="day-title"><i class="fas fa-address-book"></i> Contactes i Informació Útil</h2>`;
    
    if (!viatgeActual.contactesGenerals) {
        dayContent.innerHTML = '<p>No hi ha contactes disponibles.</p>';
        return;
    }
    
    const c = viatgeActual.contactesGenerals;
    let html = `<div class="contact-list">`;
    
    // Hotel
    if (c.hotel) {
        html += `<div class="contact-card">
                    <h4><i class="fas fa-hotel"></i> ${c.hotel.nom}</h4>
                    <div class="contact-info">
                        ${c.hotel.telefon ? `<p><i class="fas fa-phone"></i> ${c.hotel.telefon}</p>` : '<p><i class="fas fa-phone"></i> Telèfon no disponible</p>'}
                        <a href="${c.hotel.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure al mapa</a>
                        <p><i class="fas fa-ban"></i> Completament lliure de fum (no es pot fumar ni a les terrasses)</p>
                    </div>
                </div>`;
    }

    // Autos Mallorca (companyia de lloguer)
    if (c.companyiaLloguer) {
        html += `<div class="contact-card">
                    <h4><i class="fas fa-car"></i> ${c.companyiaLloguer.nom}</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> <strong>Telèfon:</strong> ${c.companyiaLloguer.telefon}</p>
                        <p><i class="fas fa-info-circle"></i> ${c.companyiaLloguer.condicions}</p>
                        <a href="${c.companyiaLloguer.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure al mapa</a>
                    </div>
                </div>`;
    }
    
    // Forn d'ensaimades
    if (c.fornEnsaimades) {
        html += `<div class="contact-card">
                    <h4><i class="fas fa-bread-slice"></i> ${c.fornEnsaimades.nom}</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> ${c.fornEnsaimades.telefon}</p>
                        <a href="${c.fornEnsaimades.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure al mapa</a>
                        <p><i class="fas fa-star"></i> No marxeu sense provar les ensaimades!</p>
                    </div>
                </div>`;
    }
    
    // Restaurants generals (si n'hi ha)
    if (c.restaurantsGenerals && c.restaurantsGenerals.length > 0) {
        c.restaurantsGenerals.forEach(r => {
            html += `<div class="contact-card">
                        <h4><i class="fas fa-utensils"></i> ${r.nom}</h4>
                        <div class="contact-info">
                            <p><i class="fas fa-star"></i> ${r.especialitat}</p>
                            <p><i class="fas fa-map-pin"></i> ${r.ubicacio}</p>
                            ${r.telefon && r.telefon !== "No trobat" ? `<p><i class="fas fa-phone"></i> ${r.telefon}</p>` : '<p><i class="fas fa-phone"></i> Telèfon no trobat</p>'}
                            <a href="${r.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure al mapa</a>
                        </div>
                    </div>`;
        });
    }
    
    // Lloc especial
    if (c.llocEspecial) {
        html += `<div class="contact-card">
                    <h4>${c.llocEspecial.nom}</h4>
                    <div class="contact-info">
                        <a href="${c.llocEspecial.enllacMapa}" target="_blank" class="contact-link"><i class="fas fa-map-marked-alt"></i> Veure ubicació al mapa</a>
                    </div>
                </div>`;
    }
    
    html += `</div>`;
    dayContent.innerHTML = html;
}

// Mostrar el temps
function mostrarTemps() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `<h2 class="day-title"><i class="fas fa-cloud-sun"></i> Temps a Mallorca</h2><p class="day-date"><i class="fas fa-sync-alt"></i> Dades en temps real</p>`;
    
    dayContent.innerHTML = `<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><p>Carregant dades meteorològiques...</p></div>`;
    
    // Clau de WeatherAPI.com (substitueix si cal)
    const API_KEY = '8ff63a61fb324802af290015262302';
    const location = 'Mallorca, Spain';
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=5&aqi=no&alerts=no&lang=ca`;
    
    fetch(url).then(response => {
        if (!response.ok) throw new Error('Error en carregar les dades');
        return response.json();
    }).then(data => {
        renderitzarTemps(data, dayContent);
    }).catch(error => {
        console.error('Error:', error);
        dayContent.innerHTML = `<div class="error-message"><p>⚠️ No s'han pogut carregar les dades meteorològiques.</p></div>`;
    });
}

function renderitzarTemps(data, container) {
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast.forecastday;
    
    let html = `<div class="weather-container">
        <div class="weather-current">
            <div class="weather-main">
                <img src="https:${current.condition.icon}" alt="${current.condition.text}" class="weather-icon-large">
                <div class="weather-temp-large">${current.temp_c}°C</div>
            </div>
            <p><strong>${current.condition.text}</strong></p>
            <div class="weather-details">
                <div class="weather-detail-item"><i class="fas fa-temperature-low"></i> Sensació: ${current.feelslike_c}°C</div>
                <div class="weather-detail-item"><i class="fas fa-tint"></i> Humitat: ${current.humidity}%</div>
                <div class="weather-detail-item"><i class="fas fa-wind"></i> Vent: ${current.wind_kph} km/h</div>
            </div>
        </div>
        <h4>Previsió per als propers dies</h4>
        <div class="weather-forecast">`;
    
    forecast.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('ca', { weekday: 'short' });
        html += `<div class="weather-forecast-day">
                    <div><strong>${dayName}</strong> ${day.date.split('-')[2]}/${day.date.split('-')[1]}</div>
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                    <div><span class="forecast-max">${day.day.maxtemp_c}°</span> / <span class="forecast-min">${day.day.mintemp_c}°</span></div>
                    <div>${day.day.condition.text}</div>
                </div>`;
    });
    
    html += `</div><div class="weather-attribution">Dades: WeatherAPI.com</div></div>`;
    container.innerHTML = html;
}

function obtenirIconaDia(numeroDia) {
    const icones = ['plane', 'sun', 'mountain', 'music', 'plane-departure'];
    return icones[numeroDia - 1] || 'calendar-day';
}

function configurarEsdeveniments() {
    console.log('Aplicació d\'itinerari carregada correctament');
}

document.addEventListener('DOMContentLoaded', carregarDadesViatge);
