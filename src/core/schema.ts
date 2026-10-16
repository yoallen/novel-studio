// Database schema and migrations. Each migration runs once, in order, inside a transaction.
// Never edit a shipped migration; add a new one.

export const MIGRATIONS: { version: number; name: string; sql: string }[] = [
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
];
