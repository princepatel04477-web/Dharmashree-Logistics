-- Every form the site sends to the desk (quote, partner, message, truck), one
-- row each. `data` is the submitted fields as a JSON object; the columns each
-- kind shows and exports are defined in src/lib/desk/forms.ts.
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL CHECK (kind IN ('quote', 'partner', 'message', 'truck')),
  reference TEXT NOT NULL UNIQUE,
  received_at TEXT NOT NULL,
  data TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS submissions_kind_received
  ON submissions (kind, received_at DESC);

-- Small site settings the admin panel edits (the announcement bar).
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
