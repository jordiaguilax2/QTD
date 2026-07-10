// app.js - Lògica principal de l'aplicació d'itinerari

let dadesViatge = null;
let viatgeActual = null;

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

function inicialitzarAplicacio() {
    if (!viatgeActual) return;
    document.title = `Itinerari ${viatgeActual.destinacio} | ${viatgeActual.dates}`;
    generarPestanyes(viatgeActual);
    mostrarDia(viatgeActual.dies[0]);
    configurarEsdeveniments();
}

function generarPestanyes(viatge) {
    const tabsContainer = document.getElementById('tabsList');
    tabsContainer.innerHTML = '';
    
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
    
    const botoChecklist = document.createElement('button');
    botoChecklist.className = 'tab-button';
    botoChecklist.innerHTML = `<i class="fas fa-tasks"></i> Checklist`;
    botoChecklist.addEventListener('click', () => {
        mostrarChecklist();
        activarPestanya(botoChecklist);
    });
    tabsContainer.appendChild(botoChecklist);
    
    const botoVols = document.createElement('button');
    botoVols.className = 'tab-button';
    botoVols.innerHTML = `<i class="fas fa-plane"></i> Vols`;
    botoVols.addEventListener('click', () => {
        mostrarVols();
        activarPestanya(botoVols);
    });
    tabsContainer.appendChild(botoVols);
    
    const botoContactes = document.createElement('button');
    botoContactes.className = 'tab-button';
    botoContactes.innerHTML = `<i class="fas fa-address-book"></i> Contactes`;
    botoContactes.addEventListener('click', () => {
        mostrarContactes();
        activarPestanya(botoContactes);
    });
    tabsContainer.appendChild(botoContactes);
    
    const botoTemps = document.createElement('button');
    botoTemps.className = 'tab-button';
    botoTemps.innerHTML = `<i class="fas fa-cloud-sun"></i> Temps`;
    botoTemps.addEventListener('click', () => {
        mostrarTemps();
        activarPestanya(botoTemps);
    });
    tabsContainer.appendChild(botoTemps);
    
    // Pestanya Extres (Formentor)
    const botoExtres = document.createElement('button');
    botoExtres.className = 'tab-button';
    botoExtres.innerHTML = `<i class="fas fa-info-circle"></i> Extres`;
    botoExtres.addEventListener('click', () => {
        mostrarExtres();
        activarPestanya(botoExtres);
    });
    tabsContainer.appendChild(botoExtres);
}

function activarPestanya(pestanya) {
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    pestanya.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarDia(dia) {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title"><i class="fas fa-${obtenirIconaDia(dia.numero)}"></i> ${dia.titol}</h2>
        <p class="day-date"><i class="fas fa-clock"></i> ${dia.data}</p>
        ${dia.notesDia ? `<div class="day-notes"><i class="fas fa-info-circle"></i> ${dia.notesDia}</div>` : ''}
    `;
    
    dayContent.innerHTML = '';
    
    if (dia.plaNou) {
        const comparativaContainer = document.createElement('div');
        comparativaContainer.className = 'comparativa-container';
        
        const colOriginal = document.createElement('div');
        colOriginal.className = 'comparativa-columna original';
        let originalHTML = `<h3><i class="fas fa-route"></i> Opció A</h3><ul>`;
        if (dia.franges && dia.franges.length > 0) {
            dia.franges.forEach(franja => {
                originalHTML += `<li><strong>${franja.horari}</strong> — ${franja.activitat}</li>`;
            });
        } else {
            originalHTML += `<li>No hi ha activitats programades.</li>`;
        }
        originalHTML += `</ul>`;
        if (dia.enllacRuta) {
            originalHTML += `<a href="${dia.enllacRuta}" target="_blank" rel="noopener noreferrer" class="ruta-link"><i class="fas fa-hiking"></i> Veure ruta a Wikiloc</a>`;
        }
        colOriginal.innerHTML = originalHTML;
        comparativaContainer.appendChild(colOriginal);
        
        const colNou = document.createElement('div');
        colNou.className = 'comparativa-columna nou';
        let nouHTML = `<h3><i class="fas fa-map-signs"></i> ${dia.plaNou.titol}</h3><ul>`;
        if (dia.plaNou.horaris && dia.plaNou.horaris.length > 0) {
            dia.plaNou.horaris.forEach(activitat => {
                nouHTML += `<li>${activitat}</li>`;
            });
        } else {
            nouHTML += `<li>No hi ha horaris definits per a aquesta opció.</li>`;
        }
        nouHTML += `</ul>`;
        if (dia.plaNou.enllacRuta) {
            nouHTML += `<a href="${dia.plaNou.enllacRuta}" target="_blank" rel="noopener noreferrer" class="ruta-link"><i class="fas fa-hiking"></i> Veure ruta a Wikiloc</a>`;
        }
        colNou.innerHTML = nouHTML;
        comparativaContainer.appendChild(colNou);
        
        dayContent.appendChild(comparativaContainer);
    } else {
        const plaContainer = document.createElement('div');
        plaContainer.className = 'comparativa-container';
        
        const colUnica = document.createElement('div');
        colUnica.className = 'comparativa-columna original';
        colUnica.style.borderLeftColor = '#2a5a4a';
        colUnica.style.flex = '1';
        
        let html = `<h3><i class="fas fa-calendar-check"></i> Pla del dia</h3><ul>`;
        if (dia.franges && dia.franges.length > 0) {
            dia.franges.forEach(franja => {
                html += `<li><strong>${franja.horari}</strong> — ${franja.activitat}</li>`;
            });
        } else {
            html += `<li>No hi ha activitats programades.</li>`;
        }
        html += `</ul>`;
        
        if (dia.enllacRuta) {
            html += `<a href="${dia.enllacRuta}" target="_blank" rel="noopener noreferrer" class="ruta-link" style="margin-top: 1rem; display: inline-block;"><i class="fas fa-hiking"></i> Veure ruta a Wikiloc</a>`;
        }
        
        colUnica.innerHTML = html;
        plaContainer.appendChild(colUnica);
        dayContent.appendChild(plaContainer);
    }
    
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

function mostrarChecklist() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title"><i class="fas fa-tasks"></i> Checklist del Viatge</h2>
        <p class="day-date"><i class="fas fa-check-circle"></i> Marca els elements que ja tinguis preparats</p>
    `;
    
    if (!viatgeActual.checklistGeneral || viatgeActual.checklistGeneral.length === 0) {
        dayContent.innerHTML = '<p>No hi ha elements a la checklist.</p>';
        return;
    }
    
    const container = document.createElement('div');
    container.className = 'checklist-container';
    
    let html = '<div class="checklist-list">';
    viatgeActual.checklistGeneral.forEach((item, index) => {
        const id = `checklist-${index}`;
        const checked = localStorage.getItem(id) === 'true' ? 'checked' : '';
        html += `
            <div class="checklist-item" data-index="${index}">
                <input type="checkbox" id="${id}" ${checked}>
                <label for="${id}" class="checklist-text">${item}</label>
            </div>
        `;
    });
    html += '</div>';
    
    const total = viatgeActual.checklistGeneral.length;
    const completed = viatgeActual.checklistGeneral.filter((_, i) => 
        localStorage.getItem(`checklist-${i}`) === 'true'
    ).length;
    html += `
        <div class="checklist-progress">
            <i class="fas fa-chart-simple"></i> Progrés: <span>${completed}</span> / <span>${total}</span> elements completats
        </div>
    `;
    
    container.innerHTML = html;
    
    container.querySelectorAll('.checklist-item input[type="checkbox"]').forEach(input => {
        input.addEventListener('change', function() {
            const id = this.id;
            localStorage.setItem(id, this.checked);
            actualitzarProgres(container);
        });
    });
    
    dayContent.innerHTML = '';
    dayContent.appendChild(container);
}

function actualitzarProgres(container) {
    const items = container.querySelectorAll('.checklist-item');
    const total = items.length;
    let completed = 0;
    items.forEach(item => {
        const checkbox = item.querySelector('input[type="checkbox"]');
        if (checkbox && checkbox.checked) {
            completed++;
        }
    });
    const progressSpan = container.querySelector('.checklist-progress span:first-of-type');
    if (progressSpan) {
        progressSpan.textContent = completed;
    }
}

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

function mostrarTemps() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `<h2 class="day-title"><i class="fas fa-cloud-sun"></i> Temps a Mallorca</h2><p class="day-date"><i class="fas fa-sync-alt"></i> Dades en temps real</p>`;
    
    dayContent.innerHTML = `<div class="loading-message"><i class="fas fa-spinner fa-spin"></i><p>Carregant dades meteorològiques...</p></div>`;
    
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

function mostrarExtres() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title"><i class="fas fa-info-circle"></i> Extres: Platja de Formentor</h2>
        <p class="day-date">🚧 Si us ve de gust, aquí teniu la informació</p>
    `;
    
    dayContent.innerHTML = `
        <div class="day-info-panel" style="border-left-color: #e67e22;">
            <h4><i class="fas fa-triangle-exclamation"></i> Restriccions 2026</h4>
            <div class="contact-info">
                <p>Del 15 de maig al 18 d'octubre, de 10:00 a 22:00, l'accés amb vehicle privat a la MA-2210 està restringit.</p>
                <p>La barrera (km 8,7) es tanca quan l'aparcament (300 places) és ple.</p>
                <p><strong>Multes:</strong> De 100 a 200 € per accés no autoritzat.</p>
            </div>
        </div>
        <div class="day-info-panel" style="border-left-color: #3498db;">
            <h4><i class="fas fa-lightbulb"></i> Com anar-hi</h4>
            <div class="contact-info">
                <p><strong>Horari recomanat:</strong> Cal sortir d'Alaró a les 7:30 i arribar abans de les 9:00 per trobar aparcament.</p>
                <p>Si la barrera està tancada, gireu cua i aneu a <strong>Cala Sant Vicenç</strong> o <strong>Platja de Muro</strong>.</p>
            </div>
        </div>
        <div class="day-info-panel" style="border-left-color: #2ecc71;">
            <h4><i class="fas fa-bus"></i> Alternativa en transport públic</h4>
            <div class="contact-info">
                <p>Bus TIB línia 334 (Alcúdia-Formentor) durant les hores de restricció.</p>
                <p><a href="https://www.tib.org" target="_blank" rel="noopener noreferrer" class="contact-link">Veure horaris a TIB</a></p>
            </div>
        </div>
    `;
}

function obtenirIconaDia(numeroDia) {
    const icones = ['plane', 'sun', 'mountain', 'umbrella-beach', 'plane-departure'];
    return icones[numeroDia - 1] || 'calendar-day';
}

function configurarEsdeveniments() {
    console.log('Aplicació d\'itinerari carregada correctament');
}

document.addEventListener('DOMContentLoaded', carregarDadesViatge);
