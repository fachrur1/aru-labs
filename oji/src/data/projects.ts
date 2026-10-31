export type ProjectStatus = 'draft' | 'published' | 'archived';

export type Project = {
  slug: string;
  title: string;
  category: string;
  status: ProjectStatus;
  year: string;
  role: string;
  tools: string[];
  description: string;
  cover: string;
  gallery: { src: string; alt: string; caption: string }[];
  color: string;
  video?: string;
};

// Original records: content/data.json. Artwork mapping: content/images.json.
// Only projects with local, attributable artwork are published here.
export const projects: Project[] = [
  {
    slug: 'nala-2024',
    title: 'Nala — Pionir Kesatria',
    category: 'Character design',
    status: 'published',
    year: '2024',
    role: '3D Mascot Designer',
    tools: ['3D Modeling', 'Character Design', 'Visual Branding', 'Asset Development'],
    description: 'A new chapter for a familiar character. Following the transition from PPSMB Kesatria to Pionir Kesatria, I refined the 3D mascot Nala with the design team. The work preserved the character’s recognizability while adapting its presentation and assets to the event’s renewed identity.\n\nThe process balanced continuity with a new visual direction: refining the model, responding to team feedback, and preparing consistent assets for promotional and digital materials. These original renders show the character in a feathered headdress, a graduation pose, and a greeting pose.',
    cover: '/artwork/nala-2024.webp',
    gallery: [
      { src: '/artwork/nala-2024.webp', alt: 'Nala, a golden owl-like mascot with a feathered headdress and both hands raised.', caption: 'Nala 2024 — character render with feathered headdress.' },
      { src: '/artwork/nala-2024-graduate.webp', alt: 'Nala wearing a graduation cap, holding green books and lifting a blue book.', caption: 'Graduation pose — an alternate character application.' },
      { src: '/artwork/nala-2024-wave.webp', alt: 'Nala in its feathered headdress with one hand raised in greeting.', caption: 'Greeting pose — a second expression of the same identity.' },
    ],
    color: '#F4D885',
  },
  {
    slug: 'ferrumium',
    title: 'Ferrumium',
    category: 'Product design',
    status: 'published',
    year: '2023–2024',
    role: 'Product Design Staff (2023) / Chief Technology Officer (2024)',
    tools: ['Blender 3D', 'AutoCAD 3D', 'Autodesk 3ds Max', 'Figma'],
    description: 'Discarded lighter components became the starting point for a collection of miniature robots. As Product Design Staff on the 2023 PKM-K-funded Ferrumium project, I contributed product concepts and design variations, working with the team to balance visual character, material constraints, and manufacturability.\n\nIn 2024, I led technical and product development as Chief Technology Officer as Ferrumium progressed into the P2MW program. The work included design improvements, production-method evaluation, and technical coordination. The original Robot Utuh and Kotak Revisi renders document the robot and its packaging—not photographs of a manufactured final product.',
    cover: '/artwork/ferrumium-robot.webp',
    gallery: [
      { src: '/artwork/ferrumium-robot.webp', alt: 'A dark-blue miniature robot design with articulated silver mechanisms on a display base.', caption: 'Robot Utuh — the complete robot product render.' },
      { src: '/artwork/ferrumium-packaging.webp', alt: 'Open blue Ferrumium display packaging with illustrated panels on a wood-textured circular platform.', caption: 'Kotak Revisi — the revised packaging design render.' },
    ],
    color: '#A9D9E7',
  },
  {
    slug: 'nala-2023',
    title: 'Nala — PPSMB Kesatria',
    category: 'Character design',
    status: 'published',
    year: '2023',
    role: '3D Mascot Designer',
    tools: ['3D Modeling', 'Character Design', 'Visual Branding', 'Asset Development'],
    description: 'Translating a character concept into a 3D identity for PPSMB Kesatria 2023. I developed the Nala mascot model with the creative team, refining the asset through feedback and preparing it for promotional materials, digital content, and event branding.\n\nThe work centered on carrying a consistent personality across different poses and media. This original composition brings three Nala poses together in the event’s illustrated environment.',
    cover: '/artwork/nala-2023.webp',
    gallery: [
      { src: '/artwork/nala-2023.webp', alt: 'Three golden Nala mascots in different poses against an orange sky and a layered blue illustrated landscape.', caption: 'Nala 2023 — three poses in the original event composition.' },
    ],
    color: '#F1B99D',
  },
  {
    slug: 'photobioreactor',
    title: 'Photobioreactor',
    category: 'Research visualization',
    status: 'published',
    year: '2024',
    role: 'Photobioreactor Prototype Designer',
    tools: ['Blender 3D', 'AutoCAD 3D', 'Autodesk 3ds Max', 'Figma'],
    description: 'Engineering visualization for microalgae-based biodiesel research. I designed a photobioreactor prototype concept as part of the collaborative paper “Bioengineering of Microalgae: Genome Editing of Chlamydomonas reinhardtii for Enhanced Biodiesel Productivity Through CRISPRi.”\n\nThe contribution was conceptual design, system visualization, and engineering representation to communicate controlled cultivation and the intended integration of biotechnology with renewable energy. The paper received third place at the Scientific Paper Competition EXPO 2024, organized by Universitas Lampung. These are design renders, not evidence of an operating cultivation system or measured biodiesel output.',
    cover: '/artwork/photobioreactor.webp',
    gallery: [
      { src: '/artwork/photobioreactor.webp', alt: 'A photobioreactor concept with a turquoise housing, upright components, green internals, and blue tubing on a wood-textured platform.', caption: 'Photobioreactor prototype — the original engineering concept render.' },
      { src: '/artwork/microalgae-flask.webp', alt: 'A rendered glass conical flask containing golden-brown liquid against a gray background.', caption: 'Supporting research visualization — flask render.' },
    ],
    color: '#D7F0EB',
  },
  {
    slug: 'nef-2023',
    title: 'National Energy Festival',
    category: 'Event documentation',
    status: 'published',
    year: '2023',
    role: 'Creative Design & Media Staff',
    tools: ['Blender 3D', 'AutoCAD 3D', 'Autodesk 3ds Max', 'Figma', 'Adobe Illustrator', 'Sony HXR-NX2500'],
    description: 'Creative and live-media work for National Energy Festival UGM 2023. I contributed to the festival’s 3D mascot and graphic assets with the creative team, and operated a Sony HXR-NX2500 camera during livestream sessions.\n\nThe available local image documents the camera-operation side of this contribution. It is shown at its original modest resolution; the separate mascot and livestream footage are not included in this archive.',
    cover: '/artwork/nef-2023.webp',
    gallery: [
      { src: '/artwork/nef-2023.webp', alt: 'A masked camera operator beside a tripod-mounted video camera in front of an NEF event backdrop.', caption: 'National Energy Festival UGM 2023 — live-event camera operation.' },
    ],
    color: '#C3BDD8',
  },
];

export const categories = [...new Set(projects.filter(project => project.status === 'published' && project.category.trim()).map(project => project.category))];

export const contact = {
  email: 'fahrulll2712@gmail.com',
  linkedin: 'https://www.linkedin.com/in/muhammad-fachrurrozy-5ab2ba1a5/',
  instagram: 'https://www.instagram.com/fachrur.rz_/',
};

export const profile = {
  image: '/artwork/fachrurrozy.webp',
  name: 'Muhammad Fachrurrozy',
  introduction: 'Engineering curiosity. A visual way of thinking. I work across 3D character design, product visualization, and renewable-energy research.',
  background: 'My background is in Engineering Physics at Universitas Gadjah Mada, following Mechanical Engineering at SMKN 1 Karawang. My interests connect renewable energy, building physics, acoustics, 3D design, and GIS analysis. I use modeling and visualization to make technical ideas easier to understand, without losing the details that matter.',
  tools: ['Blender', 'Unreal Engine 5', 'Figma', 'After Effects', 'AutoCAD', 'Inventor', 'QGIS', 'LEAP', 'WEAP', 'SAM'],
  experience: [
    { year: '2024', title: 'Research & Innovation — SRE UGM', description: 'Contributed to photobioreactor concepts and photovoltaic-powered smart irrigation design through the Society of Renewable Energy UGM.' },
    { year: '2024', title: 'Creative Economy — UPII UGM', description: 'Supported interdisciplinary entrepreneurship, innovation, and community initiatives.' },
    { year: '2023–2024', title: 'Ferrumium', description: 'Product Design Staff for the PKM-K project in 2023; Chief Technology Officer for the P2MW startup program in 2024.' },
    { year: '2023–2024', title: 'Nala / Kesatria', description: 'Developed the 3D mascot for PPSMB Kesatria 2023 and refined the assets for Pionir Kesatria 2024.' },
    { year: '2022–Present', title: 'Engineering Physics — Universitas Gadjah Mada', description: 'Studies connecting technical modeling, sustainable energy, instrumentation, and visual problem-solving.' },
    { year: '2019–2022', title: 'Mechanical Engineering — SMKN 1 Karawang', description: 'A technical foundation before continuing into Engineering Physics.' },
  ],
};
