'use client';

export type AvatarId = 'explorador' | 'maestro' | 'guardian' | 'estrella' | 'espiritu';

export const AVATAR_NAMES: Record<AvatarId, string> = {
  explorador: 'Explorador Vocal',
  maestro:    'Maestro del Ritmo',
  guardian:   'Guardián de la Armonía',
  estrella:   'Estrella en Formación',
  espiritu:   'Espíritu Melódico',
};

export const AVATAR_IDS: AvatarId[] = ['explorador', 'maestro', 'guardian', 'estrella', 'espiritu'];

// ─── 1. Explorador Vocal ───────────────────────────────────────
function ExploradorVocal({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ev-bg" cx="40%" cy="30%">
          <stop offset="0%" stopColor="#A8EEE8"/>
          <stop offset="100%" stopColor="#38B6FF"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#ev-bg)"/>
      {/* Hoodie */}
      <path d="M42 200 C42 155 68 144 100 144 C132 144 158 155 158 200Z" fill="#2CA8A0"/>
      <path d="M88 144 L100 162 L112 144Z" fill="#E8F8F7"/>
      {/* Neck */}
      <rect x="88" y="126" width="24" height="20" rx="5" fill="#F5C5A3"/>
      {/* Head */}
      <circle cx="100" cy="104" r="40" fill="#F5C5A3"/>
      {/* Hair */}
      <path d="M60 95C60 62 140 62 140 95C136 68 64 68 60 95Z" fill="#5C3420"/>
      <path d="M60 95C57 112 62 125 60 130L60 95Z" fill="#5C3420"/>
      <path d="M140 95C143 112 138 125 140 130L140 95Z" fill="#5C3420"/>
      {/* Eyes */}
      <ellipse cx="86" cy="104" rx="7.5" ry="7.5" fill="white"/>
      <ellipse cx="114" cy="104" rx="7.5" ry="7.5" fill="white"/>
      <circle cx="88" cy="105" r="5" fill="#2D3436"/>
      <circle cx="116" cy="105" r="5" fill="#2D3436"/>
      <circle cx="89.5" cy="103.5" r="1.8" fill="white"/>
      <circle cx="117.5" cy="103.5" r="1.8" fill="white"/>
      {/* Eyebrows */}
      <path d="M78 95 Q86 91 94 95" stroke="#5C3420" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106 95 Q114 91 122 95" stroke="#5C3420" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Mouth open singing */}
      <ellipse cx="100" cy="120" rx="8" ry="6" fill="#C07060"/>
      <ellipse cx="100" cy="118" rx="8" ry="3" fill="#E8967A"/>
      {/* Music note */}
      <circle cx="152" cy="66" r="8" fill="#FFC857"/>
      <rect x="158" y="40" width="5" height="28" rx="2.5" fill="#FFC857"/>
      <rect x="158" y="40" width="20" height="5" rx="2.5" fill="#FFC857"/>
      {/* Small note */}
      <circle cx="40" cy="88" r="5" fill="#FFC857" opacity="0.7"/>
      <rect x="44" y="72" width="4" height="18" rx="2" fill="#FFC857" opacity="0.7"/>
      {/* Sparkles */}
      <circle cx="162" cy="42" r="3" fill="white" opacity="0.7"/>
      <circle cx="34" cy="118" r="3" fill="white" opacity="0.5"/>
      <circle cx="158" cy="140" r="2" fill="white" opacity="0.4"/>
    </svg>
  );
}

// ─── 2. Maestro del Ritmo ─────────────────────────────────────
function MaestroDelRitmo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mr-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF9A70"/>
          <stop offset="100%" stopColor="#7B4FE0"/>
        </linearGradient>
        <linearGradient id="mr-mic" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E8E8E8"/>
          <stop offset="100%" stopColor="#B0B0B0"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#mr-bg)"/>
      {/* Jacket body */}
      <path d="M40 200 C40 154 68 143 100 143 C132 143 160 154 160 200Z" fill="#D04A20"/>
      <path d="M86 143 L100 160 L114 143Z" fill="white" opacity="0.85"/>
      {/* Neck */}
      <rect x="88" y="124" width="24" height="21" rx="5" fill="#D9A07A"/>
      {/* Head */}
      <circle cx="100" cy="102" r="40" fill="#D9A07A"/>
      {/* Beard */}
      <path d="M66 110C63 140 74 154 100 156C126 154 137 140 134 110C122 128 78 128 66 110Z" fill="#7A3A18"/>
      {/* Hair */}
      <path d="M64 92C64 62 136 62 136 92C132 70 68 70 64 92Z" fill="#7A3A18"/>
      {/* Glasses */}
      <circle cx="86" cy="97" r="12" fill="none" stroke="#3A2000" strokeWidth="3.5"/>
      <circle cx="114" cy="97" r="12" fill="none" stroke="#3A2000" strokeWidth="3.5"/>
      <path d="M98 97 L102 97" stroke="#3A2000" strokeWidth="3"/>
      <path d="M74 94 L62 90" stroke="#3A2000" strokeWidth="2.5"/>
      <path d="M126 94 L138 90" stroke="#3A2000" strokeWidth="2.5"/>
      {/* Eyes */}
      <circle cx="86" cy="97" r="6" fill="#2D3436"/>
      <circle cx="114" cy="97" r="6" fill="#2D3436"/>
      <circle cx="87.5" cy="95.5" r="2" fill="white"/>
      <circle cx="115.5" cy="95.5" r="2" fill="white"/>
      {/* Smile */}
      <path d="M86 116 Q100 128 114 116" stroke="#7A3A18" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Microphone */}
      <rect x="87" y="54" width="26" height="38" rx="13" fill="url(#mr-mic)"/>
      <rect x="87" y="54" width="26" height="38" rx="13" fill="none" stroke="#888" strokeWidth="1.5"/>
      <path d="M89 66 L111 66" stroke="#AAA" strokeWidth="1.5"/>
      <path d="M89 73 L111 73" stroke="#AAA" strokeWidth="1.5"/>
      <path d="M89 80 L111 80" stroke="#AAA" strokeWidth="1.5"/>
      {/* Sound waves */}
      <path d="M122 58 Q133 73 122 88" stroke="#FFC857" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M128 53 Q144 73 128 93" stroke="#FFC857" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      {/* Sparkle */}
      <circle cx="38" cy="75" r="4" fill="white" opacity="0.6"/>
      <circle cx="160" cy="55" r="3" fill="white" opacity="0.5"/>
    </svg>
  );
}

// ─── 3. Guardián de la Armonía ────────────────────────────────
function GuardianDeLaArmonia({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ga-bg" cx="50%" cy="30%">
          <stop offset="0%" stopColor="#DFFAF8"/>
          <stop offset="100%" stopColor="#38B6FF"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#ga-bg)"/>
      {/* Body – white shirt */}
      <path d="M44 200 C44 156 68 146 100 146 C132 146 156 156 156 200Z" fill="#EEF8FA"/>
      {/* Treble clef on shirt (simplified path) */}
      <path d="M97 175 C97 175 97 165 102 162 C108 158 110 153 107 148 C104 143 98 143 96 147 C94 151 96 157 100 160 C104 163 106 168 103 173 C101 177 97 178 97 175Z" fill="#38B6A0" strokeWidth="0"/>
      <ellipse cx="99" cy="175" rx="5" ry="3.5" fill="#38B6A0"/>
      {/* Neck */}
      <rect x="88" y="127" width="24" height="21" rx="5" fill="#F5C5A3"/>
      {/* Head */}
      <circle cx="100" cy="105" r="40" fill="#F5C5A3"/>
      {/* Hair medium length */}
      <path d="M60 96 C60 63 140 63 140 96 C136 70 64 70 60 96Z" fill="#7B4E2D"/>
      <path d="M60 96 C56 116 60 130 64 136 L60 96Z" fill="#7B4E2D"/>
      <path d="M140 96 C144 116 140 130 136 136 L140 96Z" fill="#7B4E2D"/>
      {/* Serene closed eyes */}
      <path d="M80 104 Q87 98 94 104" stroke="#4A2E1A" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <path d="M106 104 Q113 98 120 104" stroke="#4A2E1A" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Eyebrows */}
      <path d="M80 95 Q87 91 94 95" stroke="#7B4E2D" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M106 95 Q113 91 120 95" stroke="#7B4E2D" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Soft smile */}
      <path d="M90 120 Q100 130 110 120" stroke="#C08070" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Blush */}
      <ellipse cx="82" cy="112" rx="9" ry="5" fill="#FFB3A0" opacity="0.35"/>
      <ellipse cx="118" cy="112" rx="9" ry="5" fill="#FFB3A0" opacity="0.35"/>
      {/* Floating dots accent */}
      <circle cx="44" cy="70" r="6" fill="#38B6A0" opacity="0.4"/>
      <circle cx="156" cy="78" r="5" fill="#38B6A0" opacity="0.3"/>
      <circle cx="38" cy="128" r="4" fill="white" opacity="0.7"/>
      <circle cx="162" cy="120" r="4" fill="white" opacity="0.6"/>
      <circle cx="155" cy="48" r="3" fill="white" opacity="0.5"/>
    </svg>
  );
}

// ─── 4. Estrella en Formación ─────────────────────────────────
function EstrellaEnFormacion({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ef-bg" cx="50%" cy="35%">
          <stop offset="0%" stopColor="#FFE59A"/>
          <stop offset="100%" stopColor="#FF7F50"/>
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#ef-bg)"/>
      {/* Background star */}
      <polygon
        points="100,12 114,54 158,54 124,79 138,121 100,96 62,121 76,79 42,54 86,54"
        fill="#FFC857" opacity="0.3"
      />
      {/* Body – yellow shirt */}
      <path d="M46 200 C46 155 70 145 100 145 C130 145 154 155 154 200Z" fill="#FFC857"/>
      {/* Neck */}
      <rect x="88" y="126" width="24" height="21" rx="5" fill="#F5C5A3"/>
      {/* Head */}
      <circle cx="100" cy="104" r="40" fill="#F5C5A3"/>
      {/* Hair */}
      <path d="M62 94 C62 62 138 62 138 94 C134 70 66 70 62 94Z" fill="#3D2B1F"/>
      {/* Eyes – wide open excited */}
      <ellipse cx="86" cy="103" rx="8" ry="8" fill="white"/>
      <ellipse cx="114" cy="103" rx="8" ry="8" fill="white"/>
      <circle cx="87.5" cy="104" r="5.5" fill="#2D3436"/>
      <circle cx="115.5" cy="104" r="5.5" fill="#2D3436"/>
      <circle cx="89" cy="102.5" r="2" fill="white"/>
      <circle cx="117" cy="102.5" r="2" fill="white"/>
      {/* Eyebrows raised */}
      <path d="M78 92 Q86 87 94 92" stroke="#3D2B1F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M106 92 Q114 87 122 92" stroke="#3D2B1F" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Mouth – singing wide */}
      <ellipse cx="100" cy="122" rx="11" ry="9" fill="#C07060"/>
      <ellipse cx="100" cy="118" rx="11" ry="4" fill="#E8967A"/>
      {/* Sparkles */}
      <g fill="#FFC857">
        <circle cx="38" cy="72" r="6"/>
        <circle cx="162" cy="62" r="5"/>
        <circle cx="36" cy="132" r="4"/>
        <circle cx="164" cy="138" r="4"/>
        <circle cx="100" cy="28" r="4"/>
      </g>
      <circle cx="155" cy="88" r="3" fill="white" opacity="0.8"/>
      <circle cx="42" cy="108" r="3" fill="white" opacity="0.7"/>
    </svg>
  );
}

// ─── 5. Espíritu Melódico ─────────────────────────────────────
function EspirituMelodico({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="em-bg" cx="50%" cy="40%">
          <stop offset="0%" stopColor="#C5B0FF"/>
          <stop offset="100%" stopColor="#4A1FA0"/>
        </radialGradient>
        <linearGradient id="em-spirit" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#38B6FF" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#8E6CFF" stopOpacity="0.85"/>
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="100" fill="url(#em-bg)"/>
      {/* Spirit body – organic shape */}
      <path d="M72 165 C50 138 46 82 72 54 C82 43 95 40 100 40 C105 40 118 43 128 54 C154 82 150 138 128 165 C114 180 86 180 72 165Z" fill="url(#em-spirit)" opacity="0.75"/>
      {/* Inner glow ring */}
      <ellipse cx="100" cy="108" rx="42" ry="52" fill="none" stroke="#D0C0FF" strokeWidth="2" opacity="0.45"/>
      {/* Musical note 1 */}
      <circle cx="72" cy="73" r="9" fill="#FFC857"/>
      <rect x="79" y="46" width="6" height="30" rx="3" fill="#FFC857"/>
      <rect x="79" y="46" width="22" height="5.5" rx="2.5" fill="#FFC857"/>
      {/* Musical note 2 */}
      <circle cx="130" cy="86" r="7.5" fill="#FFC857" opacity="0.9"/>
      <rect x="136" y="62" width="5" height="26" rx="2.5" fill="#FFC857" opacity="0.9"/>
      <rect x="136" y="62" width="18" height="5" rx="2.5" fill="#FFC857" opacity="0.9"/>
      {/* Infinity / loop symbol */}
      <path
        d="M76 108 C76 95 84 88 93 95 C100 100 100 117 107 117 C116 117 124 108 124 95 C124 82 116 75 107 82 C100 87 100 104 93 104 C84 104 76 108 76 108Z"
        fill="none" stroke="white" strokeWidth="4" opacity="0.9"
      />
      {/* Sparkles */}
      <g fill="white" opacity="0.85">
        <circle cx="40" cy="70" r="4.5"/>
        <circle cx="160" cy="65" r="3.5"/>
        <circle cx="36" cy="130" r="3"/>
        <circle cx="164" cy="138" r="4"/>
        <circle cx="100" cy="32" r="3.5"/>
        <circle cx="50" cy="160" r="2.5"/>
        <circle cx="150" cy="158" r="2.5"/>
      </g>
      {/* Shimmer accents */}
      <path d="M46 96 L53 100 L46 104" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
      <path d="M154 92 L147 96 L154 100" stroke="white" strokeWidth="1.5" fill="none" opacity="0.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Mapa y componente público ────────────────────────────────

const SVG_MAP: Record<AvatarId, (props: { size: number }) => React.ReactElement> = {
  explorador: ExploradorVocal,
  maestro:    MaestroDelRitmo,
  guardian:   GuardianDeLaArmonia,
  estrella:   EstrellaEnFormacion,
  espiritu:   EspirituMelodico,
};

export function AvatarSVG({ id, size = 80 }: { id: AvatarId; size?: number }) {
  const Comp = SVG_MAP[id];
  return Comp ? <Comp size={size} /> : null;
}

export function isAvatarId(value: string): value is AvatarId {
  return value in SVG_MAP;
}
