// app.js - Lògica principal de l'aplicació d'itinerari (VERSIÓ COMPLETA)

// Variable global per emmagatzemar les dades del viatge
let dadesViatge = null;
let viatgeActual = null;

// Carregar les dades del viatge des de l'arxiu JSON
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
        mostrarError('No es van poder carregar les dades de l\'itinerari. Si us plau, verifiqueu que l\'arxiu viatge.json existeix.');
    }
}

// Mostrar missatge d'error
function mostrarError(missatge) {
    const dayContent = document.getElementById('dayContent');
    dayContent.innerHTML = 
        `<div class="error-message">
            <p><i class="fas fa-exclamation-circle"></i> ⚠️ ${missatge}</p>
        </div>`;
}

// Inicialitzar l'aplicació un cop carregades les dades
function inicialitzarAplicacio() {
    if (!viatgeActual) {
        mostrarError('Estructura de dades incorrecta al fitxer viatge.json.');
        return;
    }
    
    // Actualitzar el títol de la pàgina
    document.title = `Itinerari ${viatgeActual.destinacio} | ${viatgeActual.dates}`;
    
    // Generar les pestanyes de dies i les noves pestanyes
    generarPestanyes(viatgeActual);
    
    // Mostrar el primer dia per defecte
    mostrarDia(viatgeActual.dies[0]);
    
    // Configurar esdeveniments
    configurarEsdeveniments();
}

// Generar les pestanyes de navegació (dies + checklist + contactes)
function generarPestanyes(viatge) {
    const tabsContainer = document.getElementById('tabsList');
    tabsContainer.innerHTML = '';
    
    // 1. Pestanyes per a cada dia
    viatge.dies.forEach((dia, index) => {
        const boto = document.createElement('button');
        boto.className = 'tab-button';
        boto.dataset.type = 'dia';
        boto.dataset.index = index;
        
        if (index === 0) boto.classList.add('active');
        
        boto.innerHTML = `
            <i class="fas fa-${obtenirIconaDia(dia.numero)}"></i>
            Dia ${dia.numero}
        `;
        
        boto.addEventListener('click', () => {
            canviarPestanya('dia', dia);
            activarPestanya(boto);
        });
        
        tabsContainer.appendChild(boto);
    });
    
    // 2. Pestanya de Checklist
    const botoChecklist = document.createElement('button');
    botoChecklist.className = 'tab-button';
    botoChecklist.dataset.type = 'checklist';
    
    botoChecklist.innerHTML = `
        <i class="fas fa-tasks"></i>
        Checklist
    `;
    
    botoChecklist.addEventListener('click', () => {
        mostrarChecklist();
        activarPestanya(botoChecklist);
    });
    
    tabsContainer.appendChild(botoChecklist);
    
    // 3. Pestanya de Contactes
    const botoContactes = document.createElement('button');
    botoContactes.className = 'tab-button';
    botoContactes.dataset.type = 'contactes';
    
    botoContactes.innerHTML = `
        <i class="fas fa-address-book"></i>
        Contactes
    `;
    
    botoContactes.addEventListener('click', () => {
        mostrarContactes();
        activarPestanya(botoContactes);
    });
    
    tabsContainer.appendChild(botoContactes);

    // 4. Pestanya de Temps
    const botoTemps = document.createElement('button');
    botoTemps.className = 'tab-button';
    botoTemps.dataset.type = 'temps';
    
    botoTemps.innerHTML = `
        <i class="fas fa-cloud-sun"></i>
        Temps
    `;
    
    botoTemps.addEventListener('click', () => {
        mostrarTemps();
        activarPestanya(botoTemps);
    });
    
    tabsContainer.appendChild(botoTemps);
}

// Activar la pestanya clicada
function activarPestanya(pestanya) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    pestanya.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Canviar al contingut d'un dia
function canviarPestanya(tipus, contingut) {
    if (tipus === 'dia') {
        mostrarDia(contingut);
    }
}

// Mostrar el contingut d'un dia específic
function mostrarDia(dia) {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    // Capçalera del dia
    dayHeader.innerHTML = `
        <h2 class="day-title">
            <i class="fas fa-${obtenirIconaDia(dia.numero)}"></i>
            ${dia.titol}
        </h2>
        <p class="day-date"><i class="fas fa-clock"></i> ${dia.data}</p>
        ${dia.notesDia ? `<div class="day-notes"><i class="fas fa-info-circle"></i> ${dia.notesDia}</div>` : ''}
    `;
    
    // Contingut de les franges horàries
    dayContent.innerHTML = '';
    
    if (dia.franges && dia.franges.length > 0) {
        dia.franges.forEach(franja => {
            const franjaElement = document.createElement('div');
            franjaElement.className = 'time-slot';
            franjaElement.innerHTML = `
                <div class="time-range">
                    <i class="far fa-clock"></i> ${franja.horari}
                </div>
                <h3 class="activity-title">${franja.activitat}</h3>
                ${franja.detalls ? `<p class="activity-details">${franja.detalls}</p>` : ''}
            `;
            dayContent.appendChild(franjaElement);
        });
    } else {
        dayContent.innerHTML = '<p class="no-activities">No hi ha activitats programades per a aquest dia.</p>';
    }
    
    // Secció de permisos obligatoris (Dia 2)
    if (dia.permis && dia.permis.obligatori) {
        const permisSection = document.createElement('div');
        permisSection.className = 'day-info-panel';
        permisSection.innerHTML = `
            <h4><i class="fas fa-exclamation-triangle"></i> Permís Obligatori per a la ruta</h4>
            <div class="contact-info">
                <p><i class="fas fa-phone"></i> <strong>Contacte:</strong> ${dia.permis.contacte}</p>
                <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${dia.permis.email}</p>
                <p><i class="fas fa-calendar-alt"></i> <strong>Solicitar amb:</strong> ${dia.permis.antelacio} d'antelació</p>
            </div>
        `;
        dayContent.appendChild(permisSection);
    }
    
    // Enllaços especials (rutes i restaurants)
    const specialLinks = document.createElement('div');
    specialLinks.className = 'special-links';
    
    // Enllaç a la ruta de senderisme
    if (dia.enllacRuta) {
        const rutaLink = document.createElement('a');
        rutaLink.href = dia.enllacRuta;
        rutaLink.target = '_blank';
        rutaLink.rel = 'noopener noreferrer';
        rutaLink.className = 'link-button';
        rutaLink.innerHTML = '<i class="fas fa-hiking"></i> Veure ruta a Wikiloc';
        specialLinks.appendChild(rutaLink);
    }
    
    // Restaurants amb contacte i mapa (Dia 3)
    if (dia.restaurantsSopar && dia.restaurantsSopar.length > 0) {
        const restaurantsSection = document.createElement('div');
        restaurantsSection.className = 'day-info-panel';
        
        let restaurantsHTML = `
            <h4><i class="fas fa-utensils"></i> Restaurants recomanats per al sopar</h4>
            <div class="contact-list">
        `;
        
        dia.restaurantsSopar.forEach(restaurant => {
            const telefonHTML = restaurant.telefon ? 
                `<p><i class="fas fa-phone"></i> <strong>Telèfon:</strong> ${restaurant.telefon}</p>` : '';
            
            const mapaHTML = restaurant.enllacMapa ? 
                `<a href="${restaurant.enllacMapa}" target="_blank" rel="noopener noreferrer" class="contact-link">
                    <i class="fas fa-map-marked-alt"></i> Veure al mapa
                </a>` : '';
            
            restaurantsHTML += `
                <div class="contact-card">
                    <h4><i class="fas fa-store"></i> ${restaurant.nom}</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-star"></i> <strong>Especialitat:</strong> ${restaurant.especialitat}</p>
                        <p><i class="fas fa-map-pin"></i> <strong>Ubicació:</strong> ${restaurant.ubicacio}</p>
                        ${telefonHTML}
                        ${mapaHTML}
                    </div>
                </div>
            `;
        });
        
        restaurantsHTML += '</div>';
        restaurantsSection.innerHTML = restaurantsHTML;
        specialLinks.appendChild(restaurantsSection);
    }
    
    if (specialLinks.children.length > 0) {
        dayContent.appendChild(specialLinks);
    }
}

// Mostrar la pestanya de Checklist
function mostrarChecklist() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title">
            <i class="fas fa-tasks"></i>
            Checklist i Tasques Pendents
        </h2>
        <p class="day-date"><i class="fas fa-info-circle"></i> Tota la informació que necessites preparar abans del viatge</p>
    `;
    
    if (viatgeActual.checklistGeneral && viatgeActual.checklistGeneral.length > 0) {
        const checklistContainer = document.createElement('div');
        checklistContainer.className = 'checklist-container';
        
        let checklistHTML = '<div class="checklist-list">';
        
        viatgeActual.checklistGeneral.forEach((item, index) => {
            checklistHTML += `
                <div class="checklist-item" id="checklist-item-${index}">
                    <span>${item}</span>
                </div>
            `;
        });
        
        checklistHTML += '</div>';
        checklistContainer.innerHTML = checklistHTML;
        
        // Afegir funcionalitat per marcar com a completat
        checklistContainer.addEventListener('click', (e) => {
            const item = e.target.closest('.checklist-item');
            if (item) {
                item.classList.toggle('completed');
                
                // Guardar l'estat a localStorage
                const itemId = item.id;
                const estaCompletat = item.classList.contains('completed');
                localStorage.setItem(itemId, estaCompletat);
            }
        });
        
        // Restaurar estats des de localStorage
        setTimeout(() => {
            viatgeActual.checklistGeneral.forEach((_, index) => {
                const itemId = `checklist-item-${index}`;
                const itemElement = document.getElementById(itemId);
                if (itemElement && localStorage.getItem(itemId) === 'true') {
                    itemElement.classList.add('completed');
                }
            });
        }, 100);
        
        dayContent.innerHTML = '';
        dayContent.appendChild(checklistContainer);
    } else {
        dayContent.innerHTML = '<p>No hi ha elements a la checklist.</p>';
    }
}

// Mostrar la pestanya de Contactes
function mostrarContactes() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title">
            <i class="fas fa-address-book"></i>
            Contactes i Informació Útil
        </h2>
        <p class="day-date"><i class="fas fa-phone-alt"></i> Tots els telèfons i ubicacions en un sol lloc</p>
    `;
    
    if (viatgeActual.contactesGenerals) {
        const contactesContainer = document.createElement('div');
        
        let contactesHTML = '<div class="contact-list">';
        const contactes = viatgeActual.contactesGenerals;
        
        // Hotel
        if (contactes.hotel) {
            contactesHTML += `
                <div class="contact-card">
                    <h4><i class="fas fa-hotel"></i> ${contactes.hotel.nom}</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> <strong>Telèfon:</strong> ${contactes.hotel.telefon}</p>
                        <a href="${contactes.hotel.enllacMapa}" target="_blank" rel="noopener noreferrer" class="contact-link">
                            <i class="fas fa-map-marked-alt"></i> Veure ubicació al mapa
                        </a>
                        <p><i class="fas fa-info-circle"></i> Recordeu reservar aparcament amb antelació</p>
                    </div>
                </div>
            `;
        }
        
        // Permís de senderisme
        if (contactes.permisSenderisme) {
            contactesHTML += `
                <div class="contact-card">
                    <h4><i class="fas fa-hiking"></i> ${contactes.permisSenderisme.nom} (Permís senderisme)</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> <strong>Telèfon/WhatsApp:</strong> ${contactes.permisSenderisme.telefon}</p>
                        <p><i class="fas fa-envelope"></i> <strong>Email:</strong> ${contactes.permisSenderisme.email}</p>
                        <p><i class="fas fa-exclamation-triangle"></i> <strong>Important:</strong> Sol·licitar amb 2-6 dies d'antelació</p>
                    </div>
                </div>
            `;
        }
        
        // Forn d'ensaimades
        if (contactes.fornEnsaimades) {
            contactesHTML += `
                <div class="contact-card">
                    <h4><i class="fas fa-bread-slice"></i> ${contactes.fornEnsaimades.nom}</h4>
                    <div class="contact-info">
                        <p><i class="fas fa-phone"></i> <strong>Telèfon:</strong> ${contactes.fornEnsaimades.telefon}</p>
                        <a href="${contactes.fornEnsaimades.enllacMapa}" target="_blank" rel="noopener noreferrer" class="contact-link">
                            <i class="fas fa-map-marked-alt"></i> Veure ubicació al mapa
                        </a>
                        <p><i class="fas fa-info-circle"></i> <strong>Recomanació:</strong> No marxar sense provar les ensaimades!</p>
                    </div>
                </div>
            `;
        }
        
        // Restaurants generals
        if (contactes.restaurantsGenerals && contactes.restaurantsGenerals.length > 0) {
            contactes.restaurantsGenerals.forEach(restaurant => {
                contactesHTML += `
                    <div class="contact-card">
                        <h4><i class="fas fa-utensils"></i> ${restaurant.nom}</h4>
                        <div class="contact-info">
                            <p><i class="fas fa-phone"></i> <strong>Telèfon:</strong> ${restaurant.telefon}</p>
                            <a href="${restaurant.enllacMapa}" target="_blank" rel="noopener noreferrer" class="contact-link">
                                <i class="fas fa-map-marked-alt"></i> Veure ubicació al mapa
                            </a>
                        </div>
                    </div>
                `;
            });
        }

        // Lloc especial (si existeix)
        if (contactes.llocEspecial) {
            contactesHTML += `
                <div class="contact-card">
                    <h4>${contactes.llocEspecial.nom}</h4>
                    <div class="contact-info">
                        ${contactes.llocEspecial.descripcio ? `<p>${contactes.llocEspecial.descripcio}</p>` : ''}
                        <a href="${contactes.llocEspecial.enllacMapa}" target="_blank" rel="noopener noreferrer" class="contact-link">
                            <i class="fas fa-map-marked-alt"></i> Veure ubicació al mapa
                        </a>
                    </div>
                </div>
            `;
        }
        
        contactesHTML += '</div>';
        contactesContainer.innerHTML = contactesHTML;
        
        dayContent.innerHTML = '';
        dayContent.appendChild(contactesContainer);
    } else {
        dayContent.innerHTML = '<p>No hi ha contactes disponibles.</p>';
    }
}
// Mostrar la pestanya de Temps
function mostrarTemps() {
    const dayHeader = document.getElementById('dayHeader');
    const dayContent = document.getElementById('dayContent');
    
    dayHeader.innerHTML = `
        <h2 class="day-title">
            <i class="fas fa-cloud-sun"></i>
            Temps a Palma de Mallorca
        </h2>
        <p class="day-date"><i class="fas fa-sync-alt"></i> Dades en temps real</p>
    `;
    
    // Mostrar indicador de càrrega
    dayContent.innerHTML = `
        <div class="loading-message">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Carregant dades meteorològiques...</p>
        </div>
    `;
    
    // La teva API KEY de WeatherAPI.com
    const API_KEY = 'AQUI_POSA_LA_TEVA_API_KEY'; // <-- Canvia això!
    const location = 'Palma de Mallorca';
    
    // URL per obtenir dades actuals + previsió 3 dies
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${location}&days=4&aqi=no&alerts=no&lang=ca`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Error en carregar les dades');
            }
            return response.json();
        })
        .then(data => {
            renderitzarTemps(data, dayContent);
        })
        .catch(error => {
            console.error('Error:', error);
            dayContent.innerHTML = `
                <div class="error-message">
                    <p><i class="fas fa-exclamation-circle"></i> No s'han pogut carregar les dades meteorològiques.</p>
                    <p>Si us plau, verifiqueu la vostra connexió i que l'API key sigui correcta.</p>
                </div>
            `;
        });
}

// Funció per renderitzar les dades del temps
function renderitzarTemps(data, container) {
    const current = data.current;
    const location = data.location;
    const forecast = data.forecast.forecastday;
    
    // Formatar data
    const options = { weekday: 'long', day: 'numeric', month: 'long' };
    
    let html = `
        <div class="weather-container">
            <!-- Temps actual -->
            <div class="weather-current">
                <div class="weather-location">
                    <i class="fas fa-map-pin"></i> ${location.name}, ${location.country}
                </div>
                <div class="weather-main">
                    <div class="weather-icon-temp">
                        <img src="https:${current.condition.icon}" alt="${current.condition.text}" class="weather-icon-large">
                        <div class="weather-temp-large">${current.temp_c}°C</div>
                    </div>
                    <div class="weather-condition">${current.condition.text}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <i class="fas fa-temperature-low"></i>
                        <span>Sensació: ${current.feelslike_c}°C</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-tint"></i>
                        <span>Humitat: ${current.humidity}%</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-wind"></i>
                        <span>Vent: ${current.wind_kph} km/h</span>
                    </div>
                    <div class="weather-detail-item">
                        <i class="fas fa-sun"></i>
                        <span>UV: ${current.uv}</span>
                    </div>
                </div>
            </div>
            
            <h3 class="weather-forecast-title"><i class="fas fa-calendar-alt"></i> Previsió per als propers dies</h3>
            <div class="weather-forecast">
    `;
    
    // Afegir previsió per dia
    forecast.forEach((day, index) => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString('ca', { weekday: 'long' });
        const formattedDate = date.toLocaleDateString('ca', { day: 'numeric', month: 'long' });
        
        // Destacar els dies del viatge
        const isTripDay = [4, 5, 6, 7].includes(date.getDate()) && date.getMonth() === 2; // Març = mes 2
        
        html += `
            <div class="weather-forecast-day ${isTripDay ? 'trip-day' : ''}">
                <div class="forecast-date">
                    <span class="forecast-dayname">${dayName}</span>
                    <span class="forecast-date-small">${formattedDate}</span>
                </div>
                <div class="forecast-icon-temp">
                    <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}" class="weather-icon-small">
                    <div class="forecast-temps">
                        <span class="forecast-max">${day.day.maxtemp_c}°</span>
                        <span class="forecast-min">${day.day.mintemp_c}°</span>
                    </div>
                </div>
                <div class="forecast-condition">${day.day.condition.text}</div>
            </div>
        `;
    });
    
    html += `
            </div>
            <div class="weather-attribution">
                Dades proporcionades per <a href="https://www.weatherapi.com/" target="_blank" rel="noopener">WeatherAPI.com</a>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
// Obtenir icona segons el número de dia
function obtenirIconaDia(numeroDia) {
    const icones = ['plane', 'hiking', 'swimmer', 'plane-departure'];
    return icones[numeroDia - 1] || 'calendar-day';
}

// Configurar esdeveniments addicionals
function configurarEsdeveniments() {
    // Podem afegir més esdeveniments aquí si cal
    console.log('Aplicació d\'itinerari carregada correctament');
}

// Iniciar l'aplicació quan el DOM estigui llest
document.addEventListener('DOMContentLoaded', carregarDadesViatge);
