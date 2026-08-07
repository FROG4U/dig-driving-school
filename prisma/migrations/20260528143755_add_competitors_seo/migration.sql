-- CreateTable
CREATE TABLE "Competitor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "h1Tags" TEXT,
    "h2Tags" TEXT,
    "topKeywords" TEXT,
    "pageTitle" TEXT,
    "lastScanned" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PageSeo" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "metaTitle" TEXT,
    "metaDesc" TEXT,
    "h1" TEXT,
    "focusKeyword" TEXT,
    "keywords" TEXT,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL
);
