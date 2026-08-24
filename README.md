# jpi-status

jpi-status is a status footer for the Pi coding agent. It replaces Pi's
built-in footer in TUI sessions with a configurable one that shows your
model, context usage, repository, branch, pull request, and Graphite stack
position, plus any status text other extensions publish.

## Install

```
pi install git:github.com/josh-sola/jpi-status
```

## Configuring the footer

The footer's layout comes from a JSON file at
`${PI_CODING_AGENT_DIR:-~/.pi/agent}/status-line.json`. Both fields are
optional; a missing file or field falls back to this default:

```json
{
  "format": [
    [
      "@jpi/model",
      "@jpi/context",
      "@jpi/repository",
      "@jpi/worktree",
      "@jpi/branch",
      "@jpi/pull-request",
      "@jpi/stack"
    ],
    ["@jpi/slot"]
  ],
  "disabledStatuses": []
}
```

Each inner `format` array is one footer line. The footer drops unavailable
components and lines that end up empty, and it joins the components on a line
with ` · `. The built-in component IDs are:

| ID | Content |
| --- | --- |
| `@jpi/model` | Active model name |
| `@jpi/context` | Context-window percentage |
| `@jpi/repository` | Repository name |
| `@jpi/worktree` | Linked `wt` tree name |
| `@jpi/branch` | Shortened branch name |
| `@jpi/pull-request` | Graphite pull request and draft state |
| `@jpi/stack` | Graphite stack position |
| `@jpi/slot` | Published extension statuses, sorted by status ID |

Any other `format` string is an exact, case-sensitive extension status ID,
such as `auto-review`. A missing extension status is left out until that
extension publishes it. The `@jpi/` namespace is reserved, so an unknown ID
in that namespace makes the config invalid.

`@jpi/slot` shows every published extension status except the IDs listed in
`disabledStatuses`. Listing a status in `disabledStatuses` only hides it from
the slot — an explicit entry for that ID still renders, and it does not
disable the extension that publishes it. A status can appear twice this way.

Invalid JSON or an invalid value in `status-line.json` produces a warning and
falls back to the full default config.

### Custom executable components

A component ID shaped like `@custom:<path>` runs an executable and shows its
stdout:

```json
{
  "format": [
    ["@jpi/model", "@custom:bin/session-status"],
    ["@jpi/slot"]
  ]
}
```

An absolute path starts at the filesystem root; a relative path starts in the
directory that holds `status-line.json`. Pi runs the executable directly,
without a shell, in the current session directory. Each occurrence in the
config runs as its own process, even when the same path is listed twice.

The executable gets one argument: a JSON string describing the current
session (model, context usage, repository, and every published extension
status). It runs when the footer starts, right after a config reload, and
every 10 seconds after that, with a 3-second timeout. Empty or
whitespace-only output hides the component; a timeout, error, or nonzero
exit also hides it and warns once, until the next success or config reload.

### Commands

- `/jpi-status status` — reports whether the footer is active.
- `/jpi-status refresh` — requests an immediate repository metadata refresh.
- `/jpi-status reload` — reloads `status-line.json` and rerenders the footer.

Pi has one custom-footer slot, so another extension that calls `setFooter()`
later replaces this one.

## Development

```
npm install
npm test
```

To try a local checkout inside a Pi session:

```
pi -e .
```
