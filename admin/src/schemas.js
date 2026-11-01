// admin/src/schemas.js — schema-driven module definitions (fields match
// supabase/migrations/0001_schema.sql exactly).

const EMPLOYMENT_TYPES = [
  'Full-time', 'Internship', 'Part-time', 'Freelance', 'Volunteer',
  'Research', 'Community Service', 'Organization', 'Other',
].map((v) => ({ value: v, label: v }));

const PROFICIENCY_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']
  .map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));

const ORG_TYPES = ['Student organization', 'NGO', 'Community', 'Professional', 'Other']
  .map((v) => ({ value: v, label: v }));

const SOCIAL_PLATFORMS = ['email', 'linkedin', 'github', 'instagram', 'website', 'other']
  .map((v) => ({ value: v, label: v[0].toUpperCase() + v.slice(1) }));

const DOC_TYPES = ['cv', 'portfolio', 'certificate', 'other']
  .map((v) => ({ value: v, label: v.toUpperCase() }));

const STATUS_FIELD = {
  name: 'status',
  label: 'Status',
  type: 'select',
  section: 'Basic',
  required: true,
  options: [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
  ],
};

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

const projects = {
  key: 'projects',
  table: 'projects',
  label: 'Projects',
  singular: 'project',
  icon: 'projects',
  titleField: 'title',
  slugField: 'slug',
  slugSource: 'title',
  orderField: 'sort_order',
  searchFields: ['title', 'short_description'],
  categoryKind: 'project',
  categoryField: 'category_id',
  manageCategories: true,
  mediaTable: 'project_media',
  defaults: { include_in_works: true, featured: false, status: 'draft', sort_order: 0, display_priority: 0 },
  listColumns: [
    { key: 'title', label: 'Title', sortable: true, type: 'title-image', imageField: 'thumbnail_url' },
    { key: 'category', label: 'Category', sortable: false, type: 'category' },
    { key: 'status', label: 'Status', sortable: true, type: 'status' },
    { key: 'updated_at', label: 'Updated', sortable: true, type: 'updated' },
    { key: 'sort_order', label: 'Order', sortable: true, type: 'number' },
  ],
  sections: ['Basic', 'Technical', 'Media', 'External Links', 'Display'],
  fields: [
    { name: 'title', label: 'Title', type: 'text', section: 'Basic', required: true },
    { name: 'slug', label: 'Slug', type: 'slug', section: 'Basic', required: true, help: 'URL identifier: a-z, 0-9 and hyphens only. Auto-generated from the title.' },
    { name: 'short_description', label: 'Short description', type: 'textarea', section: 'Basic', rows: 3, help: 'One-paragraph summary shown in cards and lists.' },
    { name: 'full_description', label: 'Full description', type: 'markdown', section: 'Basic', rows: 12 },
    { name: 'category_id', label: 'Category', type: 'select', section: 'Basic', optionsFromCategories: 'project', nullable: true },
    STATUS_FIELD,
    { name: 'start_date', label: 'Start date', type: 'date', section: 'Basic' },
    { name: 'completion_date', label: 'Completion date', type: 'date', section: 'Basic' },
    { name: 'location', label: 'Location', type: 'text', section: 'Basic' },
    { name: 'role', label: 'Role', type: 'text', section: 'Basic' },
    { name: 'team', label: 'Team', type: 'text', section: 'Basic' },

    { name: 'technologies', label: 'Technologies', type: 'tags', section: 'Technical', placeholder: 'e.g. Python, React — press Enter to add' },
    { name: 'tools', label: 'Tools', type: 'tags', section: 'Technical' },
    { name: 'technical_skills', label: 'Technical skills', type: 'tags', section: 'Technical' },
    { name: 'methodology', label: 'Methodology', type: 'markdown', section: 'Technical', rows: 8 },
    { name: 'technical_specifications', label: 'Technical specifications', type: 'markdown', section: 'Technical', rows: 8 },
    { name: 'key_achievements', label: 'Key achievements', type: 'markdown', section: 'Technical', rows: 8 },
    { name: 'project_outcomes', label: 'Project outcomes', type: 'markdown', section: 'Technical', rows: 8 },

    { name: 'thumbnail_url', label: 'Thumbnail', type: 'image', section: 'Media' },
    { name: 'thumbnail_alt', label: 'Thumbnail alt text', type: 'text', section: 'Media' },
    { name: 'cover_url', label: 'Cover image', type: 'image', section: 'Media' },
    { name: 'cover_alt', label: 'Cover alt text', type: 'text', section: 'Media' },
    { name: 'video_url', label: 'Video URL', type: 'url', section: 'Media', placeholder: 'https://…' },
    { name: '__project_media', label: 'Project gallery', type: 'gallery', section: 'Media', help: 'Ordered image gallery for this project. Drag to reorder.' },

    { name: 'live_url', label: 'Live URL', type: 'url', section: 'External Links', placeholder: 'https://…' },
    { name: 'github_url', label: 'GitHub URL', type: 'url', section: 'External Links', placeholder: 'https://…' },
    { name: 'documentation_url', label: 'Documentation URL', type: 'url', section: 'External Links', placeholder: 'https://…' },
    { name: 'publication_url', label: 'Publication URL', type: 'url', section: 'External Links', placeholder: 'https://…' },
    { name: 'related_resources', label: 'Related resources', type: 'links', section: 'External Links' },

    { name: 'featured', label: 'Featured', type: 'checkbox', section: 'Display', checkboxLabel: 'Highlight this project as featured' },
    { name: 'include_in_works', label: 'Include in works', type: 'checkbox', section: 'Display', checkboxLabel: 'Show in the public Works carousel' },
    { name: 'display_priority', label: 'Display priority', type: 'number', section: 'Display', min: 0, help: 'Higher numbers are emphasised on the public site.' },
    { name: 'sort_order', label: 'Sort order', type: 'number', section: 'Display', min: 0, help: 'Controls list ordering. Lower numbers come first.' },
  ],
};

/* ------------------------------------------------------------------ */
/* Experiences                                                         */
/* ------------------------------------------------------------------ */

const experiences = {
  key: 'experiences',
  table: 'experiences',
  label: 'Experiences',
  singular: 'experience',
  icon: 'experiences',
  titleField: 'title',
  titleFallback: 'organization_name',
  slugField: 'slug',
  slugSource: 'organization_name',
  orderField: 'sort_order',
  searchFields: ['title', 'organization_name', 'position'],
  defaults: { status: 'draft', currently_working: false, include_in_works: false, sort_order: 0, display_priority: 0 },
  listColumns: [
    { key: 'title', label: 'Experience', sortable: true, type: 'title-image', imageField: 'logo_url', fallbackField: 'organization_name' },
    { key: 'employment_type', label: 'Type', sortable: true, type: 'text' },
    { key: 'status', label: 'Status', sortable: true, type: 'status' },
    { key: 'updated_at', label: 'Updated', sortable: true, type: 'updated' },
    { key: 'sort_order', label: 'Order', sortable: true, type: 'number' },
  ],
  sections: ['Basic', 'Technical', 'Media', 'External Links', 'Display'],
  fields: [
    { name: 'title', label: 'Title', type: 'text', section: 'Basic', help: 'Leave blank to use “Organization — Position”.' },
    { name: 'slug', label: 'Slug', type: 'slug', section: 'Basic', required: true, help: 'URL identifier: a-z, 0-9 and hyphens only.' },
    { name: 'organization_name', label: 'Organization', type: 'text', section: 'Basic', required: true },
    { name: 'position', label: 'Position', type: 'text', section: 'Basic', required: true },
    { name: 'employment_type', label: 'Employment type', type: 'select', section: 'Basic', options: EMPLOYMENT_TYPES },
    { name: 'location', label: 'Location', type: 'text', section: 'Basic' },
    { name: 'start_date', label: 'Start date', type: 'date', section: 'Basic' },
    { name: 'end_date', label: 'End date', type: 'date', section: 'Basic' },
    { name: 'currently_working', label: 'Currently working here', type: 'checkbox', section: 'Basic', checkboxLabel: 'I currently work here (disables the end date)' },
    { name: 'short_description', label: 'Short description', type: 'textarea', section: 'Basic', rows: 3 },
    { name: 'description', label: 'Description', type: 'markdown', section: 'Basic', rows: 10 },
    { name: 'responsibilities', label: 'Responsibilities', type: 'markdown', section: 'Basic', rows: 8 },
    { name: 'achievements', label: 'Achievements', type: 'markdown', section: 'Basic', rows: 8 },

    { name: 'skills', label: 'Skills', type: 'tags', section: 'Technical' },

    { name: 'logo_url', label: 'Organization logo', type: 'image', section: 'Media' },
    { name: 'media', label: 'Media', type: 'gallery', section: 'Media', help: 'Ordered image gallery stored with this experience.' },

    { name: 'external_links', label: 'External links', type: 'links', section: 'External Links' },

    { name: 'include_in_works', label: 'Include in works', type: 'checkbox', section: 'Display', checkboxLabel: 'Show in the public Works section' },
    { name: 'display_priority', label: 'Display priority', type: 'number', section: 'Display', min: 0 },
    { name: 'sort_order', label: 'Sort order', type: 'number', section: 'Display', min: 0 },
    STATUS_FIELD,
  ],
};

/* ------------------------------------------------------------------ */
/* Education                                                           */
/* ------------------------------------------------------------------ */

const education = {
  key: 'education',
  table: 'education',
  label: 'Education',
  singular: 'education entry',
  icon: 'education',
  titleField: 'institution',
  orderField: 'display_order',
  searchFields: ['institution', 'degree', 'field_of_study'],
  defaults: { status: 'draft', display_order: 0 },
  listColumns: [
    { key: 'institution', label: 'Institution', sortable: true, type: 'title-image', imageField: 'logo_url' },
    { key: 'degree', label: 'Degree', sortable: true, type: 'text' },
    { key: 'status', label: 'Status', sortable: true, type: 'status' },
    { key: 'updated_at', label: 'Updated', sortable: true, type: 'updated' },
    { key: 'display_order', label: 'Order', sortable: true, type: 'number' },
  ],
  sections: ['Basic', 'Technical', 'Media', 'External Links', 'Display'],
  fields: [
    { name: 'institution', label: 'Institution', type: 'text', section: 'Basic', required: true },
    { name: 'degree', label: 'Degree', type: 'text', section: 'Basic' },
    { name: 'field_of_study', label: 'Field of study', type: 'text', section: 'Basic' },
    { name: 'start_date', label: 'Start date', type: 'date', section: 'Basic' },
    { name: 'graduation_date', label: 'Graduation date', type: 'date', section: 'Basic' },
    { name: 'description', label: 'Description', type: 'markdown', section: 'Basic', rows: 10 },
    { name: 'achievements', label: 'Achievements', type: 'markdown', section: 'Basic', rows: 8 },

    { name: 'relevant_coursework', label: 'Relevant coursework', type: 'tags', section: 'Technical' },

    { name: 'logo_url', label: 'Institution logo', type: 'image', section: 'Media' },

    { name: 'documents', label: 'Documents', type: 'links', section: 'External Links', help: 'Links to certificates, transcripts or related documents.' },

    { name: 'display_order', label: 'Display order', type: 'number', section: 'Display', min: 0 },
    STATUS_FIELD,
  ],
};

/* ------------------------------------------------------------------ */
/* Skills                                                              */
/* ------------------------------------------------------------------ */

const skills = {
  key: 'skills',
  table: 'skills',
  label: 'Skills',
  singular: 'skill',
  icon: 'skills',
  titleField: 'name',
  orderField: 'sort_order',
  searchFields: ['name', 'description'],
  categoryKind: 'skill_group',
  categoryField: 'category_id',
  manageCategories: true,
  defaults: { status: 'draft', show_proficiency: false, sort_order: 0 },
  listColumns: [
    { key: 'name', label: 'Skill', sortable: true, type: 'title-image', imageField: 'icon_url' },
    { key: 'category', label: 'Group', sortable: false, type: 'category' },
    { key: 'proficiency_level', label: 'Level', sortable: true, type: 'text' },
    { name: 'show_proficiency', key: 'show_proficiency', label: 'Show %', sortable: true, type: 'boolean' },
    { key: 'status', label: 'Status', sortable: true, type: 'status' },
    { key: 'updated_at', label: 'Updated', sortable: true, type: 'updated' },
    { key: 'sort_order', label: 'Order', sortable: true, type: 'number' },
  ],
  sections: ['Basic', 'Technical', 'Media', 'Display'],
  fields: [
    { name: 'name', label: 'Name', type: 'text', section: 'Basic', required: true },
    { name: 'category_id', label: 'Group', type: 'select', section: 'Basic', optionsFromCategories: 'skill_group', nullable: true },
    { name: 'proficiency_level', label: 'Proficiency level', type: 'select', section: 'Basic', options: PROFICIENCY_LEVELS, emptyLabel: '— Not set —' },
    { name: 'proficiency_percent', label: 'Proficiency percent', type: 'number', section: 'Basic', min: 0, max: 100, help: 'Optional 0–100 value used when proficiency is shown.' },
    { name: 'show_proficiency', label: 'Show proficiency', type: 'checkbox', section: 'Basic', checkboxLabel: 'Show proficiency on the public site', help: 'Proficiency is hidden on the public site unless enabled.' },
    { name: 'description', label: 'Description', type: 'textarea', section: 'Basic', rows: 3 },

    { name: 'related_projects', label: 'Related projects', type: 'tags', section: 'Technical', placeholder: 'Project slugs — press Enter to add', help: 'Comma-separated project slugs.' },

    { name: 'icon_url', label: 'Icon', type: 'image', section: 'Media' },

    { name: 'sort_order', label: 'Sort order', type: 'number', section: 'Display', min: 0 },
    STATUS_FIELD,
  ],
};

/* ------------------------------------------------------------------ */
/* Organizations                                                       */
/* ------------------------------------------------------------------ */

const organizations = {
  key: 'organizations',
  table: 'organizations',
  label: 'Organizations',
  singular: 'organization',
  icon: 'organizations',
  titleField: 'organization_name',
  slugField: 'slug',
  slugSource: 'organization_name',
  orderField: 'sort_order',
  searchFields: ['organization_name', 'position', 'description'],
  defaults: { status: 'draft', sort_order: 0 },
  listColumns: [
    { key: 'organization_name', label: 'Organization', sortable: true, type: 'title-image', imageField: 'logo_url' },
    { key: 'position', label: 'Position', sortable: true, type: 'text' },
    { key: 'organization_type', label: 'Type', sortable: true, type: 'text' },
    { key: 'status', label: 'Status', sortable: true, type: 'status' },
    { key: 'updated_at', label: 'Updated', sortable: true, type: 'updated' },
    { key: 'sort_order', label: 'Order', sortable: true, type: 'number' },
  ],
  sections: ['Basic', 'Technical', 'Media', 'External Links', 'Display'],
  fields: [
    { name: 'slug', label: 'Slug', type: 'slug', section: 'Basic', required: true },
    { name: 'organization_name', label: 'Organization name', type: 'text', section: 'Basic', required: true },
    { name: 'position', label: 'Position', type: 'text', section: 'Basic' },
    { name: 'organization_type', label: 'Organization type', type: 'select', section: 'Basic', options: ORG_TYPES },
    { name: 'start_date', label: 'Start date', type: 'date', section: 'Basic' },
    { name: 'end_date', label: 'End date', type: 'date', section: 'Basic' },
    { name: 'description', label: 'Description', type: 'markdown', section: 'Basic', rows: 10 },
    { name: 'responsibilities', label: 'Responsibilities', type: 'markdown', section: 'Basic', rows: 8 },
    { name: 'achievements', label: 'Achievements', type: 'markdown', section: 'Basic', rows: 8 },

    { name: 'related_experiences', label: 'Related experiences', type: 'tags', section: 'Technical', help: 'Experience slugs related to this organization.' },

    { name: 'logo_url', label: 'Logo', type: 'image', section: 'Media' },

    { name: 'external_links', label: 'External links', type: 'links', section: 'External Links' },

    { name: 'sort_order', label: 'Sort order', type: 'number', section: 'Display', min: 0 },
    STATUS_FIELD,
  ],
};

/* ------------------------------------------------------------------ */
/* Gallery / Photography                                               */
/* ------------------------------------------------------------------ */

const gallery = {
  key: 'gallery',
  table: 'gallery',
  label: 'Photography / Gallery',
  singular: 'photo',
  icon: 'gallery',
  titleField: 'title',
  orderField: 'sort_order',
  searchFields: ['title', 'description', 'location'],
  categoryKind: 'gallery',
  categoryField: 'category_id',
  manageCategories: true,
  listView: 'gallery',
  defaults: { status: 'draft', featured: false, sort_order: 0 },
  listColumns: [],
  sections: ['Basic', 'Media', 'Display'],
  fields: [
    { name: 'title', label: 'Title', type: 'text', section: 'Basic', required: true },
    { name: 'description', label: 'Description', type: 'textarea', section: 'Basic', rows: 3 },
    { name: 'category_id', label: 'Category', type: 'select', section: 'Basic', optionsFromCategories: 'gallery', nullable: true },
    { name: 'location', label: 'Location', type: 'text', section: 'Basic' },
    { name: 'capture_date', label: 'Capture date', type: 'date', section: 'Basic' },
    STATUS_FIELD,

    { name: 'image_url', label: 'Image', type: 'image', section: 'Media', required: true },
    { name: 'alt_text', label: 'Alt text', type: 'text', section: 'Media', help: 'Describe the photo for accessibility and SEO.' },

    { name: 'featured', label: 'Featured', type: 'checkbox', section: 'Display', checkboxLabel: 'Feature this photo' },
    { name: 'sort_order', label: 'Sort order', type: 'number', section: 'Display', min: 0 },
  ],
};

/* ------------------------------------------------------------------ */
/* Singleton / auxiliary schemas (custom views)                        */
/* ------------------------------------------------------------------ */

const profile = {
  key: 'profile',
  table: 'profiles',
  label: 'About & Profile',
  singular: 'profile',
  icon: 'profile',
  titleField: 'full_name',
  sections: ['Basic', 'Media', 'Display'],
  fields: [
    { name: 'full_name', label: 'Full name', type: 'text', section: 'Basic', required: true },
    { name: 'hero_line1', label: 'Hero line 1', type: 'text', section: 'Basic' },
    { name: 'hero_line2', label: 'Hero line 2', type: 'text', section: 'Basic' },
    { name: 'professional_headline', label: 'Professional headline', type: 'text', section: 'Basic' },
    { name: 'short_intro', label: 'Short intro (typewriter line)', type: 'textarea', section: 'Basic', rows: 2 },
    { name: 'about_heading', label: 'About heading', type: 'text', section: 'Basic' },
    { name: 'about_body', label: 'About body', type: 'markdown', section: 'Basic', rows: 12 },
    { name: 'professional_interests', label: 'Professional interests', type: 'tags', section: 'Basic' },
    { name: 'areas_of_expertise', label: 'Areas of expertise', type: 'tags', section: 'Basic' },
    { name: 'location', label: 'Location', type: 'text', section: 'Basic' },
    { name: 'availability_status', label: 'Availability status', type: 'text', section: 'Basic', placeholder: 'e.g. Open for collaborations' },

    { name: 'profile_photo_url', label: 'Profile photo', type: 'image', section: 'Media' },
    { name: 'profile_photo_alt', label: 'Photo alt text', type: 'text', section: 'Media' },

    STATUS_FIELD,
  ],
};

const socialLinks = {
  key: 'social_links',
  table: 'social_links',
  label: 'Social link',
  singular: 'social link',
  icon: 'contact',
  titleField: 'label',
  sections: ['Basic', 'Display'],
  fields: [
    { name: 'platform', label: 'Platform', type: 'select', section: 'Basic', required: true, options: SOCIAL_PLATFORMS },
    { name: 'label', label: 'Label', type: 'text', section: 'Basic', placeholder: 'e.g. GitHub' },
    { name: 'url', label: 'URL', type: 'url', section: 'Basic', required: true, placeholder: 'https://… (mailto:… for email)', help: 'Must start with https:// — mailto: is allowed for the email platform.' },
    { name: 'icon', label: 'Icon name', type: 'text', section: 'Basic', help: 'Optional icon identifier used by the public site.' },
    { name: 'sort_order', label: 'Sort order', type: 'number', section: 'Display', min: 0 },
    { name: 'visible', label: 'Visible', type: 'checkbox', section: 'Display', checkboxLabel: 'Show this link on the public site' },
  ],
};

const documents = {
  key: 'documents',
  table: 'documents',
  label: 'Documents',
  singular: 'document',
  icon: 'documents',
  titleField: 'title',
  sections: ['Basic'],
  fields: [
    { name: 'title', label: 'Title', type: 'text', section: 'Basic', required: true },
    { name: 'description', label: 'Description', type: 'textarea', section: 'Basic', rows: 3 },
    { name: 'doc_type', label: 'Document type', type: 'select', section: 'Basic', required: true, options: DOC_TYPES },
    { name: 'version', label: 'Version', type: 'text', section: 'Basic', placeholder: 'e.g. 2026.1' },
  ],
};

const siteImages = {
  key: 'site_images',
  table: 'site_images',
  label: 'Media slot',
  singular: 'media slot',
  icon: 'gallery',
  titleField: 'key',
  sections: ['Basic', 'Media'],
  fields: [
    { name: 'key', label: 'Key', type: 'text', section: 'Basic', required: true, help: 'Immutable identifier for this media slot (e.g. profile_image).' },
    { name: 'url', label: 'Image', type: 'image', section: 'Media' },
    { name: 'alt', label: 'Alt text', type: 'text', section: 'Media' },
    { name: 'caption', label: 'Caption', type: 'text', section: 'Media' },
  ],
};

export const modules = {
  projects,
  experiences,
  education,
  skills,
  organizations,
  gallery,
};

export const schemas = {
  profile,
  social_links: socialLinks,
  documents,
  site_images: siteImages,
};

export const CONTENT_MODULE_ORDER = ['projects', 'experiences', 'education', 'skills', 'organizations', 'gallery'];
