-- CreateTable
CREATE TABLE `clients` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `companyName` VARCHAR(255) NOT NULL,
    `displayName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `rateLimitPerSecond` INTEGER NOT NULL DEFAULT 20,
    `timezone` VARCHAR(64) NOT NULL DEFAULT 'Africa/Blantyre',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `clients_publicId_key`(`publicId`),
    UNIQUE INDEX `clients_email_key`(`email`),
    INDEX `clients_status_idx`(`status`),
    INDEX `clients_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `firstName` VARCHAR(100) NOT NULL,
    `lastName` VARCHAR(100) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'LOCKED', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    INDEX `users_clientId_idx`(`clientId`),
    INDEX `users_status_idx`(`status`),
    INDEX `users_lastLoginAt_idx`(`lastLoginAt`),
    UNIQUE INDEX `users_clientId_email_key`(`clientId`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `system` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `roles_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `permissions` (
    `id` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `module` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `permissions_name_key`(`name`),
    INDEX `permissions_module_idx`(`module`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `userId` CHAR(36) NOT NULL,
    `roleId` CHAR(36) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `user_roles_roleId_idx`(`roleId`),
    PRIMARY KEY (`userId`, `roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `role_permissions` (
    `roleId` CHAR(36) NOT NULL,
    `permissionId` CHAR(36) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `role_permissions_permissionId_idx`(`permissionId`),
    PRIMARY KEY (`roleId`, `permissionId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `api_keys` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `prefix` VARCHAR(20) NOT NULL,
    `keyHash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `lastUsedAt` DATETIME(3) NULL,
    `expiresAt` DATETIME(3) NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `api_keys_publicId_key`(`publicId`),
    INDEX `api_keys_clientId_idx`(`clientId`),
    INDEX `api_keys_status_idx`(`status`),
    INDEX `api_keys_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `portal_sessions` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NOT NULL,
    `sessionTokenHash` VARCHAR(255) NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(512) NULL,
    `lastActivityAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `portal_sessions_userId_idx`(`userId`),
    INDEX `portal_sessions_expiresAt_idx`(`expiresAt`),
    INDEX `portal_sessions_lastActivityAt_idx`(`lastActivityAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` CHAR(36) NOT NULL,
    `sessionId` CHAR(36) NOT NULL,
    `replacedById` CHAR(36) NULL,
    `tokenHash` VARCHAR(255) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `refresh_tokens_sessionId_idx`(`sessionId`),
    INDEX `refresh_tokens_expiresAt_idx`(`expiresAt`),
    INDEX `refresh_tokens_replacedById_idx`(`replacedById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `authentication_events` (
    `id` CHAR(36) NOT NULL,
    `userId` CHAR(36) NULL,
    `clientId` CHAR(36) NULL,
    `type` ENUM('LOGIN_SUCCESS', 'LOGIN_FAILED', 'LOGOUT', 'SESSION_REVOKED', 'API_KEY_CREATED', 'API_KEY_REVOKED', 'PASSWORD_CHANGED', 'REFRESH_TOKEN_ROTATED') NOT NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(512) NULL,
    `failureReason` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `authentication_events_userId_idx`(`userId`),
    INDEX `authentication_events_clientId_idx`(`clientId`),
    INDEX `authentication_events_type_idx`(`type`),
    INDEX `authentication_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `float_ledger_entries` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `createdById` CHAR(36) NULL,
    `transactionType` ENUM('TOPUP', 'DEBIT', 'REFUND', 'ADJUSTMENT') NOT NULL,
    `credits` INTEGER NOT NULL,
    `referenceType` ENUM('MESSAGE', 'ADMIN', 'SYSTEM', 'IMPORT') NOT NULL,
    `referenceId` CHAR(36) NULL,
    `description` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `float_ledger_entries_publicId_key`(`publicId`),
    INDEX `float_ledger_entries_clientId_idx`(`clientId`),
    INDEX `float_ledger_entries_transactionType_idx`(`transactionType`),
    INDEX `float_ledger_entries_referenceType_idx`(`referenceType`),
    INDEX `float_ledger_entries_referenceId_idx`(`referenceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `messages` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `senderIdId` CHAR(36) NULL,
    `destination` VARCHAR(20) NOT NULL,
    `body` TEXT NOT NULL,
    `encoding` ENUM('GSM7', 'UCS2', 'BINARY') NOT NULL,
    `segmentCount` INTEGER NOT NULL,
    `currentStatus` ENUM('QUEUED', 'ROUTED', 'SUBMITTED', 'DELIVERED', 'FAILED', 'EXPIRED') NOT NULL DEFAULT 'QUEUED',
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `messages_publicId_key`(`publicId`),
    INDEX `messages_clientId_idx`(`clientId`),
    INDEX `messages_destination_idx`(`destination`),
    INDEX `messages_currentStatus_idx`(`currentStatus`),
    INDEX `messages_submittedAt_idx`(`submittedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_attempts` (
    `id` CHAR(36) NOT NULL,
    `messageId` CHAR(36) NOT NULL,
    `attemptNumber` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'SUBMITTED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `provider` VARCHAR(50) NOT NULL,
    `route` VARCHAR(100) NULL,
    `providerMessageId` VARCHAR(100) NULL,
    `errorCode` VARCHAR(50) NULL,
    `errorMessage` VARCHAR(255) NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `message_attempts_messageId_idx`(`messageId`),
    INDEX `message_attempts_status_idx`(`status`),
    INDEX `message_attempts_provider_idx`(`provider`),
    INDEX `message_attempts_providerMessageId_idx`(`providerMessageId`),
    UNIQUE INDEX `message_attempts_messageId_attemptNumber_key`(`messageId`, `attemptNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message_status_events` (
    `id` CHAR(36) NOT NULL,
    `messageId` CHAR(36) NOT NULL,
    `attemptId` CHAR(36) NULL,
    `status` ENUM('QUEUED', 'ROUTED', 'SUBMITTED', 'DELIVERED', 'FAILED', 'EXPIRED') NOT NULL,
    `source` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `rawData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `message_status_events_messageId_idx`(`messageId`),
    INDEX `message_status_events_attemptId_idx`(`attemptId`),
    INDEX `message_status_events_status_idx`(`status`),
    INDEX `message_status_events_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `smpp_accounts` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `systemId` VARCHAR(50) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `maxConcurrentBinds` INTEGER NOT NULL DEFAULT 1,
    `enquireLinkInterval` INTEGER NOT NULL DEFAULT 30,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `smpp_accounts_publicId_key`(`publicId`),
    UNIQUE INDEX `smpp_accounts_systemId_key`(`systemId`),
    INDEX `smpp_accounts_clientId_idx`(`clientId`),
    INDEX `smpp_accounts_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sender_ids` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `sender` VARCHAR(20) NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'DISABLED') NOT NULL DEFAULT 'PENDING',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sender_ids_publicId_key`(`publicId`),
    INDEX `sender_ids_clientId_idx`(`clientId`),
    INDEX `sender_ids_status_idx`(`status`),
    UNIQUE INDEX `sender_ids_clientId_sender_key`(`clientId`, `sender`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_endpoints` (
    `id` CHAR(36) NOT NULL,
    `publicId` VARCHAR(20) NOT NULL,
    `clientId` CHAR(36) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `url` VARCHAR(2048) NOT NULL,
    `secret` VARCHAR(255) NOT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `webhook_endpoints_publicId_key`(`publicId`),
    INDEX `webhook_endpoints_clientId_idx`(`clientId`),
    INDEX `webhook_endpoints_enabled_idx`(`enabled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `webhook_deliveries` (
    `id` CHAR(36) NOT NULL,
    `webhookEndpointId` CHAR(36) NOT NULL,
    `messageId` CHAR(36) NOT NULL,
    `attemptNumber` INTEGER NOT NULL DEFAULT 1,
    `responseCode` INTEGER NULL,
    `responseBody` TEXT NULL,
    `attemptedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `webhook_deliveries_webhookEndpointId_idx`(`webhookEndpointId`),
    INDEX `webhook_deliveries_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` CHAR(36) NOT NULL,
    `clientId` CHAR(36) NULL,
    `userId` CHAR(36) NULL,
    `entityType` VARCHAR(100) NOT NULL,
    `entityId` CHAR(36) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `oldValues` JSON NULL,
    `newValues` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `audit_logs_clientId_idx`(`clientId`),
    INDEX `audit_logs_userId_idx`(`userId`),
    INDEX `audit_logs_entityType_entityId_idx`(`entityType`, `entityId`),
    INDEX `audit_logs_action_idx`(`action`),
    INDEX `audit_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `role_permissions` ADD CONSTRAINT `role_permissions_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `permissions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portal_sessions` ADD CONSTRAINT `portal_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `portal_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_replacedById_fkey` FOREIGN KEY (`replacedById`) REFERENCES `refresh_tokens`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authentication_events` ADD CONSTRAINT `authentication_events_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `authentication_events` ADD CONSTRAINT `authentication_events_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `float_ledger_entries` ADD CONSTRAINT `float_ledger_entries_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `float_ledger_entries` ADD CONSTRAINT `float_ledger_entries_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderIdId_fkey` FOREIGN KEY (`senderIdId`) REFERENCES `sender_ids`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_attempts` ADD CONSTRAINT `message_attempts_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_status_events` ADD CONSTRAINT `message_status_events_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message_status_events` ADD CONSTRAINT `message_status_events_attemptId_fkey` FOREIGN KEY (`attemptId`) REFERENCES `message_attempts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `smpp_accounts` ADD CONSTRAINT `smpp_accounts_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sender_ids` ADD CONSTRAINT `sender_ids_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_endpoints` ADD CONSTRAINT `webhook_endpoints_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_webhookEndpointId_fkey` FOREIGN KEY (`webhookEndpointId`) REFERENCES `webhook_endpoints`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `messages`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
