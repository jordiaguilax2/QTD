// sha1.js - Carrega una biblioteca SHA-1 externa i fiable
(function() {
  var script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/js-sha1/0.6.0/sha1.min.js';
  script.integrity = 'sha512-E3YpFkKq6GwJV4R5EHAgN6p6nQvRzCq6Q6k2q+w5FvIhqpZbZ8nYhPxR8tZcLeLlqejNFqS8QraBpZHR5t5uVw==';
  script.crossOrigin = 'anonymous';
  
  script.onload = function() {
    console.log('[SHA1] Biblioteca carregada correctament.');
    // Assegura't que la funció global es digui 'sha1' (alguns CDN poden usar noms diferents)
    if (typeof window.sha1 === 'undefined' && typeof window.jssha1 !== 'undefined') {
      window.sha1 = window.jssha1;
    }
  };
  
  script.onerror = function() {
    console.error('[SHA1] Error carregant la biblioteca.');
  };
  
  document.head.appendChild(script);
})();
