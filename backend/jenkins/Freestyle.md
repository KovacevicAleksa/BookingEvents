
###
echo "=== Recent Git Activity ==="
git log --pretty=format:"%h - %an, %ar : %s" -5

echo "\n=== Branch Information ==="
git branch -v

echo "\n=== Modified Files ==="
git status -s
###
# CPU Usage
echo "\nCPU Usage:"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU Usage: " (100 - $1) "%"}'

# Memory Usage
echo "\nMemory Usage:"
free -m | awk 'NR==2{printf "Memory Usage: %s/%sMB (%.2f%%)\n", $3,$2,$3*100/$2 }'

# Disk Usage
echo "\nDisk Usage:"
df -h | awk '$NF=="/"{printf "Disk Usage: %d/%dGB (%s)\n", $3,$2,$5}'
