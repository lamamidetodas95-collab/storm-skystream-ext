# 📤 Guía de Publicación: Storm Extensions para SkyStream

## ✅ Estado Actual del Proyecto

### Providers COMPLETOS (3):
- ✅ Cuevana (~15KB, scraping completo)
- ✅ PelisplusHD (~16KB, scraping completo)
- ✅ Cinecalidad (~13KB, scraping completo)

### Providers con Template (23):
- JKAnime, AnimeFlv, LatAnime, TioAnime, Monoschinos
- AllCalidad, Pelispedia, Pelisplus4K, Seriesflix, SeriesMetro
- DoramasFlix, DoramasYT, MundoDonghua, ReyDonghua
- CineHdPlus, CablevisionHD, AreaDocumental, DocumaniaTV
- LaMovie, PeliculasFlix, Rpmvid, AnimeAV1, AnimeJL

---

## 🚀 Paso 1: Subir a GitHub

```bash
# Ir al directorio del proyecto
cd "d:\todo descargas\storm-skystream-ext"

# Inicializar Git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Storm Extensions para SkyStream - 26 providers (3 completos)"

# Crear repositorio en GitHub
# Ve a: https://github.com/new
# Nombre sugerido: storm-skystream-ext
# Descripción: "26 Spanish/Latino providers for SkyStream (ported from CloudStream)"
# Público

# Conectar con GitHub (reemplaza TU-USUARIO)
git remote add origin https://github.com/TU-USUARIO/storm-skystream-ext.git

# Subir
git branch -M main
git push -u origin main
```

---

## 📲 Paso 2: Probar en SkyStream

### URL del repositorio:
```
https://raw.githubusercontent.com/TU-USUARIO/storm-skystream-ext/main/repo.json
```

### Instalar en SkyStream:

1. **Abrir SkyStream** en tu dispositivo
2. Ir a **Settings → Extensions**
3. Tap en **Add Repository**
4. Pegar la URL del `repo.json`
5. Tap **Add**

6. **Instalar providers**:
   - Buscar "Cuevana" → Install
   - Buscar "PelisplusHD" → Install
   - Buscar "Cinecalidad" → Install

7. **Probar**:
   - Ir al Home
   - Tap en el botón flotante (bottom right)
   - Seleccionar un provider (ej: Cuevana)
   - Navegar por películas/series
   - Seleccionar un título
   - Reproducir

---

## 🧪 Paso 3: Verificar Funcionalidad

### Checklist para cada provider:

#### ✅ Cuevana:
- [ ] getHome() muestra 4 secciones
- [ ] Películas/Series tienen posters
- [ ] Search funciona
- [ ] Al abrir una película muestra detalles
- [ ] Series muestran episodios
- [ ] loadStreams() devuelve URLs de video

#### ✅ PelisplusHD:
- [ ] getHome() muestra Películas, Series, Anime, Doramas
- [ ] Posters se cargan correctamente
- [ ] Search devuelve resultados
- [ ] Episodios se extraen con temporada/número
- [ ] Streams funcionan (embed69, xupalace)

#### ✅ Cinecalidad:
- [ ] getHome() muestra Series, Estrenos, Animación
- [ ] Search funciona
- [ ] load() extrae episodios formato S01-E03
- [ ] loadStreams() extrae data-option

---

## 🐛 Solución de Problemas Comunes

### Problema: "No se pueden cargar providers"
**Solución**: Verificar que la URL raw de GitHub es correcta y accesible.

### Problema: "Provider instalado pero no muestra contenido"
**Solución**: 
1. Verificar que el `baseUrl` del provider es correcto
2. El sitio puede haber cambiado su estructura HTML
3. Revisar logs de SkyStream para ver errores

### Problema: "Streams no se cargan"
**Solución**:
1. `fixHostsLinks()` puede necesitar actualización
2. Los sitios de embed pueden haber cambiado
3. Algunos videos requieren captcha/verificación

---

## 📝 Paso 4: Documentar en GitHub

### Crear un buen README en GitHub:

1. **Badge de estado**:
   ```markdown
   ![Providers](https://img.shields.io/badge/providers-26-blue)
   ![Complete](https://img.shields.io/badge/complete-3-green)
   ![Templates](https://img.shields.io/badge/templates-23-yellow)
   ```

2. **Sección de instalación rápida**
3. **Lista de providers con estado**
4. **Screenshots** (opcional pero recomendado)
5. **Contribución**: Explicar cómo completar templates

---

## 🌟 Paso 5: Compartir con la Comunidad

### Opciones para compartir:

1. **SkyStream Discord**: https://discord.gg/skystream
2. **Telegram de SkyStream**
3. **Reddit r/SkyStream** (si existe)
4. **GitHub Discussions** en tu repo

### Mensaje sugerido:
```
🎉 Porté 26 providers españoles de CloudStream a SkyStream!

✅ 3 completamente funcionales:
- Cuevana (películas/series latino)
- PelisplusHD (películas/series/anime/doramas)
- Cinecalidad (películas mexicanas)

⚠️ 23 con templates básicos listos para completar:
JKAnime, AnimeFlv, LatAnime, Pelispedia, y más

Repo: https://github.com/TU-USUARIO/storm-skystream-ext

¡Pull requests bienvenidos para completar más providers!
```

---

## 🔄 Mantenimiento Futuro

### Actualizar providers:

1. Los sitios cambian su HTML frecuentemente
2. Revisar issues en GitHub
3. Actualizar regex patterns según sea necesario
4. Mantener `fixHostsLinks()` actualizado

### Versionado:

- `v1.0.0`: 3 providers completos
- `v1.1.0`: +5 providers completos
- `v2.0.0`: Todos los 26 completos

---

## 📊 Métricas de Éxito

- ⭐ Stars en GitHub
- 🔽 Downloads/Installs
- 🐛 Issues reportados y resueltos
- 🤝 Contributors que completen templates
- 📈 Número de providers funcionales

---

## 🎯 Próximos Pasos Sugeridos

1. **Completar JKAnime** (muy solicitado en anime)
2. **Completar AllCalidad** (popular en películas)
3. **Completar Pelispedia** (amplio catálogo)
4. **Crear script** para testear todos los providers automáticamente
5. **CI/CD** con GitHub Actions para tests automáticos

---

¡Buena suerte con la publicación! 🚀
