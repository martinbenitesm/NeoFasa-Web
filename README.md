<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&size=68&duration=3000&pause=1000&color=0A95BF&center=true&vCenter=true&width=1000&height=80&lines=🧬+NeoFasa+Web+🧬" />
</p>

## 📌 Descripción General

**Neofasa Web** es un centro de operaciones de ciberseguridad (SOC/CTI Platform). Permite a los analistas de seguridad realizar análisis heurísticos de archivos sospechosos, detectar estafas e hipervínculos de phishing en correos electrónicos, gestionar elementos aislados en cuarentena y visualizar en tiempo real la arquitectura distribuida del sistema.

---

## 🚀 Funcionalidades Principales

### 1. 🔬 Análisis de Archivos & Malware Engine (VirusTotal Style)
* **Carga e inspección de archivos**: Arrastra o selecciona ejecutables, documentos, scripts o binarios sospechosos.
* **Cálculo automático de Hashes**: Generación en cliente de hashes **SHA-256** para identificación única del indicador de compromiso (IoC).
* **Matriz de Motores Antivirus**: Simulación de firmas y motores de análisis (60+ AV vendors como Kaspersky, CrowdStrike, SentinelOne, Defender, etc.).
* **Reglas YARA & Análisis Heurístico**: Coincidencia de patrones con reglas como `SUSP_PE_Header`, `Ransomware_Behavior`, `PowerShell_Obfuscated`.
* **Aislamiento a Cuarentena**: Envío inmediato de cargas maliciosas hacia la bóveda de aislamiento.

### 2. 🎣 Detector de Phishing & Email Threat Analyzer
* **Análisis de Correos (Headers y Cuerpos)**: Inspección de remitentes, cadenas IP, firmas de correo y frases de ingeniería social.
* **Validación de Protocolos de Autenticación**: Evaluación de registros **SPF**, **DKIM** y **DMARC**.
* **Detector de URLs Maliciosas**: Detección de engaños de typosquatting, dominios recién registrados y acortadores sospechosos.
* **Casos Precargados de Prueba**: Incluye ejemplos listos para probar (CEO Fraud / Spearfishing, Falso Reset de Contraseña de Microsoft 365, Alertas de TI y Correos Legítimos de GitHub).

### 3. ☣️ Bóveda de Cuarentena & Desinfección CDR
* **Gestión de Amenazas Aisladas**: Listado en tiempo real de archivos bloqueados con sus vectores de amenaza.
* **Sanitización CDR (Content Disarm & Reconstruction)**: Simulación de reconstrucción segura de archivos removiendo macros y scripts embebidos.
* **Exportación de Reportes**: Descarga de metadatos en formato JSON para integración con SIEM.

### 4. 📐 Visualizador Interactivo de Arquitectura Backend
* Mapeo dinámico de la pipeline microservicios basada en el flujo del sistema:
  `Frontend (React) ➔ API Gateway (Kong/Traefik) ➔ Backend API (NestJS/Go) ➔ Event Bus (NATS/RabbitMQ) ➔ Event Consumers (YARA/AV Scan, Threat Intel, CDR) ➔ Persistencia (PostgreSQL & Redis)`
* Inspector interactivo para ver especificaciones técnicas de cada componente.

---

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnología / Librería | Descripción |
| :--- | :--- | :--- |
| **Framework Frontend** | React 18 / Vite 6 | Framework SPA ultrarrápido con Hot Module Replacement (HMR). |
| **Estilos & UI** | Tailwind CSS v4 | Estilizado modular con paleta Cyberpunk (Neon Green, Cyber Cyan, Crimson Alert). |
| **Iconografía** | Lucide React | Conjunto de íconos vectoriales modernos y estilizados. |
| **Efectos HUD** | CSS Custom Animations | Scanlines CRT, neón titilante y barras de pulso de telemetría. |
