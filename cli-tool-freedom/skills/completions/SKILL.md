---
description: Generate and install shell completion scripts for the CLI — bash, zsh, fish, PowerShell. Uses the CLI framework's built-in completion generator (cobra, clap, typer, commander all support this). Produces completion files in the tool's release artefacts AND offers install commands for end users. Use after adding/removing commands or flags, or when preparing a release.
---

# Completions

Tab-completion is table stakes. Most CLI frameworks generate completion scripts for free — this skill wires them up.

## Supported shells

| Shell | How users install |
|---|---|
| bash | `source <(<tool> completion bash)` in `.bashrc`, or per-distro completion dir |
| zsh | `<tool> completion zsh > "${fpath[1]}/_<tool>"` |
| fish | `<tool> completion fish > ~/.config/fish/completions/<tool>.fish` |
| PowerShell | `<tool> completion powershell | Out-String | Invoke-Expression` |

## Implementation per framework

### Go + cobra
```go
import "github.com/spf13/cobra"

var completionCmd = &cobra.Command{
    Use: "completion [bash|zsh|fish|powershell]",
    DisableFlagsInUseLine: true,
    ValidArgs: []string{"bash", "zsh", "fish", "powershell"},
    Args: cobra.MatchAll(cobra.ExactArgs(1), cobra.OnlyValidArgs),
    Run: func(cmd *cobra.Command, args []string) {
        switch args[0] {
        case "bash":       cmd.Root().GenBashCompletion(os.Stdout)
        case "zsh":        cmd.Root().GenZshCompletion(os.Stdout)
        case "fish":       cmd.Root().GenFishCompletion(os.Stdout, true)
        case "powershell": cmd.Root().GenPowerShellCompletionWithDesc(os.Stdout)
        }
    },
}
```

### Rust + clap
```rust
use clap_complete::{generate, Shell};
// In handler:
let mut cmd = MyCli::command();
generate(shell, &mut cmd, "<tool>", &mut io::stdout());
```

### Python + typer
```python
# Typer generates completions automatically:
# <tool> --install-completion bash
# or manually: <tool> --show-completion bash
```

### Node + commander
Third-party package `omelette` integrates well; commander has built-in basic completion.

## Flow

### Step 1 — Add the completion command (if not already present)

Scaffolded projects from `/cli-tool-freedom:scaffold` include this out of the box. Older projects may need it added.

### Step 2 — Verify generation

```bash
<tool> completion bash | head       # bash completion script
<tool> completion zsh | head        # zsh completion script
<tool> completion fish | head       # fish completion script
```

Each must produce a non-empty, syntactically valid completion script.

### Step 3 — Install locally for testing

```bash
# zsh
<tool> completion zsh > "${fpath[1]}/_<tool>"
autoload -U compinit && compinit

# Then try:
<tool> <TAB>                        # should list subcommands
<tool> <command> --<TAB>            # should list flags
<tool> <command> --format <TAB>     # should list enum values
```

### Step 4 — Document in README

Add install instructions for each supported shell. End users expect this clearly documented.

### Step 5 — Ship in release

- Pre-generated completion files in release artefacts for users who can't / don't want to run `<tool> completion`
- Homebrew formula: install completions automatically (`bash_completion_path`, `zsh_completion_path`)
- Debian package: install to `/etc/bash_completion.d/` etc.

### Step 6 — Regenerate after command/flag changes

Completions are derived from the command tree. After `/cli-tool-freedom:command` or `/cli-tool-freedom:flag`, regenerate + re-test.

## Cobra-specific: enum completions for flags

```go
cmd.RegisterFlagCompletionFunc("format", func(cmd *cobra.Command, args []string, toComplete string) ([]string, cobra.ShellCompDirective) {
    return []string{"text", "json", "yaml"}, cobra.ShellCompDirectiveNoFileComp
})
```

Do this for any flag with a fixed set of valid values. Users notice.

## Anti-patterns

- ❌ Shipping without completions (users punish tools that don't have them via Homebrew review stars)
- ❌ Hard-coded completion scripts that drift from the actual command list
- ❌ Missing completion for enum flags (static list flags should tab-complete values)
- ❌ Completions that include deprecated / hidden commands
