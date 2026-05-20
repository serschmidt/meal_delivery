CREATE TABLE refresh_tokens (
    id         CHAR(36)     NOT NULL PRIMARY KEY,
    user_id    CHAR(36)     NOT NULL,
    user_role  VARCHAR(20)  NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked    TINYINT(1)   NOT NULL DEFAULT 0
);
