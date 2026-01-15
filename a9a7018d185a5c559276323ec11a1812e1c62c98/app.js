// app.js - Lògica principal de l'aplicació d'itinerari

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

// Mostrar el contingut d'un dia específic
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
    
    // Afegir enllaços especials si existeixen (rutes, restaurants)
    const specialLinks = document.createElement('div');
    specialLinks.className = 'special-links';
    
    if (dia.enllacRuta) {
        const rutaLink = document.createElement('a');
        rutaLink.href = dia.enllacRuta;
        rutaLink.target = '_blank';
        rutaLink.className = 'link-button';
        rutaLink.innerHTML = '<i class="fas fa-hiking"></i> Veure ruta a Wikiloc';
        specialLinks.appendChild(rutaLink);
    }
    
    if (dia.restaurantsSopar && dia.restaurantsSopar.length > 0) {
        const restaurantsLink = document.createElement('div');
        restaurantsLink.className = 'restaurantes-info';
        restaurantsLink.innerHTML = `
            <p style="margin-top: 1rem; font-weight: bold; color: #2c3e50;">
                <i class="fas fa-utensils"></i> Restaurants recomanats:
            </p>
            <ul style="margin-top: 0.5rem; padding-left: 1.2rem;">
                ${dia.restaurantsSopar.map(r => `<li><strong>${r.nom}</strong> - ${r.especialitat} (${r.ubicacio})</li>`).join('')}
            </ul>
        `;
        specialLinks.appendChild(restaurantsLink);
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
