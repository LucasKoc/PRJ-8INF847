-- DPSCHECK - PostgreSQL schema (V1)

BEGIN;

-- -----------------------------------------------------------------------------
-- ENUM TYPES
-- -----------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('PLAYER', 'TO');
CREATE TYPE lol_roles AS ENUM ('TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT', 'FLEX');
CREATE TYPE member_status AS ENUM ('ACTIVE', 'LEFT', 'REMOVED');
CREATE TYPE tournament_status AS ENUM ('DRAFT', 'OPEN', 'CLOSED', 'CANCELLED', 'COMPLETED');
CREATE TYPE registration_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');

-- -----------------------------------------------------------------------------
-- GENERIC HELPERS
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

-- -----------------------------------------------------------------------------
-- USERS
-- -----------------------------------------------------------------------------
CREATE TABLE users
(
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    role          user_role    NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_users_set_updated_at
    BEFORE UPDATE
    ON users
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- PLAYER PROFILES
-- -----------------------------------------------------------------------------
CREATE TABLE player_profiles
(
    id            BIGSERIAL PRIMARY KEY,
    user_id       BIGINT      NOT NULL UNIQUE REFERENCES users (id) ON DELETE CASCADE,
    summoner_name VARCHAR(50) NOT NULL,
    tag_line      VARCHAR(10) NOT NULL,
    region        VARCHAR(20) NOT NULL,
    rank          VARCHAR(30),
    main_role     lol_roles,
    bio           TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_player_profile_identity UNIQUE (summoner_name, tag_line, region)
);

CREATE OR REPLACE FUNCTION ensure_player_profile_user_role()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM users WHERE id = NEW.user_id;

    IF user_role_value IS NULL THEN
        RAISE EXCEPTION 'User % does not exist', NEW.user_id;
    END IF;

    IF user_role_value <> 'PLAYER' THEN
        RAISE EXCEPTION 'Only a PLAYER can own a player profile. User % has role %', NEW.user_id, user_role_value;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_player_profiles_role_check
    BEFORE INSERT OR UPDATE
    ON player_profiles
    FOR EACH ROW
EXECUTE FUNCTION ensure_player_profile_user_role();

CREATE TRIGGER trg_player_profiles_set_updated_at
    BEFORE UPDATE
    ON player_profiles
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- TEAMS
-- -----------------------------------------------------------------------------
CREATE TABLE teams
(
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(80) NOT NULL UNIQUE,
    tag             VARCHAR(3)  NOT NULL UNIQUE,
    captain_user_id BIGINT      NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_team_tag_format CHECK (tag ~ '^[A-Za-z0-9]{2,3}$')
);

CREATE OR REPLACE FUNCTION ensure_team_captain_is_player()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM users WHERE id = NEW.captain_user_id;

    IF user_role_value IS NULL THEN
        RAISE EXCEPTION 'Captain user % does not exist', NEW.captain_user_id;
    END IF;

    IF user_role_value <> 'PLAYER' THEN
        RAISE EXCEPTION 'A team captain must be a PLAYER. User % has role %', NEW.captain_user_id, user_role_value;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_teams_captain_role_check
    BEFORE INSERT OR UPDATE
    ON teams
    FOR EACH ROW
EXECUTE FUNCTION ensure_team_captain_is_player();

CREATE TRIGGER trg_teams_set_updated_at
    BEFORE UPDATE
    ON teams
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- -----------------------------------------------------------------------------
-- TEAM MEMBERS
-- -----------------------------------------------------------------------------
CREATE TABLE team_members
(
    id            BIGSERIAL PRIMARY KEY,
    team_id       BIGINT        NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    user_id       BIGINT        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    role          lol_roles     NOT NULL,
    is_substitute BOOLEAN       NOT NULL DEFAULT FALSE,
    status        member_status NOT NULL DEFAULT 'ACTIVE',
    joined_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    left_at       TIMESTAMPTZ,
    CONSTRAINT uq_team_member_pair UNIQUE (team_id, user_id),
    CONSTRAINT chk_team_member_dates CHECK (
        (status = 'ACTIVE' AND left_at IS NULL)
            OR
        (status <> 'ACTIVE' AND left_at IS NOT NULL)
        )
);

CREATE OR REPLACE FUNCTION ensure_team_member_is_player()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM users WHERE id = NEW.user_id;

    IF user_role_value IS NULL THEN
        RAISE EXCEPTION 'Team member user % does not exist', NEW.user_id;
    END IF;

    IF user_role_value <> 'PLAYER' THEN
        RAISE EXCEPTION 'Only a PLAYER can be a team member. User % has role %', NEW.user_id, user_role_value;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_team_members_role_check
    BEFORE INSERT OR UPDATE
    ON team_members
    FOR EACH ROW
EXECUTE FUNCTION ensure_team_member_is_player();

CREATE UNIQUE INDEX uq_team_members_one_active_team_per_player
    ON team_members (user_id)
    WHERE status = 'ACTIVE';

CREATE INDEX idx_team_members_team_id ON team_members (team_id);
CREATE INDEX idx_team_members_user_id ON team_members (user_id);

-- -----------------------------------------------------------------------------
-- TOURNAMENTS
-- -----------------------------------------------------------------------------
CREATE TABLE tournaments
(
    id                    BIGSERIAL PRIMARY KEY,
    organizer_user_id     BIGINT            NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    name                  VARCHAR(120)      NOT NULL,
    game                  VARCHAR(50)       NOT NULL DEFAULT 'League of Legends',
    format                VARCHAR(50)       NOT NULL,
    registration_deadline TIMESTAMPTZ       NOT NULL,
    starts_at             TIMESTAMPTZ       NOT NULL,
    ends_at               TIMESTAMPTZ,
    max_teams             INTEGER           NOT NULL,
    status                tournament_status NOT NULL DEFAULT 'DRAFT',
    created_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_tournament_max_teams CHECK (max_teams > 1),
    CONSTRAINT chk_tournament_dates CHECK (
        registration_deadline < starts_at
            AND (ends_at IS NULL OR ends_at >= starts_at)
        )
);

CREATE OR REPLACE FUNCTION ensure_tournament_organizer_is_to()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_role_value user_role;
BEGIN
    SELECT role INTO user_role_value FROM users WHERE id = NEW.organizer_user_id;

    IF user_role_value IS NULL THEN
        RAISE EXCEPTION 'Organizer user % does not exist', NEW.organizer_user_id;
    END IF;

    IF user_role_value <> 'TO' THEN
        RAISE EXCEPTION 'Only a TO can create/manage a tournament. User % has role %', NEW.organizer_user_id, user_role_value;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tournaments_organizer_role_check
    BEFORE INSERT OR UPDATE
    ON tournaments
    FOR EACH ROW
EXECUTE FUNCTION ensure_tournament_organizer_is_to();

CREATE TRIGGER trg_tournaments_set_updated_at
    BEFORE UPDATE
    ON tournaments
    FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_tournaments_organizer_user_id ON tournaments (organizer_user_id);
CREATE INDEX idx_tournaments_status ON tournaments (status);

-- -----------------------------------------------------------------------------
-- TOURNAMENT REGISTRATIONS
-- -----------------------------------------------------------------------------
CREATE TABLE tournament_registrations
(
    id            BIGSERIAL PRIMARY KEY,
    tournament_id BIGINT              NOT NULL REFERENCES tournaments (id) ON DELETE CASCADE,
    team_id       BIGINT              NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    status        registration_status NOT NULL DEFAULT 'PENDING',
    registered_at TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
    reviewed_at   TIMESTAMPTZ,
    reviewed_by_user_id   BIGINT              REFERENCES users (id) ON DELETE SET NULL,
    review_note   TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_tournament_team UNIQUE (tournament_id, team_id),
    CONSTRAINT chk_registration_review CHECK (
        (status = 'PENDING' AND reviewed_at IS NULL)
            OR
        (status <> 'PENDING' AND reviewed_at IS NOT NULL)
        )
);

CREATE OR REPLACE FUNCTION ensure_registration_reviewer_is_to()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    user_role_value user_role;
BEGIN
    IF NEW.reviewed_by_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    SELECT role INTO user_role_value FROM users WHERE id = NEW.reviewed_by_user_id;

    IF user_role_value IS NULL THEN
        RAISE EXCEPTION 'Reviewer user % does not exist', NEW.reviewed_by_user_id;
    END IF;

    IF user_role_value <> 'TO' THEN
        RAISE EXCEPTION 'Only a TO can review a registration. User % has role %', NEW.reviewed_by_user_id, user_role_value;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tournament_registrations_reviewer_role_check
    BEFORE INSERT OR UPDATE
    ON tournament_registrations
    FOR EACH ROW
EXECUTE FUNCTION ensure_registration_reviewer_is_to();

CREATE INDEX idx_tournament_registrations_tournament_id ON tournament_registrations (tournament_id);
CREATE INDEX idx_tournament_registrations_team_id ON tournament_registrations (team_id);
CREATE INDEX idx_tournament_registrations_status ON tournament_registrations (status);

CREATE OR REPLACE FUNCTION validate_tournament_registration()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
DECLARE
    tournament_status_value    tournament_status;
    tournament_max_teams       INTEGER;
    current_registration_count INTEGER;
    active_player_count        INTEGER;
BEGIN
    -- Only validate initial registration creation or replacement.
    SELECT status, max_teams
    INTO tournament_status_value, tournament_max_teams
    FROM tournaments
    WHERE id = NEW.tournament_id;

    IF tournament_status_value IS NULL THEN
        RAISE EXCEPTION 'Tournament % does not exist', NEW.tournament_id;
    END IF;

    IF tournament_status_value <> 'OPEN' THEN
        RAISE EXCEPTION 'The tournament % is not open for registrations', NEW.tournament_id;
    END IF;

    SELECT COUNT(*)
    INTO active_player_count
    FROM team_members tm
    WHERE tm.team_id = NEW.team_id
      AND tm.status = 'ACTIVE'
      AND tm.is_substitute = FALSE;

    IF active_player_count < 5 THEN
        RAISE EXCEPTION 'Team % must have at least 5 active non-substitute players to register', NEW.team_id;
    END IF;

    SELECT COUNT(*)
    INTO current_registration_count
    FROM tournament_registrations tr
    WHERE tr.tournament_id = NEW.tournament_id;

    IF TG_OP = 'UPDATE' AND OLD.tournament_id = NEW.tournament_id THEN
        current_registration_count := current_registration_count - 1;
    END IF;

    IF current_registration_count >= tournament_max_teams THEN
        RAISE EXCEPTION 'Tournament % has reached its maximum number of teams (%).', NEW.tournament_id, tournament_max_teams;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_tournament_registrations_validate
    BEFORE INSERT OR UPDATE OF tournament_id, team_id
    ON tournament_registrations
    FOR EACH ROW
EXECUTE FUNCTION validate_tournament_registration();

COMMIT;