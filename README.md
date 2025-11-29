<div align="center">

# 🎰 GitWinner

**Convierte los comentarios de un Issue de GitHub en un emocionante sorteo estilo máquina tragamonedas.**

[![Deploy to GitHub Pages](https://github.com/josefdc/gitwinner/actions/workflows/deploy.yml/badge.svg)](https://github.com/josefdc/gitwinner/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Demo en Vivo](https://josefdc.github.io/gitwinner/) · [Reportar Bug](https://github.com/josefdc/gitwinner/issues)

</div>

---

## ✨ Características

- 🎰 **Animación de Slot Machine** - Experiencia visual tipo casino
- 👥 **Carga automática de participantes** - Desde cualquier Issue de GitHub
- 🔒 **Selección criptográficamente segura** - Usando `crypto.getRandomValues()`
- 🎊 **Confeti de celebración** - Animación festiva para el ganador
- 📱 **Diseño responsivo** - Funciona en móviles y escritorio
- 🌙 **Tema oscuro** - Estilo GitHub Dark

## 🚀 Ejecutar Localmente

**Requisitos:** Node.js 18+

```bash
# Clonar el repositorio
git clone https://github.com/josefdc/gitwinner.git
cd gitwinner

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🛠️ Tecnologías

- **React 19** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool ultrarrápido
- **Tailwind CSS** - Estilos utilitarios
- **Lucide React** - Iconos

## 📖 Uso

1. Pega la URL de un Issue de GitHub (ej: `https://github.com/owner/repo/issues/123`)
2. Click en **"Fetch Contenders"** para cargar los participantes
3. Click en **"START RAFFLE"** para iniciar el sorteo
4. ¡Celebra con el ganador! 🎉

## 📄 Licencia

MIT © [josefdc](https://github.com/josefdc)
