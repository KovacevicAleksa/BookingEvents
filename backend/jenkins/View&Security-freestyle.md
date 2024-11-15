#!/bin/bash

# Recent Git Activity
echo "=== Recent Git Activity ==="
git log --pretty=format:"%h - %an, %ar : %s" -5

echo "\n=== Branch Information ==="
git branch -v

echo "\n=== Modified Files ==="
git status -s

# CPU Usage
echo "\nCPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU Usage: " (100 - $1) "%"}'

# Memory Usage
echo "\nMemory Usage:"
free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'

# Disk Usage
echo "\nDisk Usage:"
df -h | awk '$NF=="/"{printf "Disk Usage: %d/%dGB (%s)\n", $3,$2,$5}'


# Security Scans

# Check for open ports
echo "\n=== Open Ports ==="
netstat -tuln | grep LISTEN

# Check for active users
echo "\n=== Active Users ==="
who

# Check for recently modified files (last 24 hours)
echo "\n=== Recently Modified Files ==="
find / -type f -mtime -1 2>/dev/null | head -n 10

# Check for failed login attempts
echo "\n=== Failed Login Attempts ==="
grep "Failed password" /var/log/auth.log | tail -n 5

# Check for unauthorized SUID files
echo "\n=== Unauthorized SUID Files ==="
find / -perm -4000 -type f 2>/dev/null | grep -v '/bin/' | grep -v '/sbin/'

# Check for world-writable files
echo "\n=== World-Writable Files ==="
find / -type f -perm -o+w 2>/dev/null | head -n 10

# Check for scheduled cron jobs
echo "\n=== Scheduled Cron Jobs ==="
crontab -l 2>/dev/null || echo "No cron jobs for the current user"

## Check running processes
echo "\n=== Running Processes ==="
ps aux --sort=-%mem | head -n 10

# Check zombie processes
echo "\n=== Zombie Processes ==="
ps aux | grep 'Z' | grep -v 'grep'

# Check recently installed/updated packages
echo "\n=== Recently Installed/Updated Packages ==="
grep " installed " /var/log/dpkg.log 2>/dev/null | tail -n 5 || echo "No recent installations found"

# Check outdated packages
echo "\n=== Outdated Packages ==="
apt-get -s upgrade | grep -i "upgraded" || echo "All packages are up to date"
