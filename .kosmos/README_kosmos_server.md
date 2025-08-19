# Обращение к DEV(разработческому) серверу postgres на d2(w2)
psql.exe -h 192.168.1.12 -U carl -d carlinkng

# На команду вида: Смержи main с dev нужно выдать:
git checkout main \ 
git merge dev \ 
git checkout dev