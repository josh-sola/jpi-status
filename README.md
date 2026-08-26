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

The footer's layout comes from the `status { }` section of the shared
`${PI_CODING_AGENT_DIR:-~/.pi/agent}/jpi.kdl`. The first load creates the
file if it's missing and appends the section with its defaults if the file
exists but doesn't have one yet. A fresh file looks like this:

```kdl
// jpi.kdl — config for all jpi plugins.
// Sections are added by each plugin on first load.

status {
  format {
    // status line rows, top to bottom
    row "@jpi/model" "@jpi/context" "@jpi/repository" "@jpi/worktree" "@jpi/branch" "@jpi/pull-request" "@jpi/stack"
    row "@jpi/slot"
  }
  // built-in statuses to hide
}
```

Each `row` is one footer line, given as positional component IDs. The footer
drops unavailable components and lines that end up empty, and it joins the
components on a line with `·`. The built-in component IDs are:

| ID                   | Content                                           |
| -------------------- | ------------------------------------------------- |
| `@jpi/model`         | Active model name                                 |
| `@jpi/context`       | Context-window percentage                         |
| `@jpi/repository`    | Repository name                                   |
| `@jpi/worktree`      | Linked `wt` tree name                             |
| `@jpi/branch`        | Shortened branch name                             |
| `@jpi/pull-request`  | Graphite pull request and draft state             |
| `@jpi/stack`         | Graphite stack position                           |
| `@jpi/slot`          | Published extension statuses, sorted by status ID |
| `@jpi/name`          | Pi session name                                   |
| `@jpi/ctx-total`     | Model context window, abbreviated                 |
| `@jpi/ctx-used`      | Tokens currently in context, abbreviated          |
| `@jpi/ctx-remaining` | Context window minus tokens in use, abbreviated   |
| `@jpi/turns`         | Session turn count                                |
| `@jpi/speed`         | Live generation speed while streaming             |
| `@jpi/cost`          | Cumulative session cost                           |
| `@jpi/tokens-in`     | Cumulative session input tokens, abbreviated      |
| `@jpi/tokens-out`    | Cumulative session output tokens, abbreviated     |
| `@jpi/tokens-total`  | Cumulative session tokens, abbreviated            |
| `@jpi/directory`     | Session working directory, `~` abbreviated        |
| `@jpi/tool`          | Name of the currently running tool                |

Any other component ID is an exact, case-sensitive extension status ID, such
as `@jpi-guardian/review-mode`. A missing extension status is left out until that
extension publishes it. The `@jpi/` namespace is reserved, so an unknown ID
in that namespace makes the config invalid.

`@jpi/slot` shows every published extension status except the IDs listed in
`disabled-statuses`. Listing a status in `disabled-statuses` only hides it
from the slot — an explicit entry for that ID still renders, and it does not
disable the extension that publishes it. A status can appear twice this way.
Repeat the `disabled-statuses` node for more than one:

```kdl
status {
  disabled-statuses "context"
  disabled-statuses "@jpi-guardian/review-mode"
}
```

An invalid `jpi.kdl` — bad KDL syntax, a reserved `@jpi/` ID that isn't
built in, or a blank `@custom:` path — produces a warning and falls back to
the full default config.

### Custom executable components

A component ID shaped like `@custom:<path>` runs an executable and shows its
stdout:

```kdl
status {
  format {
    row "@jpi/model" "@custom:bin/session-status"
    row "@jpi/slot"
  }
}
```

An absolute path starts at the filesystem root; a relative path starts in the
directory that holds `jpi.kdl`. Pi runs the executable directly, without a
shell, in the current session directory. Each occurrence in the config runs
as its own process, even when the same path is listed twice.

The executable gets one argument: a JSON string describing the current
session (model, context usage, repository, and every published extension
status). It runs when the footer starts, right after a config reload, and
every 10 seconds after that, with a 3-second timeout. Empty or
whitespace-only output hides the component; a timeout, error, or nonzero
exit also hides it. Errors and nonzero exits warn once, until the next
success or config reload; timeouts stay silent.

### Fleet lines from jpi-subagents

When [jpi-subagents](https://github.com/josh-sola/jpi-subagents) is installed, its FleetView (the running-agent list) renders below the status rows here instead of as its own below-editor widget. jpi-subagents hands this extension a render function over the `pi.events` bus (`subagents:fleet:provider:v1`); this footer answers with `subagents:fleet:consumer-ready:v1` once it is listening, so the handshake works whichever extension loads first. Without jpi-subagents, the footer looks exactly as it does today.

### Commands

- `/jpi-status status` — reports whether the footer is active.
- `/jpi-status refresh` — requests an immediate repository metadata refresh.
- `/jpi-status reload` — reloads the `status` section of `jpi.kdl` and
  rerenders the footer.

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
