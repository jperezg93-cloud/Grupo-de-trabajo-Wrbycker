# 🚀 OpenBot por CopilotKit

> **Plataforma para la construcción de compañeros de IA persistentes, seguros y autohospedados dentro de infraestructura propia.**

---

## 📌 Visión General

La mayoría de los asistentes de Inteligencia Artificial actuales se limitan a responder preguntas. El siguiente paso evolutivo es proporcionarles un **entorno de trabajo controlado** donde puedan ejecutar tareas reales: navegar por la web, leer archivos, ejecutar herramientas aprobadas, correr flujos de trabajo complejos y mantener siempre un **registro completo de auditoría**.

**OpenBot** es una plantilla de código abierto (*open source*) y autohospedada diseñada para construir "compañeros" de IA persistentes. La plataforma otorga control total sobre el modelo base, permitiendo definir con precisión qué credenciales, archivos, herramientas, permisos y accesos al navegador recibe cada agente.

* **Repositorio oficial:** [github.com/CopilotKit/openbot](https://github.com/CopilotKit/openbot)
* **Protocolo de comunicación:** Compatible con **AG-UI**, el estándar abierto de interacción agente-usuario de CopilotKit.

---

## 🛠️ Capacidades Clave (¿Qué hace?)

Más que una simple interfaz de chatbot, OpenBot funciona como un **plano de control centralizado** para agentes autónomos y semi-autónomos. A cada compañero de IA se le asigna:

* **Navegación dedicada:** Sesión y perfil de navegador aislados.
* **Espacio de trabajo:** Archivos y entorno de trabajo dedicado.
* **Integraciones MCP:** Acceso a herramientas mediante el protocolo MCP e integraciones autorizadas.
* **Especialización:** Rol e instrucciones específicas adaptadas a la tarea.
* **Gobierno humano:** Requisitos de aprobación humana previa (*Human-in-the-Loop*).
* **Trazabilidad:** Logs y registros detallados de todas las acciones realizadas.

---

## 🛡️ Flujo de Seguridad y Control

La arquitectura de OpenBot garantiza que ningún agente opere con acceso irrestricto al navegador, la terminal, archivos o herramientas. Cada acción se evalúa de forma estricta antes y después de su ejecución:

[1. Propuesta]      El agente propone una acción.
│
[2. Evaluación]     La política de seguridad la revisa.
│
[3. Pre-registro]   La acción propuesta queda registrada.
│
[4. Ejecución]      La acción aprobada se ejecuta.
│
[5. Post-registro]  El resultado obtenido se registra en el log.


---

## 💡 Valor Estratégico (¿Por qué es interesante?)

La mayoría de las demostraciones actuales de agentes de IA operan sin entornos de ejecución seguros o auditables. OpenBot resuelve esta limitación al transformar a los agentes en **compañeros de trabajo seguros, persistentes y alineados con las políticas de la organización**, ofreciendo el equilibrio ideal entre autonomía ejecutiva y control de infraestructura.

---

## 🖼️ Demostración Visual

| Captura de Pantalla del Proyecto | Descripción del Flujo |
| :--- | :--- |
| *(Inserta aquí la captura de pantalla)* | Panel de control de OpenBot mostrando el entorno de trabajo del agente, el historial de logs de auditoría y la gestión de permisos en tiempo real. |

---

## 📋 Ficha del Proyecto

| Campo | Detalle |
| :--- | :--- |
| **Proyecto** | OpenBot (CopilotKit) |
| **Desarrollador** | Jael Jonathan Pérez González |
| **Contacto** | `jael.ad.bibliotecario@gmail.com` |
| **Equipo de trabajo** | Wrbycker |
| **Modalidad** | Código abierto / Autohospedado |
