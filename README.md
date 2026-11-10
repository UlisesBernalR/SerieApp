# Serie · tu bitácora de gimnasio

App web instalable (PWA) para armar rutinas, programar tus días de entrenamiento y registrar cada serie. Funciona sin internet y guarda todo en tu teléfono.

## Qué incluye

- **Rutinas**: elige ejercicios de la biblioteca (31 incluidos) o crea los tuyos (con foto opcional). Plantillas listas: Push/Pull/Legs, cuerpo completo, torso/pierna y entrenamiento en casa. Superseries, notas por ejercicio y compartir rutinas con un código.
- **Ejercicios**: cada uno trae una ilustración animada de la técnica (con vista de inicio y final), mapa de músculos principales y secundarios, explicación breve y consejos. En la carpeta `gifs/` hay un GIF animado por ejercicio y cada pantalla de ejercicio tiene el enlace «Guardar como GIF».
- **Horario**: asigna rutinas a días y horas, con aviso opcional.
- **Entrenamiento**: registra peso × repeticiones (o segundos), con lo que hiciste la vez anterior como referencia, descanso automático entre series (sonido y vibración), detección de récords y resumen al terminar.
- **Cronómetro** con vueltas y temporizador de descanso, y un contador de calorías por actividad (pesas, trote, bicicleta, cuerda, etc.).
- **Perfil y calorías**: guarda tu altura, peso, edad y sexo (los dos últimos son opcionales). Calcula tu IMC y tu metabolismo basal, y estima las calorías de cada entrenamiento en vivo, en el resumen, en el historial y por semana.
- **Progreso**: historial, gráficas por ejercicio (peso máximo y 1RM estimado), volumen semanal, peso corporal, medidas, fotos de progreso, racha y más de 120 logros (ver abajo).
- **Herramientas**: calculadora de discos, calculadora de 1RM, calentamiento y estiramientos por músculo.
- **Respaldo**: exporta e importa todos tus datos. Tema claro/oscuro, kg/lb.

## Probarla en tu computadora

Necesita un servidor local (no basta con abrir el archivo):

```
cd serie
python3 -m http.server 8000
```

Abre http://localhost:8000.

## Instalarla en tu teléfono

Una PWA necesita estar en una dirección **https**. Dos formas gratis y sin cuenta de desarrollador:

1. **Netlify Drop**: entra a app.netlify.com/drop y arrastra la carpeta `serie`. Te da un enlace https.
2. **GitHub Pages**: sube la carpeta a un repositorio, activa Pages en *Settings → Pages* y usa el enlace que te dé.

Luego abre el enlace en el teléfono:

- **Android (Chrome)**: menú ⋮ → *Instalar app* (o el botón *Instalar* dentro de Más).
- **iPhone (Safari)**: Compartir → *Añadir a pantalla de inicio*.

Después de la primera carga funciona sin conexión.

## Convertirla en APK (sin Android Studio)

GitHub puede compilar el APK por ti, gratis, en sus servidores. Esta carpeta ya trae todo lo necesario
(`package.json`, `capacitor.config.json`, `android-res/` con iconos y permisos, y `.github/workflows/apk.yml`).

1. Crea una cuenta en github.com y un repositorio nuevo (botón **New**, nombre `serie`, puede ser privado).
2. Sube el contenido de esta carpeta (no la carpeta en sí): en el repositorio, **Add file → Upload files**,
   arrastra todo lo que hay dentro de `serie/` y pulsa **Commit changes**.
   - Comprueba que existe la ruta `.github/workflows/apk.yml`. Si no se subió (algunos sistemas ocultan
     las carpetas que empiezan con punto), pulsa **Add file → Create new file**, escribe como nombre
     `.github/workflows/apk.yml`, pega dentro el contenido de `apk-workflow/apk.yml` y confirma.
3. Abre la pestaña **Actions**. Verás "Compilar APK" en marcha (tarda unos 5-10 minutos la primera vez).
   Si no arrancó sola: Compilar APK → **Run workflow**.
4. Cuando salga la marca verde, entra en esa ejecución y baja hasta **Artifacts**: descarga **serie-apk**
   (es un .zip con `app-debug.apk` dentro).
5. Pasa el `.apk` al teléfono, ábrelo y acepta "instalar apps desconocidas" cuando Android lo pida.

Cada vez que cambies archivos en el repositorio se vuelve a compilar y tendrás un APK nuevo. Siempre se
firma con la misma clave (`android-res/debug.keystore`), así que el APK nuevo se instala encima del
anterior y **conserva tus datos**. Aun así, haz un respaldo (Más → Respaldo) antes de la primera
actualización, por si acaso.

Notas:

- Es un APK de **depuración**: sirve para instalarlo en tu teléfono. Para subirlo a Google Play hace falta
  uno firmado (release/AAB) con tu propia clave; se puede añadir al mismo flujo.
- **Avisos con la app cerrada**: en el APK, Horario → "Permitir avisos" (o al guardar tu primer horario) y
  Android te pide permiso. Los avisos se programan en el teléfono para los próximos 28 días y se renuevan
  solos cada vez que abres Serie; no necesitan internet ni servidor. Si pasas un mes sin abrir la app, el último
  aviso te lo recuerda. En algunos teléfonos (Xiaomi, Huawei, Samsung con ahorro de batería fuerte) hay que
  poner Serie en "Sin restricciones" en Ajustes → Batería para que no retrasen los avisos.
- "Guardar como GIF" y "Descargar respaldo" usan la descarga del navegador, que el WebView de Android no
  maneja por sí solo. "Copiar respaldo" y "Pegar copia" sí funcionan. Para guardar archivos hace falta
  añadir los plugins Filesystem y Share de Capacitor.

Alternativa sin GitHub Actions: sube la carpeta a un hosting https gratuito (Netlify Drop o GitHub Pages)
y genera el APK con <https://www.pwabuilder.com>. Con esa vía, la app se abre como una web instalada
(Trusted Web Activity) y funciona igual que la versión web.

Con Android Studio (opcional): `npm install`, copia los archivos web a `www/`, `npx cap add android`,
`npx cap sync` y `npx cap open android`.

## Logros

Hay 123 logros en 8 categorías: constancia, fuerza, variedad, cuerpo y calorías, fechas y horas, retos, retos propios y colección. Algunos son secretos hasta que los consigues.

- **Automáticos**: se desbloquean solos al entrenar, registrar tu peso, crear rutinas, etc. Incluyen fechas y horas curiosas (viernes 13, Día de Muertos, madrugador, 11:11…).
- **Retos manuales**: en la pantalla de entrenamiento, abre «Retos del día» y marca los que cumples hoy (calcetines rojos, entrenar con un amigo, tenis nuevos…). Se desbloquean al finalizar el entrenamiento.
- **Retos propios**: en Progreso › Logros › Mis retos puedes inventar los tuyos; aparecerán también en «Retos del día».
- Al desbloquear uno fuera de un entrenamiento verás un aviso con el botón «Ver».

## Cómo se calculan las calorías

Calorías = MET × peso (kg) × horas. El MET (equivalente metabólico) es un valor promedio por tipo de actividad, tomado del Compendio de Actividades Físicas: por ejemplo, pesas con esfuerzo moderado 3,5, pesas intensas 6, trote 7, circuito o HIIT 8. En un entrenamiento, la app pondera el MET de cada ejercicio según las series que marcaste y usa el tiempo total (hasta 4 horas). El metabolismo basal usa la fórmula de Mifflin-St Jeor.

Es una **estimación**, no una medición: varía de una persona a otra y no sustituye un reloj con pulsómetro. El IMC no distingue músculo de grasa, así que tómalo solo como referencia.

## Límites a tener en cuenta

- **Sin cuentas ni nube**: los datos viven solo en el dispositivo. Si borras los datos del navegador o cambias de teléfono, los pierdes salvo que hayas hecho un respaldo (Más → Respaldo).
- **Avisos del horario**: con la app cerrada solo funcionan en el APK. En la versión web suenan mientras la app esté abierta (y, si el navegador lo permite, como notificación).
- **Ilustraciones y GIFs**: son esquemas dibujados para esta app, no fotografías ni videos de personas. No pude descargar un banco de GIFs reales de internet, así que los GIFs se generaron a partir de las animaciones de la app.
- Al cambiar entre kg y lb se convierte tu peso corporal, pero no los pesos ya registrados en las series.

## Estructura

```
index.html  styles.css  manifest.webmanifest  sw.js
package.json  capacitor.config.json  .github/workflows/apk.yml  android-res/  (compilación del APK)
icons/      iconos de la app
gifs/       un GIF animado por ejercicio
js/         figures (ilustraciones) · data (ejercicios y plantillas) · core (estado, hojas, temporizadores)
            logic (récords, rachas, calorías, respaldo) · logros (definiciones y comprobación) · native (avisos del APK)
            v-*.js (pantallas) · main.js
```
