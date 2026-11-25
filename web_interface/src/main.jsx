import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.jsx'

// A tradução de página do navegador (Google Tradutor, Edge, Safari) troca os textos da tela por
// outros nós. O React, ao atualizar a tela depois, tenta remover nós que já não estão onde ele
// deixou e trava. Aqui essas duas operações ignoram o nó que mudou de lugar, em vez de travar.
if (typeof Node === 'function' && Node.prototype) {
  const removerOriginal = Node.prototype.removeChild
  Node.prototype.removeChild = function (filho) {
    if (filho.parentNode !== this) return filho
    return removerOriginal.call(this, filho)
  }
  const inserirOriginal = Node.prototype.insertBefore
  Node.prototype.insertBefore = function (novo, referencia) {
    if (referencia && referencia.parentNode !== this) return novo
    return inserirOriginal.call(this, novo, referencia)
  }
}
import { mostrarAvisoExtensao, prepararExtensao } from './services/extensao'

if (!prepararExtensao()) {
  mostrarAvisoExtensao('sem-chave')
} else createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
