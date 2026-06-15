'use client';

import Link from 'next/link';

const LAST_UPDATED = '15 de junio de 2026';

export default function TermsPage() {
  return (
    <div className="min-h-dvh bg-[#080a12] pb-16 page-enter">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0a0b10]/90 backdrop-blur-xl border-b border-white/[0.05] px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link
            href="/profile"
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
          >
            ←
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-white text-base">Términos y Privacidad</h1>
            <p className="text-xs text-white/40">Última actualización: {LAST_UPDATED}</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-5 pt-6 space-y-8 text-sm text-white/70 leading-relaxed">

        {/* Intro */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
          <p className="text-violet-300 text-xs">
            Al usar VocalIA aceptas estos términos. Si no estás de acuerdo, por favor no uses la aplicación.
          </p>
        </div>

        <Section title="1. Descripción del servicio">
          <p>
            VocalIA es una aplicación de entrenamiento vocal con inteligencia artificial desarrollada por <strong className="text-white">ByteNova</strong>.
            Analiza tu voz en tiempo real, detecta tu rango vocal, y genera planes de práctica personalizados para ayudarte a mejorar tu canto.
          </p>
        </Section>

        <Section title="2. Privacidad y datos personales">
          <ul className="space-y-2">
            <Item>El audio de tu voz se procesa <strong className="text-white">localmente en tu dispositivo</strong>. No enviamos grabaciones a ningún servidor.</Item>
            <Item>Tu progreso, perfil y configuración se guardan en el almacenamiento local de tu navegador (localStorage).</Item>
            <Item>Si inicias sesión con Google, solo almacenamos tu nombre y correo electrónico para identificar tu cuenta.</Item>
            <Item>No compartimos tus datos con terceros con fines publicitarios.</Item>
            <Item>No usamos cookies de rastreo de terceros.</Item>
          </ul>
        </Section>

        <Section title="3. Permisos del dispositivo">
          <ul className="space-y-2">
            <Item><strong className="text-white">Micrófono:</strong> requerido para detectar tu pitch y analizar tu voz en tiempo real. Sin este permiso la app no puede funcionar.</Item>
            <Item><strong className="text-white">Cámara:</strong> opcional, solo para el análisis de postura facial (panel de postura). Puedes usar la app sin activarla.</Item>
            <Item>No accedemos a tus contactos, ubicación, galería ni ningún otro dato del dispositivo.</Item>
          </ul>
        </Section>

        <Section title="4. Edad mínima">
          <p>
            VocalIA está destinada a usuarios de <strong className="text-white">13 años o más</strong>.
            Si eres menor de 13 años, no uses esta aplicación sin la supervisión de un adulto.
            Si eres padre o tutor y crees que un menor ha creado una cuenta sin autorización, contáctanos.
          </p>
        </Section>

        <Section title="5. Propiedad intelectual">
          <p>
            El contenido de la aplicación — incluyendo lecciones, textos, código, diseño visual y marca VocalIA —
            es propiedad de <strong className="text-white">ByteNova</strong>. Queda prohibida su reproducción,
            distribución o modificación sin autorización expresa.
          </p>
        </Section>

        <Section title="6. Limitación de responsabilidad">
          <ul className="space-y-2">
            <Item>VocalIA es una herramienta de apoyo al entrenamiento vocal, no reemplaza a un profesor certificado.</Item>
            <Item>ByteNova no garantiza resultados específicos de mejora vocal.</Item>
            <Item>No somos responsables de lesiones vocales derivadas de un uso incorrecto o excesivo de la aplicación. Escucha a tu cuerpo y descansa si sientes molestias.</Item>
            <Item>El servicio se ofrece "tal como está". Podemos modificarlo, suspenderlo o discontinuarlo en cualquier momento.</Item>
          </ul>
        </Section>

        <Section title="7. Uso aceptable">
          <p>Te comprometes a:</p>
          <ul className="space-y-2 mt-2">
            <Item>No intentar vulnerar la seguridad de la aplicación.</Item>
            <Item>No usar la app para fines ilegales o que dañen a terceros.</Item>
            <Item>No reproducir o redistribuir el contenido de las lecciones sin autorización.</Item>
          </ul>
        </Section>

        <Section title="8. Cambios en los términos">
          <p>
            ByteNova puede actualizar estos términos en cualquier momento.
            Los cambios entrarán en vigor desde su publicación en esta página.
            El uso continuado de la aplicación tras los cambios constituye aceptación de los nuevos términos.
          </p>
        </Section>

        <Section title="9. Contacto">
          <p>
            Si tienes preguntas sobre estos términos o sobre el manejo de tus datos, puedes contactarnos en:
          </p>
          <p className="mt-2 font-mono text-violet-400 text-xs">
            bytenova38@gmail.com
          </p>
        </Section>

        <div className="border-t border-white/[0.06] pt-6 pb-4">
          <p className="text-center text-xs text-white/20">
            © {new Date().getFullYear()} ByteNova · VocalIA
          </p>
          <div className="flex justify-center mt-3">
            <Link
              href="/profile"
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Volver al perfil
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-white font-bold text-base mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2">
      <span className="text-violet-400 flex-shrink-0 mt-0.5">•</span>
      <span>{children}</span>
    </li>
  );
}
