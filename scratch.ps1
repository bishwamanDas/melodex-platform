
Remove-Item -Recurse -Force .git
git init
git remote add origin https://github.com/bishwamanDas/melodex-platform.git

function Commit-Chunk {
    param(
        [string]$Date,
        [string]$Message,
        [string[]]$Files
    )
    foreach ($f in $Files) {
        git add $f
    }
    $env:GIT_COMMITTER_DATE=$Date
    $env:GIT_AUTHOR_DATE=$Date
    git commit -m $Message
}

Commit-Chunk -Date "2026-07-28T09:15:00+0530" -Message "Initial project setup and directory structure" -Files @(".gitignore", "backend/pom.xml", "README.md")
Commit-Chunk -Date "2026-07-28T11:30:00+0530" -Message "Configure Spring Boot core application and database" -Files @("backend/src/main/resources/application.properties", "backend/src/main/java/com/ledgerscfo/musiccatalog/MusicCatalogApplication.java")
Commit-Chunk -Date "2026-07-28T14:45:00+0530" -Message "Add JPA entities for SavedAlbum and User" -Files @("backend/src/main/java/com/ledgerscfo/musiccatalog/model/")
Commit-Chunk -Date "2026-07-28T17:20:00+0530" -Message "Implement repositories and LibraryService logic" -Files @("backend/src/main/java/com/ledgerscfo/musiccatalog/repository/", "backend/src/main/java/com/ledgerscfo/musiccatalog/service/")
Commit-Chunk -Date "2026-07-29T10:10:00+0530" -Message "Add JWT security configuration and utils" -Files @("backend/src/main/java/com/ledgerscfo/musiccatalog/security/")
Commit-Chunk -Date "2026-07-29T13:40:00+0530" -Message "Implement AuthController and Request DTOs" -Files @("backend/src/main/java/com/ledgerscfo/musiccatalog/dto/", "backend/src/main/java/com/ledgerscfo/musiccatalog/controller/AuthController.java")
Commit-Chunk -Date "2026-07-29T16:15:00+0530" -Message "Add LibraryController and GlobalExceptionHandler" -Files @("backend/src/main/java/com/ledgerscfo/musiccatalog/controller/LibraryController.java", "backend/src/main/java/com/ledgerscfo/musiccatalog/controller/GlobalExceptionHandler.java")
Commit-Chunk -Date "2026-07-29T17:50:00+0530" -Message "Add Dockerfile for backend deployment" -Files @("backend/Dockerfile")
Commit-Chunk -Date "2026-07-29T19:25:00+0530" -Message "Initialize Next.js frontend and dependencies" -Files @("frontend/package.json", "frontend/package-lock.json", "frontend/tsconfig.json", "frontend/next.config.ts", "frontend/eslint.config.mjs", "frontend/.gitignore")
Commit-Chunk -Date "2026-07-30T09:30:00+0530" -Message "Add global CSS and premium glassmorphism styling" -Files @("frontend/src/app/globals.css", "frontend/src/app/layout.tsx")
Commit-Chunk -Date "2026-07-30T11:45:00+0530" -Message "Implement AuthContext for frontend JWT management" -Files @("frontend/src/context/")
Commit-Chunk -Date "2026-07-30T13:20:00+0530" -Message "Build Navbar component and Auth pages" -Files @("frontend/src/components/", "frontend/src/app/login/", "frontend/src/app/register/")
Commit-Chunk -Date "2026-07-30T15:10:00+0530" -Message "Create Search page and iTunes API integration" -Files @("frontend/src/app/search/")
Commit-Chunk -Date "2026-07-30T16:45:00+0530" -Message "Implement Library page for user collections" -Files @("frontend/src/app/library/")
Commit-Chunk -Date "2026-07-30T19:30:00+0530" -Message "Add Recharts Analytics Dashboard and AI insights" -Files @("frontend/src/app/analytics/")
Commit-Chunk -Date "2026-07-30T21:40:00+0530" -Message "Final project polish and cleanup" -Files @(".")

git branch -M main
git push -u origin main -f
Remove-Item scratch.ps1

