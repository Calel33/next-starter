# Command Cheat Sheet - WSL Bash Environment

## File & Directory Operations
```bash
# Navigation
pwd                     # Show current directory
ls                      # List files
ls -la                  # List all files with details
ls -lh                  # List files with human-readable sizes
cd <path>               # Change directory
cd ~                    # Go to home directory
cd -                    # Go to previous directory
cd ..                   # Go up one directory

# File Operations
touch <file>            # Create empty file
cp <src> <dest>         # Copy file
cp -r <src> <dest>      # Copy directory recursively
mv <src> <dest>         # Move/rename file or directory
rm <file>               # Remove file
rm -r <dir>             # Remove directory recursively
rm -rf <dir>            # Force remove directory (be careful!)
mkdir <dir>             # Create directory
mkdir -p <path>         # Create directory with parents
rmdir <dir>             # Remove empty directory

# File Viewing & Editing
cat <file>              # Display file contents
less <file>             # View file with pagination
head <file>             # Show first 10 lines
head -n 20 <file>       # Show first 20 lines
tail <file>             # Show last 10 lines
tail -f <file>          # Follow file changes (logs)
nano <file>             # Edit with nano
vim <file>              # Edit with vim
code <file>             # Open in VS Code
```

## File Search & Text Processing
```bash
# Find Files
find . -name "*.txt"    # Find files by pattern
find . -type f -size +1M # Find files larger than 1MB
locate <filename>       # Find files by name (if updatedb is run)

# Text Search
grep "pattern" <file>   # Search for pattern in file
grep -r "pattern" .     # Search recursively in directory
grep -i "pattern" <file> # Case-insensitive search
grep -n "pattern" <file> # Show line numbers
grep -v "pattern" <file> # Invert match (exclude lines)

# Text Processing
wc -l <file>            # Count lines
wc -w <file>            # Count words
sort <file>             # Sort lines
uniq <file>             # Remove duplicate lines
cut -d',' -f1 <file>    # Extract first column (CSV)
```

## System Information
```bash
# System Info
whoami                  # Current username
id                      # User and group IDs
uname -a                # System information
lsb_release -a          # Distribution info
uptime                  # System uptime
date                    # Current date and time
cal                     # Calendar

# Process Management
ps aux                  # List all processes
top                     # Real-time process monitor
htop                    # Enhanced process monitor (if installed)
jobs                    # List active jobs
kill <PID>              # Kill process by ID
killall <name>          # Kill processes by name
nohup <command> &       # Run command in background

# Memory & Disk
free -h                 # Memory usage
df -h                   # Disk space usage
du -h <dir>             # Directory size
du -sh *                # Size of all items in current directory
```

## Network & Connectivity
```bash
# Network
ping <host>             # Ping a host
wget <url>              # Download file
curl <url>              # Make HTTP request
curl -o <file> <url>    # Download file with specific name
ssh <user>@<host>       # SSH connection
scp <file> <user>@<host>:<path> # Secure copy over SSH

# Ports & Services
netstat -tulpn          # Show listening ports
ss -tulpn               # Modern netstat alternative
lsof -i :8080           # Show what's using port 8080
```

## File Permissions & Ownership
```bash
# Permissions
chmod 755 <file>        # Set permissions (rwxr-xr-x)
chmod +x <file>         # Make executable
chmod -x <file>         # Remove executable
chown <user>:<group> <file> # Change ownership
chgrp <group> <file>    # Change group ownership
```

## Archives & Compression
```bash
# Tar Archives
tar -czf archive.tar.gz <files>  # Create compressed archive
tar -xzf archive.tar.gz          # Extract compressed archive
tar -tzf archive.tar.gz          # List archive contents

# Zip Archives
zip -r archive.zip <dir>         # Create zip archive
unzip archive.zip                # Extract zip archive
unzip -l archive.zip             # List zip contents
```

## Environment & Variables
```bash
# Environment
env                     # Show all environment variables
echo $PATH              # Show PATH variable
export VAR=value        # Set environment variable
export PATH=$PATH:/new/path # Add to PATH
source ~/.bashrc        # Reload bash configuration
history                 # Command history
history | grep "command" # Search command history
!!                      # Repeat last command
!<n>                    # Repeat command number n
```

## WSL-Specific Commands
```bash
# WSL Integration
explorer.exe .          # Open current directory in Windows Explorer
cmd.exe /c <command>    # Run Windows command
powershell.exe <command> # Run PowerShell command
wsl.exe --shutdown      # Shutdown WSL (run from PowerShell/CMD)

# File System
/mnt/c/                 # Windows C: drive
/mnt/d/                 # Windows D: drive
```

## Git Basics (if using git)
```bash
git status              # Show repository status
git add .               # Stage all changes
git commit -m "message" # Commit with message
git push                # Push to remote
git pull                # Pull from remote
git log --oneline       # Show commit history
git branch              # List branches
git checkout <branch>   # Switch branch
```

## Package Management (Ubuntu/Debian)
```bash
sudo apt update         # Update package lists
sudo apt upgrade        # Upgrade packages
sudo apt install <pkg>  # Install package
sudo apt remove <pkg>   # Remove package
sudo apt search <pkg>   # Search for package
```

## Shortcuts & Tips
```bash
# Keyboard Shortcuts
Ctrl+C                  # Cancel current command
Ctrl+Z                  # Suspend current process
Ctrl+D                  # Exit/logout
Ctrl+L                  # Clear screen
Ctrl+R                  # Reverse search history
Tab                     # Auto-complete
Tab Tab                 # Show completion options

# Useful Aliases (add to ~/.bashrc)
alias ll='ls -la'
alias la='ls -la'
alias l='ls -CF'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias h='history'
alias c='clear'
```

## Pipe & Redirection
```bash
# Pipes & Redirection
command > file          # Redirect output to file
command >> file         # Append output to file
command < file          # Use file as input
command1 | command2     # Pipe output to next command
command 2>&1            # Redirect stderr to stdout
command &> file         # Redirect both stdout and stderr
```

---

**Note**: This cheat sheet covers common bash commands for your WSL environment. Commands marked with `sudo` require administrator privileges.