// app.js - Lògica principal de l'aplicació d'itinerari (VERSIÓ ACTUALITZADA)

// Variable global per emmagatzemar les dades del viatge
let dadesViatge = null;

// Carregar les dades del viatge des de l'arxiu JSON
async function carregarDadesViatge() {
    try {
        const resposta = await fetch('viatge.json');
        if (!resposta.ok) {
            throw new Error(`Error en carregar les dades: ${resposta.status}`);
        }
        dadesViatge = await resposta.json();
        inicialitzarAplicacio();
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('dayContent').innerHTML = 
            `<div class="error-message">
                <p>⚠️ No es van poder carregar les dades de l'itinerari.</p>
                <p>Si us plau, verifiqueu que l'arxiu viatge.json existeix.</p>
            </div>`;
    }
}

// Inicialitzar l'aplicació un cop carregades les dades
function inicialitzarAplicacio() {
    if (!dadesViatge || !dadesViatge.viatge) {
        console.error('Estructura de dades incorrecta');
        return;
    }

    const viatge = dadesViatge.viatge;
    
    // Actualitzar el títol de la pàgina
    document.title = `Itinerari ${viatge.destinacio} | ${viatge.dates}`;
    
    // Generar les pestanyes de dies
    generarPestanyes(viatge.dies);
    
    // Generar la checklist general
    generarChecklist(viatge.checklistGeneral);
    
    // Mostrar el primer dia per defecte
    mostrarDia(viatge.dies[0]);
    
    // Configurar esdeveniment per al botó de tornar a dalt
    configurarEsdeveniments();
}

// Generar les pestanyes de navegació entre dies
function generarPestanyes(dies) {
    const tabsContainer = document.getElementById('tabsList');
    
    dies.forEach((dia, index) => {
        const boto = document.createElement('button');
        boto.className = 'tab-button';
        if (index === 0) boto.classList.add('active');
        
        boto.innerHTML = `
            <i class="fas fa-calendar-day"></i>
            Dia ${dia.numero}
        `;
        
        boto.addEventListener('click', () => {
            // Treure classe active de totes les pestanyes
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Afegir classe active a la pestanya clicada
            boto.classList.add('active');
            
            // Mostrar el contingut del dia seleccionat
            mostrarDia(dia);
            
            // Desplaçar suaument cap a dalt (útil en mòbils)
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        tabsContainer.appendChild(boto);
    });
}

// Mostrar el contingut d'un dia específic (VERSIÓ MILLORADA)
function mostrarDia(dia) {
    // Actualitzar la capçalera del dia
    const dayHeader = document.getElementById('dayHeader');
    dayHeader.innerHTML = `
        <h2 class="day-title">
            <i class="fas fa-${obtenirIconaDia(dia.numero)}"></i>
            ${dia.titol}
        </h2>
        <p class="day-date"><i class="fas fa-clock"></i> ${dia.data}</p>
        ${dia.notesDia ? `<div class="day-notes"><i class="fas fa-info-circle"></i> ${dia.notesDia}</div>` : ''}
    `;
    
    // Generar el contingut de les franges horàries
    const dayContent = document.getElementById('dayContent');
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
    
    // NOVA SECCIÓ: Informació de contacte i permisos especials
    if (dia.permis && dia.permis.obligatori) {
        const permisSection = document.createElement('div');
        permisSection.className = 'permis-section';
        permisSection.style.cssText = `
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 1.2rem;
            margin: 1.5rem 0;
            border-radius: 0 8px 8px 0;
        `;
        
        permisSection.innerHTML = `
            <h4 style="color: #856404; margin-bottom: 0.8rem;">
                <i class="fas fa-exclamation-triangle"></i> Permís Obligatori
            </h4>
            <p style="margin-bottom: 0.5rem;"><strong>Contacte:</strong> ${dia.permis.contacte}</p>
            <p style="margin-bottom: 0.5rem;"><strong>Email:</strong> ${dia.permis.email}</p>
            <p style="margin-bottom: 0;"><strong>Solicitar amb:</strong> ${dia.permis.antelacio} d'antelació</p>
        `;
        
        dayContent.appendChild(permisSection);
    }
    
    // SECCIÓ MILLORADA: Enllaços especials amb contactes
    const specialLinks = document.createElement('div');
    specialLinks.className = 'special-links';
    
    // Enllaç a la ruta de senderisme
    if (dia.enllacRuta) {
        const rutaLink = document.createElement('a');
        rutaLink.href = dia.enllacRuta;
        rutaLink.target = '_blank';
        rutaLink.className = 'link-button';
        rutaLink.innerHTML = '<i class="fas fa-hiking"></i> Veure ruta a Wikiloc';
        specialLinks.appendChild(rutaLink);
    }
    
    // NOVA: Llista millorada de restaurants amb telèfons i mapes
    if (dia.restaurantsSopar && dia.restaurantsSopar.length > 0) {
        const restaurantsSection = document.createElement('div');
        restaurantsSection.style.cssText = `
            margin-top: 1.5rem;
            padding: 1.2rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #e9ecef;
        `;
        
        let restaurantsHTML = `
            <h4 style="color: #2c3e50; margin-bottom: 1rem; display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-utensils"></i> Restaurants per al sopar
            </h4>
            <div style="display: flex; flex-direction: column; gap: 1rem;">
        `;
        
        dia.restaurantsSopar.forEach(restaurant => {
            const telefonHTML = restaurant.telefon ? 
                `<p style="margin: 0.3rem 0;"><i class="fas fa-phone"></i> <strong>Telèfon:</strong> ${restaurant.telefon}</p>` : '';
            
            const mapaHTML = restaurant.enllacMapa ? 
                `<a href="${restaurant.enllacMapa}" target="_blank" style="display: inline-flex; align-items: center; gap: 5px; color: #1565c0; text-decoration: none; margin-top: 0.5rem;">
                    <i class="fas fa-map-marked-alt"></i> Veure al mapa
                </a>` : '';
            
            restaurantsHTML += `
                <div style="padding: 0.8rem; background: white; border-radius: 6px; border-left: 3px solid #3498db;">
                    <h5 style="color: #2c3e50; margin-bottom: 0.5rem;">${restaurant.nom}</h5>
                    <p style="margin: 0.3rem 0; color: #555;"><strong>Especialitat:</strong> ${restaurant.especialitat}</p>
                    <p style="margin: 0.3rem 0; color: #555;"><strong>Ubicació:</strong> ${restaurant.ubicacio}</p>
                    ${telefonHTML}
                    ${mapaHTML}
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

// Generar la checklist general
function generarChecklist(checklistItems) {
    const checklistContainer = document.getElementById('checklist');
    
    if (checklistItems && checklistItems.length > 0) {
        checklistContainer.innerHTML = checklistItems.map(item => 
            `<li>${item}</li>`
        ).join('');
    } else {
        checklistContainer.innerHTML = '<li>No hi ha elements a la checklist</li>';
    }
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
