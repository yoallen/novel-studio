// Database schema and migrations. Each migration runs once, in order, inside a transaction.
// Never edit a shipped migration; add a new one.

export const MIGRATIONS: { version: number; name: string; sql: string; rebuild?: boolean }[] = [
  {
    version: 1,
    name: 'initial',
    sql: `
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  profile_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL CHECK (kind IN ('story_bible','archive','conversation','spreadsheet','author_entry','ai_session','document','other')),
  name TEXT NOT NULL,
  made_at TEXT,
  file_hash TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);
CREATE INDEX sources_project ON sources(project_id);

CREATE TABLE excerpts (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES sources(id),
  locator TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX excerpts_source ON excerpts(source_id);

CREATE TABLE elements (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT '',
  parent_id TEXT REFERENCES elements(id),
  sort_key REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX elements_project_kind ON elements(project_id, kind, sort_key);

CREATE TABLE statements (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  element_id TEXT NOT NULL REFERENCES elements(id),
  field TEXT NOT NULL,
  value_json TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('established','developing','unanswered','illustrative','proposed','set_aside')),
  speaker_kind TEXT NOT NULL CHECK (speaker_kind IN ('author','assistant','source')),
  speaker_name TEXT NOT NULL DEFAULT '',
  source_id TEXT REFERENCES sources(id),
  excerpt_id TEXT REFERENCES excerpts(id),
  made_at TEXT NOT NULL,
  supersedes_id TEXT REFERENCES statements(id),
  superseded_by_id TEXT REFERENCES statements(id),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX statements_element_field ON statements(element_id, field);
CREATE INDEX statements_project ON statements(project_id);

CREATE TABLE links (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  from_id TEXT NOT NULL REFERENCES elements(id),
  to_id TEXT NOT NULL REFERENCES elements(id),
  relation TEXT NOT NULL,
  strength TEXT NOT NULL DEFAULT 'direct' CHECK (strength IN ('direct','inferred')),
  note TEXT NOT NULL DEFAULT '',
  source_id TEXT REFERENCES sources(id),
  excerpt_id TEXT REFERENCES excerpts(id),
  created_at TEXT NOT NULL,
  deleted_at TEXT,
  CHECK (from_id <> to_id)
);
CREATE INDEX links_from ON links(from_id);
CREATE INDEX links_to ON links(to_id);

CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  position REAL NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX chapters_project ON chapters(project_id, position);

CREATE TABLE scenes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  title TEXT NOT NULL,
  position REAL NOT NULL,
  doc_json TEXT NOT NULL DEFAULT '{"type":"doc","content":[]}',
  text TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea','planned','ready','drafting','first_draft','revising','revised','final')),
  pov_element_id TEXT REFERENCES elements(id),
  plan_element_id TEXT REFERENCES elements(id),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX scenes_chapter ON scenes(chapter_id, position);
CREATE INDEX scenes_project ON scenes(project_id);

CREATE TABLE scene_revisions (
  id TEXT PRIMARY KEY,
  scene_id TEXT NOT NULL REFERENCES scenes(id),
  version INTEGER NOT NULL,
  doc_json TEXT NOT NULL,
  text TEXT NOT NULL,
  word_count INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT 'save',
  created_at TEXT NOT NULL
);
CREATE INDEX scene_revisions_scene ON scene_revisions(scene_id, created_at);

CREATE TABLE autosave_journal (
  scene_id TEXT PRIMARY KEY REFERENCES scenes(id),
  base_version INTEGER NOT NULL,
  doc_json TEXT NOT NULL,
  text TEXT NOT NULL,
  saved_at TEXT NOT NULL
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id),
  mode TEXT NOT NULL DEFAULT 'discuss',
  focus_element_id TEXT REFERENCES elements(id),
  started_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX conversations_project ON conversations(project_id);

CREATE TABLE turns (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  position INTEGER NOT NULL,
  speaker_kind TEXT NOT NULL CHECK (speaker_kind IN ('author','assistant','source')),
  speaker_name TEXT NOT NULL DEFAULT '',
  text TEXT NOT NULL,
  said_at TEXT NOT NULL
);
CREATE INDEX turns_conversation ON turns(conversation_id, position);

CREATE TABLE marks (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  turn_id TEXT NOT NULL REFERENCES turns(id),
  start_offset INTEGER NOT NULL,
  end_offset INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('keep','possibility','not_canon','question','idea')),
  quote TEXT NOT NULL,
  element_id TEXT REFERENCES elements(id),
  statement_id TEXT REFERENCES statements(id),
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  deleted_at TEXT
);
CREATE INDEX marks_conversation ON marks(conversation_id);

CREATE TABLE proposals (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  origin TEXT NOT NULL,
  kind TEXT NOT NULL,
  target_json TEXT NOT NULL DEFAULT '{}',
  before_json TEXT,
  after_json TEXT,
  rationale TEXT NOT NULL DEFAULT '',
  citations_json TEXT NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','deferred')),
  created_at TEXT NOT NULL,
  decided_at TEXT,
  result_batch_id TEXT
);
CREATE INDEX proposals_project ON proposals(project_id, status);

CREATE TABLE batches (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  actor TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  reverted_by TEXT
);
CREATE INDEX batches_project ON batches(project_id, created_at);

CREATE TABLE journal (
  seq INTEGER PRIMARY KEY AUTOINCREMENT,
  batch_id TEXT NOT NULL REFERENCES batches(id),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  op TEXT NOT NULL CHECK (op IN ('insert','update','delete','restore')),
  field TEXT,
  before_json TEXT,
  after_json TEXT
);
CREATE INDEX journal_batch ON journal(batch_id);
CREATE INDEX journal_record ON journal(table_name, record_id);

CREATE TABLE writing_state (
  project_id TEXT PRIMARY KEY REFERENCES projects(id),
  scene_id TEXT REFERENCES scenes(id),
  cursor_json TEXT NOT NULL DEFAULT '{}',
  view_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE TABLE trail (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  from_json TEXT NOT NULL,
  to_json TEXT NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  returned_at TEXT
);
CREATE INDEX trail_project ON trail(project_id, created_at);

CREATE TABLE writing_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  started_at TEXT NOT NULL,
  ended_at TEXT,
  start_words INTEGER NOT NULL,
  end_words INTEGER,
  scenes_json TEXT NOT NULL DEFAULT '[]',
  note TEXT NOT NULL DEFAULT ''
);
CREATE INDEX writing_sessions_project ON writing_sessions(project_id, started_at);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL
);
`,
  },
  {
    version: 2,
    name: 'writing environment: custom scene ladder, confirmed drafts, author-reserved markers, element attributes, alternate structures',
    rebuild: true,
    sql: `
CREATE TABLE scenes_v2 (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  chapter_id TEXT NOT NULL REFERENCES chapters(id),
  title TEXT NOT NULL,
  position REAL NOT NULL,
  doc_json TEXT NOT NULL DEFAULT '{"type":"doc","content":[]}',
  text TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'idea',
  pov_element_id TEXT REFERENCES elements(id),
  plan_element_id TEXT REFERENCES elements(id),
  prose_version INTEGER NOT NULL DEFAULT 1,
  confirmed INTEGER NOT NULL DEFAULT 0 CHECK (confirmed IN (0,1)),
  reserved TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
INSERT INTO scenes_v2(id,project_id,chapter_id,title,position,doc_json,text,word_count,status,pov_element_id,plan_element_id,prose_version,created_at,updated_at,deleted_at,version)
  SELECT id,project_id,chapter_id,title,position,doc_json,text,word_count,status,pov_element_id,plan_element_id,version,created_at,updated_at,deleted_at,version FROM scenes;
DROP TABLE scenes;
ALTER TABLE scenes_v2 RENAME TO scenes;
CREATE INDEX scenes_chapter ON scenes(chapter_id, position);
CREATE INDEX scenes_project ON scenes(project_id);

ALTER TABLE elements ADD COLUMN reserved TEXT;
ALTER TABLE elements ADD COLUMN attrs_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE chapters ADD COLUMN notes TEXT NOT NULL DEFAULT '';
ALTER TABLE trail ADD COLUMN resolved INTEGER NOT NULL DEFAULT 0;
ALTER TABLE trail ADD COLUMN outcome TEXT NOT NULL DEFAULT '';

CREATE TABLE arrangements (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  name TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL CHECK (kind IN ('manuscript','plan')),
  order_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX arrangements_project ON arrangements(project_id);
`,
  },
  {
    version: 3,
    name: 'story brain: statement qualifiers and conversation links, custom kinds and fields',
    sql: `
ALTER TABLE statements ADD COLUMN turn_id TEXT REFERENCES turns(id);
ALTER TABLE statements ADD COLUMN qualifiers_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE proposals ADD COLUMN conversation_id TEXT REFERENCES conversations(id);
ALTER TABLE proposals ADD COLUMN turn_id TEXT REFERENCES turns(id);
ALTER TABLE conversations ADD COLUMN harvested_at TEXT;

CREATE TABLE kinds (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  plural TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE UNIQUE INDEX kinds_project_key ON kinds(project_id, key) WHERE deleted_at IS NULL;

CREATE TABLE field_defs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL,
  field TEXT NOT NULL,
  label TEXT NOT NULL,
  group_name TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  multi INTEGER NOT NULL DEFAULT 0,
  private INTEGER NOT NULL DEFAULT 0,
  sort REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX field_defs_project_kind ON field_defs(project_id, kind);
`,
  },
  {
    version: 4,
    name: 'continuity: chapter and scene viewpoint records, responses to review findings',
    sql: `
ALTER TABLE chapters ADD COLUMN pov_element_id TEXT REFERENCES elements(id);
ALTER TABLE chapters ADD COLUMN pov_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE scenes ADD COLUMN pov_json TEXT NOT NULL DEFAULT '{}';

CREATE TABLE finding_notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  finding_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('intentional','deferred','resolved')),
  note TEXT NOT NULL DEFAULT '',
  finding_text TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX finding_notes_project ON finding_notes(project_id, finding_key);
`,
  },
  {
    version: 5,
    name: 'import review queues and passage details',
    sql: `
CREATE TABLE imports (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL,
  source_id TEXT REFERENCES sources(id),
  name TEXT NOT NULL,
  plan_json TEXT NOT NULL,
  report_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','applied','discarded')),
  created_at TEXT NOT NULL,
  applied_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX imports_project ON imports(project_id, status);
ALTER TABLE excerpts ADD COLUMN attrs_json TEXT NOT NULL DEFAULT '{}';
ALTER TABLE excerpts ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
ALTER TABLE excerpts ADD COLUMN text_hash TEXT;
CREATE INDEX excerpts_hash ON excerpts(source_id, text_hash);
`,
  },
  {
    version: 6,
    name: 'drafts: each completed draft of a novel kept whole',
    sql: `
CREATE TABLE drafts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id),
  number INTEGER NOT NULL,
  name TEXT NOT NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  note TEXT NOT NULL DEFAULT '',
  words INTEGER
);
CREATE INDEX drafts_project ON drafts(project_id, number);
CREATE TABLE draft_scenes (
  draft_id TEXT NOT NULL REFERENCES drafts(id),
  scene_id TEXT NOT NULL,
  chapter_id TEXT,
  chapter_title TEXT NOT NULL DEFAULT '',
  chapter_number INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  word_count INTEGER NOT NULL DEFAULT 0,
  doc_json TEXT NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (draft_id, scene_id)
);
`,
  },
];
