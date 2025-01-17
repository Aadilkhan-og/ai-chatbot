CREATE TABLE IF NOT EXISTS `Document` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `createdAt` TIMESTAMP NOT NULL,
  `title` TEXT NOT NULL,
  `content` TEXT,
  `kind` ENUM('text', 'code') NOT NULL DEFAULT 'text',
  `userId` INT NOT NULL,
  FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE
);

-- CREATE INDEX idx_document_id_created_at ON `Document`(`id`, `createdAt`);

